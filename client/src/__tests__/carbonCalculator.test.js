import { calculateTotalEmissions, calculateCarbonScore } from '../utils/carbonCalculator';

describe('Carbon Footprint Calculator Utility', () => {
  
  // 1. Food Type: Vegetarian
  test('should correctly calculate emissions for vegetarian food habit', () => {
    const transport = 100; // km/week
    const foodHabit = 'veg';
    const electricity = 200; // kWh/month

    const result = calculateTotalEmissions(transport, foodHabit, electricity);

    // Transport: 100 * 4.33 * 0.21 = 90.93
    // Food: 1.5 * 30 = 45.00
    // Electricity: 200 * 0.82 = 164.00
    // Total: 90.93 + 45 + 164 = 299.93
    expect(result.transport).toBeCloseTo(90.93, 2);
    expect(result.food).toBe(45);
    expect(result.electricity).toBe(164);
    expect(result.total).toBeCloseTo(299.93, 2);
  });

  // 2. Food Type: Mixed
  test('should correctly calculate emissions for mixed food habit', () => {
    const transport = 0;
    const foodHabit = 'mixed';
    const electricity = 0;

    const result = calculateTotalEmissions(transport, foodHabit, electricity);

    // Food: 3.0 * 30 = 90.00
    expect(result.transport).toBe(0);
    expect(result.food).toBe(90);
    expect(result.electricity).toBe(0);
    expect(result.total).toBe(90);
  });

  // 3. Food Type: Non-Vegetarian
  test('should correctly calculate emissions for non-vegetarian food habit', () => {
    const transport = 150;
    const foodHabit = 'non-veg';
    const electricity = 300;

    const result = calculateTotalEmissions(transport, foodHabit, electricity);

    // Transport: 150 * 4.33 * 0.21 = 136.395 (rounds to 136.40)
    // Food: 5.0 * 30 = 150.00
    // Electricity: 300 * 0.82 = 246.00
    // Total: 136.40 + 150 + 246 = 532.40
    expect(result.transport).toBeCloseTo(136.40, 2);
    expect(result.food).toBe(150);
    expect(result.electricity).toBe(246);
    expect(result.total).toBeCloseTo(532.40, 2);
  });

  // 4. Edge Cases: Zero values
  test('should handle edge cases with 0 values for inputs correctly', () => {
    const result = calculateTotalEmissions(0, 'veg', 0);
    expect(result.transport).toBe(0);
    expect(result.food).toBe(45); // Food still calculated (daily factor * 30)
    expect(result.electricity).toBe(0);
    expect(result.total).toBe(45);
  });

  // 5. Validation Check: Negative Values
  test('should throw an error for negative input values', () => {
    expect(() => calculateTotalEmissions(-50, 'veg', 100)).toThrow(
      'Transport distance must be a non-negative number.'
    );
    expect(() => calculateTotalEmissions(100, 'veg', -10)).toThrow(
      'Electricity usage must be a non-negative number.'
    );
  });

  // 6. Validation Check: Invalid Food Habit
  test('should throw an error for invalid food habit category', () => {
    expect(() => calculateTotalEmissions(100, 'vegan', 100)).toThrow(
      "Food habit must be 'veg', 'mixed', or 'non-veg'."
    );
    expect(() => calculateTotalEmissions(100, null, 100)).toThrow();
  });

  // 7. Carbon Score: Boundary 100
  test('should correctly map 0 emissions to a carbon health score of 100', () => {
    const score = calculateCarbonScore(0);
    expect(score).toBe(100);
  });

  // 8. Carbon Score: Boundary 50
  test('should correctly map 500 emissions to a carbon health score of 50', () => {
    const score = calculateCarbonScore(500);
    expect(score).toBe(50);
  });

  // 9. Carbon Score: Boundary 0 (and high values)
  test('should correctly map 1000 or higher emissions to a score of 0', () => {
    expect(calculateCarbonScore(1000)).toBe(0);
    expect(calculateCarbonScore(2500)).toBe(0);
  });

  // 10. Carbon Score Validation Check
  test('should throw an error if emissions parameters are invalid in score calculator', () => {
    expect(() => calculateCarbonScore(-1)).toThrow('Total emissions must be a non-negative number.');
    expect(() => calculateCarbonScore('500')).toThrow();
    expect(() => calculateCarbonScore(NaN)).toThrow();
  });
});
