const env = require('./config/env');
const logger = require('./utils/logger');
const app = require('./app');
const { connectDatabases } = require('./config/database');

const startServer = async () => {
  try {
    await connectDatabases();
    logger.info('All databases connected');

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
