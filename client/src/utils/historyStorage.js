import { STORAGE_KEYS } from './constants';

/**
 * @typedef {Object} HistoryEntry
 * @property {string} date - The date of the entry in YYYY-MM-DD format
 * @property {number} carbonScore - The calculated Carbon Health Score (0-100)
 * @property {number} transport - Transport emissions (monthly, kg CO2e)
 * @property {number} food - Food emissions (monthly, kg CO2e)
 * @property {number} electricity - Electricity emissions (monthly, kg CO2e)
 * @property {number} total - Total monthly emissions (kg CO2e)
 * @property {number|null} [predictedScore] - Score target prediction from AI Coach
 */

/**
 * @description Saves or updates a carbon footprint entry in localStorage. Overwrites existing entry if one already exists for the same date.
 * @param {HistoryEntry} entry - The entry data to save
 * @returns {boolean} True if successfully saved, false otherwise
 * @throws {Error} If localStorage fails to write
 * @example
 * saveEntry({ date: '2026-06-12', carbonScore: 82, transport: 90.93, food: 45, electricity: 164, total: 299.93 }) // => true
 */
export function saveEntry(entry) {
  try {
    if (!entry || !entry.date) {
      return false;
    }

    const history = getHistory();
    const existingIndex = history.findIndex((item) => item.date === entry.date);

    if (existingIndex > -1) {
      history[existingIndex] = { ...history[existingIndex], ...entry };
    } else {
      history.push(entry);
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error writing to history storage:', error);
    return false;
  }
}

/**
 * @description Fetches the full carbon footprint history from localStorage. Entries are returned sorted by date, newest first.
 * @returns {HistoryEntry[]} Array of history entries, sorted by date (newest first)
 * @throws {Error} If localStorage fails to read
 * @example
 * getHistory() // => [{ date: '2026-06-12', carbonScore: 82, ... }]
 */
export function getHistory() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      } catch (removeError) {
        console.error('Error removing corrupted history:', removeError);
      }
      return [];
    }

    return parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error reading history from storage:', error);
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {
      // Ignore inner localStorage failures
    }
    return [];
  }
}

/**
 * @description Retrieves up to the last 7 entries for weekly progress tracking. Entries are sorted chronologically (oldest first).
 * @returns {HistoryEntry[]} Last 7 entries sorted oldest first
 * @example
 * getWeeklyData() // => [{ date: '2026-06-06', carbonScore: 75, ... }]
 */
export function getWeeklyData() {
  const history = getHistory();
  return history.slice(0, 7).reverse();
}

/**
 * @description Retrieves up to the last 30 entries for monthly progress tracking. Entries are sorted chronologically (oldest first).
 * @returns {HistoryEntry[]} Last 30 entries sorted oldest first
 * @example
 * getMonthlyData() // => [{ date: '2026-05-15', carbonScore: 80, ... }]
 */
export function getMonthlyData() {
  const history = getHistory();
  return history.slice(0, 30).reverse();
}

/**
 * @description Clears all carbon footprint history entries from localStorage.
 * @returns {boolean} True if successfully cleared, false otherwise
 * @throws {Error} If localStorage fails to clear
 * @example
 * clearHistory() // => true
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (error) {
    console.error('Error clearing history storage:', error);
    return false;
  }
}
