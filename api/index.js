// Vercel serverless entry point — routes all /api/* requests to Express app
// Pre-require dynamic imports so Vercel's bundler includes them in the bundle
require('pg');
require('pg-hstore');

let app, connectDatabases;

try {
  connectDatabases = require('../server/src/config/database').connectDatabases;
  app = require('../server/src/app');
} catch (loadErr) {
  console.error('[LOAD ERROR]', loadErr.message, loadErr.stack);
  module.exports = (req, res) => res.status(500).json({ error: 'Module load failed', detail: loadErr.message });
  return;
}

let connected = false;

module.exports = async (req, res) => {
  if (!connected) {
    try {
      await connectDatabases();
      connected = true;
    } catch (err) {
      console.error('[DB ERROR]', err.message);
      return res.status(500).json({ error: 'DB connection failed', detail: err.message });
    }
  }
  return app(req, res);
};
