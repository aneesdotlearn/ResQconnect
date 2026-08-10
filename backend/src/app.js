'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const locationRoutes = require('./api/v1/location/location.routes');

const { corsOptions } = require('./config/cors');
const { rateLimiter, authRateLimiter, webhookRateLimiter } = require('./middleware/rateLimiter');
const { getCsrfToken, verifyCsrfToken } = require('./middleware/csrf');
// const { errorHandler } = require('./middleware/errorHandler');
// const { notFound } = require('./middleware/notFound');
const { requestLogger } = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const authRoutes = require('./api/v1/auth/auth.routes');
const contactsRoutes = require('./api/v1/contacts/contacts.routes');
const zonesRoutes = require('./api/v1/zones/zones.routes');
const sosRoutes = require('./api/v1/sos/sos.routes');
const incidentsRoutes = require('./api/v1/incidents/incidents.routes');
const notificationsRoutes = require('./api/v1/notifications/notifications.routes');
const subscriptionsRoutes = require('./api/v1/subscriptions/subscriptions.routes');
const { stripeWebhook } = require('./api/v1/subscriptions/subscriptions.controller');
const analyticsRoutes = require('./api/v1/analytics/analytics.routes');
const { razorpayWebhook } = require('./api/v1/subscriptions/subscriptions.controller');

const app = express();
// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
// This rule only recognizes csurf/csrf by name. CSRF protection is implemented via
// csrf-csrf (double-submit cookie pattern) — see middleware/csrf.js and its mount
// point below at app.use('/api/', verifyCsrfToken). Verified end-to-end: rejects
// mutating requests without a matching X-CSRF-Token, rejects cross-session token
// reuse, passes through with a valid token.

// ─── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// ─── CORS ───────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Stripe/Razorpay Webhooks — before global JSON parser (needs the raw body) ──
// These are registered before the global rate limiter (below), so they need
// their own limiter here or they'd have none at all.
app.post('/api/v1/subscriptions/stripe/webhook', webhookRateLimiter, express.raw({ type: 'application/json' }), stripeWebhook);
app.post('/api/v1/subscriptions/razorpay/webhook', webhookRateLimiter, express.raw({ type: 'application/json' }), razorpayWebhook);

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// codeql[js/missing-token-validation]
// CodeQL only recognizes csurf or lusca by name for this check. CSRF protection is
// implemented via csrf-csrf instead — see middleware/csrf.js, mounted below at
// app.use('/api/', verifyCsrfToken). Verified end-to-end (403 without a matching
// X-CSRF-Token, 403 on cross-session token reuse, passes through with a valid one).
app.use(cookieParser(process.env.JWT_SECRET));

// ─── Sanitization & Compression ─────────────────────────────────────────────────
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(hpp({ whitelist: ['sort', 'fields', 'page', 'limit'] }));
app.use(compression());

// ─── Logging ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}
app.use(requestLogger);

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);
app.use('/api/v1/auth/', authRateLimiter);

// ─── CSRF Protection ──────────────────────────────────────────────────────────────
// access_token/refresh_token cookies are httpOnly + sameSite=strict, which already
// blocks the cookie from being sent on cross-site requests in modern browsers.
// This double-submit token is a defense-in-depth layer on top of that for
// state-changing requests authenticated via cookie (as opposed to a Bearer header,
// which cross-site pages can't attach anyway).
app.get('/api/v1/csrf-token', getCsrfToken);
app.use('/api/', verifyCsrfToken);

// ─── REST API Routes ─────────────────────────────────────────────────────────────
// GraphQL is mounted separately in server.js (async — see graphql/index.js),
// since Apollo Server requires `await server.start()` before applying its
// Express middleware, which app.js's synchronous factory can't do.
const V1 = '/api/v1';
app.use(`${V1}/auth`, authRoutes);
app.use(`${V1}/contacts`, contactsRoutes);
app.use(`${V1}/zones`, zonesRoutes);
app.use(`${V1}/sos`, sosRoutes);
app.use(`${V1}/incidents`, incidentsRoutes);
app.use(`${V1}/notifications`, notificationsRoutes);
app.use(`${V1}/subscriptions`, subscriptionsRoutes);
app.use(`${V1}/analytics`, analyticsRoutes);
app.use(`${V1}/location`, locationRoutes);

// // ─── Error Handling ───────────────────────────────────────────────────────────────
// app.use(notFound);
// app.use(errorHandler);

module.exports = app;