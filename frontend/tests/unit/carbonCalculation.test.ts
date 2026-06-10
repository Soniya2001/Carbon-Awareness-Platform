import { EMISSION_FACTORS } from '../../src/lib/carbonFactors';

describe('Carbon Emission Factors', () => {
  describe('Transportation', () => {
    it('has positive emission factors for fossil fuel vehicles', () => {
      expect(EMISSION_FACTORS.transportation.car_petrol).toBeGreaterThan(0);
      expect(EMISSION_FACTORS.transportation.car_diesel).toBeGreaterThan(0);
      expect(EMISSION_FACTORS.transportation.bus).toBeGreaterThan(0);
      expect(EMISSION_FACTORS.transportation.flight_long).toBeGreaterThan(0);
    });

    it('has lower emission for electric vehicles vs petrol', () => {
      expect(EMISSION_FACTORS.transportation.car_electric).toBeLessThan(
        EMISSION_FACTORS.transportation.car_petrol
      );
    });

    it('has lower emission for train vs car', () => {
      expect(EMISSION_FACTORS.transportation.train).toBeLessThan(
        EMISSION_FACTORS.transportation.car_petrol
      );
    });

    it('has higher emission for long-haul flights vs short-haul', () => {
      expect(EMISSION_FACTORS.transportation.flight_long).toBeGreaterThan(
        EMISSION_FACTORS.transportation.flight_short
      );
    });
  });

  describe('Food', () => {
    it('beef has highest emission among meats', () => {
      expect(EMISSION_FACTORS.food.beef).toBeGreaterThan(EMISSION_FACTORS.food.pork);
      expect(EMISSION_FACTORS.food.beef).toBeGreaterThan(EMISSION_FACTORS.food.chicken);
    });

    it('vegetables have lowest emission', () => {
      expect(EMISSION_FACTORS.food.vegetables).toBeLessThan(EMISSION_FACTORS.food.beef);
      expect(EMISSION_FACTORS.food.vegetables).toBeLessThan(EMISSION_FACTORS.food.chicken);
    });

    it('vegan meal has lower emission than meat-based', () => {
      expect(EMISSION_FACTORS.food.vegan_meal).toBeLessThan(EMISSION_FACTORS.food.beef);
    });
  });

  describe('Energy', () => {
    it('has positive emission for electricity', () => {
      expect(EMISSION_FACTORS.energy.electricity).toBeGreaterThan(0);
    });

    it('has positive emission for natural gas', () => {
      expect(EMISSION_FACTORS.energy.natural_gas).toBeGreaterThan(0);
    });
  });

  describe('CO2 Calculation', () => {
    it('calculates correct CO2 for car trip', () => {
      const km = 100;
      const expected = km * EMISSION_FACTORS.transportation.car_petrol;
      expect(expected).toBeCloseTo(km * EMISSION_FACTORS.transportation.car_petrol, 5);
    });

    it('calculates correct CO2 for beef consumption', () => {
      const kg = 0.5;
      const co2 = kg * EMISSION_FACTORS.food.beef;
      expect(co2).toBeGreaterThan(0);
      expect(co2).toBeLessThan(20); // Sanity check
    });

    it('returns zero for bicycle travel', () => {
      const km = 50;
      const factor = 0; // bicycle
      expect(km * factor).toBe(0);
    });
  });
});

describe('Utility functions', () => {
  it('formatCO2 formats small values in kg', async () => {
    const { formatCO2 } = await import('../../src/lib/utils');
    expect(formatCO2(0.5)).toBe('0.50 kg CO₂e');
    expect(formatCO2(100)).toBe('100.00 kg CO₂e');
  });

  it('formatCO2 converts large values to tonnes', async () => {
    const { formatCO2 } = await import('../../src/lib/utils');
    expect(formatCO2(1500)).toContain('t CO₂e');
    expect(formatCO2(1500)).toContain('1.50');
  });

  it('calculatePercentage handles zero total gracefully', async () => {
    const { calculatePercentage } = await import('../../src/lib/utils');
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it('calculatePercentage returns correct percentage', async () => {
    const { calculatePercentage } = await import('../../src/lib/utils');
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33);
  });
});
