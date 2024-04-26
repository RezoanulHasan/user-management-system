/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import seedSuperAdmin from './app/superAdmin';
import { errorlogger, logger } from './utils/logger';
import { redisClient } from './config/configureRedis';
// Import the subscribeToChannel function

let server: Server;

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);

    // Seed super admin data if needed
    seedSuperAdmin();

    // Start the Express server
    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

// Graceful exit handler
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      redisClient.quit(); // Close Redis client
    });
  }
  process.exit(1);
};

// Handle unexpected errors
const unexpectedErrorHandler = (error: unknown) => {
  errorlogger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection is detected, shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected, shutting down ...`);
  process.exit(1);
});

// Start the server
main();
