import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { predicted, trend, period, current } = await req.json() as {
      predicted: number; trend: string; period: string; current: number;
    };

    // Meaningful fallback when no data yet
    if (!current || current === 0) {
      return NextResponse.json({
        text: "📊 Log at least 3 activities across different days to unlock personalised AI forecasting. Once you have some history, I'll predict your future footprint and show exactly where you're heading.",
      });
    }

    const key = process.env.GEMINI_API_KEY;

    // Smart fallback when no API key — still useful
    if (!key) {
      const direction = trend === 'increasing' ? 'rising ↑' : trend === 'decreasing' ? 'falling ↓' : 'stable →';
      const vsTarget = predicted > 191.7 ? `${(predicted - 191.7).toFixed(0)} kg above` : `${(191.7 - predicted).toFixed(0)} kg below`;
      return NextResponse.json({
        text: `📈 Your ${period} forecast is ${predicted.toFixed(0)} kg CO₂e (${direction}). You are ${vsTarget} the IPCC 2030 target of 191.7 kg/month. ${trend === 'increasing' ? 'Focus on reducing your top emission category this week.' : trend === 'decreasing' ? 'Great progress — keep your current habits going!' : 'Consistent is good — try one new green habit to improve further.'}`,
      });
    }

    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CarbonWise AI. Write a 2-sentence forecast insight.
Predicted ${period} footprint: ${predicted.toFixed(1)} kg CO₂e
Current monthly: ${current.toFixed(1)} kg CO₂e | Trend: ${trend}
IPCC 2030 target: 191.7 kg/month. Be specific, mention the trend, give one actionable tip.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
