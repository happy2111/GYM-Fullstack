const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many failed attempts, please try again later'
});

// Public routes (no auth required)
router.post('/register',
  strictAuthLimiter,
  validate(schemas.register),
  authController.register
);

router.post('/login',
  strictAuthLimiter,
  validate(schemas.login),
  authController.login
);

router.post('/refresh', authController.refresh);

router.post('/check-email', authController.checkEmail);

// Google OAuth routes
router.get('/google',
  authLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);

// Protected routes (auth required)
router.post('/logout', optionalAuth, authController.logout);

router.get('/me', authMiddleware, authController.getMe);

router.put('/profile',
  authMiddleware,
  validate(schemas.updateProfile),
  authController.updateProfile
);

router.get('/sessions', authMiddleware, authController.getSessions);

router.delete('/sessions/:id', authMiddleware, authController.deleteSession);

module.exports = router;