'use client';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/src/components/ui/skeleton';
import { getCategoryColor, getCategoryEmoji, formatCO2Short } from '@/src/lib/utils';
import type { CarbonCategory } from '@/src/types';

interface CategoryPieChartProps {
  data: Partial<Record<CarbonCategory, number>>;
  isLoading?: boolean;
  height?: number;
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { emoji: string } }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-lg text-sm" role="tooltip">
        <p className="font-medium text-gray-900 capitalize">
          {item.payload.emoji} {item.name}
        </p>
        <p className="text-gray-600">{formatCO2Short(item.value)} CO₂e</p>
      </div>
    );
  }
  return null;
};

export function CategoryPieChart({ data, isLoading, height = 200 }: CategoryPieChartProps) {
  if (isLoading) {
    return <Skeleton style={{ height }} className="w-full rounded-full" aria-label="Loading chart" />;
  }

  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({
      name: category,
      value: Math.round((value ?? 0) * 100) / 100,
      color: getCategoryColor(category),
      emoji: getCategoryEmoji(category),
    }));

  if (!chartData.length) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-sm text-muted-foreground"
        aria-label="No category data"
      >
        No category data yet
      </div>
    );
  }

  return (
    <div aria-label="Carbon footprint by category pie chart" role="img">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs capitalize text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
