// Frontend carbon emission factors for real-time calculation preview
// Mirrors the backend carbonFactors.ts

export const CARBON_FACTORS = {
  transportation: {
    car_petrol: { label: 'Car (Petrol)', factor: 0.21233, unit: 'km' },
    car_diesel: { label: 'Car (Diesel)', factor: 0.16844, unit: 'km' },
    car_electric: { label: 'Car (Electric)', factor: 0.05302, unit: 'km' },
    car_hybrid: { label: 'Car (Hybrid)', factor: 0.10630, unit: 'km' },
    motorcycle: { label: 'Motorcycle', factor: 0.11600, unit: 'km' },
    bus: { label: 'Bus', factor: 0.08890, unit: 'km' },
    train_local: { label: 'Local Train/Metro', factor: 0.03694, unit: 'km' },
    train_long_distance: { label: 'Long Distance Train', factor: 0.04115, unit: 'km' },
    flight_domestic: { label: 'Domestic Flight', factor: 0.25500, unit: 'km' },
    flight_short_haul: { label: 'Short-Haul Flight', factor: 0.15570, unit: 'km' },
    flight_long_haul: { label: 'Long-Haul Flight', factor: 0.19500, unit: 'km' },
    bicycle: { label: 'Bicycle', factor: 0, unit: 'km' },
    walking: { label: 'Walking', factor: 0, unit: 'km' },
  },
  energy: {
    electricity_grid: { label: 'Grid Electricity', factor: 0.23314, unit: 'kWh' },
    electricity_renewable: { label: 'Renewable Electricity', factor: 0.01200, unit: 'kWh' },
    natural_gas: { label: 'Natural Gas', factor: 2.04042, unit: 'm³' },
    natural_gas_kwh: { label: 'Natural Gas (kWh)', factor: 0.18316, unit: 'kWh' },
    heating_oil: { label: 'Heating Oil', factor: 2.52011, unit: 'litre' },
    lpg: { label: 'LPG / Propane', factor: 1.55484, unit: 'litre' },
    solar_panel: { label: 'Solar Panel', factor: 0.04100, unit: 'kWh' },
  },
  food: {
    beef: { label: 'Beef', factor: 27.0, unit: 'kg' },
    lamb: { label: 'Lamb / Mutton', factor: 39.2, unit: 'kg' },
    pork: { label: 'Pork', factor: 12.1, unit: 'kg' },
    chicken: { label: 'Chicken', factor: 6.9, unit: 'kg' },
    fish_farmed: { label: 'Fish (Farmed)', factor: 13.6, unit: 'kg' },
    fish_wild: { label: 'Fish (Wild)', factor: 3.0, unit: 'kg' },
    eggs: { label: 'Eggs', factor: 4.8, unit: 'kg' },
    dairy_milk: { label: 'Dairy Milk', factor: 3.2, unit: 'litre' },
    dairy_cheese: { label: 'Cheese', factor: 13.5, unit: 'kg' },
    plant_milk: { label: 'Plant-based Milk', factor: 0.9, unit: 'litre' },
    vegetables: { label: 'Vegetables', factor: 2.0, unit: 'kg' },
    fruits: { label: 'Fruits', factor: 1.1, unit: 'kg' },
    legumes: { label: 'Legumes', factor: 0.9, unit: 'kg' },
    rice: { label: 'Rice', factor: 2.7, unit: 'kg' },
    coffee: { label: 'Coffee', factor: 17.0, unit: 'kg' },
  },
  shopping: {
    clothing_new: { label: 'New Clothing', factor: 33.4, unit: 'item' },
    electronics_laptop: { label: 'Laptop', factor: 422.0, unit: 'item' },
    electronics_phone: { label: 'Smartphone', factor: 70.0, unit: 'item' },
    electronics_tv: { label: 'Television', factor: 350.0, unit: 'item' },
    furniture: { label: 'Furniture', factor: 125.0, unit: 'item' },
    books: { label: 'Books', factor: 1.2, unit: 'item' },
    second_hand: { label: 'Second-hand Item', factor: 0.3, unit: 'item' },
  },
  waste: {
    landfill_general: { label: 'General Waste', factor: 0.44895, unit: 'kg' },
    recycling_paper: { label: 'Paper Recycling', factor: -1.29, unit: 'kg' },
    recycling_plastic: { label: 'Plastic Recycling', factor: -0.46, unit: 'kg' },
    recycling_glass: { label: 'Glass Recycling', factor: -0.31, unit: 'kg' },
    recycling_metal: { label: 'Metal Recycling', factor: -4.60, unit: 'kg' },
    composting: { label: 'Composting', factor: 0.07, unit: 'kg' },
    water: { label: 'Water Usage', factor: 0.000344, unit: 'litre' },
  },
};

export type CategoryKey = keyof typeof CARBON_FACTORS;

export function calculateCO2Preview(
  category: CategoryKey,
  subcategory: string,
  value: number
): number {
  const catFactors = CARBON_FACTORS[category] as Record<string, { factor: number }>;
  const factorObj = catFactors[subcategory];
  if (!factorObj) return 0;
  return Number((factorObj.factor * value).toFixed(4));
}

export function getCategorySubcategories(category: CategoryKey) {
  return Object.entries(CARBON_FACTORS[category]).map(([key, val]) => ({
    key,
    label: val.label,
    unit: val.unit,
    factor: val.factor,
  }));
}

// Alias for backwards compatibility with tracker component
export const EMISSION_FACTORS = {
  transportation: {
    car_petrol: CARBON_FACTORS.transportation.car_petrol.factor,
    car_diesel: CARBON_FACTORS.transportation.car_diesel.factor,
    car_electric: CARBON_FACTORS.transportation.car_electric.factor,
    bus: CARBON_FACTORS.transportation.bus.factor,
    train: CARBON_FACTORS.transportation.train_local.factor,
    metro: CARBON_FACTORS.transportation.train_local.factor,
    flight_short: CARBON_FACTORS.transportation.flight_short_haul.factor,
    flight_long: CARBON_FACTORS.transportation.flight_long_haul.factor,
  },
  energy: {
    electricity: CARBON_FACTORS.energy.electricity_grid.factor,
    natural_gas: CARBON_FACTORS.energy.natural_gas.factor,
    air_conditioner: CARBON_FACTORS.energy.electricity_grid.factor * 2.5,
    water_heater: CARBON_FACTORS.energy.natural_gas.factor * 0.3,
  },
  food: {
    beef: CARBON_FACTORS.food.beef.factor,
    pork: CARBON_FACTORS.food.pork.factor,
    chicken: CARBON_FACTORS.food.chicken.factor,
    fish: CARBON_FACTORS.food.fish_wild.factor,
    dairy: CARBON_FACTORS.food.dairy_milk.factor,
    vegetables: CARBON_FACTORS.food.vegetables.factor,
    vegan_meal: 1.5,
  },
  shopping: {
    clothes: CARBON_FACTORS.shopping.clothing_new.factor,
    electronics: CARBON_FACTORS.shopping.electronics_phone.factor,
    general: 0.002, // per ₹ spent
  },
  waste: {
    landfill: CARBON_FACTORS.waste.landfill_general.factor,
    recycled: 0.02,
    composted: CARBON_FACTORS.waste.composting.factor,
  },
};
