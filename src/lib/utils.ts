import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format CO2e in kg or tonnes with full label */
export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes CO₂e`;
  }
  if (kg >= 100) {
    return `${Math.round(kg)} kg CO₂e`;
  }
  return `${kg.toFixed(1)} kg CO₂e`;
}

/** Format CO2e in kg or tonnes, short form */
export function formatCO2Short(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  if (kg >= 100) {
    return `${Math.round(kg)} kg`;
  }
  return `${kg.toFixed(1)} kg`;
}

/** Format a number with locale-aware commas */
export function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

/** Format a date string (YYYY-MM-DD) to human-readable */
export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Format a date string to short form */
export function formatDateShort(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Today's date as ISO string YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Calculate percentage */
export function pct(val: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((val / total) * 100 * 10) / 10;
}

/** Get Tailwind text color class based on sustainability score */
export function scoreColor(score: number): string {
  if (score >= 80) return 'text-eco-600 dark:text-eco-400';
  if (score >= 60) return 'text-eco-500 dark:text-eco-400';
  if (score >= 40) return 'text-amber-500 dark:text-amber-400';
  if (score >= 20) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-500 dark:text-red-400';
}

/** Get Tailwind background color class based on sustainability score */
export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-eco-100 dark:bg-eco-900/30';
  if (score >= 60) return 'bg-eco-50 dark:bg-eco-900/20';
  if (score >= 40) return 'bg-amber-50 dark:bg-amber-900/20';
  if (score >= 20) return 'bg-orange-50 dark:bg-orange-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
}

/** Get color class for challenge difficulty */
export function difficultyColor(d: 'easy' | 'medium' | 'hard'): string {
  switch (d) {
    case 'easy':
      return 'text-eco-600 bg-eco-100 dark:bg-eco-900/30 dark:text-eco-400';
    case 'medium':
      return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    case 'hard':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  }
}

/** Sanitize user input to prevent XSS */
export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .slice(0, 10000); // hard limit
}

/** Generate a unique ID */
export function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Promise-based delay */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Get gradient class for category */
export function categoryGradient(category: string): string {
  const map: Record<string, string> = {
    transportation: 'from-blue-500 to-blue-600',
    energy: 'from-amber-500 to-amber-600',
    food: 'from-eco-500 to-eco-600',
    shopping: 'from-purple-500 to-purple-600',
    waste: 'from-red-500 to-red-600',
  };
  return map[category] ?? 'from-gray-500 to-gray-600';
}

/** Format percentage with sign */
export function formatPctChange(val: number): string {
  const rounded = Math.round(val * 10) / 10;
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}
