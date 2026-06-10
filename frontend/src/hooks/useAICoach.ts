'use client';

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { aiApi } from '@/src/lib/api';
import { useAIStore } from '@/src/store/useAIStore';
import type { ChatMessage } from '@/src/types';

export function useAICoach() {
  const {
    messages,
    recommendations,
    isTyping,
    explanation,
    isLoading,
    error,
    addMessage,
    setMessages,
    setRecommendations,
    setIsTyping,
    setExplanation,
    setLoading,
    setError,
    clearMessages,
  } = useAIStore();

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await aiApi.chat(content, history);
      const responseText = res.data?.response ?? 'I apologize, I could not generate a response.';

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
      return responseText;
    } catch (err) {
      const errorMsg = 'Sorry, I\'m having trouble connecting right now. Please try again.';
      addMessage({
        id: uuidv4(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      });
      setError(err instanceof Error ? err.message : 'AI error');
    } finally {
      setIsTyping(false);
    }
  }, [messages, addMessage, setIsTyping, setError]);

  const fetchExplanation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiApi.explainFootprint();
      setExplanation(res.data?.explanation ?? null);
      return res.data?.explanation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get explanation');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setExplanation]);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiApi.getRecommendations();
      setRecommendations((res.data?.recommendations ?? []) as typeof recommendations);
      return res.data?.recommendations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRecommendations]);

  return {
    messages,
    recommendations,
    isTyping,
    explanation,
    isLoading,
    error,
    sendMessage,
    fetchExplanation,
    fetchRecommendations,
    clearMessages,
  };
}
