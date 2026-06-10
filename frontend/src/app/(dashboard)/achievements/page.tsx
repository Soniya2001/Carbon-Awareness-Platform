'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useGamification } from '@/src/hooks/useGamification';
import { BADGE_DEFINITIONS } from '@/src/lib/constants';
import { numberWithCommas } from '@/src/lib/utils';

export default function AchievementsPage() {
  const { points, badges, fetchPoints, fetchBadges, isLoading } = useGamification();

  useEffect(() => {
    fetchPoints();
    fetchBadges();
  }, [fetchPoints, fetchBadges]);

  const earnedBadgeIds = new Set(badges?.earned?.map((b: { id: string }) => b.id) ?? []);

  const levelThresholds = [
    { name: 'Green Beginner', min: 0, max: 100 },
    { name: 'Eco Explorer', min: 100, max: 300 },
    { name: 'Carbon Reducer', min: 300, max: 700 },
    { name: 'Sustainability Champion', min: 700, max: 1500 },
    { name: 'Eco Legend', min: 1500, max: Infinity },
  ];

  const currentLevel = levelThresholds.findLast((l) => (points?.total ?? 0) >= l.min) ?? levelThresholds[0];
  const nextLevel = levelThresholds.find((l) => l.min > (points?.total ?? 0));
  const progressToNext = nextLevel
    ? (((points?.total ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-600" aria-hidden="true" />
          Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your sustainability journey milestones
        </p>
      </div>

      {/* Points card */}
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" aria-hidden="true" />
                <span className="font-semibold text-gray-900">Eco Points</span>
              </div>
              <p className="mt-1 text-4xl font-extrabold text-yellow-700">
                {numberWithCommas(points?.total ?? 0)}
              </p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                {currentLevel.name}
              </Badge>
            </div>
            {points?.streak !== undefined && (
              <div className="text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto" aria-hidden="true" />
                <p className="text-2xl font-bold text-orange-700">{points.streak}</p>
                <p className="text-xs text-orange-600">day streak</p>
              </div>
            )}
          </div>

          {nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name} ({nextLevel.min} pts)</span>
              </div>
              <Progress
                value={progressToNext}
                className="h-2"
                aria-label={`Progress to next level: ${Math.round(progressToNext)}%`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Badges ({earnedBadgeIds.size}/{BADGE_DEFINITIONS.length})
        </h2>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label="Achievement badges"
        >
          {BADGE_DEFINITIONS.map((badge, i) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                role="listitem"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-4 text-center transition-all ${
                  earned
                    ? 'border-yellow-300 bg-yellow-50 shadow-sm'
                    : 'border-gray-200 bg-gray-50 opacity-50 grayscale'
                }`}
                aria-label={`${badge.name}: ${badge.description}. ${earned ? 'Earned' : 'Not yet earned'}`}
              >
                <div className="text-3xl mb-2" aria-hidden="true">{badge.emoji}</div>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{badge.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{badge.description}</p>
                {earned && (
                  <Badge className="mt-2 text-[10px] bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Earned
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rank */}
      {points?.rank && (
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Community Rank</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">#{points.rank}</p>
            </div>
            <Award className="h-12 w-12 text-yellow-300" aria-hidden="true" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
