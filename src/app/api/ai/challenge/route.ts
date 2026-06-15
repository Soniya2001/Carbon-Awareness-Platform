import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const FALLBACK = { title: 'Go Car-Free for One Day', description: 'Skip your car for a full day. Walk, bike, or use public transport — save up to 3 kg CO₂e.', category: 'transportation', targetValue: 1, unit: 'days', points: 150, difficulty: 'MEDIUM', daysLeft: 7, icon: '🚶' };

export async function POST(req: NextRequest) {
  try {
    const { topCategory, monthlyKg, completedCount } = await req.json() as { topCategory: string; monthlyKg: number; completedCount: number };
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json(FALLBACK);

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI. Create one personalized eco challenge.\nUser's top emission category: ${topCategory}\nMonthly CO₂e: ${monthlyKg.toFixed(1)} kg\nCompleted challenges: ${completedCount}\nReturn ONLY a JSON object: "title"(max 8 words),"description"(2 sentences),"category","targetValue"(number),"unit","points"(50-300),"difficulty"("EASY"|"MEDIUM"|"HARD"),"daysLeft"(1-30),"icon"(emoji). JSON only, no markdown.`;

    try {
      const raw = (await model.generateContent(prompt)).response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return NextResponse.json(JSON.parse(raw));
    } catch { return NextResponse.json(FALLBACK); }
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
