const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_builder',
  PG_HOST: process.env.PG_HOST || 'localhost',
  PG_PORT: process.env.PG_PORT || 5432,
  PG_DATABASE: process.env.PG_DATABASE || 'erp_builder',
  PG_USER: process.env.PG_USER || 'erp_admin',
  PG_PASSWORD: process.env.PG_PASSWORD || 'erp_secret',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DEPLOY_PORT_START: parseInt(process.env.DEPLOY_PORT_START || '4000', 10),
  DEPLOY_PORT_END: parseInt(process.env.DEPLOY_PORT_END || '5000', 10),
  GENERATED_PROJECTS_DIR: process.env.GENERATED_PROJECTS_DIR || path.resolve(__dirname, '../../../generated'),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = env;
