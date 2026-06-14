// Simulation Engine for Carbon Twin and Forecasting

import {
  sustainabilityScore,
  treesEquivalent,
  carsEquivalent,
  flightsEquivalent,
  fuelLitresEquivalent,
  GLOBAL_AVG_KG_YEAR,
  IPCC_TARGET,
} from './carbonEngine';

export interface Scenario {
  key: string;
  name: string;
  description: string;
  icon: string;
  reductionFactor: Record<string, number>; // 0-1: factor to multiply category emissions
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    key: 'current',
    name: 'Current Lifestyle',
    description: 'Your current carbon footprint with no changes made.',
    icon: '📊',
    reductionFactor: {
      transportation: 1.0,
      energy: 1.0,
      food: 1.0,
      shopping: 1.0,
      waste: 1.0,
    },
    difficulty: 'easy',
    tags: ['baseline'],
  },
  {
    key: 'public_transport',
    name: 'Switch to Public Transport',
    description:
      'Replace all car journeys with public transport and reduce flight frequency by 50%.',
    icon: '🚌',
    reductionFactor: {
      transportation: 0.35,
      energy: 1.0,
      food: 1.0,
      shopping: 1.0,
      waste: 1.0,
    },
    difficulty: 'medium',
    tags: ['transport', 'urban'],
  },
  {
    key: 'reduce_meat',
    name: 'Plant-Based Diet',
    description:
      'Adopt a predominantly plant-based diet, reducing meat consumption by 80% and dairy by 50%.',
    icon: '🥦',
    reductionFactor: {
      transportation: 1.0,
      energy: 1.0,
      food: 0.4,
      shopping: 1.0,
      waste: 0.8,
    },
    difficulty: 'medium',
    tags: ['food', 'diet', 'vegan'],
  },
  {
    key: 'reduce_electricity',
    name: 'Green Energy & Efficiency',
    description:
      'Switch to renewable electricity, improve home insulation, and reduce overall energy consumption by 60%.',
    icon: '☀️',
    reductionFactor: {
      transportation: 1.0,
      energy: 0.35,
      food: 1.0,
      shopping: 1.0,
      waste: 1.0,
    },
    difficulty: 'medium',
    tags: ['energy', 'solar', 'efficiency'],
  },
  {
    key: 'sustainable_shopping',
    name: 'Sustainable Consumption',
    description:
      'Buy second-hand, repair instead of replace, and reduce overall consumption by 70%.',
    icon: '♻️',
    reductionFactor: {
      transportation: 1.0,
      energy: 1.0,
      food: 1.0,
      shopping: 0.3,
      waste: 0.5,
    },
    difficulty: 'easy',
    tags: ['shopping', 'circular', 'minimal'],
  },
  {
    key: 'full_sustainable',
    name: 'Full Sustainable Lifestyle',
    description:
      'Combine all sustainable practices: public transport, plant-based diet, renewable energy, mindful consumption, and zero waste.',
    icon: '🌍',
    reductionFactor: {
      transportation: 0.3,
      energy: 0.25,
      food: 0.35,
      shopping: 0.25,
      waste: 0.2,
    },
    difficulty: 'hard',
    tags: ['comprehensive', 'zero-waste', 'champion'],
  },
];

export interface SimulationProjection {
  year: number;
  current: number;
  scenario: number;
  saving: number;
  cumulativeSaving: number;
}

export interface Equivalents {
  trees: number;
  cars: number;
  flights: number;
  fuelLitres: number;
}

export interface SimulationResult {
  scenarioKey: string;
  scenarioName: string;
  currentAnnualKg: number;
  scenarioAnnualKg: number;
  annualSavingKg: number;
  savingPercent: number;
  projections: SimulationProjection[];
  equivalents: Equivalents; // annual saving equivalents
  cumulativeEquivalents: Equivalents; // total over all years
  sustainabilityScore: number;
  currentSustainabilityScore: number;
  vsIPCC: number; // how close to IPCC target (%)
  vsGlobal: number; // vs global average (%)
  chartData: Array<{ year: string; current: number; scenario: number; saving: number }>;
}

/**
 * Run a simulation for a given scenario
 */
export function runSimulation(
  scenarioKey: string,
  monthlyByCategory: Record<string, number>,
  years: number = 5,
): SimulationResult {
  const scenario = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[0];

  // Calculate current annual kg per category
  const currentByCategory: Record<string, number> = {};
  let currentAnnualKg = 0;
  for (const [cat, monthly] of Object.entries(monthlyByCategory)) {
    const annual = monthly * 12;
    currentByCategory[cat] = annual;
    currentAnnualKg += annual;
  }

  // Apply reduction factors
  const scenarioByCategory: Record<string, number> = {};
  let scenarioAnnualKg = 0;
  for (const [cat, annual] of Object.entries(currentByCategory)) {
    const factor = scenario.reductionFactor[cat] ?? 1.0;
    const reduced = annual * factor;
    scenarioByCategory[cat] = reduced;
    scenarioAnnualKg += reduced;
  }

  const annualSavingKg = currentAnnualKg - scenarioAnnualKg;
  const savingPercent = currentAnnualKg > 0 ? (annualSavingKg / currentAnnualKg) * 100 : 0;

  // Build year-by-year projections
  const projections: SimulationProjection[] = [];
  const chartData: Array<{ year: string; current: number; scenario: number; saving: number }> = [];
  let cumulativeSaving = 0;

  for (let y = 1; y <= years; y++) {
    cumulativeSaving += annualSavingKg;
    projections.push({
      year: y,
      current: Math.round(currentAnnualKg * y),
      scenario: Math.round(scenarioAnnualKg * y),
      saving: Math.round(annualSavingKg),
      cumulativeSaving: Math.round(cumulativeSaving),
    });
    chartData.push({
      year: `Year ${y}`,
      current: Math.round(currentAnnualKg),
      scenario: Math.round(scenarioAnnualKg),
      saving: Math.round(annualSavingKg),
    });
  }

  const totalSaving = annualSavingKg * years;

  return {
    scenarioKey,
    scenarioName: scenario.name,
    currentAnnualKg: Math.round(currentAnnualKg),
    scenarioAnnualKg: Math.round(scenarioAnnualKg),
    annualSavingKg: Math.round(annualSavingKg),
    savingPercent: Math.round(savingPercent * 10) / 10,
    projections,
    equivalents: {
      trees: treesEquivalent(annualSavingKg),
      cars: carsEquivalent(annualSavingKg),
      flights: flightsEquivalent(annualSavingKg),
      fuelLitres: fuelLitresEquivalent(annualSavingKg),
    },
    cumulativeEquivalents: {
      trees: treesEquivalent(totalSaving),
      cars: carsEquivalent(totalSaving),
      flights: flightsEquivalent(totalSaving),
      fuelLitres: fuelLitresEquivalent(totalSaving),
    },
    sustainabilityScore: sustainabilityScore(scenarioAnnualKg),
    currentSustainabilityScore: sustainabilityScore(currentAnnualKg),
    vsIPCC:
      IPCC_TARGET > 0
        ? Math.round(((scenarioAnnualKg - IPCC_TARGET) / IPCC_TARGET) * 100)
        : 0,
    vsGlobal:
      GLOBAL_AVG_KG_YEAR > 0
        ? Math.round(((scenarioAnnualKg - GLOBAL_AVG_KG_YEAR) / GLOBAL_AVG_KG_YEAR) * 100)
        : 0,
    chartData,
  };
}

export interface DailyRecord {
  date: string;
  total: number;
  byCategory?: Record<string, number>;
}

export interface ForecastResult {
  nextMonth: number;
  threeMonth: number;
  sixMonth: number;
  annual: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number; // change % per month
  confidence: number; // 0-100
  chartData: Array<{
    date: string;
    actual?: number;
    forecast?: number;
    upper?: number;
    lower?: number;
  }>;
  dailyAverage: number;
  weeklyAverage: number;
}

/**
 * Forecast future emissions from historical daily records
 */
export function forecastFromHistory(dailyRecords: DailyRecord[]): ForecastResult {
  if (!dailyRecords || dailyRecords.length === 0) {
    const defaultVal = (GLOBAL_AVG_KG_YEAR / 365) * 30;
    return {
      nextMonth: Math.round(defaultVal),
      threeMonth: Math.round(defaultVal * 3),
      sixMonth: Math.round(defaultVal * 6),
      annual: Math.round(GLOBAL_AVG_KG_YEAR),
      trend: 'stable',
      trendPercent: 0,
      confidence: 0,
      chartData: [],
      dailyAverage: Math.round((GLOBAL_AVG_KG_YEAR / 365) * 100) / 100,
      weeklyAverage: Math.round((GLOBAL_AVG_KG_YEAR / 52) * 100) / 100,
    };
  }

  // Sort records by date
  const sorted = [...dailyRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const n = sorted.length;
  const totals = sorted.map((r) => r.total);

  const dailyAverage = totals.reduce((a, b) => a + b, 0) / n;

  // Calculate trend using linear regression
  const xMean = (n - 1) / 2;
  const yMean = dailyAverage;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (totals[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Monthly trend percent
  const currentMonthlyEst = dailyAverage * 30;
  const nextMonthEst = (intercept + slope * (n + 15)) * 30;
  const trendPercent =
    currentMonthlyEst > 0
      ? Math.round(((nextMonthEst - currentMonthlyEst) / currentMonthlyEst) * 1000) / 10
      : 0;

  let trend: 'increasing' | 'stable' | 'decreasing';
  if (trendPercent > 2) trend = 'increasing';
  else if (trendPercent < -2) trend = 'decreasing';
  else trend = 'stable';

  // Confidence based on data availability
  const confidence = Math.min(100, Math.round((n / 30) * 100));

  // Predictions
  const nextMonthDaily = Math.max(0, intercept + slope * (n + 15));
  const threeMonthDaily = Math.max(0, intercept + slope * (n + 45));
  const sixMonthDaily = Math.max(0, intercept + slope * (n + 90));

  // Build chart data
  const chartData: ForecastResult['chartData'] = [];

  // Historical data points (last 30 days or all if fewer)
  const historyDays = Math.min(30, sorted.length);
  for (let i = sorted.length - historyDays; i < sorted.length; i++) {
    chartData.push({
      date: sorted[i].date,
      actual: Math.round(sorted[i].total * 100) / 100,
    });
  }

  // Forecast next 30 days
  const lastDate = new Date(sorted[sorted.length - 1].date);
  for (let d = 1; d <= 30; d++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + d);
    const forecastVal = Math.max(0, intercept + slope * (n + d));
    const uncertainty = forecastVal * 0.1 * (d / 30);

    chartData.push({
      date: forecastDate.toISOString().split('T')[0],
      forecast: Math.round(forecastVal * 100) / 100,
      upper: Math.round((forecastVal + uncertainty) * 100) / 100,
      lower: Math.round(Math.max(0, forecastVal - uncertainty) * 100) / 100,
    });
  }

  return {
    nextMonth: Math.round(nextMonthDaily * 30),
    threeMonth: Math.round(threeMonthDaily * 90),
    sixMonth: Math.round(sixMonthDaily * 180),
    annual: Math.round(dailyAverage * 365 + slope * 182.5 * 365),
    trend,
    trendPercent,
    confidence,
    chartData,
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    weeklyAverage: Math.round(dailyAverage * 7 * 100) / 100,
  };
}

export interface CommunityImpact {
  totalAnnualSavingTons: number;
  treesEquivalent: number;
  carsRemovedEquivalent: number;
  fuelLitresSaved: number;
  flightsEquivalent: number;
  powerHomesYears: number; // homes powered for a year
}

/**
 * Calculate community-scale impact
 */
export function communityImpact(annualSavingKgPerPerson: number, users: number): CommunityImpact {
  const totalKg = annualSavingKgPerPerson * users;
  const totalTons = totalKg / 1000;

  return {
    totalAnnualSavingTons: Math.round(totalTons),
    treesEquivalent: Math.round(totalKg / 21),
    carsRemovedEquivalent: Math.round(totalKg / 4600),
    fuelLitresSaved: Math.round(totalKg / 2.31),
    flightsEquivalent: Math.round(totalKg / 990),
    powerHomesYears: Math.round(totalKg / 4200), // avg home ~4200 kg CO2/year
  };
}

/**
 * Get scenario by key
 */
export function getScenario(key: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.key === key);
}
