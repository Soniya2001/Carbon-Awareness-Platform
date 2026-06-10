'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Clock, Zap, Sparkles, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useGamification } from '@/src/hooks/useGamification';
import { challengeApi } from '@/src/lib/api';
import { getDifficultyColor, getCategoryEmoji } from '@/src/lib/utils';
import type { Challenge, ChallengeProgress } from '@/src/types';

function ChallengeCard({ challenge, onJoin }: {
  challenge: Challenge;
  onJoin?: (id: string) => void;
}) {
  const progress = challenge.userProgress;
  const isActive = progress?.status === 'ACTIVE';
  const isCompleted = progress?.status === 'COMPLETED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={isCompleted ? 'border-eco-300 bg-eco-50' : ''}>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-2xl" aria-hidden="true">{getCategoryEmoji(challenge.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm">{challenge.title}</h3>
                  {isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-eco-600 shrink-0" aria-label="Completed" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{challenge.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1 text-yellow-500" aria-hidden="true" />
                    {challenge.points} pts
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">{challenge.category}</span>
                </div>
              </div>
            </div>

            {!isActive && !isCompleted && onJoin && (
              <Button
                size="sm"
                variant="eco"
                onClick={() => onJoin(challenge.id)}
                aria-label={`Join challenge: ${challenge.title}`}
              >
                <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                Join
              </Button>
            )}

            {isActive && (
              <Badge variant="outline" className="text-blue-700 border-blue-300 shrink-0">
                <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                Active
              </Badge>
            )}
          </div>

          {isActive && progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <Progress
                value={progress.progress}
                className="h-1.5"
                aria-label={`Challenge progress: ${Math.round(progress.progress)}%`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [active, setActive] = useState<Challenge[]>([]);
  const [completed, setCompleted] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { fetchPoints } = useGamification();

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const [allRes, activeRes, completedRes] = await Promise.all([
        challengeApi.getAll(),
        challengeApi.getActive(),
        challengeApi.getCompleted(),
      ]);
      setChallenges((allRes.data as Challenge[]) ?? []);
      setActive((activeRes.data as Challenge[]) ?? []);
      setCompleted((completedRes.data as Challenge[]) ?? []);
    } catch {
      // handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoin = async (challengeId: string) => {
    await challengeApi.join(challengeId);
    fetchChallenges();
    fetchPoints();
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const { aiApi } = await import('@/src/lib/api');
      await aiApi.generateChallenge();
      fetchChallenges();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-eco-600" aria-hidden="true" />
            Challenges
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete sustainability missions to earn eco points
          </p>
        </div>
        <Button
          variant="eco"
          size="sm"
          onClick={handleGenerateAI}
          loading={isGenerating}
          aria-label="Generate AI challenge"
        >
          <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
          AI Generate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Active', value: active.length, color: 'text-blue-700' },
          { label: 'Completed', value: completed.length, color: 'text-eco-700' },
          { label: 'Available', value: challenges.length, color: 'text-purple-700' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="available">
        <TabsList aria-label="Challenge tabs">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({challenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : active.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <Target className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="mt-3 font-medium text-gray-700">No active challenges</p>
                <p className="text-sm text-muted-foreground">Join one from the Available tab</p>
              </CardContent>
            </Card>
          ) : (
            active.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : challenges.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No available challenges. Generate one with AI!</p>
              </CardContent>
            </Card>
          ) : (
            challenges.map((c) => <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : completed.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                <p className="mt-3 font-medium text-gray-700">No completed challenges yet</p>
              </CardContent>
            </Card>
          ) : (
            completed.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
