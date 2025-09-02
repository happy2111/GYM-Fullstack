const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    });
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw error;
    }
  }

  async saveRefreshToken(userId, token, clientInfo, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, ip, user_agent, device, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [
        userId,
        token,
        clientInfo.ip,
        clientInfo.userAgent,
        clientInfo.device,
        expiresAt
      ]);

      logger.info(`Refresh token saved for user ${userId} from ${clientInfo.device}`);
      return result.rows[0].id;
    } catch (error) {
      logger.error('Error saving refresh token:', error);
      throw error;
    }
  }

  async findRefreshToken(token) {
    const query = `
      SELECT rt.*, u.id as user_id, u.email, u.name, u.role 
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = $1 AND rt.expires_at > NOW()
    `;

    try {
      const result = await pool.query(query, [token]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding refresh token:', error);
      throw error;
    }
  }

  async deleteRefreshToken(token) {
    const query = 'DELETE FROM refresh_tokens WHERE token = $1';

    try {
      const result = await pool.query(query, [token]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting refresh token:', error);
      throw error;
    }
  }

  async deleteRefreshTokenById(tokenId, userId) {
    const query = 'DELETE FROM refresh_tokens WHERE id = $1 AND user_id = $2';

    try {
      const result = await pool.query(query, [tokenId, userId]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting refresh token by ID:', error);
      throw error;
    }
  }

  async getUserSessions(userId) {
    const query = `
      SELECT id, ip, user_agent, device, expires_at, created_at
      FROM refresh_tokens 
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }

  async cleanupExpiredTokens() {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at <= NOW()';

    try {
      const result = await pool.query(query);
      if (result.rowCount > 0) {
        logger.info(`Cleaned up ${result.rowCount} expired refresh tokens`);
      }
      return result.rowCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  async limitUserSessions(userId, maxSessions = 10) {
    const query = `
      DELETE FROM refresh_tokens 
      WHERE user_id = $1 AND id NOT IN (
        SELECT id FROM refresh_tokens 
        WHERE user_id = $1 AND expires_at > NOW()
        ORDER BY created_at DESC 
        LIMIT $2
      )
    `;

    try {
      const result = await pool.query(query, [userId, maxSessions]);
      if (result.rowCount > 0) {
        logger.info(`Removed ${result.rowCount} old sessions for user ${userId}`);
      }
      return result.rowCount;
    } catch (error) {
      logger.error('Error limiting user sessions:', error);
      throw error;
    }
  }

  getCookieOptions(isRefresh = false) {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = isRefresh
      ? 30 * 24 * 60 * 60 * 1000 // 30 days for refresh token
      : 15 * 60 * 1000; // 15 minutes for access token

    return {
      httpOnly: true,
      secure: isProduction || process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
      maxAge,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    };
  }
}

module.exports = new TokenService();