'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { EMISSION_FACTORS, getSubcategories, calcCO2, CATEGORY_ICONS } from '@/lib/carbonEngine';
import { formatCO2, todayISO } from '@/lib/utils';

const schema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Type is required'),
  value: z.coerce.number().positive('Value must be positive').max(100000, 'Value too large'),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = Object.keys(EMISSION_FACTORS);

export function ActivityLogger() {
  const { logActivity } = useAppStore();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [livePreview, setLivePreview] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: CATEGORIES[0],
      subcategory: '',
      value: undefined,
      date: todayISO(),
    },
  });

  const watchedSubcategory = watch('subcategory');
  const watchedValue = watch('value');

  // Live CO2e preview
  React.useEffect(() => {
    if (watchedSubcategory && watchedValue && watchedValue > 0) {
      const co2 = calcCO2(activeCategory, watchedSubcategory, watchedValue);
      setLivePreview(co2);
    } else {
      setLivePreview(null);
    }
  }, [activeCategory, watchedSubcategory, watchedValue]);

  const onCategoryChange = useCallback(
    (cat: string) => {
      setActiveCategory(cat);
      setValue('category', cat);
      setValue('subcategory', '');
      setLivePreview(null);
    },
    [setValue],
  );

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const record = logActivity({
        category: data.category,
        subcategory: data.subcategory,
        value: data.value,
        date: data.date,
      });

      if (record) {
        setShowSuccess(true);
        reset({ category: data.category, subcategory: '', value: undefined, date: todayISO() });
        setLivePreview(null);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const subcategories = getSubcategories(activeCategory);
  const selectedSub = subcategories.find((s) => s.key === watchedSubcategory);

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Log carbon activity" className="space-y-6">
      {/* Category Tabs */}
      <div>
        <Label className="mb-2 block">Category</Label>
        <Tabs value={activeCategory} onValueChange={onCategoryChange}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize gap-1.5 text-xs">
                <span aria-hidden>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-0">
              {/* Hidden input for category */}
              <input type="hidden" {...register('category')} value={activeCategory} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Subcategory */}
      <div className="space-y-1">
        <Label htmlFor="subcategory">
          Type <span aria-hidden className="text-muted-foreground text-xs">({activeCategory})</span>
        </Label>
        <Select
          value={watchedSubcategory}
          onValueChange={(val) => setValue('subcategory', val, { shouldValidate: true })}
        >
          <SelectTrigger id="subcategory" aria-label="Select activity type">
            <SelectValue placeholder="Select type…" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map(({ key, label, unit }) => (
              <SelectItem key={key} value={key}>
                {label} ({unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subcategory && (
          <p role="alert" className="text-xs text-red-500">{errors.subcategory.message}</p>
        )}
      </div>

      {/* Value & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="value">
            Amount {selectedSub && <span className="text-muted-foreground">({selectedSub.unit})</span>}
          </Label>
          <Input
            id="value"
            type="number"
            step="any"
            placeholder={`Enter ${selectedSub?.unit ?? 'amount'}`}
            {...register('value')}
            aria-describedby={errors.value ? 'value-error' : undefined}
          />
          {errors.value && (
            <p id="value-error" role="alert" className="text-xs text-red-500">
              {errors.value.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            max={todayISO()}
            {...register('date')}
          />
        </div>
      </div>

      {/* Live CO2e Preview */}
      <AnimatePresence>
        {livePreview !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-3 rounded-lg bg-eco-50 dark:bg-eco-900/20 border border-eco-200 dark:border-eco-800"
              role="status"
              aria-live="polite"
              aria-label={`Estimated emissions: ${formatCO2(livePreview)}`}
            >
              <span className="text-sm text-eco-700 dark:text-eco-300 font-medium">
                Estimated CO₂e:
              </span>
              <Badge variant="eco" className="text-sm font-bold">
                {formatCO2(livePreview)}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="gradient"
          className="flex-1"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Logging…
            </>
          ) : (
            <>Log Activity</>
          )}
        </Button>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 text-eco-600 dark:text-eco-400 text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden />
              <span>+10 pts!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
