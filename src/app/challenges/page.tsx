'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Loader2, AlertCircle, Key, Compass, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChallengeCard } from '@/components/features/ChallengeCard';
import { useAppStore } from '@/store/useAppStore';
import { generateAIChallenge } from '@/lib/gemini';
import { uniqueId } from '@/lib/utils';

export default function ChallengesPage() {
  const {
    challenges,
    monthlySummary,
    preferences,
    joinChallenge,
    markChallengeComplete,
    updateChallengeProgress,
    addChallenge,
    aiLoading,
    setAILoading,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('available');
  const [error, setError] = useState<string | null>(null);

  const apiKey = preferences?.geminiApiKey ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  const hasApiKey = apiKey.trim().length > 0;

  // Split challenges by status
  const activeChallenges = useMemo(() => challenges.filter((c) => c.joined && !c.completed), [challenges]);
  const availableChallenges = useMemo(() => challenges.filter((c) => !c.joined && !c.completed), [challenges]);
  const completedChallenges = useMemo(() => challenges.filter((c) => c.completed), [challenges]);

  // Trigger custom AI challenge generation
  const handleGenerateAIChallenge = async () => {
    if (!hasApiKey) return;
    setError(null);
    setAILoading(true);

    try {
      const existingTitles = challenges.map((c) => c.title);
      const data = {
        monthlyKg: monthlySummary?.total ?? 350,
        byCategory: monthlySummary?.byCategory ?? {
          transportation: 120,
          energy: 80,
          food: 110,
          shopping: 20,
          waste: 20,
        },
        existingChallenges: existingTitles,
      };

      const aiCh = await generateAIChallenge(apiKey, data);

      const newChallenge = {
        id: `ch_ai_${uniqueId()}`,
        title: aiCh.title,
        description: aiCh.description,
        category: aiCh.category,
        targetValue: aiCh.targetValue,
        currentValue: 0,
        unit: aiCh.unit,
        points: aiCh.points,
        difficulty: aiCh.difficulty,
        daysLeft: aiCh.daysLeft,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + aiCh.daysLeft * 86400000).toISOString().split('T')[0],
        completed: false,
        joined: false,
        aiGenerated: true,
        icon: aiCh.icon,
      };

      addChallenge(newChallenge);
      setActiveTab('available');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI challenge.');
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and AI Generator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Eco Challenges
          </h2>
          <p className="text-muted-foreground text-sm">
            Complete tasks, reduce your carbon emissions, and earn Eco Points to rank up.
          </p>
        </div>

        {/* AI Challenge Generator Card */}
        <Card className="lg:col-span-1 border-eco-200 dark:border-eco-800 bg-eco-50/50 dark:bg-eco-900/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-eco-600" /> AI Challenge Generator
            </CardTitle>
            <CardDescription className="text-xs">
              Gemini will build a customized challenge based on your current carbon footprint.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {hasApiKey ? (
              <Button
                onClick={handleGenerateAIChallenge}
                disabled={aiLoading}
                variant="gradient"
                size="sm"
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Generating Mission…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Generate Custom Challenge
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-lg text-[10px] text-amber-800 dark:text-amber-300">
                <Key className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p>
                  API Key required. Go to{' '}
                  <a href="/settings" className="underline font-bold">
                    Settings
                  </a>{' '}
                  to paste your Gemini API key.
                </p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs list */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
        <div className="flex justify-between items-center border-b pb-2">
          <TabsList>
            <TabsTrigger value="available" className="text-xs">
              Available ({availableChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Available Tab */}
        <TabsContent value="available" className="pt-4 mt-0">
          {availableChallenges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableChallenges.map((ch) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  onJoin={joinChallenge}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Compass className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm">No challenges available</p>
              <p className="text-xs mt-1">
                You have joined all available challenges or completed them. Generate a custom one with AI!
              </p>
            </div>
          )}
        </TabsContent>

        {/* Active Tab */}
        <TabsContent value="active" className="pt-4 mt-0">
          {activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((ch) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  onComplete={markChallengeComplete}
                  onUpdateProgress={updateChallengeProgress}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Compass className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm">No active challenges</p>
              <p className="text-xs mt-1">
                Go to the &quot;Available&quot; tab and join a challenge to track your carbon-saving habits.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="pt-4 mt-0">
          {completedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedChallenges.map((ch) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm">No completed challenges yet</p>
              <p className="text-xs mt-1">
                Start working on your active challenges and complete them to see them in this list.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
