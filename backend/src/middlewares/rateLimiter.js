const { rateLimit } = require("express-rate-limit");
const AppError = require("../utils/appErrors");

/**
 * Rate Limiter Configuration
 *
 * Implements different rate limits for different API endpoints
 * to protect against abuse and ensure fair resource usage.
 */

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  handler: (req, res, next) => {
    throw new AppError("Too many requests, please try again later.", 429);
  },
});

// Authentication rate limiter: 5 requests per 15 minutes
// Stricter limit for login and signup to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 authentication requests
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next) => {
    throw new AppError("Too many authentication attempts. Please try again after 15 minutes.", 429);
  },
});

// Password reset rate limiter: 3 requests per hour
// Very strict limit for password reset to prevent abuse
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Limit each IP to 3 password reset requests per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next) => {
    throw new AppError("Too many password reset attempts. Please try again after an hour.", 429);
  },
});

// File upload rate limiter: 10 requests per hour
// Stricter limit for file uploads to control bandwidth usage
const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 file upload requests per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next) => {
    throw new AppError("Too many file uploads. Please try again after an hour.", 429);
  },
});

module.exports = generalLimiter;
module.exports.authLimiter = authLimiter;
module.exports.passwordResetLimiter = passwordResetLimiter;
module.exports.fileUploadLimiter = fileUploadLimiter;
