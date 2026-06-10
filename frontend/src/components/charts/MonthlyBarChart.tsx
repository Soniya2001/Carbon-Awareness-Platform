'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatCO2Short } from '@/src/lib/utils';

interface MonthlyDataPoint {
  month: string;
  transportation?: number;
  energy?: number;
  food?: number;
  shopping?: number;
  waste?: number;
}

interface MonthlyBarChartProps {
  data: MonthlyDataPoint[];
  isLoading?: boolean;
  height?: number;
  stacked?: boolean;
}

const CATEGORY_COLORS = {
  transportation: '#3b82f6',
  energy: '#f59e0b',
  food: '#22c55e',
  shopping: '#a855f7',
  waste: '#ef4444',
};

export function MonthlyBarChart({ data, isLoading, height = 220, stacked = true }: MonthlyBarChartProps) {
  if (isLoading) {
    return <Skeleton style={{ height }} className="w-full rounded-lg" aria-label="Loading chart" />;
  }
  if (!data.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-muted-foreground">
        No monthly data available
      </div>
    );
  }

  return (
    <div aria-label="Monthly emissions bar chart" role="img">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} width={45} />
          <Tooltip formatter={(value: number) => [formatCO2Short(value), '']} />
          <Legend formatter={(value) => <span className="text-xs capitalize text-gray-600">{value}</span>} />
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? 'a' : undefined}
              fill={color}
              radius={stacked ? undefined : [2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
