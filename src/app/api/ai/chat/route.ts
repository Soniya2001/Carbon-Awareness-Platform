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

interface ProfileContext {
  name?: string;
  monthly?: number;
  topCategory?: string;
  score?: number;
  streak?: number;
  // Full profile fields
  primaryTransport?: string;
  weeklyCommuteKm?: number;
  monthlyElectricityKwh?: number;
  dietType?: string;
  monthlyShoppingItems?: number;
  shortFlightsPerYear?: number;
  longFlightsPerYear?: number;
  usesRenewableEnergy?: boolean;
  hasAirConditioning?: boolean;
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
      context?: ProfileContext;
    };

    const safeMessage = String(message ?? '').slice(0, 1000);
    const key = process.env.GEMINI_API_KEY;

    // Smart fallback without API key — uses actual profile data
    if (!key) {
      const tips: Record<string, string> = {
        transportation: `Your primary transport is ${context?.primaryTransport ?? 'car'} covering ${context?.weeklyCommuteKm ?? 0} km/week. Switching to public transit twice a week could cut transport emissions by 35–40%.`,
        energy: `You use ${context?.monthlyElectricityKwh ?? 300} kWh/month${context?.hasAirConditioning ? ' with AC' : ''}. Smart power strips and LED lighting can reduce energy use by 15% with minimal effort.`,
        food: `A ${context?.dietType ?? 'mixed'} diet contributes significantly to your footprint. Adding two plant-based days per week can save 25–30 kg CO₂e monthly.`,
        shopping: `You purchase ~${context?.monthlyShoppingItems ?? 2} items/month. Choosing second-hand or waiting 48h before purchasing reduces impulse-buy emissions by 50%.`,
        waste: `Recycling and composting food waste prevents methane — one of the most potent greenhouse gases. Even a small kitchen bin makes a measurable difference.`,
      };
      const tip = tips[context?.topCategory ?? 'transportation'];
      return NextResponse.json({
        text: `Hi${context?.name ? ` ${context.name}` : ''}! ${tip} Add your Gemini API key in Settings for full personalised AI coaching.`,
      });
    }

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build rich context from full profile
    const ctxLines = [
      context?.name              && `Name: ${context.name}`,
      context?.monthly           && `Monthly footprint: ${context.monthly.toFixed(1)} kg CO₂e`,
      context?.topCategory       && `Highest category: ${context.topCategory}`,
      context?.score             && `Sustainability score: ${context.score}/100`,
      context?.streak            && `Streak: ${context.streak} days`,
      context?.primaryTransport  && `Primary transport: ${context.primaryTransport}`,
      context?.weeklyCommuteKm   && `Weekly commute: ${context.weeklyCommuteKm} km`,
      context?.monthlyElectricityKwh && `Monthly electricity: ${context.monthlyElectricityKwh} kWh`,
      context?.dietType          && `Diet: ${context.dietType}`,
      context?.shortFlightsPerYear !== undefined && `Flights/yr: ${context.shortFlightsPerYear} short + ${context.longFlightsPerYear ?? 0} long`,
      context?.usesRenewableEnergy !== undefined && `Renewable energy: ${context.usesRenewableEnergy ? 'Yes' : 'No'}`,
    ].filter(Boolean).join('\n');

    const histStr = (history ?? []).slice(-6)
      .map(m => `${m.role === 'user' ? 'User' : 'CarbonWise'}: ${m.content}`)
      .join('\n');

    const prompt = `You are CarbonWise AI, a friendly, expert sustainability coach. Respond in 2-4 sentences. Be specific, reference the user's actual profile data, and always give one actionable tip.

User Profile:
${ctxLines || 'No profile data yet'}
${histStr ? `\nRecent conversation:\n${histStr}\n` : ''}
User: ${safeMessage}
CarbonWise:`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
