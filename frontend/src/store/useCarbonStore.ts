import { create } from 'zustand';
import type { Activity, FootprintSummary, CarbonRecord } from '@/src/types';

interface CarbonState {
  activities: Activity[];
  summary: FootprintSummary | null;
  weeklyRecords: CarbonRecord[];
  todayRecord: CarbonRecord | null;
  isLoading: boolean;
  error: string | null;

  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  setSummary: (summary: FootprintSummary | null) => void;
  setWeeklyRecords: (records: CarbonRecord[]) => void;
  setTodayRecord: (record: CarbonRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCarbonStore = create<CarbonState>((set) => ({
  activities: [],
  summary: null,
  weeklyRecords: [],
  todayRecord: null,
  isLoading: false,
  error: null,

  setActivities: (activities) => set({ activities }),

  addActivity: (activity) =>
    set((state) => ({ activities: [activity, ...state.activities] })),

  removeActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),

  setSummary: (summary) => set({ summary }),

  setWeeklyRecords: (weeklyRecords) => set({ weeklyRecords }),

  setTodayRecord: (todayRecord) => set({ todayRecord }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      activities: [],
      summary: null,
      weeklyRecords: [],
      todayRecord: null,
      isLoading: false,
      error: null,
    }),
}));
