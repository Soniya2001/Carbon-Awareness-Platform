import type { ApiResponse, PaginationMeta } from '@/src/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json() as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiError(
      data.message ?? 'Request failed',
      response.status,
      data.errors
    );
  }

  return data;
}

// ─── Auth API ────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    request<{ user: unknown; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: unknown; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  refresh: () =>
    request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),

  getMe: () =>
    request<unknown>('/auth/me'),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<unknown>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Carbon API ──────────────────────────────────────────────────────
export const carbonApi = {
  logActivity: (data: {
    category: string;
    subcategory: string;
    value: number;
    unit: string;
    date?: string;
  }) =>
    request<unknown>('/carbon/record', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.category) search.set('category', params.category);
    if (params?.startDate) search.set('startDate', params.startDate);
    if (params?.endDate) search.set('endDate', params.endDate);
    return request<unknown>(`/carbon/history?${search.toString()}`);
  },

  getDailySummary: (date?: string) =>
    request<unknown>(`/carbon/summary/daily${date ? `?date=${date}` : ''}`),

  getWeeklySummary: () =>
    request<unknown>('/carbon/summary/weekly'),

  getMonthlySummary: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    return request<unknown>(`/carbon/summary/monthly?${params.toString()}`);
  },

  getAnnualSummary: (year?: number) =>
    request<unknown>(`/carbon/summary/annual${year ? `?year=${year}` : ''}`),

  getTrend: (days?: number) =>
    request<unknown>(`/carbon/trend${days ? `?days=${days}` : ''}`),

  getCategories: () =>
    request<unknown>('/carbon/categories'),

  deleteActivity: (id: string) =>
    request(`/carbon/record/${id}`, { method: 'DELETE' }),
};

// ─── AI API ──────────────────────────────────────────────────────────
export const aiApi = {
  explainFootprint: (data?: { period?: string }) =>
    request<{ explanation: string; summary: unknown }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),

  getRecommendations: () =>
    request<{ recommendations: unknown[] }>('/ai/recommend', { method: 'POST', body: '{}' }),

  chat: (message: string, history: Array<{ role: string; content: string }> = []) =>
    request<{ response: string; message: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  generateChallenge: () =>
    request<{ challenge: unknown }>('/ai/challenge', { method: 'POST', body: '{}' }),
};

// ─── Simulation API ──────────────────────────────────────────────────
export const simulationApi = {
  getScenarios: () =>
    request<unknown[]>('/simulation/scenarios'),

  runSimulation: (scenario: string, years?: number) =>
    request<unknown>('/simulation/run', {
      method: 'POST',
      body: JSON.stringify({ scenario, years }),
    }),

  getHistory: () =>
    request<unknown[]>('/simulation/history'),

  getById: (id: string) =>
    request<unknown>(`/simulation/${id}`),

  compareScenarios: () =>
    request<unknown[]>('/simulation/compare'),
};

// ─── Forecast API ────────────────────────────────────────────────────
export const forecastApi = {
  getMonthly: () => request<unknown>('/forecast/monthly'),
  getQuarterly: () => request<unknown[]>('/forecast/quarterly'),
  getAnnual: () => request<unknown>('/forecast/annual'),
  getFullSeries: () => request<unknown>('/forecast'),
};

// ─── Challenge API ───────────────────────────────────────────────────
export const challengeApi = {
  getAll: (params?: { difficulty?: string; category?: string }) => {
    const search = new URLSearchParams();
    if (params?.difficulty) search.set('difficulty', params.difficulty);
    if (params?.category) search.set('category', params.category);
    return request<unknown[]>(`/challenges?${search.toString()}`);
  },

  getActive: () => request<unknown[]>('/challenges/active'),

  getCompleted: () => request<unknown[]>('/challenges/completed'),

  join: (challengeId: string) =>
    request<unknown>('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    }),

  updateProgress: (challengeId: string, progress: number) =>
    request<unknown>('/challenges/progress', {
      method: 'PUT',
      body: JSON.stringify({ challengeId, progress }),
    }),
};

// ─── Community API ───────────────────────────────────────────────────
export const communityApi = {
  getStats: () => request<unknown>('/community/stats'),
  getLeaderboard: (period?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (period) params.set('period', period);
    if (limit) params.set('limit', String(limit));
    return request<unknown[]>(`/community/leaderboard?${params.toString()}`);
  },
  getInsights: () => request<unknown[]>('/community/insights'),
};

// ─── Gamification API ────────────────────────────────────────────────
export const gamificationApi = {
  getPoints: () => request<unknown>('/gamification/points'),
  getBadges: () => request<unknown>('/gamification/badges'),
  getLeaderboard: (period?: string) =>
    request<unknown[]>(`/gamification/leaderboard${period ? `?period=${period}` : ''}`),
  getAchievements: () => request<unknown>('/gamification/achievements'),
};

// ─── Admin API ───────────────────────────────────────────────────────
export const adminApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.search) search.set('search', params.search);
    return request<unknown[]>(`/admin/users?${search.toString()}`);
  },
  getAnalytics: () => request<unknown>('/admin/analytics'),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getChallenges: () => request<unknown[]>('/admin/challenges'),
  createChallenge: (data: unknown) =>
    request<unknown>('/admin/challenges', { method: 'POST', body: JSON.stringify(data) }),
};

export { ApiError };
