'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Loader2, Sparkles, Trees, Car, Plane, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TwinComparison } from '@/components/charts';
import { useAppStore } from '@/store/useAppStore';
import { SCENARIOS, runSimulation, type SimulationResult } from '@/lib/simulationEngine';
import { generateTwinNarrative } from '@/lib/aiClient';
import { formatCO2, formatNum, uniqueId, cn } from '@/lib/utils';

const DIFF_COLORS = { easy:'eco', medium:'amber', hard:'red' } as const;

export function CarbonTwin() {
  const { monthlySummary, preferences, addSimulation, setAILoading } = useAppStore();
  const [selected, setSelected]   = useState('public_transport');
  const [years, setYears]         = useState(5);
  const [result, setResult]       = useState<SimulationResult|null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [narrative, setNarrative] = useState<string|null>(null);
  const [isSaved, setIsSaved]     = useState(false);

  const monthlyByCat = monthlySummary?.byCategory ?? { transportation:120, energy:80, food:150, shopping:40, waste:20 };

  const runSim = async () => {
    setIsRunning(true); setNarrative(null); setIsSaved(false);
    try {
      const sim = runSimulation(selected, monthlyByCat, years);
      setResult(sim);
      setAILoading(true);
      try {
        const narr = await generateTwinNarrative({ scenario: sim.scenarioName, current: sim.currentAnnualKg, projected: sim.scenarioAnnualKg, savings: sim.annualSavingKg, trees: sim.equivalents.trees, years });
        setNarrative(narr);
      } catch { /* optional */ } finally { setAILoading(false); }
    } finally { setIsRunning(false); }
  };

  const handleSave = () => {
    if (!result) return;
    addSimulation({ id: uniqueId(), scenarioKey: result.scenarioKey, scenarioName: result.scenarioName, years, annualSavingKg: result.annualSavingKg, savingPercent: result.savingPercent, sustainabilityScore: result.sustainabilityScore, aiNarrative: narrative ?? undefined, createdAt: new Date().toISOString() });
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Choose a lifestyle scenario</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map(s => (
            <motion.button key={s.key} onClick={() => setSelected(s.key)} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className={cn('text-left p-4 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected===s.key ? 'border-eco-500 bg-eco-50 dark:bg-eco-900/20' : 'border-border bg-card hover:border-eco-200')}
              aria-pressed={selected===s.key}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl" aria-hidden>{s.icon}</span>
                <Badge variant={DIFF_COLORS[s.difficulty as keyof typeof DIFF_COLORS] ?? 'outline'} className="text-[10px]">{s.difficulty}</Badge>
              </div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="yrs" className="text-sm font-medium text-muted-foreground block mb-2">
          Projection period: <span className="text-foreground font-semibold">{years} year{years>1?'s':''}</span>
        </label>
        <input id="yrs" type="range" min={1} max={10} value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full h-2 bg-muted rounded-full accent-eco-500 cursor-pointer" aria-valuemin={1} aria-valuemax={10} aria-valuenow={years} />
        <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1 year</span><span>10 years</span></div>
      </div>

      <Button onClick={runSim} disabled={isRunning} variant="gradient" size="lg" className="w-full" aria-busy={isRunning}>
        {isRunning ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Running Simulation…</> : <><Play className="w-5 h-5" aria-hidden /> Run Carbon Twin Simulation</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Annual Saving',  value: formatCO2(result.annualSavingKg),   cls:'text-eco-700 dark:text-eco-300' },
                { label:'Reduction',      value: `${result.savingPercent}%`,          cls:'text-eco-700 dark:text-eco-300' },
                { label:'New Score',      value: `${result.sustainabilityScore}/100`, cls:'' },
                { label:'vs IPCC',        value: result.vsIPCC<=0 ? 'On target ✓' : `+${result.vsIPCC}%`, cls: result.vsIPCC<=0?'text-eco-600':'text-red-500' },
              ].map(({label,value,cls}) => (
                <Card key={label} className={label==='Annual Saving'?'border-eco-200 dark:border-eco-800 bg-eco-50 dark:bg-eco-900/20':''}>
                  <CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={cn('text-xl font-bold mt-1',cls)}>{value}</p></CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Annual saving is equivalent to…</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{icon:Trees,label:'Trees planted',value:formatNum(result.equivalents.trees)},{icon:Car,label:'Cars removed',value:result.equivalents.cars.toFixed(1)},{icon:Plane,label:'Flights avoided',value:result.equivalents.flights.toFixed(1)},{icon:Fuel,label:'Litres saved',value:formatNum(result.equivalents.fuelLitres)}].map(({icon:Icon,label,value})=>(
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-900/30 flex items-center justify-center"><Icon className="w-4 h-4 text-eco-600 dark:text-eco-400" aria-hidden /></div>
                      <div><p className="text-sm font-bold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Annual Footprint Comparison</CardTitle></CardHeader>
              <CardContent><TwinComparison data={result.chartData} name={result.scenarioName} /></CardContent>
            </Card>

            <AnimatePresence>
              {narrative && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="p-4 rounded-xl bg-gradient-to-br from-eco-50 to-sky-50 dark:from-eco-900/20 dark:to-sky-900/20 border border-eco-200 dark:border-eco-800">
                  <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-eco-600" aria-hidden /><span className="text-sm font-semibold text-eco-700 dark:text-eco-300">AI Insight</span></div>
                  <p className="text-sm leading-relaxed">{narrative}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button onClick={handleSave} disabled={isSaved} variant={isSaved?'outline':'default'} className="w-full" aria-label={isSaved?'Saved':'Save simulation'}>
              <Save className="w-4 h-4" aria-hidden /> {isSaved ? 'Simulation Saved ✓' : 'Save Simulation'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
