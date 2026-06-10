import prisma from '../config/database';
import { logger } from '../config/logger';

export interface SimulationScenario {
  name: string;
  description: string;
  changes: Array<{
    category: string;
    subcategory: string;
    changePercent: number;
    description: string;
  }>;
}

export interface SimulationResult {
  scenario: string;
  currentAnnualCo2e: number;
  projectedAnnualCo2e: number;
  annualSavings: number;
  projections: Array<{
    year: number;
    co2e: number;
    cumulativeSavings: number;
  }>;
  equivalents: {
    treesPlanted: number;
    kmsDriven: number;
    flightsAvoided: number;
    moneySaved: number;
  };
  aiNarrative?: string;
}

export const SCENARIOS: Record<string, SimulationScenario> = {
  public_transport: {
    name: 'Switch to Public Transport',
    description: 'Replace 80% of car trips with bus/train/cycling',
    changes: [
      { category: 'transportation', subcategory: 'car', changePercent: -80, description: '80% reduction in car use' },
      { category: 'transportation', subcategory: 'public', changePercent: 200, description: 'Increased public transit use' },
    ],
  },
  reduce_meat: {
    name: 'Plant-Based Diet',
    description: 'Eliminate beef and lamb, reduce other meat by 50%',
    changes: [
      { category: 'food', subcategory: 'beef', changePercent: -100, description: 'Eliminate beef' },
      { category: 'food', subcategory: 'lamb', changePercent: -100, description: 'Eliminate lamb' },
      { category: 'food', subcategory: 'pork', changePercent: -50, description: 'Reduce pork by half' },
      { category: 'food', subcategory: 'chicken', changePercent: -30, description: 'Reduce chicken by 30%' },
    ],
  },
  renewable_energy: {
    name: 'Switch to Renewable Energy',
    description: 'Switch to 100% renewable electricity tariff and improve home insulation',
    changes: [
      { category: 'energy', subcategory: 'electricity', changePercent: -90, description: '90% reduction in grid electricity emissions' },
      { category: 'energy', subcategory: 'heating', changePercent: -20, description: '20% reduction in heating through insulation' },
    ],
  },
  remote_work: {
    name: 'Work From Home',
    description: 'Work from home 4 days a week, reduce commute by 80%',
    changes: [
      { category: 'transportation', subcategory: 'commute', changePercent: -80, description: '80% reduction in commuting' },
      { category: 'energy', subcategory: 'home', changePercent: 15, description: '15% increase in home energy use' },
    ],
  },
  zero_waste: {
    name: 'Zero Waste Lifestyle',
    description: 'Recycle everything, compost food waste, buy second-hand',
    changes: [
      { category: 'waste', subcategory: 'landfill', changePercent: -90, description: 'Eliminate landfill waste' },
      { category: 'waste', subcategory: 'recycling', changePercent: 500, description: 'Maximise recycling' },
      { category: 'shopping', subcategory: 'new', changePercent: -60, description: '60% less new purchases' },
    ],
  },
  full_sustainable: {
    name: 'Full Sustainable Lifestyle',
    description: 'Combine all major changes: EV, plant-based, renewable energy, minimal waste',
    changes: [
      { category: 'transportation', subcategory: 'car', changePercent: -70, description: 'Switch to electric vehicle' },
      { category: 'food', subcategory: 'beef', changePercent: -80, description: 'Mostly plant-based diet' },
      { category: 'energy', subcategory: 'electricity', changePercent: -85, description: 'Renewable energy' },
      { category: 'waste', subcategory: 'landfill', changePercent: -70, description: 'Minimise waste' },
      { category: 'shopping', subcategory: 'new', changePercent: -50, description: 'Conscious consumption' },
    ],
  },
};

async function getUserAnnualCo2e(userId: string): Promise<{ total: number; byCategory: Record<string, number> }> {
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const records = await prisma.carbonRecord.findMany({
    where: { userId, date: { gte: yearAgo } },
  });

  if (records.length === 0) {
    // Return global average estimates if no data
    return {
      total: 4800,
      byCategory: {
        transportation: 1344,
        energy: 1200,
        food: 1296,
        shopping: 672,
        waste: 288,
      },
    };
  }

  const totals = records.reduce(
    (acc, r) => ({
      transportation: acc.transportation + r.transportation,
      energy: acc.energy + r.energy,
      food: acc.food + r.food,
      shopping: acc.shopping + r.shopping,
      waste: acc.waste + r.waste,
      total: acc.total + r.total,
    }),
    { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, total: 0 }
  );

  // Extrapolate to full year if we don't have 365 days
  const factor = 365 / records.length;

  return {
    total: Number((totals.total * factor).toFixed(2)),
    byCategory: {
      transportation: Number((totals.transportation * factor).toFixed(2)),
      energy: Number((totals.energy * factor).toFixed(2)),
      food: Number((totals.food * factor).toFixed(2)),
      shopping: Number((totals.shopping * factor).toFixed(2)),
      waste: Number((totals.waste * factor).toFixed(2)),
    },
  };
}

function applyScenarioChanges(
  baseline: { total: number; byCategory: Record<string, number> },
  scenario: SimulationScenario
): number {
  let projected = baseline.total;

  // Apply category-level changes
  for (const change of scenario.changes) {
    const catTotal = baseline.byCategory[change.category] ?? 0;
    const categoryShare = baseline.total > 0 ? catTotal / baseline.total : 0;
    const changeAmount = catTotal * (change.changePercent / 100);
    projected += changeAmount;
  }

  return Math.max(0, projected);
}

function calculateEquivalents(annualSavings: number, years: number) {
  const totalSavings = annualSavings * years;
  return {
    treesPlanted: Math.floor(totalSavings / 21), // 21 kg CO2/tree/year
    kmsDriven: Math.floor(totalSavings / 0.21), // 0.21 kg CO2/km petrol car
    flightsAvoided: Number((totalSavings / (0.255 * 1000)).toFixed(1)), // 1000km domestic flight
    moneySaved: Math.floor(totalSavings * 0.05), // carbon price ~$50/tonne -> $0.05/kg
  };
}

export async function runSimulation(
  userId: string,
  scenarioKey: string,
  years: number = 1
): Promise<SimulationResult> {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioKey}`);
  }

  const baseline = await getUserAnnualCo2e(userId);
  const projectedAnnual = applyScenarioChanges(baseline, scenario);
  const annualSavings = baseline.total - projectedAnnual;

  // Build year-by-year projections
  const projections = [];
  for (let y = 1; y <= Math.min(years, 10); y++) {
    // Apply gradual improvement (behavior change compounds)
    const adoptionFactor = Math.min(1, 0.7 + y * 0.05);
    const yearCo2e = baseline.total - (annualSavings * adoptionFactor);
    projections.push({
      year: new Date().getFullYear() + y,
      co2e: Number(Math.max(0, yearCo2e).toFixed(2)),
      cumulativeSavings: Number((annualSavings * adoptionFactor * y).toFixed(2)),
    });
  }

  const totalYearSavings = projections.reduce((sum, p) => sum + (annualSavings - (p.co2e - projectedAnnual)), 0);
  const equivalents = calculateEquivalents(annualSavings, years);

  // Save simulation to DB
  await prisma.simulation.create({
    data: {
      userId,
      scenario: scenarioKey,
      currentCo2e: baseline.total,
      projectedCo2e: projectedAnnual,
      savings: annualSavings,
      years,
      details: { baseline, projections, equivalents } as object,
    },
  });

  return {
    scenario: scenario.name,
    currentAnnualCo2e: Number(baseline.total.toFixed(2)),
    projectedAnnualCo2e: Number(projectedAnnual.toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
    projections,
    equivalents,
  };
}

export async function getSimulationHistory(userId: string) {
  return prisma.simulation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function getSimulationById(userId: string, simulationId: string) {
  const sim = await prisma.simulation.findFirst({
    where: { id: simulationId, userId },
  });

  if (!sim) throw new Error('Simulation not found');
  return sim;
}

export async function compareScenarios(userId: string) {
  const baseline = await getUserAnnualCo2e(userId);

  return Object.entries(SCENARIOS).map(([key, scenario]) => {
    const projected = applyScenarioChanges(baseline, scenario);
    const savings = baseline.total - projected;
    const savingsPercent = baseline.total > 0 ? (savings / baseline.total) * 100 : 0;

    return {
      key,
      name: scenario.name,
      description: scenario.description,
      currentCo2e: Number(baseline.total.toFixed(2)),
      projectedCo2e: Number(projected.toFixed(2)),
      annualSavings: Number(savings.toFixed(2)),
      savingsPercent: Number(savingsPercent.toFixed(1)),
    };
  });
}
