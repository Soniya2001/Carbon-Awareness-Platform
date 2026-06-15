'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Trophy, Loader2, AlertCircle, Compass, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChallengeCard } from '@/components/features/ChallengeCard';
import { useAppStore } from '@/store/useAppStore';
import { generateAIChallenge } from '@/lib/aiClient';
import { uniqueId } from '@/lib/utils';

export default function ChallengesPage() {
  const { challenges, monthlySummary, joinChallenge, markChallengeComplete, updateChallengeProgress, addChallenge, aiLoading, setAILoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<'active'|'available'|'completed'>('available');
  const [error, setError]         = useState<string|null>(null);

  const active    = useMemo(()=>challenges.filter(c=>c.joined&&!c.completed),[challenges]);
  const available = useMemo(()=>challenges.filter(c=>!c.joined&&!c.completed),[challenges]);
  const completed = useMemo(()=>challenges.filter(c=>c.completed),[challenges]);

  const handleGenerate = async () => {
    setError(null); setAILoading(true);
    try {
      const topCat = monthlySummary?.byCategory ? Object.entries(monthlySummary.byCategory).sort(([,a],[,b])=>b-a)[0]?.[0]??'transportation' : 'transportation';
      const aiCh = await generateAIChallenge({ topCategory: topCat, monthlyKg: monthlySummary?.total??350, completedCount: completed.length });
      addChallenge({ id:`ch_ai_${uniqueId()}`, title:aiCh.title, description:aiCh.description, category:aiCh.category, targetValue:aiCh.targetValue, currentValue:0, unit:aiCh.unit, points:aiCh.points, difficulty:aiCh.difficulty.toLowerCase() as 'easy'|'medium'|'hard', daysLeft:aiCh.daysLeft, startDate:new Date().toISOString().split('T')[0], endDate:new Date(Date.now()+aiCh.daysLeft*86400000).toISOString().split('T')[0], completed:false, joined:false, aiGenerated:true, icon:aiCh.icon });
      setActiveTab('available');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate challenge.'); }
    finally { setAILoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> Eco Challenges</h2>
          <p className="text-muted-foreground text-sm">Complete tasks, reduce emissions, and earn Eco Points to rank up.</p>
        </div>
        <Card className="border-eco-200 dark:border-eco-800 bg-eco-50/50 dark:bg-eco-900/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-eco-600" /> AI Challenge Generator</CardTitle>
            <CardDescription className="text-xs">Gemini generates a custom challenge based on your footprint.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            <Button onClick={handleGenerate} disabled={aiLoading} variant="gradient" size="sm" className="w-full">
              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-1.5" /> Generate Custom Challenge</>}
            </Button>
            {error && <div className="flex items-center gap-1.5 text-xs text-red-500" role="alert"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />{error}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={v=>setActiveTab(v as typeof activeTab)}>
        <div className="flex justify-between items-center border-b pb-2">
          <TabsList>
            <TabsTrigger value="available" className="text-xs">Available ({available.length})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed ({completed.length})</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="available" className="pt-4 mt-0">
          {available.length>0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{available.map(ch=><ChallengeCard key={ch.id} challenge={ch} onJoin={joinChallenge} />)}</div> : <Empty icon={<Compass className="w-10 h-10 text-muted-foreground/30" />} title="No challenges available" desc="Generate a custom one with AI above!" />}
        </TabsContent>
        <TabsContent value="active" className="pt-4 mt-0">
          {active.length>0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{active.map(ch=><ChallengeCard key={ch.id} challenge={ch} onComplete={markChallengeComplete} onUpdateProgress={updateChallengeProgress} />)}</div> : <Empty icon={<Compass className="w-10 h-10 text-muted-foreground/30" />} title="No active challenges" desc='Join a challenge from the "Available" tab.' />}
        </TabsContent>
        <TabsContent value="completed" className="pt-4 mt-0">
          {completed.length>0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{completed.map(ch=><ChallengeCard key={ch.id} challenge={ch} />)}</div> : <Empty icon={<CheckCircle2 className="w-10 h-10 text-muted-foreground/30" />} title="No completed challenges yet" desc="Complete active challenges to see them here." />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
      {icon}<p className="font-semibold text-sm mt-2">{title}</p><p className="text-xs mt-1">{desc}</p>
    </div>
  );
}
