const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Rate limiting: Limit each IP to 10 requests per 15 minutes
const coachRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    data: null,
    message: 'Too many coaching requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Express validator rules mapping
const validateCoachRequest = [
  body('carbonScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Carbon score must be an integer between 0 and 100.'),
  body('transport')
    .isFloat({ min: 0 })
    .withMessage('Transport distance must be a non-negative number.'),
  body('food')
    .isIn(['veg', 'mixed', 'non-veg'])
    .withMessage("Food habit must be 'veg', 'mixed', or 'non-veg'."),
  body('electricity')
    .isFloat({ min: 0 })
    .withMessage('Electricity usage must be a non-negative number.'),
  body('history')
    .optional()
    .isArray()
    .withMessage('History must be an array of past scores.')
    .custom((arr) => {
      if (arr && !arr.every((val) => typeof val === 'number' && val >= 0 && val <= 100)) {
        throw new Error('History items must be scores between 0 and 100.');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

/**
 * @description Sanitizes response text by stripping script tags and other HTML tags
 * @param {string} text - The raw response text
 * @returns {string} The sanitized text
 * @example
 * sanitizeResponse('<script>alert(1)</script>hello') // => 'hello'
 */
const sanitizeResponse = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * @description Invokes the Gemini API, sanitizes, and parses the returned JSON string.
 * @param {Object} model - The initialized Google Generative AI model
 * @param {string} prompt - The constructed input prompt
 * @returns {Promise<Object>} The parsed JSON data from Gemini
 * @throws {Error} Throws parsing or API execution errors
 * @example
 * callGemini(model, prompt) // => parsedObject
 */
async function callGemini(model, prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const sanitizedText = sanitizeResponse(text);
  return JSON.parse(sanitizedText);
}

/**
 * @description POST /api/carbon-coach
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post(
  '/carbon-coach',
  coachRateLimiter,
  validateCoachRequest,
  async function handleCarbonCoach(req, res) {
    const { carbonScore, transport, food, electricity, history = [] } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Gemini API key configuration is missing on the server.'
      });
    }

    // Build the structured prompt
    const historyText =
      history.length > 0 ? `Your past score history: [${history.join(', ')}].` : '';
    const prompt = `You are the EcoSense AI Carbon Coach. Provide a highly personalized carbon footprint analysis and action plan based on the user's current data.
  
  User Data Profile:
  - Carbon Score: ${carbonScore}/100
  - Transport distance: ${transport} km/week
  - Dietary habits: ${food}
  - Electricity consumption: ${electricity} kWh/month
  ${historyText}

  Guidelines for advice generation:
  1. Do NOT give generic advice. Reference the user's exact numbers (e.g. 'Your ${transport} km/week transport produces approximately ${Math.round(transport * 4.33 * 0.21)} kg CO2').
  2. Recommendations must be specific, numeric, and actionable based on THEIR data.
  3. Respond ONLY in this JSON format. Use these exact keys. Do not include markdown code block syntax inside the json payload.

  JSON Schema Target:
  {
    "analysis": "string - personalized, references their actual numbers",
    "topEmissionSource": "transport" | "food" | "electricity",
    "topEmissionSourceExplanation": "string",
    "recommendations": [
      { 
        "title": "string", 
        "description": "string", 
        "estimatedCO2Saved": number (representing kg CO2 saved per week)
      }
    ],
    "sevenDayChallenge": {
      "title": "string",
      "days": [
        { "day": 1, "task": "string" },
        { "day": 2, "task": "string" },
        { "day": 3, "task": "string" },
        { "day": 4, "task": "string" },
        { "day": 5, "task": "string" },
        { "day": 6, "task": "string" },
        { "day": 7, "task": "string" }
      ]
    },
    "predictedImprovement": {
      "newScore": number (target carbon score 0-100),
      "co2ReductionPercent": number (estimated percentage carbon reduction),
      "explanation": "string"
    }
  }

  Requirements:
  - The "recommendations" array must contain EXACTLY 5 items.
  - The "sevenDayChallenge.days" array must contain EXACTLY 7 items, indexed 1 to 7.
  - The "estimatedCO2Saved" and "newScore" must be numbers (not stringified values).`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      let coachData;
      try {
        // First attempt to execute Gemini call
        coachData = await callGemini(model, prompt);
      } catch (firstError) {
        console.warn(
          'Gemini first call failed or returned malformed JSON. Retrying once...',
          firstError.message
        );
        // Single-retry attempt
        coachData = await callGemini(model, prompt);
      }

      return res.status(200).json({
        success: true,
        data: coachData,
        message: 'Coaching recommendations generated successfully.'
      });
    } catch (err) {
      console.error('Gemini Coaching API Error:', err.message);

      // Rate limiting (429) checks
      if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          success: false,
          data: null,
          message: 'The coaching service is currently overloaded. Please try again shortly.'
        });
      }

      // Default error fallback
      return res.status(500).json({
        success: false,
        data: null,
        message:
          'Failed to generate coaching insights. Please ensure your inputs are valid and try again.'
      });
    }
  }
);

module.exports = router;
