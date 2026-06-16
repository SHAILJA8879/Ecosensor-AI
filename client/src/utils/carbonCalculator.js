import { EMISSION_FACTORS } from './constants';

const WEEKS_PER_MONTH = 4.33;

const DAYS_PER_MONTH = 30;

const SCORE_DIVISOR = 10;

const MAX_SCORE = 100;

const MIN_SCORE = 0;

const ROUNDING_FACTOR = 100;

const ROUNDING_OFFSET = 1e-9;

/**
 * @description Helper to round a floating point number to two decimal places avoiding standard binary-float quirks using Number.EPSILON.
 * @param {number} num - The number to round
 * @returns {number} The rounded number
 * @throws {Error} If input is invalid or negative
 * @example
 * roundToTwoDecimals(123.456) // => 123.46
 */
function roundToTwoDecimals(num) {
  if (typeof num !== 'number' || num < MIN_SCORE) {
    throw new Error('Invalid input: must be a non-negative number');
  }

  return Math.round((num + ROUNDING_OFFSET) * ROUNDING_FACTOR) / ROUNDING_FACTOR;
}

/**
 * @description Calculates monthly transport emissions
 * @param {number} kmPerWeek - Weekly distance in km
 * @returns {number} Monthly CO2 emissions in kg
 * @throws {Error} If input is invalid or negative
 * @example
 * calculateTransport(100) // => 90.93
 */
export function calculateTransport(kmPerWeek) {
  if (typeof kmPerWeek !== 'number' || kmPerWeek < MIN_SCORE || isNaN(kmPerWeek)) {
    throw new Error(
      'Transport distance must be a non-negative number. Invalid input: must be a non-negative number'
    );
  }

  return roundToTwoDecimals(kmPerWeek * WEEKS_PER_MONTH * EMISSION_FACTORS.TRANSPORT_KG_PER_KM);
}

/**
 * @description Calculates monthly food emissions
 * @param {string} foodHabit - The food habit category ('veg', 'mixed', 'non-veg')
 * @returns {number} Monthly CO2 emissions in kg
 * @throws {Error} If input is invalid or negative
 * @example
 * calculateFood('veg') // => 45
 */
export function calculateFood(foodHabit) {
  if (typeof foodHabit !== 'string') {
    throw new Error('Food habit: Invalid input: must be a string');
  }

  const foodFactor = EMISSION_FACTORS.FOOD[foodHabit];
  if (foodFactor === undefined) {
    throw new Error("Food habit must be 'veg', 'mixed', or 'non-veg'.");
  }

  return roundToTwoDecimals(foodFactor * DAYS_PER_MONTH);
}

/**
 * @description Calculates monthly electricity emissions
 * @param {number} kwhPerMonth - Monthly electricity usage in kWh
 * @returns {number} Monthly CO2 emissions in kg
 * @throws {Error} If input is invalid or negative
 * @example
 * calculateElectricity(200) // => 164
 */
export function calculateElectricity(kwhPerMonth) {
  if (typeof kwhPerMonth !== 'number' || kwhPerMonth < MIN_SCORE || isNaN(kwhPerMonth)) {
    throw new Error(
      'Electricity usage must be a non-negative number. Invalid input: must be a non-negative number'
    );
  }

  return roundToTwoDecimals(kwhPerMonth * EMISSION_FACTORS.ELECTRICITY_KG_PER_KWH);
}

/**
 * @description Calculates total monthly carbon emissions across transport, food, and electricity
 * @param {number} transport - Weekly distance in km
 * @param {string} foodHabit - The food habit category ('veg', 'mixed', 'non-veg')
 * @param {number} electricity - Monthly electricity usage in kWh
 * @returns {Object} Monthly CO2 emissions breakdown and total in kg
 * @throws {Error} If inputs are invalid or negative
 * @example
 * calculateTotalEmissions(100, 'veg', 200) // => { transport: 90.93, food: 45, electricity: 164, total: 299.93 }
 */
export function calculateTotalEmissions(transport, foodHabit, electricity) {
  const transportEmissions = calculateTransport(transport);
  const foodEmissions = calculateFood(foodHabit);
  const electricityEmissions = calculateElectricity(electricity);
  const total = roundToTwoDecimals(transportEmissions + foodEmissions + electricityEmissions);

  return {
    transport: transportEmissions,
    food: foodEmissions,
    electricity: electricityEmissions,
    total
  };
}

/**
 * @description Calculates a Carbon Health Score between 0 and 100 based on monthly emissions (kg CO2/month). Lower emissions result in a higher score.
 * @param {number} totalEmissions - The total monthly emissions in kg CO2 (must be >= 0)
 * @returns {number} The carbon score from 0 (poor) to 100 (excellent)
 * @throws {Error} If input is invalid or negative
 * @example
 * calculateCarbonScore(300) // => 70
 */
export function calculateCarbonScore(totalEmissions) {
  if (typeof totalEmissions !== 'number' || totalEmissions < MIN_SCORE || isNaN(totalEmissions)) {
    throw new Error(
      'Total emissions must be a non-negative number. Invalid input: must be a non-negative number'
    );
  }

  const score = MAX_SCORE - totalEmissions / SCORE_DIVISOR;

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(score)));
}
