import { calcLevel, LEVEL_LABELS, LEVEL_THRESHOLDS, BADGE_DEFS } from '../../lib/storage';

describe('calcLevel thresholds', () => {
  it('returns level 1 for 0 points', () => {
    expect(calcLevel(0)).toBe(1);
  });

  it('returns level 1 just below threshold 2', () => {
    expect(calcLevel(LEVEL_THRESHOLDS[2] - 1)).toBe(1);
  });

  it('returns level 2 at exact threshold', () => {
    expect(calcLevel(LEVEL_THRESHOLDS[2])).toBe(2);
  });

  it('returns level 3 at threshold', () => {
    expect(calcLevel(LEVEL_THRESHOLDS[3])).toBe(3);
  });

  it('returns level 4 at threshold', () => {
    expect(calcLevel(LEVEL_THRESHOLDS[4])).toBe(4);
  });

  it('returns level 5 at max threshold', () => {
    expect(calcLevel(LEVEL_THRESHOLDS[5])).toBe(5);
  });

  it('returns level 5 for very large number', () => {
    expect(calcLevel(999999)).toBe(5);
  });
});

describe('LEVEL_LABELS', () => {
  it('has correct count (6 including empty index 0)', () => {
    expect(LEVEL_LABELS).toHaveLength(6);
  });

  it('index 0 is empty string', () => {
    expect(LEVEL_LABELS[0]).toBe('');
  });

  it('level 1 is Seedling', () => {
    expect(LEVEL_LABELS[1]).toContain('Seedling');
  });

  it('level 2 is Sapling', () => {
    expect(LEVEL_LABELS[2]).toContain('Sapling');
  });

  it('level 5 is Climate Hero', () => {
    expect(LEVEL_LABELS[5]).toContain('Climate Hero');
  });
});

describe('LEVEL_THRESHOLDS', () => {
  it('thresholds increase monotonically', () => {
    for (let i = 2; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it('has correct count', () => {
    expect(LEVEL_THRESHOLDS).toHaveLength(6);
  });
});

describe('BADGE_DEFS requirements', () => {
  it('every badge has a unique id', () => {
    const ids = BADGE_DEFS.map((b) => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every badge has a check function', () => {
    BADGE_DEFS.forEach((b) => {
      expect(typeof b.check).toBe('function');
    });
  });

  it('green_beginner check requires at least 1 record', () => {
    const badge = BADGE_DEFS.find((b) => b.id === 'green_beginner')!;
    const mockState = { points: 0, level: 1, streak: 0, lastActivityDate: '', badges: [], pointsHistory: [] };
    expect(badge.check(mockState, [])).toBe(false);
    expect(badge.check(mockState, [{ id: '1', date: '2025-01-01', category: 'transportation', subcategory: 'car_petrol', value: 10, co2e: 2, unit: 'km', label: 'Car', createdAt: '' }])).toBe(true);
  });

  it('week_warrior requires streak >= 7', () => {
    const badge = BADGE_DEFS.find((b) => b.id === 'week_warrior')!;
    const lowStreak = { points: 0, level: 1, streak: 6, lastActivityDate: '', badges: [], pointsHistory: [] };
    const highStreak = { ...lowStreak, streak: 7 };
    expect(badge.check(lowStreak, [])).toBe(false);
    expect(badge.check(highStreak, [])).toBe(true);
  });

  it('net_zero_hero requires >= 500 points', () => {
    const badge = BADGE_DEFS.find((b) => b.id === 'net_zero_hero')!;
    const low = { points: 499, level: 1, streak: 0, lastActivityDate: '', badges: [], pointsHistory: [] };
    const high = { ...low, points: 500 };
    expect(badge.check(low, [])).toBe(false);
    expect(badge.check(high, [])).toBe(true);
  });

  it('sustainability_champ requires >= 2000 points', () => {
    const badge = BADGE_DEFS.find((b) => b.id === 'sustainability_champ')!;
    const state = { points: 2000, level: 4, streak: 0, lastActivityDate: '', badges: [], pointsHistory: [] };
    expect(badge.check(state, [])).toBe(true);
  });
});
