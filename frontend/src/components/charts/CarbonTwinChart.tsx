'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatCO2Short } from '@/src/lib/utils';

interface TwinProjection {
  year: number;
  current: number;
  projected: number;
}

interface CarbonTwinChartProps {
  data: TwinProjection[];
  scenarioName: string;
  isLoading?: boolean;
  height?: number;
}

export function CarbonTwinChart({ data, scenarioName, isLoading, height = 260 }: CarbonTwinChartProps) {
  if (isLoading) {
    return <Skeleton style={{ height }} className="w-full rounded-lg" aria-label="Loading simulation" />;
  }
  if (!data.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-muted-foreground">
        Run a simulation to see projections
      </div>
    );
  }

  return (
    <div aria-label={`Carbon Twin chart: ${scenarioName}`} role="img">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `Year ${v}`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}kg`}
            width={50}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCO2Short(value), name === 'current' ? 'Current path' : scenarioName]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-600">
                {value === 'current' ? 'Current lifestyle' : scenarioName}
              </span>
            )}
          />
          {/* 2-tonne net-zero reference */}
          <ReferenceLine
            y={2000}
            stroke="#22c55e"
            strokeDasharray="6 3"
            label={{ value: 'Net Zero Target', fill: '#16a34a', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#ef4444"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={{ fill: '#ef4444', r: 3 }}
            name="current"
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ fill: '#16a34a', r: 3 }}
            activeDot={{ r: 5 }}
            name="projected"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
