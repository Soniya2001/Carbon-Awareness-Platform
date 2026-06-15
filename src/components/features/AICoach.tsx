'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { chatWithCoach } from '@/lib/aiClient';
import { uniqueId, sanitize } from '@/lib/utils';

const QUICK_PROMPTS = ['Explain my carbon footprint', 'Give me 5 eco tips', "What's my progress?", 'How do I reduce transport emissions?'];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" aria-label="AI is typing" role="status">
      {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground" animate={{ y:[0,-5,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.1 }} />)}
    </div>
  );
}

function MessageBubble({ role, content, timestamp }: { role:'user'|'assistant'; content:string; timestamp:string }) {
  const isUser = role === 'user';
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }} className={`flex gap-3 ${isUser?'flex-row-reverse':'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser?'bg-eco-500 text-white':'bg-gradient-to-br from-eco-500 to-sky-500 text-white'}`} aria-hidden>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] space-y-1 ${isUser?'items-end':'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser?'bg-eco-500 text-white rounded-tr-sm':'bg-muted text-foreground rounded-tl-sm'}`}>
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <time className="text-[10px] text-muted-foreground px-1" dateTime={timestamp}>{new Date(timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time>
      </div>
    </motion.div>
  );
}

export function AICoach() {
  const { chatHistory, preferences, gamification, monthlySummary, addChatMessage, clearChat, setAILoading } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [error, setError]         = useState<string|null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatHistory, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = sanitize(text.trim());
    if (!trimmed) return;
    setError(null); setInputText('');
    addChatMessage({ id: uniqueId(), role:'user', content: trimmed, timestamp: new Date().toISOString() });
    setIsTyping(true); setAILoading(true);
    try {
      const context = {
        monthly:     monthlySummary?.total,
        topCategory: monthlySummary?.byCategory ? Object.entries(monthlySummary.byCategory).sort(([,a],[,b])=>b-a)[0]?.[0] : undefined,
        streak:      gamification?.streak,
      };
      const response = await chatWithCoach(trimmed, chatHistory.slice(-10).map(m=>({role:m.role,content:m.content})), context);
      addChatMessage({ id: uniqueId(), role:'assistant', content: response, timestamp: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally { setIsTyping(false); setAILoading(false); }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-eco-500/10 to-sky-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" aria-hidden /></div>
          <div><p className="text-sm font-semibold">CarbonWise AI Coach</p><p className="text-xs text-muted-foreground">Online · Powered by Gemini</p></div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => clearChat()} aria-label="Clear chat history"><Trash2 className="w-4 h-4" aria-hidden /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-eco-100 to-sky-100 dark:from-eco-900/30 dark:to-sky-900/30 flex items-center justify-center">
              <Bot className="w-8 h-8 text-eco-600 dark:text-eco-400" aria-hidden />
            </div>
            <div>
              <p className="font-medium">Hi{preferences?.name ? `, ${preferences.name}` : ''}! 👋</p>
              <p className="text-sm text-muted-foreground mt-1">I&apos;m your personal sustainability coach. Ask me anything about your carbon footprint.</p>
            </div>
          </div>
        )}
        {chatHistory.map(msg => <MessageBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />)}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-white" aria-hidden /></div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3"><TypingIndicator /></div>
          </div>
        )}
        {error && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200" role="alert">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden /><p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatHistory.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => <button key={p} onClick={() => sendMessage(p)} className="text-xs px-3 py-1.5 rounded-full border border-eco-200 dark:border-eco-800 text-eco-700 dark:text-eco-400 hover:bg-eco-50 dark:hover:bg-eco-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{p}</button>)}
        </div>
      )}

      <div className="px-4 pb-4 pt-2 border-t">
        <div className="flex gap-2">
          <Textarea value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); }}} placeholder="Ask your AI coach… (Enter to send)" disabled={isTyping} rows={1} className="resize-none min-h-[40px] max-h-[120px]" aria-label="Chat message input" />
          <Button onClick={() => sendMessage(inputText)} disabled={!inputText.trim() || isTyping} size="icon" variant="gradient" aria-label="Send message">
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />}
          </Button>
        </div>
      </div>
    </div>
  );
}
