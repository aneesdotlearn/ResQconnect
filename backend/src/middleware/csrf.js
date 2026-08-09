'use strict';

const crypto = require('crypto');
const AppError = require('../utils/AppError');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Routes that don't carry the auth cookie session (third-party signed webhooks)
// or that run before any session exists (login/register/refresh/reset flows).
// These can't present a CSRF token yet, and — since they don't rely on an
// authenticated cookie to perform their action — aren't CSRF targets.
const EXEMPT_PREFIXES = [
  '/api/v1/subscriptions/stripe/webhook',
  '/api/v1/subscriptions/razorpay/webhook',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
];

function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS so it can echo it back in the header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

// GET /api/v1/csrf-token — issues the token pair; client stores the body token
// (or reads the cookie) and sends it back as X-CSRF-Token on mutating requests.
const getCsrfToken = (req, res) => {
  const token = issueCsrfToken(req, res);
  res.status(200).json({ status: 'success', data: { csrfToken: token } });
};

// Verifies the token from the cookie matches the token from the header
// (double-submit pattern). Only requests authenticated via cookie are at risk
// of CSRF — requests using a Bearer token in the Authorization header aren't,
// since a cross-site page can't read or attach that header. So we only enforce
// the check when the access token cookie (not an Authorization header) is what
// authenticated this request.
const verifyCsrfToken = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  // req.originalUrl (not req.path) — this middleware is mounted at '/api/', which
  // strips that prefix from req.path/req.url but leaves originalUrl untouched.
  if (EXEMPT_PREFIXES.some((p) => req.originalUrl.startsWith(p))) return next();
  if (req.headers.authorization?.startsWith('Bearer ')) return next();
  if (!req.cookies?.access_token) return next(); // no cookie session to forge

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return next(new AppError('Invalid or missing CSRF token', 403, 'CSRF_TOKEN_INVALID'));
  }

  next();
};

module.exports = { getCsrfToken, verifyCsrfToken, issueCsrfToken, CSRF_COOKIE, CSRF_HEADER };