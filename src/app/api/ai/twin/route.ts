import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { scenario, current, projected, savings, trees, years } = await req.json() as { scenario: string; current: number; projected: number; savings: number; trees: number; years: number };
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ text: '⚠️ AI narrative unavailable. Your simulation results are shown above.' });

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI. Write an inspiring 3-sentence narrative about this Carbon Twin simulation.\nScenario: "${scenario}"\nCurrent annual CO₂e: ${current.toFixed(0)} kg | Projected: ${projected.toFixed(0)} kg\nAnnual savings: ${savings.toFixed(0)} kg | Trees equivalent (${years} years): ${trees}\nInclude real-world equivalents, cumulative impact, and an encouraging call-to-action. No bullet points.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
