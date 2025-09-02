require('dotenv').config();
const tokenService = require('./src/services/tokenService');
const { connectDB } = require('./src/utils/database');
const logger = require('./src/utils/logger');

async function cleanupTokens() {
  try {
    await connectDB();
    const deletedCount = await tokenService.cleanupExpiredTokens();
    logger.info(`Cleanup completed. Deleted ${deletedCount} expired tokens.`);
    process.exit(0);
  } catch (error) {
    logger.error('Cleanup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupTokens();
}

module.exports = cleanupTokens;