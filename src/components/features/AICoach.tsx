'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, User, Loader2, AlertCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { chatWithCoach } from '@/lib/gemini';
import { LEVEL_LABELS } from '@/lib/storage';
import { formatDate, uniqueId, sanitize } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Explain my carbon footprint',
  'Give me 5 eco tips',
  "What's my progress?",
  'How do I reduce transport emissions?',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" aria-label="AI is typing" role="status">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-eco-500 text-white'
            : 'bg-gradient-to-br from-eco-500 to-sky-500 text-white'
        }`}
        aria-hidden
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-eco-500 text-white rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <time className="text-[10px] text-muted-foreground px-1" dateTime={timestamp}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </motion.div>
  );
}

export function AICoach() {
  const { chatHistory, preferences, gamification, monthlySummary, addChatMessage, clearChat, setAILoading, aiLoading } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const apiKey = preferences?.geminiApiKey ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  const hasApiKey = apiKey.trim().length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = sanitize(text.trim());
    if (!trimmed || !hasApiKey) return;

    setError(null);
    setInputText('');

    // Add user message
    const userMsg = {
      id: uniqueId(),
      role: 'user' as const,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    setIsTyping(true);
    setAILoading(true);

    try {
      // Build context
      const context = {
        monthlyKg: monthlySummary?.total,
        grade: undefined,
        score: undefined,
        byCategory: monthlySummary?.byCategory,
        name: preferences?.name,
        streak: gamification?.streak,
        level: gamification ? LEVEL_LABELS[gamification.level] : undefined,
      };

      // Build chat history for Gemini
      const historyForGemini = chatHistory.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model' as const,
        parts: [{ text: m.content }],
      }));

      const response = await chatWithCoach(apiKey, trimmed, historyForGemini, context);

      const assistantMsg = {
        id: uniqueId(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMsg);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get response';
      setError(message);
    } finally {
      setIsTyping(false);
      setAILoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-eco-500/10 to-sky-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold">CarbonWise AI Coach</p>
            <p className="text-xs text-muted-foreground">
              {hasApiKey ? 'Online · Ready to help' : 'API key required'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearChat()}
          aria-label="Clear chat history"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" aria-hidden />
        </Button>
      </div>

      {/* No API Key Warning */}
      {!hasApiKey && (
        <div className="m-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3">
          <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Gemini API Key Required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Add your free API key in{' '}
              <a href="/settings" className="underline font-medium" aria-label="Go to settings to add API key">
                Settings
              </a>{' '}
              to chat with your AI coach.{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Get a free key →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-eco-100 to-sky-100 dark:from-eco-900/30 dark:to-sky-900/30 flex items-center justify-center">
              <Bot className="w-8 h-8 text-eco-600 dark:text-eco-400" aria-hidden />
            </div>
            <div>
              <p className="font-medium text-foreground">Hi{preferences?.name ? `, ${preferences.name}` : ''}! 👋</p>
              <p className="text-sm text-muted-foreground mt-1">
                I&apos;m your personal sustainability coach. Ask me anything about your carbon footprint.
              </p>
            </div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" aria-hidden />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {chatHistory.length === 0 && hasApiKey && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-eco-200 dark:border-eco-800 text-eco-700 dark:text-eco-400 hover:bg-eco-50 dark:hover:bg-eco-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey ? 'Ask your AI coach… (Enter to send)' : 'Add API key in Settings to chat'}
            disabled={!hasApiKey || isTyping}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px]"
            aria-label="Chat message input"
          />
          <Button
            onClick={() => sendMessage(inputText)}
            disabled={!hasApiKey || !inputText.trim() || isTyping}
            size="icon"
            variant="gradient"
            aria-label="Send message"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Send className="w-4 h-4" aria-hidden />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
