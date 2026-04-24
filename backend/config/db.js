const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);

    logger.success('MongoDB Connected Successfully');
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
