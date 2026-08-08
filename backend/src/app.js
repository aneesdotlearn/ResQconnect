'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { corsOptions } = require('./config/cors');
const { rateLimiter, authRateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { requestLogger } = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const authRoutes = require('./api/v1/auth/auth.routes');
const contactsRoutes = require('./api/v1/contacts/contacts.routes');
const zonesRoutes = require('./api/v1/zones/zones.routes');

const app = express();

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

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
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

// ─── Rate Limiting ───────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);
app.use('/api/v1/auth/', authRateLimiter);

// ─── REST API Routes ─────────────────────────────────────────────────────────────
const V1 = '/api/v1';
app.use(`${V1}/auth`, authRoutes);
app.use(`${V1}/contacts`, contactsRoutes);
app.use(`${V1}/zones`, zonesRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;