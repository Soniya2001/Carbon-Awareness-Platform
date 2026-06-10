'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TreePine, Fuel, Car, Globe2, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Skeleton } from '@/src/components/ui/skeleton';
import { communityApi } from '@/src/lib/api';
import { numberWithCommas, formatCO2 } from '@/src/lib/utils';
import type { CommunityStats, LeaderboardEntry } from '@/src/types';
import { useState } from 'react';

const rankColors = ['text-yellow-600', 'text-gray-500', 'text-orange-600'];
const rankIcons = ['🥇', '🥈', '🥉'];

export default function CommunityPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, lbRes] = await Promise.all([
          communityApi.getStats(),
          communityApi.getLeaderboard('all', 10),
        ]);
        setStats(statsRes.data as CommunityStats);
        setLeaderboard((lbRes.data as LeaderboardEntry[]) ?? []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const impactItems = stats
    ? [
        { icon: Globe2, label: 'CO₂ Saved', value: formatCO2(stats.totalCo2Saved), color: 'text-eco-600 bg-eco-50' },
        { icon: TreePine, label: 'Trees Equivalent', value: `${numberWithCommas(stats.treesEquivalent)} trees`, color: 'text-green-600 bg-green-50' },
        { icon: Fuel, label: 'Fuel Saved', value: `${numberWithCommas(stats.fuelSaved)} L`, color: 'text-orange-600 bg-orange-50' },
        { icon: Car, label: 'Cars Removed Equiv.', value: `${stats.carsRemoved} cars`, color: 'text-blue-600 bg-blue-50' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-eco-600" aria-hidden="true" />
          Community Impact
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Together we&apos;re making a measurable difference
        </p>
      </div>

      {/* Impact counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          : impactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-5">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${item.color} mb-3`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      {/* Active members */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{numberWithCommas(stats.activeMemberCount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Activities Logged</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{numberWithCommas(stats.totalActivities)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Medal className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <CardTitle className="text-base">Community Leaderboard</CardTitle>
          <Badge variant="outline" className="ml-auto text-xs">Anonymous</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No leaderboard data yet — be the first!
            </p>
          ) : (
            <ol className="space-y-2" aria-label="Community leaderboard">
              {leaderboard.map((entry, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i < 3 ? 'bg-gray-50' : ''}`}
                >
                  <span
                    className={`w-6 text-center text-sm font-bold ${rankColors[i] ?? 'text-gray-500'}`}
                    aria-label={`Rank ${entry.rank}`}
                  >
                    {i < 3 ? rankIcons[i] : entry.rank}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-eco-100 text-eco-700">
                      {entry.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium text-gray-900">{entry.displayName}</span>
                  <span className="text-sm font-bold text-eco-700">
                    {numberWithCommas(entry.score)} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
