'use client';

import { useMemo } from 'react';
import { cn } from '@/src/lib/utils';

interface HeatmapCell {
  date: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: HeatmapCell[];
  weeks?: number;
}

function getIntensity(value: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (value === 0) return 0;
  const ratio = value / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

const intensityClasses = [
  'bg-gray-100',
  'bg-eco-100',
  'bg-eco-200',
  'bg-eco-400',
  'bg-eco-600',
];

const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ActivityHeatmap({ data, weeks = 26 }: ActivityHeatmapProps) {
  const { grid, monthLabels, maxValue } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Build lookup map
    const lookup = new Map<string, number>();
    for (const cell of data) {
      lookup.set(cell.date.split('T')[0], cell.value);
    }

    const max = Math.max(...data.map((d) => d.value), 1);

    const gridData: Array<Array<{ date: string; value: number }>> = [];
    const months: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const week: Array<{ date: string; value: number }> = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);
        const key = date.toISOString().split('T')[0];
        week.push({ date: key, value: lookup.get(key) ?? 0 });

        if (d === 0 && date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth();
          months.push({ label: MONTHS[lastMonth], col: w });
        }
      }
      gridData.push(week);
    }

    return { grid: gridData, monthLabels: months, maxValue: max };
  }, [data, weeks]);

  return (
    <div aria-label="Activity heatmap" role="img" className="overflow-x-auto scrollbar-thin">
      <div className="inline-block min-w-max">
        {/* Month labels */}
        <div className="flex gap-0.5 mb-1 pl-7">
          {monthLabels.map((m) => (
            <div
              key={`${m.label}-${m.col}`}
              className="text-[10px] text-gray-400"
              style={{ width: `${(m.col + 1) * 14}px`, minWidth: 0 }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 pr-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-[10px] text-gray-400 h-3 leading-3">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell, di) => {
                  const intensity = getIntensity(cell.value, maxValue);
                  return (
                    <div
                      key={di}
                      className={cn(
                        'h-3 w-3 rounded-sm cursor-default',
                        intensityClasses[intensity]
                      )}
                      title={`${cell.date}: ${cell.value.toFixed(1)} kg CO₂e`}
                      aria-label={`${cell.date}: ${cell.value.toFixed(1)} kg CO₂e`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-1 pl-7">
          <span className="text-[10px] text-gray-400 mr-1">Less</span>
          {intensityClasses.map((cls, i) => (
            <div key={i} className={cn('h-3 w-3 rounded-sm', cls)} aria-hidden="true" />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
