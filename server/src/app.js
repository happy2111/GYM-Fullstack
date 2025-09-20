require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const membershipRoutes = require('./routes/membershipRoutes');
const visitRoutes = require('./routes/visitRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const tariffRoutes = require('./routes/tariffRoutes');
const usersRoutes = require('./routes/usersRoutes');

const logger = require('./utils/logger');
require('./services/googleAuth'); // Initialize Google OAuth strategy

const app = express();
app.set('trust proxy', 1);


// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Слишком много запросов, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://gym-fullstack-wine.vercel.app',
      "https://admin.bullfit.uz",
      "https://www.bullfit.uz",
      "https://bullfit.uz",
      'http://localhost:5173',
      'http://localhost:5174',
    ]
    : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.1.148:5173',
      'https://gym-fullstack-wine.vercel.app',
      'https://gym-fullstack-k5z5.vercel.app',
      "https://admin.bullfit.uz",
      "https://www.bullfit.uz",
      "https://bullfit.uz"
    ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use("/memberships", membershipRoutes);
app.use('/visits', visitRoutes);
app.use("/payment", paymentRoutes)
app.use('/tariffs', tariffRoutes);
app.use("/users", usersRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please refresh your token'
    });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;
