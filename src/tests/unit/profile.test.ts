/**
 * SustainabilityProfile unit tests
 */

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'window',       { value: global });

import {
  getProfile, saveProfile, profileCompletionPercent,
  profileBaselineMonthly, isProfileComplete, DEFAULT_PROFILE,
} from '../../lib/storage';

beforeEach(() => { localStorageMock.clear(); });

// ── getProfile ────────────────────────────────────────────────────────
describe('getProfile', () => {
  it('returns defaults on first call', () => {
    const p = getProfile();
    expect(p.name).toBe('');
    expect(p.primaryTransport).toBe('car_petrol');
    expect(p.dietType).toBe('omnivore');
    expect(p.version).toBe(1);
  });

  it('merges saved values with defaults', () => {
    saveProfile({ name: 'Soniya', dietType: 'vegan' });
    const p = getProfile();
    expect(p.name).toBe('Soniya');
    expect(p.dietType).toBe('vegan');
    expect(p.primaryTransport).toBe('car_petrol'); // default preserved
  });
});

// ── saveProfile ───────────────────────────────────────────────────────
describe('saveProfile', () => {
  it('persists partial updates', () => {
    saveProfile({ name: 'Alex', weeklyCommuteKm: 80 });
    const p = getProfile();
    expect(p.name).toBe('Alex');
    expect(p.weeklyCommuteKm).toBe(80);
  });

  it('sets updatedAt on save', () => {
    saveProfile({ name: 'Test' });
    const p = getProfile();
    expect(p.updatedAt).toBeTruthy();
    expect(new Date(p.updatedAt).getTime()).toBeGreaterThan(0);
  });
});

// ── profileCompletionPercent ──────────────────────────────────────────
describe('profileCompletionPercent', () => {
  it('returns 0 for empty default profile', () => {
    const p = { ...DEFAULT_PROFILE };
    // name is empty → lower score
    expect(profileCompletionPercent(p)).toBeLessThan(50);
  });

  it('returns 100 for fully filled profile', () => {
    const full = {
      ...DEFAULT_PROFILE,
      name: 'Test User',
      primaryTransport: 'bus' as const,
      weeklyCommuteKm: 40,
      monthlyElectricityKwh: 250,
      dietType: 'vegetarian' as const,
      monthlyShoppingItems: 3,
      shortFlightsPerYear: 2,
      longFlightsPerYear: 1,
      wasteRecyclingPercent: 60,
    };
    expect(profileCompletionPercent(full)).toBe(100);
  });

  it('returns partial score for half-filled profile', () => {
    const partial = {
      ...DEFAULT_PROFILE,
      name: 'Partial',
      dietType: 'vegan' as const,
      monthlyElectricityKwh: 200,
    };
    const pct = profileCompletionPercent(partial);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });
});

// ── profileBaselineMonthly ────────────────────────────────────────────
describe('profileBaselineMonthly', () => {
  it('returns all 5 categories', () => {
    const profile = getProfile();
    const baseline = profileBaselineMonthly(profile);
    expect(Object.keys(baseline)).toEqual(
      expect.arrayContaining(['transportation', 'energy', 'food', 'shopping', 'waste'])
    );
  });

  it('transportation emissions are higher for car_petrol than bicycle', () => {
    const carProfile  = { ...DEFAULT_PROFILE, primaryTransport: 'car_petrol'  as const, weeklyCommuteKm: 100 };
    const bikeProfile = { ...DEFAULT_PROFILE, primaryTransport: 'bicycle'     as const, weeklyCommuteKm: 100 };
    expect(profileBaselineMonthly(carProfile).transportation).toBeGreaterThan(
      profileBaselineMonthly(bikeProfile).transportation
    );
  });

  it('vegan diet has lower food emissions than high_meat', () => {
    const vegan    = { ...DEFAULT_PROFILE, dietType: 'vegan'    as const };
    const highMeat = { ...DEFAULT_PROFILE, dietType: 'high_meat'as const };
    expect(profileBaselineMonthly(vegan).food).toBeLessThan(profileBaselineMonthly(highMeat).food);
  });

  it('renewable energy reduces electricity baseline', () => {
    const grid = { ...DEFAULT_PROFILE, monthlyElectricityKwh: 300, usesRenewableEnergy: false };
    const renew= { ...DEFAULT_PROFILE, monthlyElectricityKwh: 300, usesRenewableEnergy: true  };
    expect(profileBaselineMonthly(renew).energy).toBeLessThan(profileBaselineMonthly(grid).energy);
  });

  it('AC usage increases energy baseline', () => {
    const noAC  = { ...DEFAULT_PROFILE, hasAirConditioning: false, acHoursPerDay: 0 };
    const withAC= { ...DEFAULT_PROFILE, hasAirConditioning: true,  acHoursPerDay: 8 };
    expect(profileBaselineMonthly(withAC).energy).toBeGreaterThan(profileBaselineMonthly(noAC).energy);
  });

  it('total baseline is positive', () => {
    const total = Object.values(profileBaselineMonthly(getProfile())).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
  });
});

// ── isProfileComplete ─────────────────────────────────────────────────
describe('isProfileComplete', () => {
  it('returns false for default profile', () => {
    expect(isProfileComplete(DEFAULT_PROFILE)).toBe(false);
  });

  it('returns false when name is empty', () => {
    const p = { ...DEFAULT_PROFILE, completedAt: new Date().toISOString() };
    expect(isProfileComplete(p)).toBe(false);
  });

  it('returns false when completedAt is empty', () => {
    const p = { ...DEFAULT_PROFILE, name: 'Test', completedAt: '' };
    expect(isProfileComplete(p)).toBe(false);
  });

  it('returns true when name and completedAt are set', () => {
    const p = { ...DEFAULT_PROFILE, name: 'Test', completedAt: new Date().toISOString() };
    expect(isProfileComplete(p)).toBe(true);
  });
});

// ── Integration: onboarding → settings sync ───────────────────────────
describe('onboarding → settings sync', () => {
  it('profile saved during onboarding is readable in settings', () => {
    saveProfile({
      name: 'Integration User',
      dietType: 'vegan',
      primaryTransport: 'bus',
      weeklyCommuteKm: 30,
      completedAt: new Date().toISOString(),
    });

    const loaded = getProfile();
    expect(loaded.name).toBe('Integration User');
    expect(loaded.dietType).toBe('vegan');
    expect(loaded.primaryTransport).toBe('bus');
    expect(loaded.weeklyCommuteKm).toBe(30);
    expect(isProfileComplete(loaded)).toBe(true);
  });

  it('updating a field in settings does not reset other fields', () => {
    saveProfile({ name: 'Original', dietType: 'vegan', weeklyCommuteKm: 50 });
    saveProfile({ dietType: 'vegetarian' }); // settings update

    const loaded = getProfile();
    expect(loaded.name).toBe('Original');           // preserved
    expect(loaded.dietType).toBe('vegetarian');     // updated
    expect(loaded.weeklyCommuteKm).toBe(50);        // preserved
  });
});
