import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const FALLBACK = [
  { category: 'transportation', action: 'Take public transport twice per week.', saving: 40, effort: 'medium', icon: '🚌' },
  { category: 'food',           action: 'Replace beef with plant-based meals 3×/week.', saving: 35, effort: 'low', icon: '🥦' },
  { category: 'energy',         action: 'Turn off AC when leaving rooms.', saving: 25, effort: 'low', icon: '💡' },
  { category: 'shopping',       action: 'Buy second-hand clothing this month.', saving: 15, effort: 'low', icon: '👕' },
  { category: 'waste',          action: 'Start composting food scraps at home.', saving: 8, effort: 'medium', icon: '♻️' },
];

export async function POST(req: NextRequest) {
  try {
    const { total, byCategory } = await req.json() as { total: number; byCategory: Record<string, number> };
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ recommendations: FALLBACK });

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI. Generate exactly 5 personalized carbon reduction recommendations.\nUser footprint: ${total.toFixed(1)} kg CO₂e/month\n${Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v.toFixed(2)} kg`).join('\n')}\nReturn ONLY a valid JSON array. Each object: "category","action"(max 15 words),"saving"(monthly kg),"effort"("low"|"medium"|"high"),"icon"(emoji). JSON only, no markdown.`;

    try {
      const raw = (await model.generateContent(prompt)).response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return NextResponse.json({ recommendations: JSON.parse(raw) });
    } catch { return NextResponse.json({ recommendations: FALLBACK }); }
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
