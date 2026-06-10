import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t CO₂e`;
  }
  return `${kg.toFixed(2)} kg CO₂e`;
}

export function formatCO2Short(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  if (kg >= 100) {
    return `${kg.toFixed(0)}kg`;
  }
  return `${kg.toFixed(1)}kg`;
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getSustainabilityColor(score: number): string {
  if (score >= 75) return 'text-eco-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 25) return 'text-orange-600';
  return 'text-red-600';
}

export function getTrendIcon(trend: 'improving' | 'stable' | 'worsening'): string {
  switch (trend) {
    case 'improving': return '↓';
    case 'stable': return '→';
    case 'worsening': return '↑';
  }
}

export function getTrendColor(trend: 'improving' | 'stable' | 'worsening'): string {
  switch (trend) {
    case 'improving': return 'text-eco-600';
    case 'stable': return 'text-yellow-600';
    case 'worsening': return 'text-red-600';
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    transportation: '#3b82f6',
    energy: '#f59e0b',
    food: '#22c55e',
    shopping: '#a855f7',
    waste: '#ef4444',
  };
  return colors[category] ?? '#6b7280';
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    transportation: '🚗',
    energy: '⚡',
    food: '🥗',
    shopping: '🛒',
    waste: '♻️',
  };
  return emojis[category] ?? '🌍';
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY': return 'text-eco-600 bg-eco-50';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
    case 'HARD': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function numberWithCommas(n: number): string {
  return n.toLocaleString('en-US');
}
