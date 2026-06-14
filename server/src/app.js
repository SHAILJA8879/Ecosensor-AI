// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Strengthen Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
}));

// Strict CORS Configuration (No wildcard)
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Speed limiter configuration
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: 500
});

// Global API rate limiting: Limit each IP to 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    data: null,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply speed limiter and rate limiting to all API endpoints
app.use('/api', speedLimiter);
app.use('/api', apiLimiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const billScannerRouter = require('../routes/billScanner');
const carbonCoachRouter = require('../routes/carbonCoach');
app.use('/api', billScannerRouter);
app.use('/api', carbonCoachRouter);

/**
 * @description Serves the security.txt file containing contact and expiration details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 * @example
 * GET /.well-known/security.txt
 */
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text').send(
    'Contact: mailto:security@ecosense-ai.app\n' +
    'Expires: 2026-12-31T00:00:00.000Z\n'
  );
});

/**
 * @description Returns the health status of the application server
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 * @example
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve static client assets
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Centralized Error Handler Middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    data: null,
    message: isDev ? err.message : 'An unexpected error occurred on the server.'
  });
});

module.exports = app;
