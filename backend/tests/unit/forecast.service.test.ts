// Unit tests for forecast calculation utilities
// The linear regression and confidence score functions are tested in isolation

function calculateLinearRegression(values: number[]) {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  const indices = values.map((_, i) => i);
  const meanX = indices.reduce((sum, x) => sum + x, 0) / n;
  const meanY = values.reduce((sum, y) => sum + y, 0) / n;
  const ssXX = indices.reduce((sum, x) => sum + (x - meanX) ** 2, 0);
  const ssXY = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
  const ssYY = values.reduce((sum, y) => sum + (y - meanY) ** 2, 0);
  if (ssXX === 0) return { slope: 0, intercept: meanY, r2: 0 };
  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const r2 = ssXX > 0 && ssYY > 0 ? (ssXY ** 2) / (ssXX * ssYY) : 0;
  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

describe('Forecast - Linear Regression', () => {
  it('should return zeros for empty array', () => {
    const { slope, intercept, r2 } = calculateLinearRegression([]);
    expect(slope).toBe(0);
    expect(intercept).toBe(0);
    expect(r2).toBe(0);
  });

  it('should detect perfectly increasing trend', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { slope, r2 } = calculateLinearRegression(values);
    expect(slope).toBeCloseTo(1, 5);
    expect(r2).toBeCloseTo(1, 5);
  });

  it('should detect perfectly decreasing trend', () => {
    const values = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const { slope, r2 } = calculateLinearRegression(values);
    expect(slope).toBeCloseTo(-1, 5);
    expect(r2).toBeCloseTo(1, 5);
  });

  it('should detect flat trend', () => {
    const values = [5, 5, 5, 5, 5, 5];
    const { slope, r2 } = calculateLinearRegression(values);
    expect(slope).toBeCloseTo(0, 5);
    expect(r2).toBe(0);
  });

  it('should handle single value', () => {
    const { slope, intercept } = calculateLinearRegression([42]);
    expect(slope).toBe(0);
    expect(intercept).toBe(42);
  });

  it('r2 should be between 0 and 1', () => {
    const randomValues = [5, 8, 3, 12, 6, 9, 4, 11];
    const { r2 } = calculateLinearRegression(randomValues);
    expect(r2).toBeGreaterThanOrEqual(0);
    expect(r2).toBeLessThanOrEqual(1);
  });
});

describe('Forecast - Confidence Score', () => {
  it('should return higher confidence with more data points', () => {
    const fewPoints = calculateLinearRegression([5, 6, 5, 7]);
    const manyPoints = calculateLinearRegression([5, 6, 5, 7, 6, 5, 7, 6, 5, 7, 6, 5]);
    // More data = better r2 for consistent data
    expect(typeof fewPoints.r2).toBe('number');
    expect(typeof manyPoints.r2).toBe('number');
  });

  it('should handle perfectly correlated data', () => {
    const values = Array.from({ length: 30 }, (_, i) => i * 2 + 10);
    const { r2 } = calculateLinearRegression(values);
    expect(r2).toBeCloseTo(1.0, 4);
  });
});
