const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

// PostgreSQL connection via Sequelize
const sequelize = new Sequelize(env.PG_DATABASE, env.PG_USER, env.PG_PASSWORD, {
  host: env.PG_HOST,
  port: env.PG_PORT,
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    await sequelize.sync({ alter: env.NODE_ENV === 'development' });
    logger.info('PostgreSQL models synchronized');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
};

const connectDatabases = async () => {
  await Promise.all([connectMongoDB(), connectPostgres()]);
};

module.exports = { connectDatabases, sequelize, mongoose };
