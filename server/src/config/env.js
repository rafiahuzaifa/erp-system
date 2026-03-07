const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Resolve GENERATED_PROJECTS_DIR — always use an absolute path
// On Windows: use project-relative generated/ folder
// On Linux (Vercel/production): use /tmp/generated (the only writable dir in serverless)
let generatedDir = process.env.GENERATED_PROJECTS_DIR;

// Detect Windows-style absolute paths (e.g. C:\... or C:/...) and override on Linux
const isWindowsStylePath = /^[A-Za-z]:[/\\]/.test(generatedDir || '');
if (isWindowsStylePath && process.platform !== 'win32') {
  generatedDir = null; // will be replaced below with platform-appropriate default
}

if (!generatedDir || generatedDir === '/tmp/generated') {
  if (process.platform === 'win32') {
    // On Windows, use project-root/generated (avoids AppData/Local/Temp permission issues)
    generatedDir = path.resolve(__dirname, '../../../generated');
  } else {
    // On Linux/Mac (Vercel, Render, etc.) /tmp is the only writable directory
    generatedDir = '/tmp/generated';
  }
}
if (!path.isAbsolute(generatedDir)) {
  generatedDir = path.resolve(__dirname, '../../../', generatedDir);
}
// Ensure the directory exists at startup
try { fs.mkdirSync(generatedDir, { recursive: true }); } catch {}

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
  GENERATED_PROJECTS_DIR: generatedDir,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = env;
