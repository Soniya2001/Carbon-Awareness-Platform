'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const DIET_OPTIONS = [
  { key: 'omnivore',    label: 'Mixed Diet (Omnivore)',  desc: 'Regular meat, dairy, and vegetables.', emoji: '🥩' },
  { key: 'flexitarian', label: 'Flexitarian',             desc: 'Mostly plant-based, occasional meat.', emoji: '🥗' },
  { key: 'vegetarian',  label: 'Vegetarian',              desc: 'No meat, includes dairy and eggs.',    emoji: '🧀' },
  { key: 'vegan',       label: 'Vegan',                   desc: 'Strictly plant-based.',                emoji: '🥦' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, updatePreferences } = useAppStore();
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState('');
  const [diet, setDiet]       = useState<typeof DIET_OPTIONS[number]['key']>('omnivore');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && preferences?.onboardingDone) router.replace('/dashboard'); }, [mounted, preferences, router]);

  if (!mounted || preferences === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-eco-600" aria-label="Loading" />
        <p className="text-sm text-muted-foreground">Initialising CarbonWise AI…</p>
      </div>
    );
  }

  if (preferences.onboardingDone) return null;

  const finish = () => {
    updatePreferences({ onboardingDone: true, name: name.trim(), dietType: diet });
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 flex flex-col justify-center min-h-[75vh]">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-eco-gradient rounded-2xl flex items-center justify-center shadow-lg animate-float">
          <Leaf className="w-8 h-8 text-white" aria-hidden />
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-6" aria-label="Step progress">
          {[1, 2].map(s => (
            <div key={s} className={cn('h-2 rounded-full transition-all duration-300', s === step ? 'w-8 bg-eco-600' : s < step ? 'w-2 bg-eco-400' : 'w-2 bg-muted')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Welcome to CarbonWise AI</h1>
                <p className="text-sm text-muted-foreground">Your personal sustainability coach — no sign-up required.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">What should we call you?</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)} className="pl-9 h-11" maxLength={30} autoFocus aria-required="true" />
                </div>
              </div>
              <Button onClick={() => setStep(2)} disabled={!name.trim()} className="w-full h-11" variant="gradient">
                Continue <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Your Diet Type</h1>
                <p className="text-sm text-muted-foreground">Diet is one of the biggest factors in your carbon footprint.</p>
              </div>
              <div className="space-y-2" role="radiogroup" aria-label="Select your diet type">
                {DIET_OPTIONS.map(opt => {
                  const selected = diet === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => setDiet(opt.key)}
                      className={cn('w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500', selected ? 'border-eco-500 bg-eco-50 dark:bg-eco-900/10' : 'border-border bg-card hover:border-eco-200')}
                      role="radio" aria-checked={selected}>
                      <span className="text-2xl mt-0.5" aria-hidden>{opt.emoji}</span>
                      <div><p className="font-semibold text-sm">{opt.label}</p><p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p></div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">Back</Button>
                <Button variant="gradient" onClick={finish} className="flex-1 h-11">Start Tracking 🌱</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">All data stored locally · No account required</p>
    </div>
  );
}
