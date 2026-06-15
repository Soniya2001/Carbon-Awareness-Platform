import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });

    const { message, history, context } = await req.json() as { message: string; history: Array<{ role: string; content: string }>; context?: Record<string, unknown> };
    const safeMessage = String(message).slice(0, 1000);
    const model = getModel();
    if (!model) return NextResponse.json({ text: '⚠️ AI features are temporarily unavailable.' });

    const ctx = context ? Object.entries(context).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
    const histStr = (history ?? []).slice(-6).map(m => `${m.role === 'user' ? 'User' : 'CarbonWise'}: ${m.content}`).join('\n');
    const prompt = `You are CarbonWise AI, a friendly sustainability coach. Be concise (2-4 sentences), specific, actionable.\n${ctx ? `Context: ${ctx}` : ''}\n${histStr ? `\nRecent chat:\n${histStr}\n` : ''}\nUser: ${safeMessage}\nCarbonWise:`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
