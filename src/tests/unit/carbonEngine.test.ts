import {
  calcCO2,
  calculateDailyFootprint,
  sustainabilityScore,
  carbonScore,
  treesEquivalent,
  carsEquivalent,
  flightsEquivalent,
  GLOBAL_AVG_KG_YEAR,
  IPCC_TARGET,
  NET_ZERO,
} from '../../lib/carbonEngine';

describe('calcCO2', () => {
  it('returns correct CO2 for car petrol travel', () => {
    expect(calcCO2('transportation', 'car_petrol', 100)).toBeCloseTo(19.2, 1);
  });

  it('returns 0 for bicycle (zero-emission)', () => {
    expect(calcCO2('transportation', 'bicycle', 50)).toBe(0);
  });

  it('returns 0 for unknown category', () => {
    expect(calcCO2('unknown', 'car', 10)).toBe(0);
  });

  it('returns 0 for unknown subcategory', () => {
    expect(calcCO2('transportation', 'hovercraft', 10)).toBe(0);
  });

  it('calculates food beef correctly', () => {
    expect(calcCO2('food', 'beef', 1)).toBeCloseTo(27.0, 1);
  });

  it('calculates energy electricity correctly', () => {
    expect(calcCO2('energy', 'electricity_grid', 100)).toBeCloseTo(23.3, 1);
  });

  it('calculates waste landfill correctly', () => {
    expect(calcCO2('waste', 'landfill', 10)).toBeCloseTo(5.8, 1);
  });

  it('calculates shopping laptop correctly', () => {
    expect(calcCO2('shopping', 'electronics_laptop', 1)).toBeCloseTo(422.0, 1);
  });
});

describe('calculateDailyFootprint', () => {
  it('sums multiple activities correctly', () => {
    const inputs = [
      { category: 'transportation', subcategory: 'car_petrol', value: 20 },
      { category: 'food', subcategory: 'beef', value: 0.5 },
    ];
    const result = calculateDailyFootprint(inputs);
    expect(result.total).toBeGreaterThan(0);
    expect(result.byCategory.transportation).toBeGreaterThan(0);
    expect(result.byCategory.food).toBeGreaterThan(0);
  });

  it('returns zero for empty inputs', () => {
    const result = calculateDailyFootprint([]);
    expect(result.total).toBe(0);
  });

  it('uses today as default date', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = calculateDailyFootprint([]);
    expect(result.date).toBe(today);
  });

  it('uses provided date', () => {
    const inputs = [{ category: 'transportation', subcategory: 'bus', value: 10, date: '2024-01-15' }];
    const result = calculateDailyFootprint(inputs);
    expect(result.date).toBe('2024-01-15');
  });
});

describe('sustainabilityScore', () => {
  it('returns 100 for net zero lifestyle', () => {
    expect(sustainabilityScore(NET_ZERO)).toBe(100);
  });

  it('returns 100 for below net zero', () => {
    expect(sustainabilityScore(0)).toBe(100);
  });

  it('returns 0 for extremely high emissions', () => {
    expect(sustainabilityScore(GLOBAL_AVG_KG_YEAR * 2)).toBe(0);
  });

  it('returns value between 0-100 for average user', () => {
    const score = sustainabilityScore(GLOBAL_AVG_KG_YEAR);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('higher emissions = lower score', () => {
    const low = sustainabilityScore(1000);
    const high = sustainabilityScore(5000);
    expect(low).toBeGreaterThan(high);
  });
});

describe('carbonScore', () => {
  it('gives A+ grade for net-zero footprint', () => {
    const score = carbonScore(NET_ZERO / 12);
    expect(score.grade).toBe('A+');
    expect(score.label).toBe('Net Zero Hero');
  });

  it('gives A grade for IPCC target', () => {
    const score = carbonScore(IPCC_TARGET / 12);
    expect(score.grade).toBe('A');
  });

  it('gives F grade for very high footprint', () => {
    const score = carbonScore((GLOBAL_AVG_KG_YEAR * 2) / 12);
    expect(score.grade).toBe('F');
  });

  it('returns annual kg calculation correctly', () => {
    const monthly = 200;
    const score = carbonScore(monthly);
    expect(score.annualKg).toBe(monthly * 12);
  });

  it('vsGlobal is negative when below average', () => {
    const score = carbonScore(100); // 1200/year << 4800
    expect(score.vsGlobal).toBeLessThan(0);
  });
});

describe('equivalents', () => {
  it('treesEquivalent calculates correctly', () => {
    expect(treesEquivalent(210)).toBe(10); // 210/21 = 10
  });

  it('treesEquivalent returns 0 for 0 kg', () => {
    expect(treesEquivalent(0)).toBe(0);
  });

  it('carsEquivalent works for global average', () => {
    const result = carsEquivalent(GLOBAL_AVG_KG_YEAR);
    expect(result).toBeCloseTo(1.04, 1);
  });

  it('flightsEquivalent works for large value', () => {
    const result = flightsEquivalent(4800);
    expect(result).toBeGreaterThan(0);
  });
});
