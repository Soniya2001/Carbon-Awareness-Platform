// Gemini AI Integration with rate limiting

import { GoogleGenerativeAI } from '@google/generative-ai';

// Rate limiting state
let _lastCallTime = 0;
let _callCount = 0;
let _windowStart = Date.now();
const MAX_CALLS_PER_MINUTE = 10;

function rateLimiter(): void {
  const now = Date.now();
  // Reset window every minute
  if (now - _windowStart > 60000) {
    _callCount = 0;
    _windowStart = now;
  }

  if (_callCount >= MAX_CALLS_PER_MINUTE) {
    const waitMs = 60000 - (now - _windowStart);
    throw new Error(
      `Rate limit reached. Please wait ${Math.ceil(waitMs / 1000)} seconds before trying again.`,
    );
  }

  // Minimum 1 second between calls
  if (now - _lastCallTime < 1000) {
    throw new Error('Please wait a moment before sending another request.');
  }

  _callCount++;
  _lastCallTime = now;
}

async function generate(apiKey: string, prompt: string): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Gemini API key not configured. Please add your API key in Settings.',
    );
  }

  rateLimiter();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('Rate limit') || err.message.includes('wait')) {
        throw err;
      }
      if (err.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your key in Settings.');
      }
      if (err.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please check your Google AI Studio account.');
      }
    }
    throw new Error('Failed to generate AI response. Please try again.');
  }
}

export interface FootprintData {
  monthlyKg: number;
  byCategory: Record<string, number>;
  grade: string;
  score: number;
  vsGlobal: number;
  name?: string;
}

export async function explainFootprint(apiKey: string, data: FootprintData): Promise<string> {
  const prompt = `You are CarbonWise AI, a friendly sustainability coach. Analyze this carbon footprint data and provide a clear, encouraging explanation in 3-4 paragraphs.

User: ${data.name || 'User'}
Monthly CO2e: ${data.monthlyKg} kg
Annual CO2e: ${data.monthlyKg * 12} kg
Carbon Grade: ${data.grade}
Sustainability Score: ${data.score}/100
vs Global Average: ${data.vsGlobal > 0 ? `${data.vsGlobal}% above` : `${Math.abs(data.vsGlobal)}% below`} average

Breakdown by category:
${Object.entries(data.byCategory)
  .map(([cat, kg]) => `- ${cat}: ${kg} kg/month`)
  .join('\n')}

Please:
1. Explain what these numbers mean in relatable terms
2. Highlight the biggest sources and their impact
3. Give 2-3 specific, actionable recommendations
4. End with an encouraging message

Keep the tone warm, supportive, and actionable. Use emojis sparingly.`;

  return generate(apiKey, prompt);
}

export interface RecommendationItem {
  category: string;
  action: string;
  saving: string;
  effort: 'Low' | 'Medium' | 'High';
  icon: string;
}

export async function getRecommendations(
  apiKey: string,
  data: FootprintData,
): Promise<RecommendationItem[]> {
  const prompt = `You are CarbonWise AI. Based on this carbon footprint, provide exactly 5 personalized recommendations as a JSON array.

Monthly CO2e: ${data.monthlyKg} kg
Breakdown: ${JSON.stringify(data.byCategory)}
Grade: ${data.grade}

Return ONLY a valid JSON array with exactly 5 objects, each with these fields:
- category: one of "transportation", "energy", "food", "shopping", "waste"
- action: specific action to take (max 60 chars)
- saving: estimated CO2e saving (e.g., "50-100 kg/year")
- effort: one of "Low", "Medium", "High"
- icon: a single relevant emoji

Example format:
[
  {
    "category": "food",
    "action": "Replace beef with chicken twice a week",
    "saving": "80-120 kg/year",
    "effort": "Low",
    "icon": "🥗"
  }
]

Return ONLY the JSON array, no other text.`;

  const response = await generate(apiKey, prompt);
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    return JSON.parse(jsonMatch[0]) as RecommendationItem[];
  } catch {
    // Return default recommendations if parsing fails
    return [
      {
        category: 'transportation',
        action: 'Switch to public transport for daily commute',
        saving: '200-400 kg/year',
        effort: 'Medium',
        icon: '🚌',
      },
      {
        category: 'food',
        action: 'Reduce red meat consumption by half',
        saving: '150-300 kg/year',
        effort: 'Low',
        icon: '🥦',
      },
      {
        category: 'energy',
        action: 'Switch to LED bulbs and smart thermostat',
        saving: '100-200 kg/year',
        effort: 'Low',
        icon: '💡',
      },
      {
        category: 'shopping',
        action: 'Buy second-hand clothing instead of new',
        saving: '50-150 kg/year',
        effort: 'Low',
        icon: '♻️',
      },
      {
        category: 'waste',
        action: 'Start composting food waste',
        saving: '30-80 kg/year',
        effort: 'Low',
        icon: '🌱',
      },
    ];
  }
}

export interface ChatContext {
  monthlyKg?: number;
  grade?: string;
  score?: number;
  byCategory?: Record<string, number>;
  name?: string;
  streak?: number;
  level?: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export async function chatWithCoach(
  apiKey: string,
  message: string,
  history: ChatHistoryItem[],
  context: ChatContext,
): Promise<string> {
  const systemContext = `You are CarbonWise AI Coach, a friendly and knowledgeable sustainability assistant. 
Your user's profile:
- Name: ${context.name || 'there'}
- Monthly CO2e: ${context.monthlyKg ?? 'unknown'} kg
- Carbon Grade: ${context.grade ?? 'unknown'}
- Sustainability Score: ${context.score ?? 'unknown'}/100
- Current streak: ${context.streak ?? 0} days
- Level: ${context.level ?? 'Seedling'}
${context.byCategory ? `- Breakdown: ${JSON.stringify(context.byCategory)}` : ''}

Keep responses concise (2-4 paragraphs max), friendly, and actionable. Use emojis occasionally for warmth. Always be encouraging and specific.`;

  const fullPrompt = history.length === 0
    ? `${systemContext}\n\nUser message: ${message}`
    : `${systemContext}\n\nConversation history:\n${history
        .slice(-6)
        .map((h) => `${h.role === 'user' ? 'User' : 'AI Coach'}: ${h.parts[0].text}`)
        .join('\n')}\n\nUser message: ${message}`;

  return generate(apiKey, fullPrompt);
}

export interface TwinData {
  scenarioName: string;
  currentAnnualKg: number;
  scenarioAnnualKg: number;
  annualSavingKg: number;
  savingPercent: number;
  trees: number;
  cars: number;
  years: number;
  name?: string;
}

export async function generateTwinNarrative(apiKey: string, data: TwinData): Promise<string> {
  const prompt = `You are CarbonWise AI. Write a short, inspiring narrative (3-4 sentences) for a Carbon Twin simulation result.

User: ${data.name || 'You'}
Scenario: "${data.scenarioName}"
Current footprint: ${data.currentAnnualKg} kg CO2e/year
With this scenario: ${data.scenarioAnnualKg} kg CO2e/year
Annual saving: ${data.annualSavingKg} kg (${data.savingPercent}% reduction)
Equivalent to: planting ${data.trees} trees, removing ${data.cars} cars from the road
Over ${data.years} years

Write an inspiring, personal narrative about what this change means for the planet. Be specific, emotional, and motivating. Use "you" to address the user directly.`;

  return generate(apiKey, prompt);
}

export interface ChallengeData {
  monthlyKg: number;
  byCategory: Record<string, number>;
  existingChallenges: string[];
}

export async function generateAIChallenge(apiKey: string, data: ChallengeData): Promise<{
  title: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  daysLeft: number;
  icon: string;
}> {
  const prompt = `You are CarbonWise AI. Create a personalized carbon reduction challenge based on this user's footprint.

Monthly CO2e: ${data.monthlyKg} kg
Category breakdown: ${JSON.stringify(data.byCategory)}
Existing challenges: ${data.existingChallenges.join(', ')}

Create ONE unique, achievable challenge. Return ONLY a JSON object with these fields:
- title: challenge name (max 50 chars)
- description: what to do (max 100 chars)
- category: one of "transportation", "energy", "food", "shopping", "waste"
- targetValue: numeric target (e.g., 5 for "5 days")
- unit: unit of measurement (e.g., "days", "kg", "%")
- points: reward points (50-300 based on difficulty)
- difficulty: "easy", "medium", or "hard"
- daysLeft: duration in days (1-30)
- icon: a single emoji

Return ONLY the JSON object.`;

  const response = await generate(apiKey, prompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      title: 'Reduce Daily Transport Emissions',
      description: 'Walk or cycle instead of driving for 3 days this week.',
      category: 'transportation',
      targetValue: 3,
      unit: 'days',
      points: 75,
      difficulty: 'easy',
      daysLeft: 7,
      icon: '🚶',
    };
  }
}

export interface ForecastData {
  nextMonth: number;
  threeMonth: number;
  annual: number;
  trend: string;
  trendPercent: number;
  currentMonthlyKg: number;
  name?: string;
}

export async function generateForecastInsight(apiKey: string, data: ForecastData): Promise<string> {
  const prompt = `You are CarbonWise AI. Provide a brief forecast insight (2-3 sentences) for this user.

User: ${data.name || 'User'}
Current monthly: ${data.currentMonthlyKg} kg CO2e
Next month forecast: ${data.nextMonth} kg
3-month forecast: ${data.threeMonth} kg
Annual projection: ${data.annual} kg
Trend: ${data.trend} (${data.trendPercent}% change/month)

Give an actionable insight about their forecast. Be specific about what actions could improve the trend. Keep it concise and encouraging.`;

  return generate(apiKey, prompt);
}
