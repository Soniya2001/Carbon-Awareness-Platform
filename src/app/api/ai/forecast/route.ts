import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { predicted, trend, period, current } = await req.json() as { predicted: number; trend: string; period: string; current: number };
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ text: '⚠️ AI insight unavailable.' });

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI. Write a 2-sentence forecast insight.\nPredicted ${period} footprint: ${predicted.toFixed(1)} kg CO₂e\nCurrent monthly: ${current.toFixed(1)} kg CO₂e | Trend: ${trend}\nIPCC 2030 target: 191.7 kg/month. Be specific, mention the trend, give one actionable tip.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
