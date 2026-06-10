import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const env = getEnv();
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

async function generateContent(prompt: string): Promise<string> {
  try {
    const aiModel = getModel();
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    logger.error('Gemini AI error:', err);
    if (err instanceof Error && err.message.includes('API key')) {
      return 'AI service is not configured. Please add your Gemini API key.';
    }
    return 'AI service is temporarily unavailable. Please try again later.';
  }
}

export async function explainFootprint(footprintData: {
  totalCo2e: number;
  byCategory: Record<string, number>;
  averageDaily: number;
  comparedToGlobal: number;
  period: string;
}): Promise<string> {
  const { totalCo2e, byCategory, averageDaily, comparedToGlobal, period } = footprintData;

  const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

  const prompt = `You are CarbonWise AI, a friendly and knowledgeable sustainability coach.

A user has a carbon footprint of ${totalCo2e.toFixed(1)} kg CO2e for ${period}.
Their daily average is ${averageDaily.toFixed(2)} kg CO2e.
They emit ${(comparedToGlobal * 100).toFixed(0)}% of the global average.

Breakdown by category:
${Object.entries(byCategory)
  .map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} kg CO2e`)
  .join('\n')}

The highest emission category is: ${topCategory?.[0]} at ${topCategory?.[1]?.toFixed(2)} kg CO2e.

Provide a warm, encouraging explanation of their footprint in 3-4 sentences. 
- Highlight what they're doing well
- Note the most impactful area to improve
- Compare to the global average (4,800 kg CO2e/year) and IPCC 2030 target (2,300 kg CO2e/year)
- Use specific numbers
Keep it conversational, not preachy.`;

  return generateContent(prompt);
}

export async function generateRecommendations(data: {
  totalCo2e: number;
  byCategory: Record<string, number>;
  userProfile?: { name?: string; location?: string };
}): Promise<{ category: string; recommendation: string; potentialSaving: number; effort: string }[]> {
  const { totalCo2e, byCategory } = data;

  const prompt = `You are CarbonWise AI. Generate 5 personalized carbon reduction recommendations.

User's carbon footprint: ${totalCo2e.toFixed(1)} kg CO2e
Breakdown:
${Object.entries(byCategory)
  .map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} kg CO2e`)
  .join('\n')}

Return ONLY a valid JSON array with exactly 5 objects. Each object must have:
- "category": string (transportation/energy/food/shopping/waste)
- "recommendation": string (specific, actionable advice in 1-2 sentences)
- "potentialSaving": number (estimated kg CO2e savings per year)
- "effort": string ("low"/"medium"/"high")

Focus on the highest-emission categories. Make recommendations specific and achievable.
Response must be valid JSON only, no markdown, no explanation.`;

  const raw = await generateContent(prompt);

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    logger.error('Failed to parse AI recommendations JSON:', raw);
    return [
      {
        category: 'transportation',
        recommendation: 'Consider switching to public transport or cycling for short trips under 5km.',
        potentialSaving: 500,
        effort: 'medium',
      },
      {
        category: 'food',
        recommendation: 'Reducing beef consumption by 50% can significantly lower your food footprint.',
        potentialSaving: 400,
        effort: 'low',
      },
      {
        category: 'energy',
        recommendation: 'Switch to a renewable energy tariff to immediately reduce your energy emissions.',
        potentialSaving: 300,
        effort: 'low',
      },
      {
        category: 'shopping',
        recommendation: 'Buy second-hand clothing and electronics when possible.',
        potentialSaving: 200,
        effort: 'low',
      },
      {
        category: 'waste',
        recommendation: 'Set up a home composting system to divert food waste from landfill.',
        potentialSaving: 100,
        effort: 'medium',
      },
    ];
  }
}

export async function chatWithCoach(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }>,
  userContext?: {
    totalCo2e?: number;
    topCategory?: string;
    sustainabilityScore?: number;
  }
): Promise<string> {
  const contextStr = userContext
    ? `User context: Carbon footprint ${userContext.totalCo2e?.toFixed(1)} kg CO2e, highest category: ${userContext.topCategory}, sustainability score: ${userContext.sustainabilityScore}/100.`
    : '';

  const systemPrompt = `You are CarbonWise AI, an expert sustainability coach. You help people understand and reduce their carbon footprint. 
Be conversational, encouraging, and specific. Use facts and numbers where helpful.
${contextStr}
Current conversation context has ${conversationHistory.length} messages.`;

  const historyStr = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map((m) => `${m.role === 'user' ? 'User' : 'CarbonWise'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}

${historyStr ? `Previous conversation:\n${historyStr}\n` : ''}
User: ${message}
CarbonWise:`;

  return generateContent(fullPrompt);
}

export async function generateAIChallenge(data: {
  topCategories: string[];
  currentCo2e: number;
  completedChallenges: string[];
}): Promise<{
  title: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string;
  points: number;
  difficulty: string;
}> {
  const prompt = `You are CarbonWise AI. Generate a personalized sustainability challenge.

User's highest emission categories: ${data.topCategories.join(', ')}
Monthly CO2e: ${data.currentCo2e.toFixed(1)} kg
Already completed challenges: ${data.completedChallenges.join(', ') || 'none'}

Return ONLY a JSON object (no markdown) with:
- "title": string (catchy challenge name)
- "description": string (clear 2-sentence description of what to do and why)
- "category": string (transportation/energy/food/shopping/waste)
- "targetValue": number (measurable goal)
- "unit": string (km/kWh/kg/days/etc)
- "points": number (50-500 based on difficulty)
- "difficulty": string (EASY/MEDIUM/HARD)

Make it specific, achievable in 30 days, and motivating.`;

  const raw = await generateContent(prompt);

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      title: 'Meat-Free Mondays',
      description: 'Go meat-free every Monday this month. Plant-based meals can save up to 2 kg CO2e per day.',
      category: 'food',
      targetValue: 4,
      unit: 'days',
      points: 200,
      difficulty: 'EASY',
    };
  }
}

export async function generateForecastInsight(data: {
  predictedCo2e: number;
  trend: string;
  period: string;
  currentAverage: number;
}): Promise<string> {
  const prompt = `You are CarbonWise AI. Comment on a carbon footprint forecast in 2-3 sentences.

Predicted ${data.period} footprint: ${data.predictedCo2e.toFixed(1)} kg CO2e
Current average: ${data.currentAverage.toFixed(1)} kg CO2e per month
Trend: ${data.trend}

Be specific, encouraging, and actionable. Mention the IPCC 2030 target context if relevant.`;

  return generateContent(prompt);
}

export async function runCarbonTwinNarrative(data: {
  scenario: string;
  currentCo2e: number;
  projectedCo2e: number;
  savings: number;
  years: number;
}): Promise<string> {
  const { scenario, currentCo2e, projectedCo2e, savings, years } = data;

  const prompt = `You are CarbonWise AI. Explain a Carbon Twin simulation result in 3-4 sentences.

Scenario: "${scenario}"
Current annual CO2e: ${currentCo2e.toFixed(0)} kg
Projected annual CO2e after change: ${projectedCo2e.toFixed(0)} kg
Annual savings: ${savings.toFixed(0)} kg CO2e
Projection period: ${years} year${years > 1 ? 's' : ''}

Calculate cumulative savings over the period. Be enthusiastic, concrete, and compare to real-world equivalents (like trees planted, car miles avoided, etc.).`;

  return generateContent(prompt);
}
