const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('./authService');
const logger = require('../utils/logger');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with Google ID
      let user = await authService.findUserByGoogleId(profile.id);

      if (user) {
        logger.info(`Google login: existing user ${user.email}`);
        return done(null, user);
      }

      // Check if user exists with same email
      user = await authService.findUserByEmail(profile.emails[0].value);

      if (user) {
        // Link Google account to existing user
        await pool.query(
          'UPDATE users SET google_id = $1, is_verified = true WHERE id = $2',
          [profile.id, user.id]
        );
        user.google_id = profile.id;
        user.is_verified = true;

        logger.info(`Google account linked to existing user: ${user.email}`);
        return done(null, user);
      }

      // Create new user
      const newUser = await authService.createUser({
        name: profile.displayName,
        email: profile.emails[0].value,
        phone: profile.phoneNumbers?.[0]?.value || null,
        dateOfBirth: profile.birthday || null,
        gender: profile.gender || null,
        googleId: profile.id,
        isVerified: true
      });

      logger.info(`New user created via Google: ${newUser.email}`);
      return done(null, newUser);

    } catch (error) {
      logger.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;