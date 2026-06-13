/**
 * Emission factors for calculations (kg CO2 equivalent):
 * - Transport: ~0.21 kg CO2/km (avg vehicle)
 * - Electricity: ~0.82 kg CO2/kWh (grid average)
 * - Food Habits: veg ~1.5kg, mixed ~3kg, non-veg ~5kg CO2/day
 */
export const EMISSION_FACTORS = {
  TRANSPORT: 0.21, // kg CO2 per km
  ELECTRICITY: 0.82, // kg CO2 per kWh
  FOOD: {
    'veg': 1.5, // kg CO2 per day
    'mixed': 3.0, // kg CO2 per day
    'non-veg': 5.0 // kg CO2 per day
  }
};

/**
 * Helper to round a floating point number to two decimal places
 * avoiding standard binary-float quirks using Number.EPSILON.
 * 
 * @param {number} num - The number to round
 * @returns {number} The rounded number
 */
function roundToTwoDecimals(num) {
  return Math.round((num + 1e-9) * 100) / 100;
}

/**
 * Normalizes and calculates total monthly carbon emissions (kg CO2/month)
 * based on weekly transport, daily food habits, and monthly electricity consumption.
 * 
 * - Transport (weekly) is normalized to monthly: km/week * 4.33 weeks/month * 0.21 kg CO2/km
 * - Food (daily) is normalized to monthly: kg CO2/day * 30 days/month
 * - Electricity (monthly) is calculated: kWh/month * 0.82 kg CO2/kWh
 * 
 * @param {number} transport - The transport distance in km per week (must be >= 0)
 * @param {string} foodHabit - The food habit type ('veg', 'mixed', 'non-veg')
 * @param {number} electricity - The electricity usage in kWh per month (must be >= 0)
 * @returns {{transport: number, food: number, electricity: number, total: number}} The monthly emissions by category and in total (kg CO2)
 * @throws {Error} Throws an error if any input parameter is invalid or negative
 * 
 * @example
 * const result = calculateTotalEmissions(100, 'veg', 200);
 * // Returns: { transport: 90.93, food: 45, electricity: 164, total: 299.93 }
 */
export function calculateTotalEmissions(transport, foodHabit, electricity) {
  // Validate transport input
  if (typeof transport !== 'number' || isNaN(transport) || transport < 0) {
    throw new Error('Transport distance must be a non-negative number.');
  }

  // Validate electricity input
  if (typeof electricity !== 'number' || isNaN(electricity) || electricity < 0) {
    throw new Error('Electricity usage must be a non-negative number.');
  }

  // Validate food habit input
  const foodFactor = EMISSION_FACTORS.FOOD[foodHabit];
  if (foodFactor === undefined) {
    throw new Error("Food habit must be 'veg', 'mixed', or 'non-veg'.");
  }

  // Calculate normalized monthly emissions (rounded to 2 decimal places using Math.round to avoid JS float precision quirks)
  const transportEmissions = roundToTwoDecimals(transport * 4.33 * EMISSION_FACTORS.TRANSPORT);
  const foodEmissions = roundToTwoDecimals(foodFactor * 30);
  const electricityEmissions = roundToTwoDecimals(electricity * EMISSION_FACTORS.ELECTRICITY);
  
  const total = roundToTwoDecimals(transportEmissions + foodEmissions + electricityEmissions);

  return {
    transport: transportEmissions,
    food: foodEmissions,
    electricity: electricityEmissions,
    total
  };
}

/**
 * Calculates a Carbon Health Score between 0 and 100 based on monthly emissions (kg CO2/month).
 * Lower emissions result in a higher score.
 * 
 * - An emission total of 0 kg CO2/month yields a score of 100.
 * - An emission total of 500 kg CO2/month yields a score of 50.
 * - An emission total of 1000 kg CO2/month or more yields a score of 0.
 * 
 * @param {number} totalEmissions - The total monthly emissions in kg CO2 (must be >= 0)
 * @returns {number} The carbon score from 0 (poor) to 100 (excellent)
 * @throws {Error} Throws an error if totalEmissions is not a non-negative number
 * 
 * @example
 * const score = calculateCarbonScore(300);
 * // Returns: 70
 */
export function calculateCarbonScore(totalEmissions) {
  if (typeof totalEmissions !== 'number' || isNaN(totalEmissions) || totalEmissions < 0) {
    throw new Error('Total emissions must be a non-negative number.');
  }

  // Scale: 0 emissions = 100 score, 1000+ emissions = 0 score
  const score = 100 - (totalEmissions / 10);
  
  // Bound score between 0 and 100, and round to nearest integer
  return Math.max(0, Math.min(100, Math.round(score)));
}
