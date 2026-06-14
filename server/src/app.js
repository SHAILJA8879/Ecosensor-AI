// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middlewares
// Configure Helmet with API-appropriate Content Security Policy (CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    }
  }
}));

// CORS Configuration (No wildcard origin)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

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

// Apply rate limiting to all API endpoints
app.use('/api', apiLimiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const billScannerRouter = require('../routes/billScanner');
const carbonCoachRouter = require('../routes/carbonCoach');
app.use('/api', billScannerRouter);
app.use('/api', carbonCoachRouter);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
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
