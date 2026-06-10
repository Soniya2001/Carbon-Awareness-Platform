'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatDateShort, formatCO2Short } from '@/src/lib/utils';

interface DataPoint {
  date: string;
  value: number;
}

interface FootprintLineChartProps {
  data: DataPoint[];
  isLoading?: boolean;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-lg text-sm" role="tooltip">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-eco-600">{formatCO2Short(payload[0].value)} CO₂e</p>
      </div>
    );
  }
  return null;
};

export function FootprintLineChart({ data, isLoading, height = 200 }: FootprintLineChartProps) {
  if (isLoading) {
    return <Skeleton style={{ height }} className="w-full rounded-lg" aria-label="Loading chart" />;
  }

  if (!data.length) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-sm text-muted-foreground"
        aria-label="No data available"
      >
        No data yet — start logging activities
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    date: formatDateShort(d.date),
    value: Math.round(d.value * 100) / 100,
  }));

  const avg = data.reduce((s, d) => s + d.value, 0) / data.length;

  return (
    <div aria-label="Carbon footprint line chart" role="img">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}kg`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avg}
            stroke="#d1fae5"
            strokeDasharray="4 4"
            label={{ value: 'avg', fill: '#6b7280', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ fill: '#16a34a', r: 3 }}
            activeDot={{ r: 5, fill: '#15803d' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
