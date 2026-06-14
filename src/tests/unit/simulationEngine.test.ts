import { runSimulation, forecastFromHistory, communityImpact, SCENARIOS } from '../../lib/simulationEngine';

const baseCategoryKg = {
  transportation: 120,
  energy: 80,
  food: 100,
  shopping: 30,
  waste: 20,
};

describe('SCENARIOS', () => {
  it('contains 6 scenarios', () => {
    expect(SCENARIOS).toHaveLength(6);
  });

  it('every scenario has required fields', () => {
    SCENARIOS.forEach((s) => {
      expect(s.key).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(typeof s.reductionFactor).toBe('object');
    });
  });

  it('current scenario has no reductions', () => {
    const current = SCENARIOS.find((s) => s.key === 'current');
    expect(Object.keys(current!.reductionFactor)).toHaveLength(0);
  });
});

describe('runSimulation', () => {
  it('current scenario projects no saving', () => {
    const result = runSimulation('current', baseCategoryKg, 5);
    expect(result.annualSavingKg).toBe(0);
    expect(result.savingPercent).toBe(0);
  });

  it('reduce_meat lowers food emissions', () => {
    const result = runSimulation('reduce_meat', baseCategoryKg, 1);
    expect(result.annualSavingKg).toBeGreaterThan(0);
    expect(result.projectedAnnualKg).toBeLessThan(result.currentAnnualKg);
  });

  it('full_sustainable has highest saving', () => {
    const full = runSimulation('full_sustainable', baseCategoryKg, 5);
    const transport = runSimulation('public_transport', baseCategoryKg, 5);
    expect(full.annualSavingKg).toBeGreaterThan(transport.annualSavingKg);
  });

  it('generates correct number of projections', () => {
    const result = runSimulation('reduce_meat', baseCategoryKg, 5);
    expect(result.projections).toHaveLength(5);
  });

  it('projections year increases monotonically', () => {
    const result = runSimulation('reduce_meat', baseCategoryKg, 3);
    const years = result.projections.map((p) => p.year);
    expect(years[1]).toBeGreaterThan(years[0]);
    expect(years[2]).toBeGreaterThan(years[1]);
  });

  it('equivalents are positive for saving scenarios', () => {
    const result = runSimulation('public_transport', baseCategoryKg, 5);
    expect(result.equivalents.trees).toBeGreaterThanOrEqual(0);
    expect(result.equivalents.cars).toBeGreaterThanOrEqual(0);
  });

  it('sustainability score is 0-100', () => {
    const result = runSimulation('full_sustainable', baseCategoryKg, 5);
    expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(result.sustainabilityScore).toBeLessThanOrEqual(100);
  });

  it('saving percent matches annual numbers', () => {
    const result = runSimulation('reduce_meat', baseCategoryKg, 1);
    const expected = ((result.annualSavingKg / result.currentAnnualKg) * 100).toFixed(1);
    expect(result.savingPercent.toFixed(1)).toBe(expected);
  });
});

describe('forecastFromHistory', () => {
  const makeRecords = (days: number, baseVal = 15) =>
    Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
      total: baseVal + (Math.random() - 0.5) * 2,
    }));

  it('returns zeros for fewer than 5 records', () => {
    const result = forecastFromHistory([]);
    expect(result.nextMonth).toBe(0);
    expect(result.confidence).toBe(0);
  });

  it('returns forecast for sufficient data', () => {
    const records = makeRecords(30, 10);
    const result = forecastFromHistory(records);
    expect(result.nextMonth).toBeGreaterThan(0);
    expect(result.threeMonth).toBeGreaterThan(result.nextMonth);
    expect(result.annual).toBeGreaterThan(result.sixMonth);
  });

  it('trend is valid enum value', () => {
    const records = makeRecords(30);
    const result = forecastFromHistory(records);
    expect(['increasing', 'decreasing', 'stable']).toContain(result.trend);
  });

  it('confidence is 0-100', () => {
    const records = makeRecords(60, 12);
    const result = forecastFromHistory(records);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('chartData has 8 entries', () => {
    const records = makeRecords(30);
    const result = forecastFromHistory(records);
    expect(result.chartData).toHaveLength(8);
  });

  it('upper bound >= predicted >= lower bound', () => {
    const records = makeRecords(30, 15);
    const result = forecastFromHistory(records);
    result.chartData.forEach((d) => {
      expect(d.upper).toBeGreaterThanOrEqual(d.value);
      expect(d.value).toBeGreaterThanOrEqual(d.lower);
    });
  });
});

describe('communityImpact', () => {
  it('scales linearly with user count', () => {
    const single = communityImpact(100, 1);
    const thousand = communityImpact(100, 1000);
    expect(thousand.totalCo2Saved).toBe(single.totalCo2Saved * 1000);
  });

  it('returns zero for zero saving', () => {
    const result = communityImpact(0, 10000);
    expect(result.totalCo2Saved).toBe(0);
    expect(result.treesEquiv).toBe(0);
  });

  it('returns correct tree count', () => {
    const result = communityImpact(210, 1); // 210 kg -> 10 trees
    expect(result.treesEquiv).toBe(10);
  });
});
