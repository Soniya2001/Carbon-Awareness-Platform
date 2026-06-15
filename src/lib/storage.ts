// localStorage persistence layer - all operations wrapped in try/catch for SSR safety

export const KEYS = {
  RECORDS: 'cw_records',
  PREFERENCES: 'cw_prefs',
  GAMIFICATION: 'cw_gamification',
  CHALLENGES: 'cw_challenges',
  SIMULATIONS: 'cw_simulations',
  CHAT_HISTORY: 'cw_chat',
} as const;

// ─────────────────────── Interfaces ───────────────────────

export interface ActivityRecord {
  id: string;
  date: string;
  category: string;
  subcategory: string;
  value: number;
  co2e: number;
  unit: string;
  label: string;
  createdAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  total: number;
  byCategory: Record<string, number>;
  recordCount: number;
  dailyRecords: Array<{ date: string; total: number; byCategory: Record<string, number> }>;
}

export interface UserPreferences {
  onboardingDone: boolean;
  name: string;
  dietType: 'omnivore' | 'flexitarian' | 'vegetarian' | 'vegan';
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  notifications: boolean;
}

export interface GamificationState {
  points: number;
  level: number;
  streak: number;
  lastActivityDate: string;
  badges: string[];
  pointsHistory: Array<{ date: string; points: number; reason: string }>;
}

export interface StoredChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  daysLeft: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  completedDate?: string;
  joined: boolean;
  aiGenerated?: boolean;
  icon: string;
}

export interface StoredSimulation {
  id: string;
  scenarioKey: string;
  scenarioName: string;
  years: number;
  annualSavingKg: number;
  savingPercent: number;
  sustainabilityScore: number;
  aiNarrative?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─────────────────────── Helpers ───────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write errors (quota exceeded, etc.)
  }
}

// ─────────────────────── Records ───────────────────────

export function getRecords(): ActivityRecord[] {
  return safeGet<ActivityRecord[]>(KEYS.RECORDS, []);
}

export function saveRecord(record: ActivityRecord): void {
  const records = getRecords();
  records.push(record);
  safeSet(KEYS.RECORDS, records);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  safeSet(KEYS.RECORDS, records);
}

export function getTodayRecord(): ActivityRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return getRecords().filter((r) => r.date === today);
}

export function getRecentRecords(days: number = 30): ActivityRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return getRecords().filter((r) => r.date >= cutoffStr);
}

export function getMonthlySummary(monthOffset: number = 0): MonthlySummary {
  const now = new Date();
  now.setMonth(now.getMonth() - monthOffset);
  const month = now.toISOString().slice(0, 7); // YYYY-MM

  const records = getRecords().filter((r) => r.date.startsWith(month));

  const byCategory: Record<string, number> = {
    transportation: 0,
    energy: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };
  let total = 0;

  // Group by day
  const dailyMap: Record<string, { total: number; byCategory: Record<string, number> }> = {};

  for (const r of records) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + r.co2e;
    total += r.co2e;

    if (!dailyMap[r.date]) {
      dailyMap[r.date] = {
        total: 0,
        byCategory: { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0 },
      };
    }
    dailyMap[r.date].total += r.co2e;
    dailyMap[r.date].byCategory[r.category] =
      (dailyMap[r.date].byCategory[r.category] ?? 0) + r.co2e;
  }

  const dailyRecords = Object.entries(dailyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      total: Math.round(data.total * 100) / 100,
      byCategory: Object.fromEntries(
        Object.entries(data.byCategory).map(([k, v]) => [k, Math.round(v * 100) / 100]),
      ),
    }));

  // Round category values
  Object.keys(byCategory).forEach((k) => {
    byCategory[k] = Math.round(byCategory[k] * 100) / 100;
  });

  return {
    month,
    total: Math.round(total * 100) / 100,
    byCategory,
    recordCount: records.length,
    dailyRecords,
  };
}

// ─────────────────────── Preferences ───────────────────────

const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingDone: false,
  name: '',
  dietType: 'omnivore',
  theme: 'system',
  units: 'metric',
  notifications: true,
};

export function getPreferences(): UserPreferences {
  const stored = safeGet<Partial<UserPreferences>>(KEYS.PREFERENCES, {});
  return { ...DEFAULT_PREFERENCES, ...stored };
}

export function savePreferences(partial: Partial<UserPreferences>): void {
  const current = getPreferences();
  safeSet(KEYS.PREFERENCES, { ...current, ...partial });
}

// ─────────────────────── Gamification ───────────────────────

export const LEVEL_LABELS = [
  '',
  'Seedling 🌱',
  'Sapling 🌿',
  'Young Tree 🌳',
  'Forest Guardian 🌲',
  'Climate Hero 🌍',
];

export const LEVEL_THRESHOLDS = [0, 0, 250, 800, 2000, 5000];

export function calcLevel(points: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return Math.min(level, LEVEL_LABELS.length - 1);
}

export function pointsToNextLevel(points: number): { current: number; needed: number; nextThreshold: number } {
  const level = calcLevel(points);
  const nextLevel = Math.min(level + 1, LEVEL_THRESHOLDS.length - 1);
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  const currentThreshold = LEVEL_THRESHOLDS[level];
  return {
    current: points - currentThreshold,
    needed: nextThreshold - currentThreshold,
    nextThreshold,
  };
}

const DEFAULT_GAMIFICATION: GamificationState = {
  points: 0,
  level: 1,
  streak: 0,
  lastActivityDate: '',
  badges: [],
  pointsHistory: [],
};

export function getGamification(): GamificationState {
  const stored = safeGet<Partial<GamificationState>>(KEYS.GAMIFICATION, {});
  return { ...DEFAULT_GAMIFICATION, ...stored };
}

export function addEcoPoints(points: number, reason: string = 'Activity logged'): GamificationState {
  const state = getGamification();
  const newPoints = state.points + points;
  const newLevel = calcLevel(newPoints);
  const newState: GamificationState = {
    ...state,
    points: newPoints,
    level: newLevel,
    pointsHistory: [
      { date: new Date().toISOString(), points, reason },
      ...state.pointsHistory.slice(0, 49), // keep last 50
    ],
  };
  safeSet(KEYS.GAMIFICATION, newState);
  return newState;
}

export function updateStreak(): GamificationState {
  const state = getGamification();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = state.streak;

  if (state.lastActivityDate === today) {
    // Already logged today, no change
  } else if (state.lastActivityDate === yesterday) {
    // Consecutive day
    streak += 1;
  } else {
    // Streak broken (or first activity)
    streak = 1;
  }

  const newState: GamificationState = {
    ...state,
    streak,
    lastActivityDate: today,
  };

  safeSet(KEYS.GAMIFICATION, newState);
  return newState;
}

// ─────────────────────── Badges ───────────────────────

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  check: (state: GamificationState, records: ActivityRecord[]) => boolean;
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'green_beginner',
    name: 'Green Beginner',
    description: 'Log your first carbon activity',
    icon: '🌱',
    requirement: 'Log 1 activity',
    check: (_s, records) => records.length >= 1,
  },
  {
    id: 'eco_explorer',
    name: 'Eco Explorer',
    description: 'Log activities in 3 different categories',
    icon: '🔍',
    requirement: 'Use 3 categories',
    check: (_s, records) => {
      const cats = new Set(records.map((r) => r.category));
      return cats.size >= 3;
    },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '🗓️',
    requirement: '7-day streak',
    check: (state) => state.streak >= 7,
  },
  {
    id: 'carbon_reducer',
    name: 'Carbon Reducer',
    description: 'Log 50 activities total',
    icon: '📉',
    requirement: 'Log 50 activities',
    check: (_s, records) => records.length >= 50,
  },
  {
    id: 'challenge_master',
    name: 'Challenge Master',
    description: 'Complete your first challenge',
    icon: '🏆',
    requirement: 'Complete 1 challenge',
    check: (state) => {
      try {
        const challenges = getChallenges();
        return challenges.some((c) => c.completed && c.joined);
      } catch {
        return false;
      }
    },
  },
  {
    id: 'twin_explorer',
    name: 'Twin Explorer',
    description: 'Run your first Carbon Twin simulation',
    icon: '🌀',
    requirement: 'Run 1 simulation',
    check: () => {
      try {
        const sims = getSimulations();
        return sims.length >= 1;
      } catch {
        return false;
      }
    },
  },
  {
    id: 'net_zero_hero',
    name: 'Net Zero Hero',
    description: 'Reach 500 eco points',
    icon: '🌍',
    requirement: '500 eco points',
    check: (state) => state.points >= 500,
  },
  {
    id: 'future_guardian',
    name: 'Future Guardian',
    description: 'Maintain a 30-day logging streak',
    icon: '🛡️',
    requirement: '30-day streak',
    check: (state) => state.streak >= 30,
  },
  {
    id: 'sustainability_champ',
    name: 'Sustainability Champion',
    description: 'Reach 2000 eco points',
    icon: '⭐',
    requirement: '2000 eco points',
    check: (state) => state.points >= 2000,
  },
];

export function checkAndAwardBadges(): string[] {
  const state = getGamification();
  const records = getRecords();
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFS) {
    if (!state.badges.includes(badge.id) && badge.check(state, records)) {
      state.badges.push(badge.id);
      newBadges.push(badge.id);
    }
  }

  if (newBadges.length > 0) {
    safeSet(KEYS.GAMIFICATION, state);
  }

  return newBadges;
}

// ─────────────────────── Challenges ───────────────────────

const DEFAULT_CHALLENGES: StoredChallenge[] = [
  {
    id: 'ch_walk_week',
    title: 'Walk or Cycle 5 Days',
    description: 'Replace your usual commute with walking or cycling for 5 days this week.',
    category: 'transportation',
    targetValue: 5,
    currentValue: 0,
    unit: 'days',
    points: 100,
    difficulty: 'easy',
    daysLeft: 7,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
    joined: false,
    icon: '🚶',
  },
  {
    id: 'ch_meatless',
    title: 'Meatless Monday',
    description: 'Go meat-free for one full day this week.',
    category: 'food',
    targetValue: 1,
    currentValue: 0,
    unit: 'days',
    points: 50,
    difficulty: 'easy',
    daysLeft: 7,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
    joined: false,
    icon: '🥗',
  },
  {
    id: 'ch_energy_save',
    title: 'Cut Energy Use by 10%',
    description: 'Reduce your home energy consumption by 10% compared to last month.',
    category: 'energy',
    targetValue: 10,
    currentValue: 0,
    unit: '%',
    points: 150,
    difficulty: 'medium',
    daysLeft: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    completed: false,
    joined: false,
    icon: '💡',
  },
  {
    id: 'ch_zero_waste',
    title: 'Zero Waste Week',
    description: 'Produce no landfill waste for 7 consecutive days.',
    category: 'waste',
    targetValue: 7,
    currentValue: 0,
    unit: 'days',
    points: 200,
    difficulty: 'hard',
    daysLeft: 7,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
    joined: false,
    icon: '♻️',
  },
  {
    id: 'ch_buy_nothing',
    title: 'Buy Nothing Day',
    description: 'Go 24 hours without buying any new products.',
    category: 'shopping',
    targetValue: 1,
    currentValue: 0,
    unit: 'days',
    points: 75,
    difficulty: 'easy',
    daysLeft: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    joined: false,
    icon: '🛑',
  },
];

export function getChallenges(): StoredChallenge[] {
  const stored = safeGet<StoredChallenge[]>(KEYS.CHALLENGES, []);
  if (stored.length === 0) {
    safeSet(KEYS.CHALLENGES, DEFAULT_CHALLENGES);
    return DEFAULT_CHALLENGES;
  }
  return stored;
}

export function saveChallenge(ch: StoredChallenge): void {
  const challenges = getChallenges();
  const idx = challenges.findIndex((c) => c.id === ch.id);
  if (idx >= 0) {
    challenges[idx] = ch;
  } else {
    challenges.push(ch);
  }
  safeSet(KEYS.CHALLENGES, challenges);
}

export function completeChallenge(id: string): void {
  const challenges = getChallenges();
  const ch = challenges.find((c) => c.id === id);
  if (ch) {
    ch.completed = true;
    ch.completedDate = new Date().toISOString().split('T')[0];
    ch.currentValue = ch.targetValue;
    safeSet(KEYS.CHALLENGES, challenges);
  }
}

// ─────────────────────── Simulations ───────────────────────

export function getSimulations(): StoredSimulation[] {
  return safeGet<StoredSimulation[]>(KEYS.SIMULATIONS, []);
}

export function saveSimulation(sim: StoredSimulation): void {
  const sims = getSimulations();
  sims.unshift(sim); // newest first
  safeSet(KEYS.SIMULATIONS, sims.slice(0, 20)); // keep last 20
}

// ─────────────────────── Chat History ───────────────────────

export function getChatHistory(): ChatMessage[] {
  return safeGet<ChatMessage[]>(KEYS.CHAT_HISTORY, []);
}

export function saveChatMessage(msg: ChatMessage): void {
  const history = getChatHistory();
  history.push(msg);
  safeSet(KEYS.CHAT_HISTORY, history.slice(-100)); // keep last 100 messages
}

export function clearChatHistory(): void {
  safeSet(KEYS.CHAT_HISTORY, []);
}

// ─────────────────────── Data Export / Clear ───────────────────────

export function exportAllData(): string {
  try {
    const data = {
      records: getRecords(),
      preferences: { ...getPreferences() },
      gamification: getGamification(),
      challenges: getChallenges(),
      simulations: getSimulations(),
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
    return JSON.stringify(data, null, 2);
  } catch {
    return '{}';
  }
}

export function clearAllData(): void {
  try {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore
  }
}
