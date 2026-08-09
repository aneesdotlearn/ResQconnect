'use strict';

require('dotenv').config();
require('express-async-errors');

const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const { connectRedis, getRedisClient } = require('./config/redis');
const { initSocketIO } = require('./config/socket');
const { initQueues, closeQueues } = require('./queues');
const { initGraphQL } = require('./graphql');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    await connectRedis();
    await initGraphQL(app);

    app.use(notFound);
    app.use(errorHandler);

    const server = http.createServer(app);
    initSocketIO(server);
    initQueues();

    server.listen(PORT, () => {
      logger.info(`ResQconnect API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Graceful shutdown initiated.`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await closeQueues();
        await mongoose.connection.close();
        const redis = getRedisClient();
        if (redis) await redis.quit();
        logger.info('Connections closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error('Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();