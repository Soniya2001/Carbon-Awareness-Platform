'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/src/components/ui/skeleton';
import { formatCO2Short } from '@/src/lib/utils';

interface ForecastPoint {
  period: string;
  predicted: number;
  lower?: number;
  upper?: number;
}

interface ForecastAreaChartProps {
  data: ForecastPoint[];
  isLoading?: boolean;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white px-3 py-2 shadow-lg text-sm" role="tooltip">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-eco-600">
            {p.name}: {formatCO2Short(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ForecastAreaChart({ data, isLoading, height = 220 }: ForecastAreaChartProps) {
  if (isLoading) {
    return <Skeleton style={{ height }} className="w-full rounded-lg" aria-label="Loading forecast" />;
  }
  if (!data.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-muted-foreground">
        Not enough data for forecasting
      </div>
    );
  }

  return (
    <div aria-label="Forecast area chart" role="img">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="predicted"
            name="Predicted"
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="url(#forecastGradient)"
            dot={{ fill: '#16a34a', r: 3 }}
          />
          {data[0]?.upper !== undefined && (
            <Area
              type="monotone"
              dataKey="upper"
              name="Upper"
              stroke="#86efac"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
          )}
          {data[0]?.lower !== undefined && (
            <Area
              type="monotone"
              dataKey="lower"
              name="Lower"
              stroke="#86efac"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
