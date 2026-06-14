'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type StoredChallenge } from '@/lib/storage';
import { difficultyColor, pct } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChallengeCardProps {
  challenge: StoredChallenge;
  onJoin?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdateProgress?: (id: string, value: number) => void;
}

export function ChallengeCard({ challenge, onJoin, onComplete, onUpdateProgress }: ChallengeCardProps) {
  const progress = pct(challenge.currentValue, challenge.targetValue);
  const isCompleted = challenge.completed;
  const isJoined = challenge.joined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={!isCompleted ? { y: -2 } : undefined}
      className={cn(
        'rounded-xl border p-4 space-y-3 transition-shadow duration-200',
        isCompleted
          ? 'bg-eco-50 dark:bg-eco-900/20 border-eco-200 dark:border-eco-800'
          : 'bg-card border-border hover:shadow-md',
      )}
      aria-label={`Challenge: ${challenge.title}. ${isCompleted ? 'Completed.' : `Progress: ${progress}%`}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{challenge.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{challenge.title}</h3>
              {challenge.aiGenerated && (
                <Badge variant="sky" className="text-[10px]">AI</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {challenge.description}
            </p>
          </div>
        </div>
        {isCompleted && (
          <CheckCircle2
            className="w-5 h-5 text-eco-500 flex-shrink-0"
            aria-label="Completed"
          />
        )}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            difficultyColor(challenge.difficulty),
          )}
        >
          {challenge.difficulty}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-amber-400" aria-hidden />
          <span>{challenge.points} pts</span>
        </div>
        {!isCompleted && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            <span>{challenge.daysLeft}d left</span>
          </div>
        )}
        {isCompleted && challenge.completedDate && (
          <span className="text-xs text-eco-600 dark:text-eco-400 font-medium">
            ✓ Completed {new Date(challenge.completedDate + 'T00:00:00').toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Progress */}
      {isJoined && !isCompleted && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {challenge.currentValue}/{challenge.targetValue} {challenge.unit}
            </span>
          </div>
          <Progress
            value={progress}
            className="h-1.5"
            aria-label={`Challenge progress: ${progress}%`}
          />
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2 pt-1">
          {!isJoined ? (
            <Button
              size="sm"
              variant="gradient"
              className="flex-1"
              onClick={() => onJoin?.(challenge.id)}
              aria-label={`Join challenge: ${challenge.title}`}
            >
              Join Challenge
            </Button>
          ) : (
            <>
              {onUpdateProgress && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    onUpdateProgress(
                      challenge.id,
                      Math.min(challenge.currentValue + 1, challenge.targetValue),
                    )
                  }
                  aria-label="Log progress for this challenge"
                >
                  +1 Progress
                </Button>
              )}
              <Button
                size="sm"
                variant="eco"
                className="flex-1"
                onClick={() => onComplete?.(challenge.id)}
                disabled={progress < 100}
                aria-label={
                  progress < 100
                    ? 'Complete all progress before marking done'
                    : `Mark ${challenge.title} as complete`
                }
              >
                {progress >= 100 ? 'Complete ✓' : `${Math.round(progress)}%`}
              </Button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
