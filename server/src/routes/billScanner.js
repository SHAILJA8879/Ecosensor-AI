const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Rate limiting: Limit each IP to 10 requests per 15 minutes
const scannerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    data: null,
    message: 'Too many scan requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Configure Multer for memory-only storage and a max size limit of 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('bill');

// Multer Upload Wrapper Middleware
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'File size exceeds the 5MB limit.'
        });
      }
      return res.status(400).json({
        success: false,
        data: null,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.message
      });
    }

    // Sanitize filename on the server if present
    if (req.file && req.file.originalname) {
      req.file.originalname = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    next();
  });
};

// Express Validator configuration for the file upload route
const validateBillScan = [
  body('bill').custom((_, { req }) => {
    if (!req.file) {
      throw new Error('No bill image file provided.');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WEBP images are accepted.');
    }

    const buffer = req.file.buffer;
    if (!buffer || buffer.length < 12) {
      throw new Error('Invalid file buffer or file too small.');
    }

    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') {
      if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        throw new Error('File content does not match JPEG/JPG format.');
      }
    } else if (req.file.mimetype === 'image/png') {
      if (buffer[0] !== 0x89 || buffer[1] !== 0x50) {
        throw new Error('File content does not match PNG format.');
      }
    } else if (req.file.mimetype === 'image/webp') {
      if (buffer.toString('ascii', 8, 12) !== 'WEBP') {
        throw new Error('File content does not match WEBP format.');
      }
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
 * @description Validates whether the extracted date matches the standard ISO YYYY-MM-DD format.
 * @param {any} dateStr - The date string to validate
 * @returns {string|null} The validated date string in YYYY-MM-DD format or null
 * @example
 * sanitizeBillingDate('2026-06-15') // => '2026-06-15'
 */
function sanitizeBillingDate(dateStr) {
  if (typeof dateStr !== 'string') {
    return null;
  }
  // Standard YYYY-MM-DD check
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateRegex.test(dateStr)) {
    return dateStr;
  }
  // Try to parse standard dates and convert them to ISO format
  const parsedDate = Date.parse(dateStr);
  if (!isNaN(parsedDate)) {
    return new Date(parsedDate).toISOString().split('T')[0];
  }
  return null;
}

/**
 * @description Validates and sanitizes the extracted numeric utility values.
 * @param {any} val - The input value to sanitize
 * @returns {number|null} The parsed positive float or null
 * @example
 * sanitizeNumericVal(12.5) // => 12.5
 */
function sanitizeNumericVal(val) {
  if (val === null || val === undefined) {
    return null;
  }
  const parsed = parseFloat(val);
  if (isNaN(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

/**
 * @description POST /api/scan-bill
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post(
  '/scan-bill',
  scannerRateLimiter,
  uploadMiddleware,
  validateBillScan,
  async function handleBillScan(req, res) {
    // 1. Validate Gemini API configurations
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Gemini API key configuration is missing on the server.'
      });
    }

    try {
      // Initialize Gemini SDK client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      // Prepare image base64 structure
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      };

      // Prompt optimized for structure extraction
      const prompt = `Analyze this utility bill. Extract the following properties and return them in a JSON object:
    - "kwh": The total electricity consumption in kWh. Must be a number. If not found, return null.
    - "fuel_liters": The total fuel/gas consumption in liters. Must be a number. If not found, return null.
    - "billing_date": The billing date formatted as YYYY-MM-DD. If not found, return null.

    Do not estimate or guess values. Return nulls if they are not explicitly or clearly readable on the bill.`;

      // Call Gemini API
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const sanitizedText = sanitizeResponse(text);

      // Parse and sanitize raw Gemini response
      let parsedJson;
      try {
        parsedJson = JSON.parse(sanitizedText);
      } catch (e) {
        console.error('Gemini malformed JSON response:', text);
        return res.status(500).json({
          success: false,
          data: null,
          message: 'The AI model returned an unparsable response. Please try again.'
        });
      }

      // Sanitize properties to prevent script injections and type errors
      const sanitizedData = {
        kwh: sanitizeNumericVal(parsedJson.kwh),
        fuel_liters: sanitizeNumericVal(parsedJson.fuel_liters),
        billing_date: sanitizeBillingDate(parsedJson.billing_date)
      };

      return res.status(200).json({
        success: true,
        data: sanitizedData,
        message: 'Bill successfully scanned and parsed.'
      });
    } catch (apiError) {
      console.error('Gemini API Integration Error:', apiError.message);

      // Handle Rate Limit (429) errors
      if (apiError.message.includes('429') || apiError.message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          success: false,
          data: null,
          message: 'The AI service is currently overloaded. Please try again in a moment.'
        });
      }

      // Handle other API validation/service errors
      return res.status(500).json({
        success: false,
        data: null,
        message: 'An error occurred while communicating with the AI scanning service.'
      });
    }
  }
);

module.exports = router;
