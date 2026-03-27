const winston = require("winston");
const path = require("path");

/**
 * Winston Logger Configuration
 *
 * Usage Examples:
 * ---------------
 * const logger = require('./config/logger');
 *
 * logger.error('Error message', { userId: 123, action: 'login' });
 * logger.warn('Warning message', { resource: 'user', id: 456 });
 * logger.info('Info message', { event: 'user_created' });
 * logger.debug('Debug message', { query: userQuery });
 *
 * Log Levels (in order of priority):
 * - error: 0
 * - warn: 1
 * - info: 2
 * - debug: 3
 *
 * Files:
 * - logs/error.log - Only error level logs
 * - logs/combined.log - All log levels
 * - logs/exceptions.log - Uncaught exceptions
 * - logs/rejections.log - Unhandled promise rejections
 */

// Define log format
const logFormat = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());

// Define console format for better readability
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      msg += `\n${stack}`;
    }
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
  }),
);

// Create logs directory path
const logsDir = path.join(__dirname, "../../logs");

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Error logs - only errors
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    }),
  );
}

// Add console transport for production (less verbose)
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "info",
    }),
  );
}

// Stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
