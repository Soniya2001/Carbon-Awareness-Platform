import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { total, byCategory, daysTracked } = await req.json() as {
      total: number; byCategory: Record<string, number>; daysTracked: number;
    };

    if (typeof total !== 'number' || total < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // No data fallback
    if (total === 0 || daysTracked === 0) {
      return NextResponse.json({
        text: "🌱 Welcome to CarbonWise AI! Start by logging your first activity in the Calculator — transport, food, energy, shopping, or waste. Once you have a few days of data, I'll give you a full breakdown of your carbon footprint and personalised tips to reduce it.",
      });
    }

    const key = process.env.GEMINI_API_KEY;
    const top = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];
    const annualEst = daysTracked > 0 ? (total / daysTracked) * 365 : 0;

    // Smart fallback without API key
    if (!key) {
      const topName = top?.[0] ?? 'unknown';
      const topVal = top?.[1]?.toFixed(1) ?? '0';
      const pct = total > 0 ? Math.round(((top?.[1] ?? 0) / total) * 100) : 0;
      const vsGlobal = annualEst < 4800 ? `${Math.round(((4800 - annualEst) / 4800) * 100)}% below` : `${Math.round(((annualEst - 4800) / 4800) * 100)}% above`;
      return NextResponse.json({
        text: `Your footprint over ${daysTracked} day${daysTracked !== 1 ? 's' : ''} is ${total.toFixed(1)} kg CO₂e (${annualEst.toFixed(0)} kg/year projected — ${vsGlobal} the global average of 4,800 kg). Your biggest source is ${topName} at ${topVal} kg (${pct}% of total). Reducing your ${topName} habits even slightly can make a measurable difference — explore the Challenges page for personalised missions.`,
      });
    }

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI, a warm sustainability coach.
User's footprint over ${daysTracked} tracked days:
- Total: ${total.toFixed(1)} kg CO₂e
- Estimated annual: ${annualEst.toFixed(0)} kg CO₂e
- Global average: 4,800 kg/year | IPCC 2030 target: 2,300 kg/year
Breakdown: ${Object.entries(byCategory).map(([k, v]) => `${k}: ${v.toFixed(2)} kg`).join(', ')}
Top category: ${top?.[0]} (${top?.[1]?.toFixed(2)} kg)
Write a warm, specific 3-sentence explanation. Compare to benchmarks, name the top source, give one concrete action. No bullet points.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
