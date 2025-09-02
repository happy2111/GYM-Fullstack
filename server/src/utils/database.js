const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_FHuGzSYx0V3Q@ep-patient-sun-a2befxzx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function connectDB() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../../migrations/init.sql');
    const migration = await fs.readFile(migrationPath, 'utf8');
    await pool.query(migration);
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

module.exports = { pool, connectDB, runMigration };