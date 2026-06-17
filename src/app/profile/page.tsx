'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Car, Zap, Utensils, ShoppingBag, Plane,
  CheckCircle2, ChevronRight, Pencil, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import {
  profileCompletionPercent,
  profileBaselineMonthly,
  isProfileComplete,
} from '@/lib/storage';
import { formatCO2, cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'personal',      label: 'Personal Info',      icon: User,        color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20'    },
  { id: 'transport',     label: 'Transportation',     icon: Car,         color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'energy',        label: 'Home Energy',        icon: Zap,         color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'},
  { id: 'food',          label: 'Food & Diet',        icon: Utensils,    color: 'text-eco-600 bg-eco-50 dark:bg-eco-900/20'    },
  { id: 'lifestyle',     label: 'Lifestyle',          icon: ShoppingBag, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'},
  { id: 'travel',        label: 'Travel',             icon: Plane,       color: 'text-red-600 bg-red-50 dark:bg-red-900/20'   },
];

const TRANSPORT_LABEL: Record<string, string> = {
  car_petrol:'Petrol Car', car_diesel:'Diesel Car', car_electric:'Electric Car',
  car_hybrid:'Hybrid Car', motorcycle:'Motorcycle', bus:'Bus / Metro',
  train:'Train', bicycle:'Bicycle', walking:'Walking',
};

const DIET_LABEL: Record<string, string> = {
  vegan:'Vegan', vegetarian:'Vegetarian', flexitarian:'Flexitarian',
  omnivore:'Mixed Diet', high_meat:'High Meat Diet',
};

export default function ProfilePage() {
  const router = useRouter();
  const { profile, monthlySummary } = useAppStore();
  // profileBaselineMonthly is pure/synchronous — no need for useState+useEffect
  const baseline = useMemo(
    () => (profile ? profileBaselineMonthly(profile) : null),
    [profile],
  );

  if (!profile) return null;

  const completionPct = profileCompletionPercent(profile);
  const complete      = isProfileComplete(profile);
  const baselineTotal = baseline ? Object.values(baseline).reduce((a, b) => a + b, 0) : 0;
  const actualTotal   = monthlySummary?.total ?? 0;
  const displayTotal  = actualTotal > 0 ? actualTotal : baselineTotal;

  const rows = [
    { section: 'personal',  items: [
      { label: 'Name',    value: profile.name || '—' },
      { label: 'Region',  value: profile.region || '—' },
      { label: 'Units',   value: profile.units === 'metric' ? 'Metric' : 'Imperial' },
    ]},
    { section: 'transport', items: [
      { label: 'Primary Transport', value: TRANSPORT_LABEL[profile.primaryTransport] ?? profile.primaryTransport },
      { label: 'Weekly Commute',    value: `${profile.weeklyCommuteKm} km/week` },
    ]},
    { section: 'energy', items: [
      { label: 'Monthly Electricity', value: `${profile.monthlyElectricityKwh} kWh` },
      { label: 'Air Conditioning',    value: profile.hasAirConditioning ? `Yes — ${profile.acHoursPerDay}h/day` : 'No' },
      { label: 'Renewable Energy',    value: profile.usesRenewableEnergy ? '✅ Yes' : 'No' },
    ]},
    { section: 'food', items: [
      { label: 'Diet Type', value: DIET_LABEL[profile.dietType] ?? profile.dietType },
    ]},
    { section: 'lifestyle', items: [
      { label: 'Monthly Shopping',    value: `${profile.monthlyShoppingItems} items/month` },
      { label: 'Recycling Rate',      value: `${profile.wasteRecyclingPercent}%` },
      { label: 'Composts Food Waste', value: profile.compostsFood ? '✅ Yes' : 'No' },
    ]},
    { section: 'travel', items: [
      { label: 'Short-haul Flights/yr', value: `${profile.shortFlightsPerYear}` },
      { label: 'Long-haul Flights/yr',  value: `${profile.longFlightsPerYear}` },
    ]},
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-eco-600" />
            Sustainability Profile
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal carbon profile — used by all modules.
          </p>
        </div>
        <Button variant="gradient" onClick={() => router.push('/settings')} className="gap-2">
          <Pencil className="w-4 h-4" aria-hidden />
          Edit Profile
        </Button>
      </div>

      {/* Completion card */}
      <Card className={cn('border-2', complete ? 'border-eco-300 dark:border-eco-700' : 'border-amber-300 dark:border-amber-700')}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {complete
                ? <CheckCircle2 className="w-5 h-5 text-eco-600" aria-hidden />
                : <BarChart3 className="w-5 h-5 text-amber-500" aria-hidden />}
              <span className="font-semibold text-sm">
                Profile {completionPct}% Complete
              </span>
            </div>
            <Badge variant={complete ? 'eco' : 'amber'}>
              {complete ? 'All sections filled' : 'Update your profile'}
            </Badge>
          </div>
          <Progress value={completionPct} className="h-2.5" aria-label={`Profile ${completionPct}% complete`} />
          {!complete && (
            <p className="text-xs text-muted-foreground mt-2">
              A complete profile enables accurate AI forecasting and personalised coaching.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estimated footprint banner */}
      <Card className="border-eco-200 dark:border-eco-800 bg-eco-50/50 dark:bg-eco-900/10">
        <CardContent className="p-5">
          <p className="text-xs text-eco-700 dark:text-eco-400 font-semibold uppercase tracking-wide mb-1">
            {actualTotal > 0 ? 'Measured Monthly Footprint' : 'Estimated Monthly Baseline'}
          </p>
          <p className="text-3xl font-black font-display text-eco-700 dark:text-eco-300">
            {formatCO2(displayTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-2">/ month</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {actualTotal > 0
              ? 'Based on your logged activities.'
              : 'Based on profile answers — log activities for precise tracking.'}
          </p>
          {baseline && actualTotal === 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(baseline).map(([cat, val]) => (
                <div key={cat} className="rounded-lg border bg-card px-2 py-1.5 text-center">
                  <p className="text-[10px] text-muted-foreground capitalize">{cat}</p>
                  <p className="text-xs font-bold">{val.toFixed(0)} kg</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile sections */}
      <div className="space-y-4">
        {rows.map((row, ri) => {
          const section = SECTIONS.find(s => s.id === row.section)!;
          const Icon = section.icon;
          return (
            <motion.div
              key={row.section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border shrink-0', section.color)}>
                    <Icon className="w-4 h-4" aria-hidden />
                  </div>
                  <CardTitle className="text-sm font-semibold">{section.label}</CardTitle>
                  <button
                    onClick={() => router.push('/settings')}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={`Edit ${section.label}`}
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </button>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {row.items.map(item => (
                      <div key={item.label} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                        <dt className="text-xs text-muted-foreground">{item.label}</dt>
                        <dd className="text-xs font-semibold text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
