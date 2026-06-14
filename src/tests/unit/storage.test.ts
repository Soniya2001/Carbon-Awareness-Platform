/**
 * Storage layer unit tests
 * Runs in jsdom (localStorage available)
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'window', { value: global });

import {
  getRecords, saveRecord, getTodayRecord, getRecentRecords, getMonthlySummary,
  getPreferences, savePreferences,
  getGamification, addEcoPoints, calcLevel, updateStreak, checkAndAwardBadges,
  LEVEL_LABELS, LEVEL_THRESHOLDS, BADGE_DEFS,
  getChallenges, saveChallenge, completeChallenge,
  getSimulations, saveSimulation,
  getChatHistory, saveChatMessage, clearChatHistory,
  clearAllData,
  type ActivityRecord,
} from '../../lib/storage';

// Helper to create a record
function makeRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: `test-${Date.now()}-${Math.random()}`,
    date: today,
    category: 'transportation',
    subcategory: 'car_petrol',
    value: 20,
    co2e: 3.84,
    unit: 'km',
    label: 'Car (Petrol)',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorageMock.clear();
});

// ── Records ──────────────────────────────────────────────────────────
describe('getRecords / saveRecord', () => {
  it('returns empty array when no records', () => {
    expect(getRecords()).toEqual([]);
  });

  it('saves and retrieves a record', () => {
    const r = makeRecord();
    saveRecord(r);
    const records = getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(r.id);
  });

  it('saves multiple records', () => {
    saveRecord(makeRecord({ id: 'r1' }));
    saveRecord(makeRecord({ id: 'r2' }));
    expect(getRecords()).toHaveLength(2);
  });
});

describe('getTodayRecord', () => {
  it('returns only today\'s records', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    saveRecord(makeRecord({ id: 'today', date: today }));
    saveRecord(makeRecord({ id: 'yesterday', date: yesterday }));
    const todayRecords = getTodayRecord();
    expect(todayRecords).toHaveLength(1);
    expect(todayRecords[0].id).toBe('today');
  });
});

describe('getRecentRecords', () => {
  it('filters records within range', () => {
    const today = new Date().toISOString().split('T')[0];
    const oldDate = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0];
    saveRecord(makeRecord({ id: 'recent', date: today }));
    saveRecord(makeRecord({ id: 'old', date: oldDate }));
    const recent = getRecentRecords(30);
    expect(recent.map((r) => r.id)).toContain('recent');
    expect(recent.map((r) => r.id)).not.toContain('old');
  });
});

describe('getMonthlySummary', () => {
  it('returns correct total', () => {
    saveRecord(makeRecord({ co2e: 10 }));
    saveRecord(makeRecord({ co2e: 5 }));
    const summary = getMonthlySummary();
    expect(summary.total).toBeCloseTo(15, 1);
  });

  it('groups by category correctly', () => {
    saveRecord(makeRecord({ category: 'transportation', co2e: 10 }));
    saveRecord(makeRecord({ category: 'food', co2e: 5 }));
    const summary = getMonthlySummary();
    expect(summary.byCategory.transportation).toBeCloseTo(10, 1);
    expect(summary.byCategory.food).toBeCloseTo(5, 1);
  });
});

// ── Preferences ───────────────────────────────────────────────────────
describe('getPreferences / savePreferences', () => {
  it('returns defaults on first call', () => {
    const prefs = getPreferences();
    expect(prefs.onboardingDone).toBe(false);
    expect(prefs.dietType).toBe('omnivore');
    expect(prefs.theme).toBe('system');
  });

  it('saves and retrieves partial updates', () => {
    savePreferences({ name: 'Soniya', onboardingDone: true });
    const prefs = getPreferences();
    expect(prefs.name).toBe('Soniya');
    expect(prefs.onboardingDone).toBe(true);
    expect(prefs.theme).toBe('system'); // default preserved
  });
});

// ── Gamification ──────────────────────────────────────────────────────
describe('addEcoPoints', () => {
  it('starts at 0 and increments', () => {
    addEcoPoints(50, 'test');
    expect(getGamification().points).toBe(50);
  });

  it('accumulates correctly', () => {
    addEcoPoints(100);
    addEcoPoints(200);
    expect(getGamification().points).toBe(300);
  });

  it('logs point history', () => {
    addEcoPoints(10, 'reason1');
    const g = getGamification();
    expect(g.pointsHistory[0].reason).toBe('reason1');
  });
});

describe('calcLevel', () => {
  it.each([
    [0, 1],
    [249, 1],
    [250, 2],
    [799, 2],
    [800, 3],
    [1999, 3],
    [2000, 4],
    [4999, 4],
    [5000, 5],
    [9999, 5],
  ])('%d points -> level %d', (points, expectedLevel) => {
    expect(calcLevel(points)).toBe(expectedLevel);
  });
});

describe('LEVEL_LABELS', () => {
  it('has 6 entries (index 0 empty)', () => {
    expect(LEVEL_LABELS).toHaveLength(6);
    expect(LEVEL_LABELS[0]).toBe('');
  });

  it('level 5 is Climate Hero', () => {
    expect(LEVEL_LABELS[5]).toContain('Climate Hero');
  });
});

describe('updateStreak', () => {
  it('starts streak at 1 on first activity', () => {
    const state = updateStreak();
    expect(state.streak).toBe(1);
  });

  it('does not increment streak on same day double-call', () => {
    updateStreak();
    const state = updateStreak();
    expect(state.streak).toBe(1);
  });
});

describe('BADGE_DEFS', () => {
  it('has 9 badge definitions', () => {
    expect(BADGE_DEFS).toHaveLength(9);
  });

  it('every badge has required fields', () => {
    BADGE_DEFS.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.icon).toBeTruthy();
      expect(typeof b.check).toBe('function');
    });
  });
});

describe('checkAndAwardBadges', () => {
  it('awards green_beginner after first record', () => {
    saveRecord(makeRecord());
    updateStreak();
    addEcoPoints(10);
    const newBadges = checkAndAwardBadges();
    expect(newBadges).toContain('green_beginner');
  });

  it('does not re-award already earned badge', () => {
    saveRecord(makeRecord());
    checkAndAwardBadges();
    const second = checkAndAwardBadges();
    expect(second).not.toContain('green_beginner');
  });
});

// ── Challenges ────────────────────────────────────────────────────────
describe('getChallenges / saveChallenge', () => {
  it('returns default challenges on first call', () => {
    const challenges = getChallenges();
    expect(challenges.length).toBeGreaterThan(0);
  });

  it('saves a new challenge', () => {
    const initial = getChallenges().length;
    saveChallenge({
      id: 'new_ch',
      title: 'Test Challenge',
      description: 'Test',
      category: 'transportation',
      targetValue: 5,
      currentValue: 0,
      unit: 'days',
      points: 100,
      difficulty: 'easy',
      daysLeft: 7,
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      completed: false,
      joined: false,
      icon: '🧪',
    });
    expect(getChallenges().length).toBeGreaterThan(initial);
  });

  it('completeChallenge marks as completed', () => {
    const challenges = getChallenges();
    const first = challenges[0];
    completeChallenge(first.id);
    const updated = getChallenges().find((c) => c.id === first.id);
    expect(updated!.completed).toBe(true);
    expect(updated!.completedDate).toBeDefined();
  });
});

// ── Simulations ───────────────────────────────────────────────────────
describe('getSimulations / saveSimulation', () => {
  it('returns empty array initially', () => {
    expect(getSimulations()).toEqual([]);
  });

  it('saves and retrieves a simulation', () => {
    saveSimulation({
      id: 'sim1',
      scenarioKey: 'public_transport',
      scenarioName: 'Public Transport',
      years: 5,
      annualSavingKg: 500,
      savingPercent: 20,
      sustainabilityScore: 65,
      createdAt: new Date().toISOString(),
    });
    expect(getSimulations()).toHaveLength(1);
    expect(getSimulations()[0].scenarioKey).toBe('public_transport');
  });
});

// ── Chat ──────────────────────────────────────────────────────────────
describe('chat history', () => {
  it('starts empty', () => {
    expect(getChatHistory()).toEqual([]);
  });

  it('saves and retrieves messages', () => {
    saveChatMessage({ id: 'm1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() });
    saveChatMessage({ id: 'm2', role: 'assistant', content: 'Hi!', timestamp: new Date().toISOString() });
    expect(getChatHistory()).toHaveLength(2);
  });

  it('clearChatHistory empties the history', () => {
    saveChatMessage({ id: 'm1', role: 'user', content: 'test', timestamp: new Date().toISOString() });
    clearChatHistory();
    expect(getChatHistory()).toEqual([]);
  });
});

// ── clearAllData ──────────────────────────────────────────────────────
describe('clearAllData', () => {
  it('clears all stored data', () => {
    saveRecord(makeRecord());
    savePreferences({ name: 'Test' });
    clearAllData();
    expect(getRecords()).toEqual([]);
    expect(getPreferences().name).toBe('');
  });
});
