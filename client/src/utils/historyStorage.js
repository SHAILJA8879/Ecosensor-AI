const STORAGE_KEY = 'ecosense_history';

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
 * Saves or updates a carbon footprint entry in localStorage.
 * Overwrites existing entry if one already exists for the same date.
 * 
 * @param {HistoryEntry} entry - The entry data to save
 * @returns {boolean} True if successfully saved, false otherwise
 * 
 * @example
 * saveEntry({
 *   date: '2026-06-12',
 *   carbonScore: 82,
 *   transport: 90.93,
 *   food: 45,
 *   electricity: 164,
 *   total: 299.93,
 *   predictedScore: 88
 * });
 */
export function saveEntry(entry) {
  try {
    if (!entry || !entry.date) {
      return false;
    }

    const history = getHistory();
    const existingIndex = history.findIndex((item) => item.date === entry.date);

    if (existingIndex > -1) {
      // Overwrite / merge existing entry for the same date
      history[existingIndex] = { ...history[existingIndex], ...entry };
    } else {
      history.push(entry);
    }

    // Keep history sorted by date, newest first
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error writing to history storage:', error);
    return false;
  }
}

/**
 * Fetches the full carbon footprint history from localStorage.
 * Entries are returned sorted by date, newest first.
 * 
 * @returns {HistoryEntry[]} Array of history entries, sorted by date (newest first)
 */
export function getHistory() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      // Clear corrupt non-array data
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Return sorted newest first
    return parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error reading history from storage:', error);
    // Clear corrupted localStorage to heal the system state
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore inner localStorage failures
    }
    return [];
  }
}

/**
 * Retrieves up to the last 7 entries for weekly progress tracking.
 * Entries are sorted chronologically (oldest first) for left-to-right timeline charts.
 * 
 * @returns {HistoryEntry[]} Last 7 entries sorted oldest first
 */
export function getWeeklyData() {
  const history = getHistory();
  // Slice the 7 most recent entries, then reverse to sort chronologically (oldest first)
  return history.slice(0, 7).reverse();
}

/**
 * Retrieves up to the last 30 entries for monthly progress tracking.
 * Entries are sorted chronologically (oldest first) for left-to-right timeline charts.
 * 
 * @returns {HistoryEntry[]} Last 30 entries sorted oldest first
 */
export function getMonthlyData() {
  const history = getHistory();
  // Slice the 30 most recent entries, then reverse to sort chronologically (oldest first)
  return history.slice(0, 30).reverse();
}

/**
 * Clears all carbon footprint history entries from localStorage.
 * Useful for debugging, system reset, and testing environments.
 * 
 * @returns {boolean} True if successfully cleared, false otherwise
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history storage:', error);
    return false;
  }
}
