import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

// In-memory rate limiter (per cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { message, history, context } = await req.json() as {
      message: string;
      history: Array<{ role: string; content: string }>;
      context?: { monthly?: number; topCategory?: string; score?: number; streak?: number; name?: string };
    };

    const safeMessage = String(message ?? '').slice(0, 1000);
    const key = process.env.GEMINI_API_KEY;

    // Smart fallback without API key
    if (!key) {
      const tips: Record<string, string> = {
        transport: 'Try taking public transport or cycling for short trips under 5 km — can cut transport emissions by up to 40%.',
        food: 'Swapping beef for chicken or legumes twice a week saves around 25-35 kg CO₂e per month.',
        energy: 'Turning off AC when leaving a room and using a smart power strip can reduce home energy use by 10-15%.',
        shopping: 'Buying second-hand or repairing items instead of replacing them can save 30+ kg CO₂e per purchase.',
        waste: 'Composting food waste prevents methane emissions — even a small kitchen composter makes a difference.',
      };
      const tip = tips[context?.topCategory ?? 'transport'] ?? tips.transport;
      return NextResponse.json({
        text: `Hi${context?.name ? ` ${context.name}` : ''}! Here's a personalised tip based on your ${context?.topCategory ?? 'activity'} emissions: ${tip} Add your Gemini API key in Settings for full AI coaching.`,
      });
    }

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build rich context string
    const ctxParts = [];
    if (context?.name)        ctxParts.push(`User name: ${context.name}`);
    if (context?.monthly)     ctxParts.push(`Monthly footprint: ${context.monthly.toFixed(1)} kg CO₂e`);
    if (context?.topCategory) ctxParts.push(`Highest emission category: ${context.topCategory}`);
    if (context?.score)       ctxParts.push(`Sustainability score: ${context.score}/100`);
    if (context?.streak)      ctxParts.push(`Current streak: ${context.streak} days`);
    const ctxStr = ctxParts.length ? ctxParts.join(', ') : 'No activity data yet';

    const histStr = (history ?? []).slice(-6)
      .map(m => `${m.role === 'user' ? 'User' : 'CarbonWise'}: ${m.content}`)
      .join('\n');

    const prompt = `You are CarbonWise AI, a friendly sustainability coach. Be concise (2-4 sentences), specific and actionable.
User context: ${ctxStr}
${histStr ? `\nRecent chat:\n${histStr}\n` : ''}
User: ${safeMessage}
CarbonWise:`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
