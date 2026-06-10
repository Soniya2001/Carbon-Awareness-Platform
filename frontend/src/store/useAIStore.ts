import { create } from 'zustand';
import type { ChatMessage, AIRecommendation } from '@/src/types';

interface AIState {
  messages: ChatMessage[];
  recommendations: AIRecommendation[];
  isTyping: boolean;
  explanation: string | null;
  isLoading: boolean;
  error: string | null;

  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setRecommendations: (recommendations: AIRecommendation[]) => void;
  setIsTyping: (typing: boolean) => void;
  setExplanation: (explanation: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  recommendations: [],
  isTyping: false,
  explanation: null,
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),

  setRecommendations: (recommendations) => set({ recommendations }),

  setIsTyping: (isTyping) => set({ isTyping }),

  setExplanation: (explanation) => set({ explanation }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),
}));
