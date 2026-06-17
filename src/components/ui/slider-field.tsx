import React, { memo } from 'react';
import { Label } from '@/components/ui/label';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  hint?: string;
  onChange: (v: number) => void;
}

/** Reusable accessible range slider with label and hint */
export const SliderField = memo(function SliderField({
  label, value, min, max, step = 1, unit, hint, onChange,
}: SliderFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-bold text-eco-700 dark:text-eco-300">
          {value}{' '}
          <span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-full accent-eco-600 cursor-pointer"
        aria-label={`${label}: ${value} ${unit}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
});
