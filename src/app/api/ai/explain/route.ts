import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export async function POST(req: NextRequest) {
  try {
    const { total, byCategory, daysTracked } = await req.json() as { total: number; byCategory: Record<string, number>; daysTracked: number };
    if (typeof total !== 'number' || total < 0) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const model = getModel();
    if (!model) return NextResponse.json({ text: '__AI_UNAVAILABLE__' });

    const top = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];
    const annualEst = daysTracked > 0 ? (total / daysTracked) * 365 : 0;
    const prompt = `You are CarbonWise AI, a warm sustainability coach.\nUser's footprint over ${daysTracked} tracked days:\n- Total: ${total.toFixed(1)} kg CO₂e\n- Estimated annual: ${annualEst.toFixed(0)} kg CO₂e\n- Global average: 4,800 kg/year | IPCC 2030 target: 2,300 kg/year\nBreakdown: ${Object.entries(byCategory).map(([k, v]) => `${k}: ${v.toFixed(2)} kg`).join(', ')}\nTop category: ${top?.[0]} (${top?.[1]?.toFixed(2)} kg)\nWrite a warm, specific 3-sentence explanation. Compare to benchmarks, name the top source, give one concrete action. No bullet points.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
