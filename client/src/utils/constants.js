export const EMISSION_FACTORS = {
  TRANSPORT_KG_PER_KM: 0.21,
  ELECTRICITY_KG_PER_KWH: 0.82,
  FOOD: {
    veg: 1.5,
    mixed: 3.0,
    'non-veg': 5.0,
  },
};

export const SCORE_THRESHOLDS = {
  LOW: 40,
  MEDIUM: 70,
  HIGH: 100,
};

export const API_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

export const STORAGE_KEYS = {
  HISTORY: 'ecosense_history',
  CHALLENGE: 'ecosense_7day_challenge',
};
