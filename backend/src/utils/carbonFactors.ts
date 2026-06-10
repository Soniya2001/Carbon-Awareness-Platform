// Carbon emission factors in kg CO2e per unit
// Sources: IPCC, EPA, DEFRA emission factor datasets

export const CARBON_FACTORS = {
  transportation: {
    car_petrol: {
      label: 'Car (Petrol)',
      factor: 0.21233, // kg CO2e per km
      unit: 'km',
    },
    car_diesel: {
      label: 'Car (Diesel)',
      factor: 0.16844,
      unit: 'km',
    },
    car_electric: {
      label: 'Car (Electric)',
      factor: 0.05302,
      unit: 'km',
    },
    car_hybrid: {
      label: 'Car (Hybrid)',
      factor: 0.10630,
      unit: 'km',
    },
    motorcycle: {
      label: 'Motorcycle',
      factor: 0.11600,
      unit: 'km',
    },
    bus: {
      label: 'Bus',
      factor: 0.08890,
      unit: 'km',
    },
    train_local: {
      label: 'Local Train/Metro',
      factor: 0.03694,
      unit: 'km',
    },
    train_long_distance: {
      label: 'Long Distance Train',
      factor: 0.04115,
      unit: 'km',
    },
    flight_domestic: {
      label: 'Domestic Flight',
      factor: 0.25500,
      unit: 'km',
    },
    flight_short_haul: {
      label: 'Short-Haul Flight (<3700 km)',
      factor: 0.15570,
      unit: 'km',
    },
    flight_long_haul: {
      label: 'Long-Haul Flight (>3700 km)',
      factor: 0.19500,
      unit: 'km',
    },
    ferry: {
      label: 'Ferry',
      factor: 0.11300,
      unit: 'km',
    },
    bicycle: {
      label: 'Bicycle',
      factor: 0.0,
      unit: 'km',
    },
    walking: {
      label: 'Walking',
      factor: 0.0,
      unit: 'km',
    },
  },

  energy: {
    electricity_grid: {
      label: 'Grid Electricity',
      factor: 0.23314, // kg CO2e per kWh (global average)
      unit: 'kWh',
    },
    electricity_renewable: {
      label: 'Renewable Electricity',
      factor: 0.01200,
      unit: 'kWh',
    },
    natural_gas: {
      label: 'Natural Gas',
      factor: 2.04042, // kg CO2e per cubic meter
      unit: 'm3',
    },
    natural_gas_kwh: {
      label: 'Natural Gas (kWh)',
      factor: 0.18316,
      unit: 'kWh',
    },
    heating_oil: {
      label: 'Heating Oil',
      factor: 2.52011, // per litre
      unit: 'litre',
    },
    coal: {
      label: 'Coal',
      factor: 2.41700, // per kg
      unit: 'kg',
    },
    lpg: {
      label: 'LPG / Propane',
      factor: 1.55484, // per litre
      unit: 'litre',
    },
    wood_pellets: {
      label: 'Wood Pellets',
      factor: 0.03942, // per kg
      unit: 'kg',
    },
    solar_panel: {
      label: 'Solar Panel',
      factor: 0.04100,
      unit: 'kWh',
    },
  },

  food: {
    beef: {
      label: 'Beef',
      factor: 27.0, // kg CO2e per kg food
      unit: 'kg',
    },
    lamb: {
      label: 'Lamb / Mutton',
      factor: 39.2,
      unit: 'kg',
    },
    pork: {
      label: 'Pork',
      factor: 12.1,
      unit: 'kg',
    },
    chicken: {
      label: 'Chicken',
      factor: 6.9,
      unit: 'kg',
    },
    fish_farmed: {
      label: 'Fish (Farmed)',
      factor: 13.6,
      unit: 'kg',
    },
    fish_wild: {
      label: 'Fish (Wild Caught)',
      factor: 3.0,
      unit: 'kg',
    },
    eggs: {
      label: 'Eggs',
      factor: 4.8,
      unit: 'kg',
    },
    dairy_milk: {
      label: 'Dairy Milk',
      factor: 3.2,
      unit: 'litre',
    },
    dairy_cheese: {
      label: 'Cheese',
      factor: 13.5,
      unit: 'kg',
    },
    dairy_butter: {
      label: 'Butter',
      factor: 11.9,
      unit: 'kg',
    },
    plant_milk: {
      label: 'Plant-based Milk',
      factor: 0.9,
      unit: 'litre',
    },
    vegetables: {
      label: 'Vegetables (mixed)',
      factor: 2.0,
      unit: 'kg',
    },
    fruits: {
      label: 'Fruits (mixed)',
      factor: 1.1,
      unit: 'kg',
    },
    legumes: {
      label: 'Legumes / Pulses',
      factor: 0.9,
      unit: 'kg',
    },
    rice: {
      label: 'Rice',
      factor: 2.7,
      unit: 'kg',
    },
    bread: {
      label: 'Bread',
      factor: 1.4,
      unit: 'kg',
    },
    pasta: {
      label: 'Pasta',
      factor: 1.2,
      unit: 'kg',
    },
    coffee: {
      label: 'Coffee',
      factor: 17.0,
      unit: 'kg',
    },
    chocolate: {
      label: 'Chocolate',
      factor: 18.7,
      unit: 'kg',
    },
    food_waste: {
      label: 'Food Waste (landfill)',
      factor: 0.25,
      unit: 'kg',
    },
  },

  shopping: {
    clothing_new: {
      label: 'New Clothing',
      factor: 33.4, // kg CO2e per item (average)
      unit: 'item',
    },
    clothing_synthetic: {
      label: 'Synthetic Clothing',
      factor: 15.6,
      unit: 'kg',
    },
    clothing_cotton: {
      label: 'Cotton Clothing',
      factor: 9.7,
      unit: 'kg',
    },
    electronics_laptop: {
      label: 'Laptop',
      factor: 422.0,
      unit: 'item',
    },
    electronics_phone: {
      label: 'Smartphone',
      factor: 70.0,
      unit: 'item',
    },
    electronics_tablet: {
      label: 'Tablet',
      factor: 130.0,
      unit: 'item',
    },
    electronics_tv: {
      label: 'Television (50")',
      factor: 350.0,
      unit: 'item',
    },
    furniture: {
      label: 'Furniture (average piece)',
      factor: 125.0,
      unit: 'item',
    },
    books: {
      label: 'Books',
      factor: 1.2,
      unit: 'item',
    },
    online_shopping: {
      label: 'Online Purchase (avg delivery)',
      factor: 0.5,
      unit: 'item',
    },
    second_hand: {
      label: 'Second-hand Purchase',
      factor: 0.3,
      unit: 'item',
    },
  },

  waste: {
    landfill_general: {
      label: 'General Waste (landfill)',
      factor: 0.44895, // kg CO2e per kg waste
      unit: 'kg',
    },
    recycling_paper: {
      label: 'Paper Recycling',
      factor: -1.29,
      unit: 'kg',
    },
    recycling_plastic: {
      label: 'Plastic Recycling',
      factor: -0.46,
      unit: 'kg',
    },
    recycling_glass: {
      label: 'Glass Recycling',
      factor: -0.31,
      unit: 'kg',
    },
    recycling_metal: {
      label: 'Metal Recycling',
      factor: -4.60,
      unit: 'kg',
    },
    composting: {
      label: 'Composting',
      factor: 0.07,
      unit: 'kg',
    },
    incineration: {
      label: 'Incineration / Energy Recovery',
      factor: 0.23,
      unit: 'kg',
    },
    water: {
      label: 'Water Usage',
      factor: 0.000344, // kg CO2e per litre
      unit: 'litre',
    },
  },
};

export type CategoryKey = keyof typeof CARBON_FACTORS;
export type TransportKey = keyof typeof CARBON_FACTORS.transportation;
export type EnergyKey = keyof typeof CARBON_FACTORS.energy;
export type FoodKey = keyof typeof CARBON_FACTORS.food;
export type ShoppingKey = keyof typeof CARBON_FACTORS.shopping;
export type WasteKey = keyof typeof CARBON_FACTORS.waste;

export interface EmissionFactor {
  label: string;
  factor: number;
  unit: string;
}

export function getEmissionFactor(
  category: CategoryKey,
  subcategory: string
): EmissionFactor | null {
  const categoryFactors = CARBON_FACTORS[category] as Record<string, EmissionFactor>;
  return categoryFactors[subcategory] ?? null;
}

export function calculateEmissions(
  category: CategoryKey,
  subcategory: string,
  value: number
): number {
  const factor = getEmissionFactor(category, subcategory);
  if (!factor) return 0;
  return Number((factor.factor * value).toFixed(4));
}

// Average annual footprint benchmarks (kg CO2e)
export const GLOBAL_BENCHMARKS = {
  global_average: 4800, // kg CO2e per year
  usa_average: 14000,
  eu_average: 7000,
  india_average: 1900,
  uk_average: 5500,
  sustainable_target: 2300, // IPCC 2030 target
  net_zero_target: 500,    // Net zero lifestyle
};

// Category average percentages (for visualization)
export const CATEGORY_WEIGHTS = {
  transportation: 0.28,
  energy: 0.25,
  food: 0.27,
  shopping: 0.14,
  waste: 0.06,
};
