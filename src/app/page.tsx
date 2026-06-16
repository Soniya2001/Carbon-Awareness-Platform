'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, User, ArrowRight, ArrowLeft, Loader2,
  Car, Zap, Utensils, Plane, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { saveRecord, saveProfile } from '@/lib/storage';

// ─── Assessment data types ────────────────────────────────────────────
interface AssessmentData {
  // Step 1 — Profile
  name: string;
  // Step 2 — Transportation
  primaryTransport: string;
  weeklyCarKm: number;
  // Step 3 — Energy
  electricityKwh: number;
  hasAC: boolean;
  // Step 4 — Food & Shopping
  dietType: 'omnivore' | 'flexitarian' | 'vegetarian' | 'vegan';
  monthlyShoppingItems: number;
  // Step 5 — Travel
  shortFlightsPerYear: number;
  longFlightsPerYear: number;
}

const DEFAULT: AssessmentData = {
  name: '',
  primaryTransport: 'car_petrol',
  weeklyCarKm: 50,
  electricityKwh: 300,
  hasAC: false,
  dietType: 'omnivore',
  monthlyShoppingItems: 2,
  shortFlightsPerYear: 2,
  longFlightsPerYear: 1,
};

// ─── Steps config ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Profile',         icon: User,       color: 'text-eco-600'  },
  { id: 2, label: 'Transport',       icon: Car,        color: 'text-blue-600' },
  { id: 3, label: 'Energy',          icon: Zap,        color: 'text-amber-600'},
  { id: 4, label: 'Food & Shopping', icon: Utensils,   color: 'text-eco-600'  },
  { id: 5, label: 'Travel',          icon: Plane,      color: 'text-sky-600'  },
  { id: 6, label: 'Done',            icon: CheckCircle2,color:'text-eco-600'  },
];

const TRANSPORT_OPTIONS = [
  { key: 'car_petrol',  label: 'Petrol Car',     emoji: '🚗' },
  { key: 'car_electric',label: 'Electric Car',   emoji: '⚡' },
  { key: 'bus',         label: 'Bus / Metro',    emoji: '🚌' },
  { key: 'train',       label: 'Train',          emoji: '🚆' },
  { key: 'bicycle',     label: 'Bicycle',        emoji: '🚲' },
  { key: 'walking',     label: 'Walking',        emoji: '🚶' },
];

const DIET_OPTIONS = [
  { key: 'omnivore',    label: 'Mixed Diet',    desc: 'Regular meat and dairy.',       emoji: '🥩', kgDay: 7.19 },
  { key: 'flexitarian', label: 'Flexitarian',   desc: 'Mostly plant, occasional meat.',emoji: '🥗', kgDay: 5.63 },
  { key: 'vegetarian',  label: 'Vegetarian',    desc: 'No meat, includes dairy/eggs.', emoji: '🧀', kgDay: 3.81 },
  { key: 'vegan',       label: 'Vegan',         desc: 'Strictly plant-based.',         emoji: '🥦', kgDay: 2.89 },
] as const;

// ─── Compute initial carbon records from assessment ───────────────────
function buildInitialRecords(data: AssessmentData) {
  const today = new Date();
  const records = [];

  // Transportation — spread over last 4 weeks
  const CAR_FACTOR: Record<string, number> = { car_petrol: 0.21233, car_electric: 0.05302, bus: 0.08890, train: 0.03694, bicycle: 0, walking: 0 };
  const factor = CAR_FACTOR[data.primaryTransport] ?? 0.21233;

  for (let w = 0; w < 4; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - w * 7 - 1);
    const dateStr = d.toISOString().split('T')[0];
    const co2e = Math.round(data.weeklyCarKm * factor * 100) / 100;
    if (co2e > 0) {
      records.push({ id: `init_transport_${w}`, date: dateStr, category: 'transportation', subcategory: data.primaryTransport, value: data.weeklyCarKm, co2e, unit: 'km', label: TRANSPORT_OPTIONS.find(t => t.key === data.primaryTransport)?.label ?? 'Transport', createdAt: new Date().toISOString() });
    }
  }

  // Energy — monthly average spread
  for (let w = 0; w < 4; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - w * 7 - 2);
    const dateStr = d.toISOString().split('T')[0];
    const weeklyKwh = data.electricityKwh / 4;
    const co2e = Math.round(weeklyKwh * 0.23314 * 100) / 100;
    records.push({ id: `init_energy_${w}`, date: dateStr, category: 'energy', subcategory: 'electricity_grid', value: weeklyKwh, co2e, unit: 'kWh', label: 'Grid Electricity', createdAt: new Date().toISOString() });
    if (data.hasAC) {
      const acCo2 = Math.round(7 * 3 * 0.58285 * 100) / 100;
      records.push({ id: `init_ac_${w}`, date: dateStr, category: 'energy', subcategory: 'air_conditioner', value: 21, co2e: acCo2, unit: 'hours', label: 'Air Conditioner', createdAt: new Date().toISOString() });
    }
  }

  // Food — daily
  const dietFactor = DIET_OPTIONS.find(d => d.key === data.dietType)?.kgDay ?? 5.63;
  for (let day = 0; day < 28; day++) {
    const d = new Date(today);
    d.setDate(d.getDate() - day - 1);
    const dateStr = d.toISOString().split('T')[0];
    records.push({ id: `init_food_${day}`, date: dateStr, category: 'food', subcategory: data.dietType, value: 1, co2e: dietFactor, unit: 'day', label: `${data.dietType.charAt(0).toUpperCase() + data.dietType.slice(1)} Diet`, createdAt: new Date().toISOString() });
  }

  // Shopping — monthly
  if (data.monthlyShoppingItems > 0) {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    const dateStr = d.toISOString().split('T')[0];
    const co2e = Math.round(data.monthlyShoppingItems * 33.4 * 100) / 100;
    records.push({ id: 'init_shopping', date: dateStr, category: 'shopping', subcategory: 'clothing_new', value: data.monthlyShoppingItems, co2e, unit: 'items', label: 'Clothing', createdAt: new Date().toISOString() });
  }

  return records;
}

// ─── Main component ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, updatePreferences } = useAppStore();
  const [step, setStep]         = useState(1);
  const [data, setData]         = useState<AssessmentData>(DEFAULT);
  const [mounted, setMounted]   = useState(false);
  const [completing, setCompleting] = useState(false);

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

  const update = (partial: Partial<AssessmentData>) => setData(prev => ({ ...prev, ...partial }));

  const finish = async () => {
    setCompleting(true);
    // 1. Save initial carbon records from assessment answers
    const initialRecords = buildInitialRecords(data);
    for (const r of initialRecords) {
      saveRecord(r as Parameters<typeof saveRecord>[0]);
    }
    // 2. Save preferences (single source of truth)
    updatePreferences({
      onboardingDone: true,
      name: data.name.trim(),
      dietType: data.dietType,
      notifications: true,
      theme: 'system',
      units: 'metric',
    });
    // 3. Save full SustainabilityProfile — the unified data model
    saveProfile({
      name:                  data.name.trim(),
      region:                '',
      units:                 'metric',
      primaryTransport:      data.primaryTransport as import('@/lib/storage').SustainabilityProfile['primaryTransport'],
      weeklyCommuteKm:       data.weeklyCarKm,
      hasPrivateCar:         !['bicycle','walking','bus','train'].includes(data.primaryTransport),
      monthlyElectricityKwh: data.electricityKwh,
      hasAirConditioning:    data.hasAC,
      acHoursPerDay:         data.hasAC ? 4 : 0,
      usesRenewableEnergy:   false,
      dietType:              data.dietType as import('@/lib/storage').SustainabilityProfile['dietType'],
      monthlyShoppingItems:  data.monthlyShoppingItems,
      shortFlightsPerYear:   data.shortFlightsPerYear,
      longFlightsPerYear:    data.longFlightsPerYear,
      wasteRecyclingPercent: 30,
      compostsFood:          false,
      aiCoachingEnabled:     true,
      forecastNotifications: true,
      challengesEnabled:     true,
      completedAt:           new Date().toISOString(),
      updatedAt:             new Date().toISOString(),
      version:               1,
    });
    router.push('/dashboard');
  };

  const totalSteps = 5;
  const progress = ((step - 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-white to-sky-50 dark:from-eco-950 dark:via-background dark:to-sky-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 bg-eco-gradient rounded-2xl flex items-center justify-center shadow-lg">
            <Leaf className="w-7 h-7 text-white" aria-hidden />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">CarbonWise AI</h1>
            <p className="text-xs text-muted-foreground">Your Personal Sustainability Coach</p>
          </div>
        </div>

        {/* Progress bar */}
        {step <= totalSteps && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {STEPS.slice(0, -1).map((s) => {
                const Icon = s.icon;
                const isActive   = s.id === step;
                const isComplete = s.id < step;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-1">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all', isComplete ? 'bg-eco-600 border-eco-600 text-white' : isActive ? 'border-eco-600 bg-white dark:bg-background' : 'border-muted bg-muted/30')}>
                      <Icon className={cn('w-4 h-4', isComplete ? 'text-white' : isActive ? 'text-eco-600' : 'text-muted-foreground')} aria-hidden />
                    </div>
                    <span className={cn('text-[9px] font-medium hidden sm:block', isActive ? 'text-eco-700 dark:text-eco-400' : 'text-muted-foreground')}>{s.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-eco-gradient rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Name ─────────────────────────────── */}
            {step === 1 && (
              <StepWrapper key="s1" title="Welcome! What's your name?" desc="We'll personalise your sustainability journey." emoji="👋">
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
                    <Input id="name" type="text" placeholder="e.g. Alex" value={data.name} onChange={e => update({ name: e.target.value })} onKeyDown={e => e.key === 'Enter' && data.name.trim() && setStep(2)} className="pl-9 h-11" maxLength={30} autoFocus aria-required="true" />
                  </div>
                </div>
                <NavButtons onNext={() => setStep(2)} nextDisabled={!data.name.trim()} nextLabel="Start Assessment" isFirst />
              </StepWrapper>
            )}

            {/* ── Step 2: Transportation ────────────────────── */}
            {step === 2 && (
              <StepWrapper key="s2" title="How do you get around?" desc="Your primary mode of transport and typical weekly distance." emoji="🚗">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Primary transport mode</Label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Transport mode">
                      {TRANSPORT_OPTIONS.map(t => (
                        <button key={t.key} type="button" onClick={() => update({ primaryTransport: t.key })}
                          className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500', data.primaryTransport === t.key ? 'border-eco-500 bg-eco-50 dark:bg-eco-900/20 text-eco-700 dark:text-eco-300' : 'border-border hover:border-eco-200')}
                          role="radio" aria-checked={data.primaryTransport === t.key}>
                          <span className="text-xl" aria-hidden>{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SliderField
                    label={`Weekly distance (km)`}
                    value={data.weeklyCarKm}
                    min={0} max={500} step={10}
                    onChange={v => update({ weeklyCarKm: v })}
                    unit="km/week"
                    hint="Include commute and errands"
                  />
                </div>
                <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
              </StepWrapper>
            )}

            {/* ── Step 3: Energy ────────────────────────────── */}
            {step === 3 && (
              <StepWrapper key="s3" title="How much energy do you use?" desc="Your typical monthly home electricity and whether you use AC." emoji="⚡">
                <div className="space-y-4">
                  <SliderField
                    label="Monthly electricity usage"
                    value={data.electricityKwh}
                    min={50} max={1000} step={25}
                    onChange={v => update({ electricityKwh: v })}
                    unit="kWh/month"
                    hint="Average Indian home: 200–400 kWh"
                  />
                  <div>
                    <Label className="mb-2 block">Do you use air conditioning?</Label>
                    <div className="flex gap-3" role="radiogroup" aria-label="Air conditioning usage">
                      {[{ v: false, label: 'No / Rarely', emoji: '🌿' }, { v: true, label: 'Yes, regularly', emoji: '❄️' }].map(opt => (
                        <button key={String(opt.v)} type="button" onClick={() => update({ hasAC: opt.v })}
                          className={cn('flex-1 flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500', data.hasAC === opt.v ? 'border-eco-500 bg-eco-50 dark:bg-eco-900/20 text-eco-700' : 'border-border hover:border-eco-200')}
                          role="radio" aria-checked={data.hasAC === opt.v}>
                          <span className="text-xl" aria-hidden>{opt.emoji}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
              </StepWrapper>
            )}

            {/* ── Step 4: Food & Shopping ───────────────────── */}
            {step === 4 && (
              <StepWrapper key="s4" title="Food & Shopping habits" desc="Diet and consumption patterns are major emission sources." emoji="🥗">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">What best describes your diet?</Label>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Diet type">
                      {DIET_OPTIONS.map(opt => (
                        <button key={opt.key} type="button" onClick={() => update({ dietType: opt.key })}
                          className={cn('text-left p-3 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500', data.dietType === opt.key ? 'border-eco-500 bg-eco-50 dark:bg-eco-900/20' : 'border-border hover:border-eco-200')}
                          role="radio" aria-checked={data.dietType === opt.key}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg" aria-hidden>{opt.emoji}</span>
                            <span className="font-semibold text-sm">{opt.label}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</p>
                          <p className="text-[10px] text-eco-600 font-medium mt-1">{opt.kgDay} kg CO₂e/day</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <SliderField
                    label="New clothing/electronics per month"
                    value={data.monthlyShoppingItems}
                    min={0} max={20} step={1}
                    onChange={v => update({ monthlyShoppingItems: v })}
                    unit="items/month"
                    hint="Clothing, gadgets, household items"
                  />
                </div>
                <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
              </StepWrapper>
            )}

            {/* ── Step 5: Travel ────────────────────────────── */}
            {step === 5 && (
              <StepWrapper key="s5" title="How much do you fly?" desc="Air travel is one of the highest per-hour emission activities." emoji="✈️">
                <div className="space-y-4">
                  <SliderField
                    label="Short-haul flights per year"
                    value={data.shortFlightsPerYear}
                    min={0} max={20} step={1}
                    onChange={v => update({ shortFlightsPerYear: v })}
                    unit="flights/year"
                    hint="Under 3 hours (e.g. domestic)"
                  />
                  <SliderField
                    label="Long-haul flights per year"
                    value={data.longFlightsPerYear}
                    min={0} max={10} step={1}
                    onChange={v => update({ longFlightsPerYear: v })}
                    unit="flights/year"
                    hint="Over 3 hours (e.g. international)"
                  />
                  {/* Estimated annual footprint preview */}
                  <div className="rounded-xl border border-eco-200 bg-eco-50 dark:bg-eco-900/20 dark:border-eco-800 p-4">
                    <p className="text-xs font-semibold text-eco-700 dark:text-eco-300 mb-1">Your estimated annual footprint</p>
                    <p className="text-2xl font-bold text-eco-800 dark:text-eco-200">
                      {estimateAnnualKg(data).toFixed(0)} kg CO₂e
                    </p>
                    <p className="text-xs text-eco-600 dark:text-eco-400 mt-0.5">
                      Global average: 4,800 kg/year · IPCC 2030 target: 2,300 kg/year
                    </p>
                  </div>
                </div>
                <NavButtons onBack={() => setStep(4)} onNext={finish} nextLabel={completing ? 'Setting up…' : 'Complete Setup 🌱'} nextLoading={completing} />
              </StepWrapper>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          All data stored locally on your device · No account required
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────
function estimateAnnualKg(data: AssessmentData): number {
  const CAR_FACTOR: Record<string, number> = { car_petrol: 0.21233, car_electric: 0.05302, bus: 0.08890, train: 0.03694, bicycle: 0, walking: 0 };
  const transport = data.weeklyCarKm * (CAR_FACTOR[data.primaryTransport] ?? 0) * 52;
  const energy    = (data.electricityKwh * 0.23314 + (data.hasAC ? 90 * 0.58285 : 0)) * 12;
  const diet      = (DIET_OPTIONS.find(d => d.key === data.dietType)?.kgDay ?? 5.63) * 365;
  const shopping  = data.monthlyShoppingItems * 33.4 * 12;
  const flights   = data.shortFlightsPerYear * 1500 * 0.255 + data.longFlightsPerYear * 8000 * 0.195;
  return transport + energy + diet + shopping + flights;
}

// ─── Reusable sub-components ───────────────────────────────────────────
function StepWrapper({ title, desc, emoji, children }: { title: string; desc: string; emoji: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2" aria-hidden>{emoji}</div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </motion.div>
  );
}

function NavButtons({ onBack, onNext, nextDisabled = false, nextLabel = 'Continue', nextLoading = false, isFirst = false }: {
  onBack?: () => void; onNext?: () => void; nextDisabled?: boolean; nextLabel?: string; nextLoading?: boolean; isFirst?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {!isFirst && onBack && (
        <Button type="button" variant="outline" onClick={onBack} className="flex-none" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span>Back</span>
        </Button>
      )}
      {onNext && (
        <Button
          type="button"
          variant="gradient"
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
          loading={nextLoading}
          className={cn(isFirst ? 'w-full' : 'flex-1')}
          aria-label={nextLabel}
        >
          <span>{nextLabel}</span>
          {!nextLoading && <ArrowRight className="w-4 h-4" aria-hidden />}
        </Button>
      )}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, unit, hint }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-bold text-eco-700 dark:text-eco-300">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-full accent-eco-600 cursor-pointer"
        aria-label={`${label}: ${value} ${unit}`}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min} {unit.split('/')[0]}</span>
        {hint && <span className="italic">{hint}</span>}
        <span>{max} {unit.split('/')[0]}</span>
      </div>
    </div>
  );
}
