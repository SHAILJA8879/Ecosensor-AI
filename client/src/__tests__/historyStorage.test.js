/* global Storage */
import { saveEntry, getHistory, getWeeklyData, getMonthlyData, clearHistory } from '../utils/historyStorage';

describe('History Storage Utility', () => {
  const STORAGE_KEY = 'ecosense_history';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // 1. Empty State
  test('should return an empty array if localStorage is empty', () => {
    const history = getHistory();
    expect(history).toEqual([]);
  });

  // 2. Save and Fetch Basic Entries
  test('should successfully save a new entry and retrieve it', () => {
    const entry = {
      date: '2026-06-12',
      carbonScore: 82,
      transport: 90.93,
      food: 45,
      electricity: 164,
      total: 299.93,
      predictedScore: 88
    };

    const saved = saveEntry(entry);
    expect(saved).toBe(true);

    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(entry);
  });

  // 3. Date Sorting (Newest First)
  test('should keep history sorted by date with newest entries first', () => {
    const entryOld = { date: '2026-06-10', carbonScore: 70, transport: 10, food: 30, electricity: 100, total: 140 };
    const entryNew = { date: '2026-06-12', carbonScore: 80, transport: 20, food: 30, electricity: 100, total: 150 };
    const entryMid = { date: '2026-06-11', carbonScore: 75, transport: 15, food: 30, electricity: 100, total: 145 };

    saveEntry(entryOld);
    saveEntry(entryNew);
    saveEntry(entryMid);

    const history = getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].date).toBe('2026-06-12');
    expect(history[1].date).toBe('2026-06-11');
    expect(history[2].date).toBe('2026-06-10');
  });

  // 4. Overwrite/Merge Duplicate Date Entry
  test('should overwrite and merge an existing entry if saved with the same date', () => {
    const entry1 = { date: '2026-06-12', carbonScore: 82, transport: 90.93, food: 45, electricity: 164, total: 299.93 };
    const entry2 = { date: '2026-06-12', carbonScore: 85, total: 290.00, predictedScore: 90 };

    saveEntry(entry1);
    saveEntry(entry2);

    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].carbonScore).toBe(85);
    expect(history[0].transport).toBe(90.93); // merged/kept from previous
    expect(history[0].predictedScore).toBe(90);
  });

  // 5. Weekly and Monthly Slicing and Sorting (Oldest First for Charts)
  test('should return correct weekly and monthly data sorted oldest first', () => {
    // Save 35 entries across consecutive valid dates starting from 2026-01-01
    const baseDate = new Date('2026-01-01');
    for (let i = 0; i < 35; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      saveEntry({
        date: dateStr,
        carbonScore: 50 + i,
        transport: 10,
        food: 30,
        electricity: 100,
        total: 140
      });
    }

    const weekly = getWeeklyData();
    expect(weekly).toHaveLength(7);
    // Weekly gets the 7 most recent (dates 2026-01-29 to 2026-02-04) reversed to oldest first
    expect(weekly[0].date).toBe('2026-01-29');
    expect(weekly[6].date).toBe('2026-02-04');

    const monthly = getMonthlyData();
    expect(monthly).toHaveLength(30);
    // Monthly gets the 30 most recent (dates 2026-01-06 to 2026-02-04) reversed to oldest first
    expect(monthly[0].date).toBe('2026-01-06');
    expect(monthly[29].date).toBe('2026-02-04');
  });

  // 6. Corrupted JSON Handling
  test('should handle corrupted JSON string parsing in localStorage gracefully by returning empty array and clearing storage', () => {
    localStorage.setItem(STORAGE_KEY, 'corrupted{json:invalid}');
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const history = getHistory();
    
    expect(history).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    consoleSpy.mockRestore();
  });

  // 7. Non-array JSON Handling
  test('should handle non-array JSON in localStorage gracefully by clearing storage and returning empty array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ notAnArray: true }));
    
    const history = getHistory();
    expect(history).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // 8. Clearing History
  test('should successfully clear history from storage', () => {
    const entry = { date: '2026-06-12', carbonScore: 82, transport: 10, food: 30, electricity: 100, total: 140 };
    saveEntry(entry);
    
    const cleared = clearHistory();
    expect(cleared).toBe(true);
    expect(getHistory()).toEqual([]);
  });

  // 9. LocalStorage Exceptions Handling (QuotaExceededError or security block)
  test('should return false or empty array and handle errors when localStorage throws exceptions', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Disk Full / Private Mode Block');
    });
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Security Error');
    });
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Security Error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const entry = { date: '2026-06-12', carbonScore: 82, transport: 10, food: 30, electricity: 100, total: 140 };
    
    expect(saveEntry(entry)).toBe(false);
    expect(getHistory()).toEqual([]);
    expect(clearHistory()).toBe(false);

    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
