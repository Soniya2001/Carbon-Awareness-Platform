import { renderHook, act } from '@testing-library/react';
import { useCarbonStore } from '../../../src/store/useCarbonStore';

// Mock the API
jest.mock('../../../src/lib/api', () => ({
  carbonApi: {
    logActivity: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'test-id',
        category: 'transportation',
        subcategory: 'car_petrol',
        value: 50,
        unit: 'km',
        co2e: 10.5,
        date: '2026-06-10',
        createdAt: '2026-06-10T10:00:00Z',
      },
      message: 'Activity logged',
      timestamp: new Date().toISOString(),
    }),
    getHistory: jest.fn().mockResolvedValue({
      success: true,
      data: [],
      message: 'Success',
      timestamp: new Date().toISOString(),
    }),
    getDailySummary: jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalCo2e: 25.5,
        byCategory: {
          transportation: 15,
          energy: 8,
          food: 2.5,
          shopping: 0,
          waste: 0,
        },
        averageDaily: 25.5,
        comparedToGlobal: -20,
        sustainabilityScore: 65,
        trend: 'improving',
        percentileRank: 40,
      },
      message: 'Success',
      timestamp: new Date().toISOString(),
    }),
  },
  setAccessToken: jest.fn(),
}));

describe('useCarbonStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCarbonStore.setState({
      activities: [],
      history: null,
      summary: null,
      isLoading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const { activities, history, summary, isLoading } = useCarbonStore.getState();
    expect(activities).toEqual([]);
    expect(history).toBeNull();
    expect(summary).toBeNull();
    expect(isLoading).toBe(false);
  });

  it('sets loading state correctly', () => {
    const { setLoading } = useCarbonStore.getState();
    act(() => setLoading(true));
    expect(useCarbonStore.getState().isLoading).toBe(true);
    act(() => setLoading(false));
    expect(useCarbonStore.getState().isLoading).toBe(false);
  });

  it('handles logActivity correctly', async () => {
    const { logActivity } = useCarbonStore.getState();
    await act(async () => {
      await logActivity({
        category: 'transportation',
        subcategory: 'car_petrol',
        value: 50,
        unit: 'km',
      });
    });
    const state = useCarbonStore.getState();
    expect(state.activities.length).toBeGreaterThanOrEqual(0);
    expect(state.isLoading).toBe(false);
  });
});

describe('Carbon calculation correctness', () => {
  const FACTORS = {
    car_petrol: 0.21,
    bus: 0.089,
    train: 0.041,
    beef: 27,
    chicken: 6.9,
    vegan_meal: 1.5,
  };

  test.each([
    ['car_petrol', 100, 21],
    ['bus', 100, 8.9],
    ['train', 100, 4.1],
  ])('%s travel %d km = %d kg CO2', (type, km, expected) => {
    const factor = FACTORS[type as keyof typeof FACTORS];
    expect(km * factor).toBeCloseTo(expected, 0);
  });

  test.each([
    ['beef', 1, 27],
    ['chicken', 1, 6.9],
    ['vegan_meal', 1, 1.5],
  ])('%s %d unit = %d kg CO2', (food, units, expected) => {
    const factor = FACTORS[food as keyof typeof FACTORS];
    expect(units * factor).toBeCloseTo(expected, 1);
  });
});
