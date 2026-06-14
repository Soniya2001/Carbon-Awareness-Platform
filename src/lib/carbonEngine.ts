// Carbon Calculation Engine
// All emission factors in kg CO2e per unit

export const GLOBAL_AVG_KG_YEAR = 4800;
export const IPCC_TARGET = 2300;
export const NET_ZERO = 500;

// Emission factors: kg CO2e per unit
export const EMISSION_FACTORS: Record<
  string,
  Record<string, { factor: number; unit: string; label: string }>
> = {
  transportation: {
    car_petrol: { factor: 0.192, unit: 'km', label: 'Car (Petrol)' },
    car_diesel: { factor: 0.171, unit: 'km', label: 'Car (Diesel)' },
    car_hybrid: { factor: 0.106, unit: 'km', label: 'Car (Hybrid)' },
    car_electric: { factor: 0.053, unit: 'km', label: 'Car (Electric)' },
    bus: { factor: 0.089, unit: 'km', label: 'Bus' },
    train: { factor: 0.041, unit: 'km', label: 'Train' },
    metro: { factor: 0.031, unit: 'km', label: 'Metro/Subway' },
    bicycle: { factor: 0.0, unit: 'km', label: 'Bicycle' },
    walking: { factor: 0.0, unit: 'km', label: 'Walking' },
    flight_short: { factor: 0.255, unit: 'km', label: 'Flight (Short-haul)' },
    flight_long: { factor: 0.195, unit: 'km', label: 'Flight (Long-haul)' },
    motorcycle: { factor: 0.114, unit: 'km', label: 'Motorcycle' },
    taxi: { factor: 0.211, unit: 'km', label: 'Taxi/Rideshare' },
    ferry: { factor: 0.113, unit: 'km', label: 'Ferry' },
  },
  energy: {
    electricity_grid: { factor: 0.233, unit: 'kWh', label: 'Grid Electricity' },
    electricity_solar: { factor: 0.041, unit: 'kWh', label: 'Solar Electricity' },
    electricity_wind: { factor: 0.011, unit: 'kWh', label: 'Wind Electricity' },
    natural_gas: { factor: 2.04, unit: 'm³', label: 'Natural Gas' },
    heating_oil: { factor: 2.68, unit: 'litre', label: 'Heating Oil' },
    lpg: { factor: 1.51, unit: 'litre', label: 'LPG' },
    coal: { factor: 2.42, unit: 'kg', label: 'Coal' },
    wood_pellets: { factor: 0.04, unit: 'kg', label: 'Wood Pellets' },
    heat_pump: { factor: 0.07, unit: 'kWh', label: 'Heat Pump' },
  },
  food: {
    beef: { factor: 27.0, unit: 'kg', label: 'Beef' },
    lamb: { factor: 39.2, unit: 'kg', label: 'Lamb' },
    pork: { factor: 12.1, unit: 'kg', label: 'Pork' },
    chicken: { factor: 6.9, unit: 'kg', label: 'Chicken' },
    fish: { factor: 6.1, unit: 'kg', label: 'Fish' },
    dairy: { factor: 3.2, unit: 'kg', label: 'Dairy Products' },
    eggs: { factor: 4.8, unit: 'kg', label: 'Eggs' },
    vegetables: { factor: 2.0, unit: 'kg', label: 'Vegetables' },
    fruits: { factor: 1.1, unit: 'kg', label: 'Fruits' },
    grains: { factor: 1.4, unit: 'kg', label: 'Grains & Legumes' },
    tofu: { factor: 3.0, unit: 'kg', label: 'Tofu/Soy' },
    nuts: { factor: 2.3, unit: 'kg', label: 'Nuts' },
    coffee: { factor: 28.5, unit: 'kg', label: 'Coffee' },
    food_waste: { factor: 2.5, unit: 'kg', label: 'Food Waste' },
  },
  shopping: {
    clothing: { factor: 14.5, unit: 'item', label: 'Clothing Item' },
    electronics_phone: { factor: 70.0, unit: 'item', label: 'Smartphone' },
    electronics_laptop: { factor: 422.0, unit: 'item', label: 'Laptop' },
    electronics_tv: { factor: 400.0, unit: 'item', label: 'TV' },
    electronics_appliance: { factor: 200.0, unit: 'item', label: 'Home Appliance' },
    furniture: { factor: 150.0, unit: 'item', label: 'Furniture Piece' },
    books_paper: { factor: 1.2, unit: 'item', label: 'Book/Magazine' },
    online_shopping: { factor: 0.5, unit: 'package', label: 'Online Delivery Package' },
    second_hand: { factor: 1.5, unit: 'item', label: 'Second-hand Item' },
  },
  waste: {
    landfill: { factor: 0.58, unit: 'kg', label: 'General Waste (Landfill)' },
    recycled_mixed: { factor: 0.021, unit: 'kg', label: 'Mixed Recycling' },
    composted: { factor: 0.0, unit: 'kg', label: 'Composted' },
    incinerated: { factor: 1.15, unit: 'kg', label: 'Incinerated' },
    plastic: { factor: 2.7, unit: 'kg', label: 'Plastic Waste' },
    paper: { factor: 1.06, unit: 'kg', label: 'Paper Waste' },
    glass: { factor: 0.31, unit: 'kg', label: 'Glass Waste' },
    metal: { factor: 2.5, unit: 'kg', label: 'Metal Waste' },
    electronic_waste: { factor: 20.0, unit: 'kg', label: 'E-Waste' },
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#3b82f6',
  energy: '#f59e0b',
  food: '#22c55e',
  shopping: '#a855f7',
  waste: '#ef4444',
};

export const CATEGORY_ICONS: Record<string, string> = {
  transportation: '🚗',
  energy: '⚡',
  food: '🍽️',
  shopping: '🛍️',
  waste: '♻️',
};

export interface ActivityInput {
  category: string;
  subcategory: string;
  value: number;
  date?: string;
}

export interface DailyFootprint {
  date: string;
  total: number;
  byCategory: Record<string, number>;
  inputs: ActivityInput[];
}

/**
 * Calculate CO2e for a single activity
 */
export function calcCO2(category: string, subcategory: string, value: number): number {
  const categoryFactors = EMISSION_FACTORS[category];
  if (!categoryFactors) return 0;
  const factorData = categoryFactors[subcategory];
  if (!factorData) return 0;
  return Math.round(factorData.factor * value * 1000) / 1000;
}

/**
 * Calculate daily footprint from array of inputs
 */
export function calculateDailyFootprint(inputs: ActivityInput[]): DailyFootprint {
  const byCategory: Record<string, number> = {
    transportation: 0,
    energy: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  let total = 0;
  const date = inputs[0]?.date ?? new Date().toISOString().split('T')[0];

  for (const input of inputs) {
    const co2 = calcCO2(input.category, input.subcategory, input.value);
    byCategory[input.category] = (byCategory[input.category] ?? 0) + co2;
    total += co2;
  }

  // Round values
  Object.keys(byCategory).forEach((k) => {
    byCategory[k] = Math.round(byCategory[k] * 100) / 100;
  });

  return {
    date,
    total: Math.round(total * 100) / 100,
    byCategory,
    inputs,
  };
}

/**
 * Sustainability score: 0-100 (higher = better)
 * Based on annual kg CO2e
 */
export function sustainabilityScore(annualKg: number): number {
  if (annualKg <= NET_ZERO) return 100;
  if (annualKg >= GLOBAL_AVG_KG_YEAR * 2) return 0;

  // Linear interpolation between NET_ZERO (100) and GLOBAL_AVG*2 (0)
  const max = GLOBAL_AVG_KG_YEAR * 2;
  const score = ((max - annualKg) / (max - NET_ZERO)) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface CarbonScore {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
  monthlyKg: number;
  annualKg: number;
  vsGlobal: number; // percentage vs global average
  vsTarget: number; // percentage vs IPCC target
}

/**
 * Carbon score with grade A-F based on monthly kg CO2e
 */
export function carbonScore(monthlyKg: number): CarbonScore {
  const annualKg = monthlyKg * 12;
  const vsGlobal = Math.round(((annualKg - GLOBAL_AVG_KG_YEAR) / GLOBAL_AVG_KG_YEAR) * 100);
  const vsTarget = Math.round(((annualKg - IPCC_TARGET) / IPCC_TARGET) * 100);

  let grade: CarbonScore['grade'];
  let label: string;
  let color: string;

  if (annualKg <= NET_ZERO) {
    grade = 'A+';
    label = 'Net Zero Hero';
    color = '#22c55e';
  } else if (annualKg <= IPCC_TARGET) {
    grade = 'A';
    label = 'Climate Champion';
    color = '#4ade80';
  } else if (annualKg <= IPCC_TARGET * 1.5) {
    grade = 'B';
    label = 'Eco Conscious';
    color = '#86efac';
  } else if (annualKg <= GLOBAL_AVG_KG_YEAR) {
    grade = 'C';
    label = 'Average Footprint';
    color = '#fbbf24';
  } else if (annualKg <= GLOBAL_AVG_KG_YEAR * 1.5) {
    grade = 'D';
    label = 'Above Average';
    color = '#f97316';
  } else {
    grade = 'F';
    label = 'High Footprint';
    color = '#ef4444';
  }

  return { grade, label, color, monthlyKg, annualKg, vsGlobal, vsTarget };
}

// Helper conversion functions

/**
 * How many trees needed to offset annualKg for one year
 * Average tree absorbs ~21 kg CO2/year
 */
export function treesEquivalent(annualKg: number): number {
  return Math.round(annualKg / 21);
}

/**
 * Equivalent number of average cars driven for a year
 * Average car emits ~4600 kg CO2/year
 */
export function carsEquivalent(annualKg: number): number {
  return Math.round((annualKg / 4600) * 100) / 100;
}

/**
 * Equivalent number of long-haul flights (London-New York ~990 kg CO2e)
 */
export function flightsEquivalent(annualKg: number): number {
  return Math.round((annualKg / 990) * 10) / 10;
}

/**
 * Equivalent litres of petrol burned (2.31 kg CO2 per litre)
 */
export function fuelLitresEquivalent(annualKg: number): number {
  return Math.round(annualKg / 2.31);
}

/**
 * Get all subcategories for a given category
 */
export function getSubcategories(
  category: string,
): Array<{ key: string; label: string; unit: string }> {
  const cat = EMISSION_FACTORS[category];
  if (!cat) return [];
  return Object.entries(cat).map(([key, val]) => ({
    key,
    label: val.label,
    unit: val.unit,
  }));
}

/**
 * Get emission factor info for a subcategory
 */
export function getFactorInfo(
  category: string,
  subcategory: string,
): { factor: number; unit: string; label: string } | null {
  return EMISSION_FACTORS[category]?.[subcategory] ?? null;
}
