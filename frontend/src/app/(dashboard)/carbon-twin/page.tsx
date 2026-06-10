'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, TreePine, Fuel, Car, DollarSign, Sparkles, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { CarbonTwinChart } from '@/src/components/charts/CarbonTwinChart';
import { useCarbonTwin } from '@/src/hooks/useCarbonTwin';
import { SIMULATION_SCENARIOS } from '@/src/lib/constants';
import { formatCO2, numberWithCommas } from '@/src/lib/utils';
import type { SimulationResult } from '@/src/types';

export default function CarbonTwinPage() {
  const { runSimulation, result, isLoading } = useCarbonTwin();
  const [selectedScenario, setSelectedScenario] = useState(SIMULATION_SCENARIOS[0].key);
  const [years, setYears] = useState(5);

  const handleRun = async () => {
    await runSimulation(selectedScenario, years);
  };

  const twinChartData = result
    ? result.projections.map((p) => ({
        year: p.year,
        current: result.currentAnnualCo2e,
        projected: p.co2e,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-eco-600" aria-hidden="true" />
          Carbon Twin AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulate your future environmental impact based on lifestyle changes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenario Selector */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="font-semibold text-gray-900">Choose a scenario</h2>
          {SIMULATION_SCENARIOS.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => setSelectedScenario(scenario.key)}
              className={`w-full rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600 ${
                selectedScenario === scenario.key
                  ? 'border-eco-500 bg-eco-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              aria-pressed={selectedScenario === scenario.key}
              aria-label={`Select scenario: ${scenario.name}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">{scenario.icon}</span>
                <div>
                  <p className={`font-medium text-sm ${selectedScenario === scenario.key ? 'text-eco-800' : 'text-gray-900'}`}>
                    {scenario.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{scenario.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs border-eco-300 text-eco-700">
                    Save {scenario.potentialSaving}
                  </Badge>
                </div>
              </div>
            </button>
          ))}

          {/* Projection years */}
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Projection period</p>
            <div className="flex gap-2" role="group" aria-label="Projection years">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600 ${
                    years === y
                      ? 'border-eco-500 bg-eco-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  aria-pressed={years === y}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="eco"
            size="lg"
            className="w-full"
            onClick={handleRun}
            loading={isLoading}
            aria-busy={isLoading}
          >
            <PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Run Simulation
          </Button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-gray-50 text-center"
              >
                <Sparkles className="h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
                <p className="font-medium text-gray-700">Select a scenario and run simulation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  See your environmental impact over time
                </p>
              </motion.div>
            )}

            {(result || isLoading) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {SIMULATION_SCENARIOS.find((s) => s.key === selectedScenario)?.name ?? 'Simulation'}
                    </CardTitle>
                    <CardDescription>CO₂e over {years} year{years > 1 ? 's' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CarbonTwinChart
                      data={twinChartData}
                      scenarioName={SIMULATION_SCENARIOS.find((s) => s.key === selectedScenario)?.name ?? ''}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>

                {/* Impact equivalents */}
                {result && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        icon: TreePine,
                        label: 'Trees equivalent',
                        value: numberWithCommas(result.equivalents.treesPlanted),
                        color: 'text-eco-600 bg-eco-50',
                      },
                      {
                        icon: Car,
                        label: 'Km avoided',
                        value: numberWithCommas(result.equivalents.kmsDriven),
                        color: 'text-blue-600 bg-blue-50',
                      },
                      {
                        icon: Fuel,
                        label: 'Flights avoided',
                        value: result.equivalents.flightsAvoided.toFixed(1),
                        color: 'text-orange-600 bg-orange-50',
                      },
                      {
                        icon: DollarSign,
                        label: 'Money saved',
                        value: `₹${numberWithCommas(result.equivalents.moneySaved)}`,
                        color: 'text-purple-600 bg-purple-50',
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card key={item.label} className="text-center">
                          <CardContent className="pt-4 pb-4">
                            <div className={`mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full ${item.color}`}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <p className="text-xl font-bold text-gray-900">{item.value}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Savings summary */}
                {result && (
                  <Card className="border-eco-200 bg-eco-50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-eco-600" aria-hidden="true" />
                        <span className="text-sm font-semibold text-eco-800">Summary</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-eco-700">Current annual</p>
                          <p className="font-bold text-gray-900">{formatCO2(result.currentAnnualCo2e)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-eco-700">Projected annual</p>
                          <p className="font-bold text-eco-700">{formatCO2(result.projectedAnnualCo2e)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-eco-700">Annual saving</p>
                          <p className="font-bold text-eco-800">−{formatCO2(result.annualSavings)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Narrative */}
                {result?.aiNarrative && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-purple-100 p-2 shrink-0">
                          <Sparkles className="h-4 w-4 text-purple-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">AI Insight</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{result.aiNarrative}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
