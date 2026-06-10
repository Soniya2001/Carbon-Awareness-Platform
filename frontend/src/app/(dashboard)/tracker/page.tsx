'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, Leaf, ShoppingBag, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Badge } from '@/src/components/ui/badge';
import { useCarbon } from '@/src/hooks/useCarbon';
import { EMISSION_FACTORS } from '@/src/lib/carbonFactors';
import { formatCO2 } from '@/src/lib/utils';
import type { CarbonCategory } from '@/src/types';

const activitySchema = z.object({
  subcategory: z.string().min(1, 'Please select an activity type'),
  value: z.coerce.number().positive('Value must be greater than 0'),
  date: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface CategoryConfig {
  key: CarbonCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  subcategories: Array<{ key: string; label: string; unit: string; factor: number }>;
}

const categories: CategoryConfig[] = [
  {
    key: 'transportation',
    label: 'Transportation',
    icon: Car,
    color: 'text-blue-600',
    subcategories: [
      { key: 'car_petrol', label: 'Car (Petrol)', unit: 'km', factor: EMISSION_FACTORS.transportation.car_petrol },
      { key: 'car_diesel', label: 'Car (Diesel)', unit: 'km', factor: EMISSION_FACTORS.transportation.car_diesel },
      { key: 'car_electric', label: 'Car (Electric)', unit: 'km', factor: EMISSION_FACTORS.transportation.car_electric },
      { key: 'bus', label: 'Bus', unit: 'km', factor: EMISSION_FACTORS.transportation.bus },
      { key: 'train', label: 'Train', unit: 'km', factor: EMISSION_FACTORS.transportation.train },
      { key: 'metro', label: 'Metro', unit: 'km', factor: EMISSION_FACTORS.transportation.metro },
      { key: 'flight_short', label: 'Short-haul Flight', unit: 'km', factor: EMISSION_FACTORS.transportation.flight_short },
      { key: 'flight_long', label: 'Long-haul Flight', unit: 'km', factor: EMISSION_FACTORS.transportation.flight_long },
      { key: 'bicycle', label: 'Bicycle / Walking', unit: 'km', factor: 0 },
    ],
  },
  {
    key: 'energy',
    label: 'Energy',
    icon: Zap,
    color: 'text-yellow-600',
    subcategories: [
      { key: 'electricity', label: 'Electricity', unit: 'kWh', factor: EMISSION_FACTORS.energy.electricity },
      { key: 'natural_gas', label: 'Natural Gas', unit: 'm³', factor: EMISSION_FACTORS.energy.natural_gas },
      { key: 'air_conditioner', label: 'Air Conditioner', unit: 'hours', factor: EMISSION_FACTORS.energy.air_conditioner },
      { key: 'water_heater', label: 'Water Heater', unit: 'hours', factor: EMISSION_FACTORS.energy.water_heater },
    ],
  },
  {
    key: 'food',
    label: 'Food',
    icon: Leaf,
    color: 'text-eco-600',
    subcategories: [
      { key: 'beef', label: 'Beef', unit: 'kg', factor: EMISSION_FACTORS.food.beef },
      { key: 'pork', label: 'Pork', unit: 'kg', factor: EMISSION_FACTORS.food.pork },
      { key: 'chicken', label: 'Chicken', unit: 'kg', factor: EMISSION_FACTORS.food.chicken },
      { key: 'fish', label: 'Fish', unit: 'kg', factor: EMISSION_FACTORS.food.fish },
      { key: 'dairy', label: 'Dairy', unit: 'kg', factor: EMISSION_FACTORS.food.dairy },
      { key: 'vegetables', label: 'Vegetables', unit: 'kg', factor: EMISSION_FACTORS.food.vegetables },
      { key: 'vegan_meal', label: 'Vegan Meal (full day)', unit: 'meals', factor: EMISSION_FACTORS.food.vegan_meal },
    ],
  },
  {
    key: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    color: 'text-purple-600',
    subcategories: [
      { key: 'clothes', label: 'Clothing', unit: 'items', factor: EMISSION_FACTORS.shopping.clothes },
      { key: 'electronics', label: 'Electronics', unit: 'items', factor: EMISSION_FACTORS.shopping.electronics },
      { key: 'general', label: 'General Purchase', unit: '₹ spend', factor: EMISSION_FACTORS.shopping.general },
    ],
  },
  {
    key: 'waste',
    label: 'Waste',
    icon: Trash2,
    color: 'text-red-600',
    subcategories: [
      { key: 'landfill', label: 'Landfill Waste', unit: 'kg', factor: EMISSION_FACTORS.waste.landfill },
      { key: 'recycled', label: 'Recycled Waste', unit: 'kg', factor: EMISSION_FACTORS.waste.recycled },
      { key: 'composted', label: 'Composted Waste', unit: 'kg', factor: EMISSION_FACTORS.waste.composted },
    ],
  },
];

interface ActivityFormProps {
  config: CategoryConfig;
  onSuccess: () => void;
}

function ActivityForm({ config, onSuccess }: ActivityFormProps) {
  const { logActivity } = useCarbon();
  const [selectedSub, setSelectedSub] = useState(config.subcategories[0]);
  const [preview, setPreview] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { subcategory: config.subcategories[0].key, date: new Date().toISOString().split('T')[0] },
  });

  const valueWatch = watch('value');

  const handleSubcategoryChange = (sub: typeof config.subcategories[0]) => {
    setSelectedSub(sub);
    const val = parseFloat(String(valueWatch));
    if (!isNaN(val)) setPreview(val * sub.factor);
  };

  const onSubmit = async (data: ActivityFormData) => {
    const sub = config.subcategories.find((s) => s.key === data.subcategory) ?? config.subcategories[0];
    await logActivity({
      category: config.key,
      subcategory: data.subcategory,
      value: data.value,
      unit: sub.unit,
      date: data.date,
    });
    setSuccess(true);
    reset({ subcategory: config.subcategories[0].key, value: undefined as unknown as number, date: new Date().toISOString().split('T')[0] });
    setPreview(null);
    setTimeout(() => { setSuccess(false); onSuccess(); }, 1800);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Subcategory grid */}
      <div>
        <Label>Activity type</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Activity type">
          {config.subcategories.map((sub) => (
            <label
              key={sub.key}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedSub.key === sub.key
                  ? 'border-eco-500 bg-eco-50 text-eco-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={sub.key}
                aria-label={sub.label}
                {...register('subcategory')}
                onChange={() => handleSubcategoryChange(sub)}
              />
              <span>{sub.label}</span>
              <span className="block text-xs text-muted-foreground">per {sub.unit}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Value input */}
        <div className="flex-1 space-y-1">
          <Label htmlFor={`value-${config.key}`}>
            Amount ({selectedSub.unit})
          </Label>
          <Input
            id={`value-${config.key}`}
            type="number"
            step="any"
            min="0"
            placeholder="0"
            aria-describedby={errors.value ? `value-error-${config.key}` : undefined}
            aria-invalid={!!errors.value}
            {...register('value', {
              onChange: (e) => {
                const val = parseFloat(e.target.value);
                setPreview(!isNaN(val) ? val * selectedSub.factor : null);
              },
            })}
          />
          {errors.value && (
            <p id={`value-error-${config.key}`} className="text-xs text-red-600" role="alert">
              {errors.value.message}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="flex-1 space-y-1">
          <Label htmlFor={`date-${config.key}`}>Date</Label>
          <Input
            id={`date-${config.key}`}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('date')}
          />
        </div>
      </div>

      {/* Live CO2 preview */}
      <AnimatePresence>
        {preview !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg bg-eco-50 border border-eco-200 px-4 py-3 flex items-center justify-between"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-sm text-eco-700">Estimated CO₂e</span>
            <span className="text-lg font-bold text-eco-800">{formatCO2(preview)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        variant={success ? 'outline' : 'eco'}
        className="w-full"
        loading={isSubmitting}
        aria-busy={isSubmitting}
      >
        {success ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-eco-600 mr-1" aria-hidden="true" />
            Logged!
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            Log Activity
          </>
        )}
      </Button>
    </form>
  );
}

export default function TrackerPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carbon Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log your daily activities across all emission categories
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="transportation">
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6" aria-label="Emission categories">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${cat.color}`} aria-hidden="true" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.key} value={cat.key}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <cat.icon className={`h-5 w-5 ${cat.color}`} aria-hidden="true" />
                    <h2 className="font-semibold text-gray-900">{cat.label}</h2>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {cat.subcategories.length} activity types
                    </Badge>
                  </div>
                  <ActivityForm
                    config={cat}
                    key={`${cat.key}-${refreshKey}`}
                    onSuccess={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
