'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Clock, ChevronRight, Sparkles, Trash2, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CarbonTwin } from '@/components/features/CarbonTwin';
import { useAppStore } from '@/store/useAppStore';
import { formatCO2, formatDate } from '@/lib/utils';

export default function CarbonTwinPage() {
  const { simulations } = useAppStore();
  const [selectedSim, setSelectedSim] = useState<typeof simulations[number] | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Simulation Workspace */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-sky-500 animate-spin-slow" /> Carbon Twin Simulation
            </CardTitle>
            <CardDescription>
              Create a digital carbon twin of yourself to simulate the future impact of different sustainability adjustments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CarbonTwin />
          </CardContent>
        </Card>
      </div>

      {/* Saved Simulations Sidecard */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Saved Simulations
            </CardTitle>
            <CardDescription>
              Review your simulated scenarios and AI-generated impact summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {simulations.length > 0 ? (
              <div className="divide-y divide-border">
                {simulations.map((sim, i) => (
                  <motion.div
                    key={sim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between group cursor-pointer"
                    onClick={() => setSelectedSim(sim)}
                    role="button"
                    aria-label={`View simulation for ${sim.scenarioName}`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {sim.scenarioName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sim.years} year projection · {formatDate(sim.createdAt)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-eco-700 bg-eco-50 dark:bg-eco-900/30 dark:text-eco-400 px-2 py-0.5 rounded-full">
                          {sim.savingPercent}% saving
                        </span>
                        {sim.aiNarrative && (
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI Insight
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm font-semibold">No saved simulations yet</p>
                <p className="text-xs mt-1">
                  Run a simulation and click &quot;Save Simulation&quot; to store the results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={selectedSim !== null} onOpenChange={(open) => !open && setSelectedSim(null)}>
        {selectedSim && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-lg">
                {selectedSim.scenarioName}
              </DialogTitle>
              <DialogDescription>
                Simulated on {formatDate(selectedSim.createdAt)} over a {selectedSim.years}-year period.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-3.5 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Annual Saving</p>
                  <p className="text-base font-bold mt-1 text-eco-600 dark:text-eco-400">
                    {formatCO2(selectedSim.annualSavingKg)}/yr
                  </p>
                </div>
                <div className="rounded-xl border p-3.5 bg-muted/30">
                  <p className="text-xs text-muted-foreground">New Score</p>
                  <p className="text-base font-bold mt-1">
                    {selectedSim.sustainabilityScore}/100
                  </p>
                </div>
              </div>

              {/* AI Narrative */}
              {selectedSim.aiNarrative && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-eco-50 to-sky-50 dark:from-eco-900/20 dark:to-sky-900/20 border border-eco-200 dark:border-eco-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-eco-700 dark:text-eco-300 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-eco-600" />
                    <span>AI Twin Insight</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedSim.aiNarrative}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
