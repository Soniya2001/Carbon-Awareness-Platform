'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, User, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function RootPage() {
  const router = useRouter();
  const { preferences, updatePreferences } = useAppStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [diet, setDiet] = useState<'omnivore' | 'flexitarian' | 'vegetarian' | 'vegan'>('omnivore');
  const [apiKey, setApiKey] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect if onboarding is already completed
  useEffect(() => {
    if (mounted && preferences?.onboardingDone) {
      router.replace('/dashboard');
    }
  }, [mounted, preferences, router]);

  if (!mounted || preferences === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-eco-600" aria-label="Loading application" />
        <p className="text-sm text-muted-foreground">Initializing CarbonWise AI…</p>
      </div>
    );
  }

  // Double check in case of rendering delay
  if (preferences.onboardingDone) {
    return null;
  }

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save details & finish onboarding
      updatePreferences({
        onboardingDone: true,
        name: name.trim(),
        dietType: diet,
        geminiApiKey: apiKey.trim(),
      });
      router.push('/dashboard');
    }
  };

  const dietOptions = [
    { key: 'omnivore', label: 'Mixed Diet (Omnivore)', desc: 'Regular consumption of meat, dairy, and vegetables.', emoji: '🥩' },
    { key: 'flexitarian', label: 'Flexitarian', desc: 'Mostly plant-based with occasional meat/poultry.', emoji: '🥗' },
    { key: 'vegetarian', label: 'Vegetarian', desc: 'No meat or poultry, but includes dairy and eggs.', emoji: '🧀' },
    { key: 'vegan', label: 'Vegan', desc: 'Strictly plant-based. No animal products whatsoever.', emoji: '🥦' },
  ] as const;

  return (
    <div className="max-w-xl mx-auto py-12 px-4 flex flex-col justify-center min-h-[75vh]">
      {/* Upper Brand Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-eco-gradient rounded-2xl flex items-center justify-center shadow-eco-lg animate-bounce-gentle">
          <Leaf className="w-8 h-8 text-white" />
        </div>
      </div>

      <CardContainer>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display text-foreground">Welcome to CarbonWise AI</h2>
                <p className="text-sm text-muted-foreground">
                  Your journey towards a carbon-conscious lifestyle starts here. Let&apos;s get to know you.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">What should we call you?</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-11"
                    maxLength={30}
                    required
                    aria-label="Your name"
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full h-11"
                variant="gradient"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display text-foreground">Select Your Diet</h2>
                <p className="text-sm text-muted-foreground">
                  Diet accounts for a significant portion of personal greenhouse gas emissions.
                </p>
              </div>

              <div className="space-y-3" role="radiogroup" aria-label="Select diet type">
                {dietOptions.map((opt) => {
                  const isSel = diet === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setDiet(opt.key)}
                      className={cn(
                        'w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-ring',
                        isSel
                          ? 'border-eco-500 bg-eco-50/50 dark:bg-eco-900/10'
                          : 'border-border bg-card hover:border-eco-200'
                      )}
                      role="radio"
                      aria-checked={isSel}
                    >
                      <span className="text-2xl mt-0.5" aria-hidden>{opt.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                  Back
                </Button>
                <Button variant="gradient" onClick={handleNext} className="flex-1 h-11">
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display text-foreground">Gemini AI Configuration</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Gemini key to activate personal coaching, custom challenges, and twin analytics.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="apiKey" className="text-sm font-semibold flex items-center justify-between">
                  <span>Gemini API Key (Optional)</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-eco-600 hover:underline flex items-center gap-0.5"
                  >
                    Get free key <Sparkles className="w-3 h-3" />
                  </a>
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Paste your API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-11 font-mono"
                  aria-label="Gemini API key"
                />
                <div className="rounded-lg bg-muted/50 p-3 flex gap-2 border text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-eco-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Your API key is stored locally in your browser and is only sent directly to Google APIs. No backend database has access to it.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                  Back
                </Button>
                <Button variant="gradient" onClick={handleNext} className="flex-1 h-11">
                  Finish Setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContainer>
    </div>
  );
}

function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg border-border glass-panel">
      {children}
    </div>
  );
}
