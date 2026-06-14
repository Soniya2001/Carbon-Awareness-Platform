'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_COLORS } from '@/lib/carbonEngine';

// ──────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit = 'kg CO₂e' }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      role="tooltip"
      className="rounded-lg border bg-background p-3 shadow-lg text-sm"
    >
      {label && <p className="font-medium mb-1 text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color ?? p.fill }}
          />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium">
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────

function EmptyState({ message = 'No data yet. Start logging activities!' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2 text-muted-foreground">
      <span className="text-4xl" aria-hidden>
        📊
      </span>
      <p className="text-sm text-center px-4">{message}</p>
    </div>
  );
}

// ──────────────────────────────────────────
// Pie Breakdown
// ──────────────────────────────────────────

interface PieData {
  name: string;
  value: number;
  category?: string;
}

interface PieBreakdownProps {
  data: PieData[];
  isLoading?: boolean;
}

export function PieBreakdown({ data, isLoading }: PieBreakdownProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
      </div>
    );
  }

  const filtered = data.filter((d) => d.value > 0);
  if (!filtered.length) return <EmptyState />;

  const COLORS = filtered.map(
    (d) => CATEGORY_COLORS[d.category ?? d.name.toLowerCase()] ?? '#94a3b8',
  );

  const total = filtered.reduce((a, b) => a + b.value, 0);

  return (
    <div
      role="img"
      aria-label={`Pie chart showing carbon breakdown: ${filtered.map((d) => `${d.name} ${((d.value / total) * 100).toFixed(0)}%`).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {filtered.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip unit="kg CO₂e" />}
          />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-foreground capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────
// Trend Line
// ──────────────────────────────────────────

interface TrendData {
  date: string;
  total: number;
}

interface TrendLineProps {
  data: TrendData[];
  isLoading?: boolean;
}

export function TrendLine({ data, isLoading }: TrendLineProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (!data.length) return <EmptyState />;

  return (
    <div
      role="img"
      aria-label={`Line chart showing daily carbon emissions over ${data.length} days`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(val: string) => {
              const d = new Date(val + 'T00:00:00');
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} unit=" kg" className="text-muted-foreground" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="Daily emissions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────
// Forecast Area Chart
// ──────────────────────────────────────────

interface ForecastData {
  date: string;
  actual?: number;
  forecast?: number;
  upper?: number;
  lower?: number;
}

interface ForecastAreaProps {
  data: ForecastData[];
  isLoading?: boolean;
}

export function ForecastArea({ data, isLoading }: ForecastAreaProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (!data.length) return <EmptyState message="Not enough data for forecast. Log more activities!" />;

  return (
    <div
      role="img"
      aria-label="Area chart showing historical and forecast carbon emissions"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(val: string) => {
              const d = new Date(val + 'T00:00:00');
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 11 }} unit=" kg" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#actualGrad)"
            name="Actual"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#0ea5e9"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#forecastGrad)"
            name="Forecast"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="#0ea5e9"
            strokeWidth={1}
            strokeDasharray="2 4"
            fill="transparent"
            name="Upper bound"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="#0ea5e9"
            strokeWidth={1}
            strokeDasharray="2 4"
            fill="transparent"
            name="Lower bound"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────
// Category Bar Chart
// ──────────────────────────────────────────

interface CategoryData {
  category: string;
  value: number;
}

interface CategoryBarProps {
  data: CategoryData[];
  isLoading?: boolean;
}

export function CategoryBar({ data, isLoading }: CategoryBarProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (!data.length) return <EmptyState />;

  const filtered = data.filter((d) => d.value > 0);

  return (
    <div
      role="img"
      aria-label={`Bar chart showing carbon emissions by category: ${filtered.map((d) => `${d.category} ${d.value} kg`).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filtered} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" kg" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Emissions" radius={[4, 4, 0, 0]}>
            {filtered.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.category.toLowerCase()] ?? '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────
// Twin Comparison Chart
// ──────────────────────────────────────────

interface TwinData {
  year: string;
  current: number;
  scenario: number;
  saving: number;
}

interface TwinComparisonProps {
  data: TwinData[];
  name?: string;
  isLoading?: boolean;
}

export function TwinComparison({ data, name = 'Scenario', isLoading }: TwinComparisonProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (!data.length) return <EmptyState message="Run a simulation to see the comparison." />;

  return (
    <div
      role="img"
      aria-label={`Bar chart comparing current footprint vs ${name} scenario over time`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" kg" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="current" name="Current" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="scenario" name={name} fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
