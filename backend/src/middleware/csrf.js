'use strict';

const { doubleCsrf } = require('csrf-csrf');

// Routes that don't carry the auth cookie session (third-party signed webhooks —
// these never even reach this middleware since they're handled and return before
// it's mounted, see app.js) or that run before any session exists (login/register/
// refresh/reset flows). These can't present a CSRF token yet, and since they don't
// rely on an authenticated cookie to perform their action, aren't CSRF targets.
const EXEMPT_PREFIXES = [
  '/api/v1/subscriptions/stripe/webhook',
  '/api/v1/subscriptions/razorpay/webhook',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
];

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
  // No express-session in this app (auth is JWT-based) — tying the CSRF token to
  // the current access_token cookie means it naturally rotates with login/logout,
  // same effect as tying it to a session id.
  getSessionIdentifier: (req) => req.cookies?.access_token || req.ip,
  cookieName:
    process.env.NODE_ENV === 'production'
      ? '__Host-resqconnect.csrf-token'
      : 'resqconnect.csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    httpOnly: true, // explicit even though it's csrf-csrf's own default — the token
    // is only ever read from the /csrf-token JSON response body, never from the
    // cookie via client JS, so there's no reason to relax this.
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
  skipCsrfProtection: (req) =>
    EXEMPT_PREFIXES.some((p) => req.originalUrl.startsWith(p)) ||
    req.headers.authorization?.startsWith('Bearer ') || // no cookie involved, nothing to forge
    !req.cookies?.access_token, // no cookie session to forge
});

// GET /api/v1/csrf-token — issues the token; client stores it (from the JSON body,
// not the cookie — the cookie stays httpOnly) and echoes it back as X-CSRF-Token
// on mutating requests.
const getCsrfToken = (req, res) => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({ status: 'success', data: { csrfToken: token } });
};

module.exports = { getCsrfToken, verifyCsrfToken: doubleCsrfProtection };