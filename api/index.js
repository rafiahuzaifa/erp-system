// Vercel serverless entry point — routes all /api/* requests to Express app
const { connectDatabases } = require('../server/src/config/database');
const app = require('../server/src/app');

let connected = false;

module.exports = async (req, res) => {
  if (!connected) {
    try {
      await connectDatabases();
      connected = true;
    } catch (err) {
      console.error('DB connection failed:', err.message);
      return res.status(500).json({ error: 'Service unavailable' });
    }
  }
  return app(req, res);
};
