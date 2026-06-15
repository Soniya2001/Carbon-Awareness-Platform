/**
 * aiClient.ts — Client-side AI helper
 * All Gemini calls go through Next.js server API routes.
 * The GEMINI_API_KEY never leaves the server.
 */

const AI_UNAVAILABLE = '⚠️ AI features are temporarily unavailable.';

async function post<T>(route: string, body: unknown): Promise<T> {
  const res = await fetch(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function explainFootprint(data: {
  total: number;
  byCategory: Record<string, number>;
  daysTracked: number;
}): Promise<string> {
  try {
    const { text } = await post<{ text: string }>('/api/ai/explain', data);
    return text === '__AI_UNAVAILABLE__' ? AI_UNAVAILABLE : (text ?? AI_UNAVAILABLE);
  } catch { return AI_UNAVAILABLE; }
}

export async function getRecommendations(data: {
  total: number;
  byCategory: Record<string, number>;
}): Promise<Array<{ category: string; action: string; saving: number; effort: string; icon: string }>> {
  try {
    const { recommendations } = await post<{ recommendations: Array<{ category: string; action: string; saving: number; effort: string; icon: string }> }>('/api/ai/recommend', data);
    return recommendations ?? [];
  } catch { return []; }
}

export async function chatWithCoach(
  message: string,
  history: Array<{ role: string; content: string }>,
  context?: { monthly?: number; topCategory?: string; score?: number; streak?: number },
): Promise<string> {
  try {
    const { text, error } = await post<{ text?: string; error?: string }>('/api/ai/chat', { message, history, context });
    if (error) return `⚠️ ${error}`;
    return text ?? AI_UNAVAILABLE;
  } catch { return AI_UNAVAILABLE; }
}

export async function generateTwinNarrative(data: {
  scenario: string;
  current: number;
  projected: number;
  savings: number;
  trees: number;
  years: number;
}): Promise<string> {
  try {
    const { text } = await post<{ text: string }>('/api/ai/twin', data);
    return text ?? AI_UNAVAILABLE;
  } catch { return AI_UNAVAILABLE; }
}

export async function generateAIChallenge(data: {
  topCategory: string;
  monthlyKg: number;
  completedCount: number;
}): Promise<{
  title: string; description: string; category: string;
  targetValue: number; unit: string; points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; daysLeft: number; icon: string;
}> {
  try {
    return await post('/api/ai/challenge', data);
  } catch {
    return { title: 'Go Car-Free for One Day', description: 'Skip your car for a full day. Walk, bike, or use public transport.', category: data.topCategory, targetValue: 1, unit: 'days', points: 150, difficulty: 'MEDIUM', daysLeft: 7, icon: '🚶' };
  }
}

export async function generateForecastInsight(data: {
  predicted: number; trend: string; period: string; current: number;
}): Promise<string> {
  try {
    const { text } = await post<{ text: string }>('/api/ai/forecast', data);
    return text ?? AI_UNAVAILABLE;
  } catch { return AI_UNAVAILABLE; }
}
