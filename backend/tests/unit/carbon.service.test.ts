import { calculateEmissions, getEmissionFactor, CARBON_FACTORS } from '../../src/utils/carbonFactors';

describe('Carbon Emission Calculations', () => {
  describe('getEmissionFactor', () => {
    it('should return correct factor for car_petrol', () => {
      const factor = getEmissionFactor('transportation', 'car_petrol');
      expect(factor).not.toBeNull();
      expect(factor?.factor).toBeGreaterThan(0);
      expect(factor?.unit).toBe('km');
    });

    it('should return null for unknown subcategory', () => {
      const factor = getEmissionFactor('transportation', 'unknown_vehicle');
      expect(factor).toBeNull();
    });

    it('should return correct factor for beef', () => {
      const factor = getEmissionFactor('food', 'beef');
      expect(factor).not.toBeNull();
      expect(factor?.factor).toBe(27.0);
      expect(factor?.unit).toBe('kg');
    });

    it('should return negative factor for recycling (savings)', () => {
      const factor = getEmissionFactor('waste', 'recycling_paper');
      expect(factor).not.toBeNull();
      expect(factor?.factor).toBeLessThan(0);
    });
  });

  describe('calculateEmissions', () => {
    it('should calculate car petrol emissions correctly', () => {
      const co2e = calculateEmissions('transportation', 'car_petrol', 100);
      expect(co2e).toBeCloseTo(21.233, 2);
    });

    it('should calculate beef emissions correctly', () => {
      const co2e = calculateEmissions('food', 'beef', 1);
      expect(co2e).toBeCloseTo(27.0, 1);
    });

    it('should return 0 for bicycle (zero emission)', () => {
      const co2e = calculateEmissions('transportation', 'bicycle', 100);
      expect(co2e).toBe(0);
    });

    it('should return 0 for unknown subcategory', () => {
      const co2e = calculateEmissions('transportation', 'nonexistent', 100);
      expect(co2e).toBe(0);
    });

    it('should scale linearly with value', () => {
      const co2e1 = calculateEmissions('transportation', 'car_petrol', 10);
      const co2e2 = calculateEmissions('transportation', 'car_petrol', 20);
      expect(co2e2).toBeCloseTo(co2e1 * 2, 2);
    });

    it('should handle zero value', () => {
      const co2e = calculateEmissions('food', 'beef', 0);
      expect(co2e).toBe(0);
    });

    it('should calculate electricity emissions', () => {
      const co2e = calculateEmissions('energy', 'electricity_grid', 100);
      expect(co2e).toBeGreaterThan(0);
      expect(co2e).toBeCloseTo(23.314, 2);
    });

    it('should calculate renewable electricity as lower emissions', () => {
      const gridCo2e = calculateEmissions('energy', 'electricity_grid', 100);
      const renewableCo2e = calculateEmissions('energy', 'electricity_renewable', 100);
      expect(renewableCo2e).toBeLessThan(gridCo2e);
    });

    it('should return negative for paper recycling', () => {
      const co2e = calculateEmissions('waste', 'recycling_paper', 1);
      expect(co2e).toBeLessThan(0);
    });
  });

  describe('CARBON_FACTORS completeness', () => {
    it('should have all required categories', () => {
      const categories = Object.keys(CARBON_FACTORS);
      expect(categories).toContain('transportation');
      expect(categories).toContain('energy');
      expect(categories).toContain('food');
      expect(categories).toContain('shopping');
      expect(categories).toContain('waste');
    });

    it('each factor should have label, factor, and unit', () => {
      Object.values(CARBON_FACTORS).forEach((category) => {
        Object.values(category).forEach((item) => {
          expect(item).toHaveProperty('label');
          expect(item).toHaveProperty('factor');
          expect(item).toHaveProperty('unit');
          expect(typeof item.label).toBe('string');
          expect(typeof item.factor).toBe('number');
          expect(typeof item.unit).toBe('string');
        });
      });
    });

    it('transportation should include common vehicle types', () => {
      const transport = CARBON_FACTORS.transportation;
      expect(transport).toHaveProperty('car_petrol');
      expect(transport).toHaveProperty('car_electric');
      expect(transport).toHaveProperty('bus');
      expect(transport).toHaveProperty('bicycle');
    });
  });
});
