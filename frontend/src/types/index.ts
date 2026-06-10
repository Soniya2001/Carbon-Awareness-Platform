// ─── User Types ───────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

// ─── Carbon Types ─────────────────────────────────────────────────────
export type CarbonCategory = 'transportation' | 'energy' | 'food' | 'shopping' | 'waste';

export interface Activity {
  id: string;
  userId: string;
  category: CarbonCategory;
  subcategory: string;
  value: number;
  unit: string;
  co2e: number;
  date: string;
  createdAt: string;
}

export interface ActivityInput {
  category: CarbonCategory;
  subcategory: string;
  value: number;
  unit: string;
  date?: string;
}

export interface CarbonRecord {
  id: string;
  userId: string;
  date: string;
  transportation: number;
  energy: number;
  food: number;
  shopping: number;
  waste: number;
  total: number;
}

export interface FootprintSummary {
  totalCo2e: number;
  byCategory: Record<CarbonCategory, number>;
  averageDaily: number;
  comparedToGlobal: number;
  sustainabilityScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  percentileRank: number;
}

// ─── Forecast Types ───────────────────────────────────────────────────
export interface ForecastResult {
  period: string;
  predictedCo2e: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  basedOnDays: number;
}

export interface ForecastSeries {
  monthly: ForecastResult[];
  quarterly: ForecastResult;
  annual: ForecastResult;
}

// ─── Simulation Types ─────────────────────────────────────────────────
export interface SimulationResult {
  scenario: string;
  currentAnnualCo2e: number;
  projectedAnnualCo2e: number;
  annualSavings: number;
  projections: Array<{
    year: number;
    co2e: number;
    cumulativeSavings: number;
  }>;
  equivalents: {
    treesPlanted: number;
    kmsDriven: number;
    flightsAvoided: number;
    moneySaved: number;
  };
  aiNarrative?: string;
}

export interface Scenario {
  key: string;
  name: string;
  description: string;
  changeCount: number;
}

// ─── Challenge Types ──────────────────────────────────────────────────
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory;
  targetValue: number;
  unit: string;
  points: number;
  difficulty: Difficulty;
  isActive: boolean;
  createdAt: string;
  userProgress?: ChallengeProgress | null;
}

export interface ChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  progress: number;
  completedAt?: string | null;
  createdAt: string;
  challenge?: Challenge;
}

// ─── Gamification Types ───────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  earned: boolean;
}

export interface UserPoints {
  total: number;
  rank: number | null;
  badges: string[];
  streak: number;
  level: string;
  nextLevelPoints: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId?: string;
  displayName: string;
  avatarUrl?: string | null;
  score: number;
}

// ─── Community Types ──────────────────────────────────────────────────
export interface CommunityStats {
  totalCo2Saved: number;
  treesEquivalent: number;
  fuelSaved: number;
  carsRemoved: number;
  activeMemberCount: number;
  totalActivities: number;
  updatedAt: string;
}

// ─── AI Types ─────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIRecommendation {
  category: string;
  recommendation: string;
  potentialSaving: number;
  effort: 'low' | 'medium' | 'high';
}

// ─── API Response Types ───────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Notification Types ───────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
