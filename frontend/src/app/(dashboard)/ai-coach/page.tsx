'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useAICoach } from '@/src/hooks/useAICoach';
import { formatRelativeTime } from '@/src/lib/utils';
import type { ChatMessage } from '@/src/types';

const QUICK_PROMPTS = [
  'Explain my transport emissions',
  'How can I reduce my food footprint?',
  'What are my top 3 improvement areas?',
  'How do I compare to the global average?',
  'Give me a weekly sustainability challenge',
  'What is Carbon Twin AI?',
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="listitem"
    >
      {/* Avatar */}
      <div
        className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
          isUser ? 'bg-eco-600 text-white' : 'bg-purple-100 text-purple-700'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-eco-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
        }`}
        aria-label={`${isUser ? 'You' : 'AI Coach'}: ${message.content}`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`mt-1 text-[10px] ${isUser ? 'text-eco-200' : 'text-gray-400'}`}>
          {formatRelativeTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3" aria-label="AI is typing" aria-live="polite">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-gray-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AICoachPage() {
  const { messages, sendMessage, getExplanation, isTyping, clearMessages } = useAICoach();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    await sendMessage(msg);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" aria-hidden="true" />
            AI Sustainability Coach
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Powered by Gemini — ask anything about your carbon footprint
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => getExplanation()}>
            <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
            Get insights
          </Button>
          <Button variant="ghost" size="sm" onClick={clearMessages} aria-label="Clear conversation">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <Bot className="h-7 w-7 text-purple-600" aria-hidden="true" />
              </div>
              <h2 className="font-semibold text-gray-900">Your AI Sustainability Coach</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                I can explain your emissions, suggest improvements, generate challenges, and answer any sustainability question.
              </p>
              {/* Quick prompts */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-eco-400 hover:bg-eco-50 hover:text-eco-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Conversation">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={endRef} />
            </div>
          )}
        </CardContent>

        {/* Quick prompts bar (when messages exist) */}
        {messages.length > 0 && (
          <div className="border-t px-4 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
            {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-eco-400 hover:text-eco-700 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-eco-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your carbon footprint…"
              className="flex-1"
              aria-label="Message input"
              disabled={isTyping}
              maxLength={500}
            />
            <Button
              onClick={handleSend}
              variant="eco"
              size="icon"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Press Enter to send · AI responses are for guidance only
          </p>
        </div>
      </Card>
    </div>
  );
}
