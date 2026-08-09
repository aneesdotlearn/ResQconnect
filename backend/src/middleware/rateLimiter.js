'use strict';

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const createLimiter = (options = {}) => {
  const windowMs =
    options.windowMs ||
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) ||
    900000;

  return rateLimit({
    windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessful || false,

    keyGenerator: (req) =>
      req.user?.id?.toString() || ipKeyGenerator(req.ip),

    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        code: 'RATE_LIMIT_EXCEEDED',
        message:
          options.message ||
          'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

const rateLimiter = createLimiter({
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: 'Too many requests from this IP.',
});

const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  skipSuccessful: true,
  message:
    'Too many authentication attempts. Please try again in 15 minutes.',
});

const sosRateLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message:
    'Too many SOS triggers. If this is an emergency, contact local services directly.',
});

const paymentRateLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message:
    'Too many payment attempts. Please try again in 10 minutes.',
});

// For the Stripe/Razorpay webhook endpoints specifically — these are called by
// the gateway's own servers (often from a shared IP pool), not end users, so
// they need a much higher ceiling than paymentRateLimiter's per-user limit.
// This exists purely to cap abuse/DoS against the endpoint, not to throttle
// legitimate gateway traffic or retries.
const webhookRateLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 300,
  message: 'Too many webhook requests.',
});

module.exports = {
  rateLimiter,
  authRateLimiter,
  sosRateLimiter,
  paymentRateLimiter,
  webhookRateLimiter,
};