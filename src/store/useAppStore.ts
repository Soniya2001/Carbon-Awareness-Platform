// Zustand store — no persist middleware, reads/writes to localStorage directly

import { create } from 'zustand';
import {
  getRecords,
  saveRecord,
  deleteRecord as storageDeleteRecord,
  getMonthlySummary,
  getPreferences,
  savePreferences,
  getGamification,
  addEcoPoints,
  updateStreak,
  checkAndAwardBadges,
  getChallenges,
  saveChallenge,
  completeChallenge,
  getSimulations,
  saveSimulation,
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  type ActivityRecord,
  type MonthlySummary,
  type UserPreferences,
  type GamificationState,
  type StoredChallenge,
  type StoredSimulation,
  type ChatMessage,
} from '@/lib/storage';
import { calcCO2, getFactorInfo } from '@/lib/carbonEngine';
import { uniqueId, todayISO } from '@/lib/utils';

export interface ActivityInput {
  category: string;
  subcategory: string;
  value: number;
  date?: string;
}

interface AppState {
  // Data
  records: ActivityRecord[];
  monthlySummary: MonthlySummary | null;
  preferences: UserPreferences | null;
  gamification: GamificationState | null;
  challenges: StoredChallenge[];
  simulations: StoredSimulation[];
  chatHistory: ChatMessage[];
  newBadges: string[];

  // UI state
  isLoading: boolean;
  aiLoading: boolean;
}

interface AppActions {
  // Initialization
  init: () => void;

  // Activity logging
  logActivity: (input: ActivityInput) => ActivityRecord | null;

  // Data refresh
  refreshSummary: () => void;

  // Preferences
  updatePreferences: (partial: Partial<UserPreferences>) => void;

  // Gamification
  addPoints: (pts: number, reason?: string) => void;

  // Challenges
  joinChallenge: (id: string) => void;
  updateChallengeProgress: (id: string, progress: number) => void;
  markChallengeComplete: (id: string) => void;
  addChallenge: (ch: StoredChallenge) => void;

  // Simulations
  addSimulation: (sim: StoredSimulation) => void;

  // Chat
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // UI
  setAILoading: (v: boolean) => void;
  dismissBadges: () => void;

  // Records
  deleteRecord: (id: string) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // ── Initial State ──────────────────────────────
  records: [],
  monthlySummary: null,
  preferences: null,
  gamification: null,
  challenges: [],
  simulations: [],
  chatHistory: [],
  newBadges: [],
  isLoading: false,
  aiLoading: false,

  // ── Initialization ─────────────────────────────
  init: () => {
    try {
      const records = getRecords();
      const monthlySummary = getMonthlySummary();
      const preferences = getPreferences();
      const gamification = getGamification();
      const challenges = getChallenges();
      const simulations = getSimulations();
      const chatHistory = getChatHistory();

      set({
        records,
        monthlySummary,
        preferences,
        gamification,
        challenges,
        simulations,
        chatHistory,
      });
    } catch (error) {
      console.error('Failed to initialize app store:', error);
    }
  },

  // ── Activity Logging ───────────────────────────
  logActivity: (input: ActivityInput) => {
    try {
      const factorInfo = getFactorInfo(input.category, input.subcategory);
      if (!factorInfo) return null;

      const co2e = calcCO2(input.category, input.subcategory, input.value);
      const record: ActivityRecord = {
        id: uniqueId(),
        date: input.date ?? todayISO(),
        category: input.category,
        subcategory: input.subcategory,
        value: input.value,
        co2e,
        unit: factorInfo.unit,
        label: factorInfo.label,
        createdAt: new Date().toISOString(),
      };

      saveRecord(record);

      // Update streak
      updateStreak();

      // Award points
      const earnedPoints = 10 + Math.floor(co2e * 0.5);
      addEcoPoints(earnedPoints, `Logged ${factorInfo.label}`);

      // Check badges
      const newBadges = checkAndAwardBadges();

      // Refresh state
      const records = getRecords();
      const monthlySummary = getMonthlySummary();
      const gamification = getGamification();

      set((state) => ({
        records,
        monthlySummary,
        gamification,
        newBadges: [...state.newBadges, ...newBadges],
      }));

      return record;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  },

  // ── Delete Record ──────────────────────────────
  deleteRecord: (id: string) => {
    try {
      storageDeleteRecord(id);
      const records = getRecords();
      const monthlySummary = getMonthlySummary();
      set({ records, monthlySummary });
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  },

  // ── Data Refresh ───────────────────────────────
  refreshSummary: () => {
    try {
      const monthlySummary = getMonthlySummary();
      const records = getRecords();
      set({ monthlySummary, records });
    } catch (error) {
      console.error('Failed to refresh summary:', error);
    }
  },

  // ── Preferences ────────────────────────────────
  updatePreferences: (partial: Partial<UserPreferences>) => {
    try {
      savePreferences(partial);
      const preferences = getPreferences();
      set({ preferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  },

  // ── Gamification ───────────────────────────────
  addPoints: (pts: number, reason = 'Eco action') => {
    try {
      addEcoPoints(pts, reason);
      const gamification = getGamification();
      const newBadges = checkAndAwardBadges();
      set((state) => ({
        gamification,
        newBadges: [...state.newBadges, ...newBadges],
      }));
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  },

  // ── Challenges ─────────────────────────────────
  joinChallenge: (id: string) => {
    try {
      const challenges = get().challenges;
      const ch = challenges.find((c) => c.id === id);
      if (ch) {
        const updated = { ...ch, joined: true };
        saveChallenge(updated);
        set({ challenges: getChallenges() });
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  },

  updateChallengeProgress: (id: string, progress: number) => {
    try {
      const challenges = get().challenges;
      const ch = challenges.find((c) => c.id === id);
      if (ch) {
        const updated = { ...ch, currentValue: Math.min(progress, ch.targetValue) };
        saveChallenge(updated);
        set({ challenges: getChallenges() });
      }
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
    }
  },

  markChallengeComplete: (id: string) => {
    try {
      const challenges = get().challenges;
      const ch = challenges.find((c) => c.id === id);
      if (ch && !ch.completed) {
        completeChallenge(id);
        // Award points
        addEcoPoints(ch.points, `Completed: ${ch.title}`);
        const gamification = getGamification();
        const newBadges = checkAndAwardBadges();
        set((state) => ({
          challenges: getChallenges(),
          gamification,
          newBadges: [...state.newBadges, ...newBadges],
        }));
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  },

  addChallenge: (ch: StoredChallenge) => {
    try {
      saveChallenge(ch);
      set({ challenges: getChallenges() });
    } catch (error) {
      console.error('Failed to add challenge:', error);
    }
  },

  // ── Simulations ────────────────────────────────
  addSimulation: (sim: StoredSimulation) => {
    try {
      saveSimulation(sim);
      // Award points for running simulation
      addEcoPoints(20, 'Ran Carbon Twin simulation');
      const gamification = getGamification();
      const newBadges = checkAndAwardBadges();
      set((state) => ({
        simulations: getSimulations(),
        gamification,
        newBadges: [...state.newBadges, ...newBadges],
      }));
    } catch (error) {
      console.error('Failed to add simulation:', error);
    }
  },

  // ── Chat ───────────────────────────────────────
  addChatMessage: (msg: ChatMessage) => {
    try {
      saveChatMessage(msg);
      set({ chatHistory: getChatHistory() });
    } catch (error) {
      console.error('Failed to add chat message:', error);
    }
  },

  clearChat: () => {
    try {
      clearChatHistory();
      set({ chatHistory: [] });
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  },

  // ── UI ─────────────────────────────────────────
  setAILoading: (v: boolean) => set({ aiLoading: v }),

  dismissBadges: () => set({ newBadges: [] }),
}));
