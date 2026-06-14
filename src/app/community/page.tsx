'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Trees, Car, Fuel, Home, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SCENARIOS, runSimulation, communityImpact } from '@/lib/simulationEngine';
import { formatNum } from '@/lib/utils';

export default function CommunityPage() {
  const [selectedScenario, setSelectedScenario] = useState('full_sustainable');
  const [scale, setScale] = useState(10000);

  const baselineMonthly = {
    transportation: 150,
    energy: 100,
    food: 120,
    shopping: 50,
    waste: 30,
  };

  const simResult = useMemo(() => {
    return runSimulation(selectedScenario, baselineMonthly, 1);
  }, [selectedScenario]);

  const impact = useMemo(() => {
    return communityImpact(simResult.annualSavingKg, scale);
  }, [simResult.annualSavingKg, scale]);

  const metrics = [
    {
      title: 'Trees Planted',
      value: formatNum(impact.treesEquivalent),
      sub: 'Annual absorption capacity',
      icon: Trees,
      color: 'text-eco-600 dark:text-eco-400 bg-eco-50 dark:bg-eco-900/20 border-eco-200 dark:border-eco-800',
    },
    {
      title: 'Cars Removed',
      value: formatNum(impact.carsRemovedEquivalent),
      sub: 'Typical passenger cars off the road',
      icon: Car,
      color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
    {
      title: 'Fuel Litres Saved',
      value: formatNum(impact.fuelLitresSaved),
      sub: 'Litres of petrol saved',
      icon: Fuel,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Homes Powered',
      value: formatNum(impact.powerHomesYears),
      sub: 'Annual household electricity offset',
      icon: Home,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-eco-600" /> Community Impact Simulator
        </h2>
        <p className="text-muted-foreground text-sm">
          Visualize what happens when thousands of people adopt your green habits. Small changes scale up to save the planet.
        </p>
      </div>

      {/* Control Panel Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario Selector */}
            <div className="space-y-2">
              <label htmlFor="scenario-select" className="text-sm font-semibold text-foreground">
                Select sustainability habit:
              </label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger id="scenario-select" aria-label="Select habit to scale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIOS.filter(s => s.key !== 'current').map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.icon} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Typical savings for this habit: <span className="font-bold text-foreground">{simResult.savingPercent}% CO₂e reduction</span>.
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <label htmlFor="community-slider" className="text-sm font-semibold text-foreground block">
                Number of people: <span className="font-bold text-eco-600 dark:text-eco-400">{formatNum(scale)}</span>
              </label>
              <input
                id="community-slider"
                type="range"
                min={10}
                max={1000000}
                step={scale < 10000 ? 100 : scale < 100000 ? 1000 : 10000}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full accent-eco-500 cursor-pointer"
                aria-valuemin={10}
                aria-valuemax={1000000}
                aria-valuenow={scale}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>10 people</span>
                <span>10k</span>
                <span>100k</span>
                <span>1 Million people</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulated Cumulative Savings banner */}
      <Card className="border-eco-200 dark:border-eco-800 bg-eco-50 dark:bg-eco-900/20 shadow-eco">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-xs text-eco-700 dark:text-eco-300 font-semibold tracking-wider uppercase">
            Simulated Carbon Reduction
          </p>
          <p className="text-4xl md:text-5xl font-black font-display text-eco-600 dark:text-eco-400 tracking-tight">
            {formatNum(impact.totalAnnualSavingTons)} Tons CO₂e
          </p>
          <p className="text-xs text-muted-foreground">
            Prevented from entering the atmosphere per year if {formatNum(scale)} people adopted this lifestyle.
          </p>
        </CardContent>
      </Card>

      {/* Visual Impact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const IconComp = m.icon;
          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-muted-foreground">
                    {m.title}
                  </CardTitle>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${m.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-1">
                  <p className="text-xl md:text-2xl font-bold font-display text-foreground tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    {m.sub}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
