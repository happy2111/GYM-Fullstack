const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const { getClientInfo } = require('../utils/deviceParser');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, phone, dateOfBirth, gender } = req.body;

      // Проверяем юзера
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Создаём нового
      const user = await authService.createUser({
        name,
        email,
        password,
        phone,
        dateOfBirth,
        gender
      });

      // Генерим токены
      const accessToken = tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const refreshToken = tokenService.generateRefreshToken();

      const clientInfo = getClientInfo(req);
      const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

      await tokenService.saveRefreshToken(user.id, refreshToken, clientInfo, refreshExpires);

      // Лимит сессий
      const maxSessions = parseInt(process.env.MAX_SESSIONS_PER_USER) || 10;
      await tokenService.limitUserSessions(user.id, maxSessions);

      // refresh → HttpOnly cookie
      res.cookie('refreshToken', refreshToken, tokenService.getCookieOptions(true));

      logger.info(`User registered: ${email}`);

      // access → JSON
      res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        user: authService.getUserPublicData(user)
      });
    } catch (error) {
      logger.error('Register error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;


      const user = await authService.findUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'User email not found ' });
      }

      const isPasswordValid = await authService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Password is not correct' });
      }

      const accessToken = tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const refreshToken = tokenService.generateRefreshToken();

      const clientInfo = getClientInfo(req);
      const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await tokenService.saveRefreshToken(user.id, refreshToken, clientInfo, refreshExpires);
      const maxSessions = parseInt(process.env.MAX_SESSIONS_PER_USER) || 10;
      await tokenService.limitUserSessions(user.id, maxSessions);

      res.cookie('refreshToken', refreshToken, tokenService.getCookieOptions(true));

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        accessToken,
        user: authService.getUserPublicData(user)
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await tokenService.deleteRefreshToken(refreshToken);
      }

      res.clearCookie('refreshToken', { path: '/' });

      logger.info(`User logged out: ${req.user?.email || 'unknown'}`);
      res.json({ message: 'Logout successful' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Refresh token not provided'
        });
      }

      // Find and validate refresh token
      const tokenData = await tokenService.findRefreshToken(refreshToken);
      if (!tokenData) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const newAccessToken = tokenService.generateAccessToken({
        userId: tokenData.user_id,
        email: tokenData.email,
        role: tokenData.role
      });

      // Optionally rotate refresh token
      let newRefreshToken = refreshToken;
      if (process.env.ROTATE_REFRESH_TOKENS === 'true') {
        newRefreshToken = tokenService.generateRefreshToken();
        const clientInfo = getClientInfo(req);
        const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Delete old token and save new one
        await tokenService.deleteRefreshToken(refreshToken);
        await tokenService.saveRefreshToken(tokenData.user_id, newRefreshToken, clientInfo, refreshExpires);
      }

      const user = await authService.findUserByEmail(tokenData.email);
      if (!user) {
        return res.status(401).json({ message: 'User email not found ' });
      }

      // Set cookies
      if (newRefreshToken !== refreshToken) {
        res.cookie('refreshToken', newRefreshToken, tokenService.getCookieOptions(true));
      }

      res.json({ message: 'Token refreshed successfully', accessToken: newAccessToken, user: authService.getUserPublicData(user) });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token refresh failed'
      });
    }
  }

  async googleAuth(req, res, next) {
    // This is handled by passport middleware
  }

  async googleCallback(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }



      const refreshToken = tokenService.generateRefreshToken();
      const clientInfo = getClientInfo(req);
      const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Save refresh token
      await tokenService.saveRefreshToken(user.id, refreshToken, clientInfo, refreshExpires);

      // Limit user sessions
      const maxSessions = parseInt(process.env.MAX_SESSIONS_PER_USER) || 10;
      await tokenService.limitUserSessions(user.id, maxSessions);

      // Set cookies
      // res.cookie('accessToken', accessToken, tokenService.getCookieOptions(false));
      res.cookie('refreshToken', refreshToken, tokenService.getCookieOptions(true));

      // Redirect to frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth/google/callback`);
    } catch (error) {
      logger.error('Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
  }

  async getSessions(req, res) {
    try {
      const sessions = await tokenService.getUserSessions(req.user.id);

      res.json({
        sessions: sessions.map(session => ({
          id: session.id,
          device: session.device,
          ip: session.ip,
          lastActive: session.created_at,
          expiresAt: session.expires_at
        }))
      });

    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve sessions'
      });
    }
  }

  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      const sessions = await tokenService.getUserSessions(req.user.id);

      const targetSession = sessions.find(session => session.id === id);

      const deleted = await tokenService.deleteRefreshTokenById(id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Session not found'
        });
      }

      // Текущая сессия
      const currentToken = req.cookies.refreshToken; // или из заголовка
      const currentSession = await tokenService.findSessionByToken(currentToken);
      const currentSessionId = currentSession?.id;

      return res.json({
        message: 'Session deleted successfully',
        logout: targetSession?.id === currentSessionId
      });

    } catch (error) {
      logger.error('Delete session error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete session'
      });
    }
  }

  async getMe(req, res) {
    try {
      res.json({
        user: req.user
      });
    } catch (error) {
      logger.error('Get me error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user info'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const updatedUser = await authService.updateUser(req.user.id, updates);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async checkEmail(req, res)  {
    try {
      const {email} = req.body;
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return res.json({exists: false});
      }
      res.json({
        exists: true,
      });
    }
    catch (error) {
      console.error('Check email error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async telegram(req, res) {
    try {
      const user = await authService.createOrUpdateTelegramUser(req.body);
      console.log("REQUEST BODY:", req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json({error: "Failed to process Telegram user"});
    }
  }
}

module.exports = new AuthController();