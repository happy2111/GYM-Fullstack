const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../utils/database');
const logger = require('../utils/logger');

class AuthService {
  async createUser(userData) {
    const { name, email, phone, password, dateOfBirth, gender, role = 'client', googleId, isVerified = false } = userData;

    const query = `
      INSERT INTO users (id, name, email, phone, password, date_of_birth, gender, role, google_id, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, email, phone, date_of_birth, gender, role, is_verified, created_at
    `;

    const hashedPassword = password ? await this.hashPassword(password) : null;
    const userId = uuidv4();

    try {
      const result = await pool.query(query, [
        userId,
        name,
        email,
        phone,
        hashedPassword,
        dateOfBirth,
        gender,
        role,
        googleId,
        isVerified
      ]);

      logger.info(`User created: ${email}`);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async createOrUpdateTelegramUser(userData) {
    const {
      telegramId,
      firstName,
      lastName,
      photoUrl,
      phone
    } = userData;

    try {
      const fullName = [firstName, lastName].filter(Boolean).join(" ");

      const query = `
        INSERT INTO users (id, telegram_id, name, phone, telegram_photo_url, role, is_verified)
        VALUES ($1, $2, $3, $4, $5, 'client', true)
        ON CONFLICT (telegram_id) DO UPDATE
        SET name              = EXCLUDED.name,
            phone             = COALESCE(EXCLUDED.phone, users.phone),
            telegram_photo_url= EXCLUDED.telegram_photo_url,
            updated_at        = NOW()
        RETURNING id, telegram_id, name, phone, telegram_photo_url, role, created_at, updated_at
      `;


      const userId = uuidv4();

      const result = await pool.query(query, [
        userId,
        telegramId,
        fullName,
        phone || null,
        photoUrl || null
      ]);

      logger.info(`Telegram user upserted: ${telegramId} - ${fullName} - ${phone || 'No phone provided'} - ${photoUrl || 'No photo URL provided'}`);
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating/updating Telegram user:", error);
      throw error;
    }
  }

  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
}

  async findUserByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';

    try {
      const result = await pool.query(query, [googleId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by Google ID:', error);
      throw error;
    }
  }

  async findUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, rounds);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updateUser(id, updates) {
    const allowedFields = ['name', 'phone', 'date_of_birth', 'gender'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, phone, date_of_birth, gender, role, is_verified
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info(`User updated: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  getUserPublicData(user) {
    const { password, ...publicData } = user;
    return publicData;
  }
}

module.exports = new AuthService();