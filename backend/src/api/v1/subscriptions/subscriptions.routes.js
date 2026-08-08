'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');
const { validate } = require('../../../middleware/validate');
const { protect } = require('../../../middleware/auth');
const { paymentRateLimiter } = require('../../../middleware/rateLimiter');
const ctrl = require('./subscriptions.controller');

const VALID_PLANS = ['basic', 'premium', 'enterprise'];

// Note: the Stripe webhook route lives in app.js, not here — it needs the
// raw request body for signature verification, which must be captured
// BEFORE the global express.json() parser runs. See app.js for details.
router.post('/razorpay/webhook', ctrl.razorpayWebhook);

router.use(protect);

router.get('/status', ctrl.getSubscriptionStatus);
router.get('/transactions', ctrl.getTransactionHistory);
router.get('/invoice/:txId', validate([param('txId').isMongoId()]), ctrl.generateInvoice);

router.post('/razorpay/order', paymentRateLimiter, validate([
  body('plan').isIn(VALID_PLANS).withMessage('Invalid subscription plan'),
]), ctrl.createRazorpayOrder);

router.post('/razorpay/verify', paymentRateLimiter, validate([
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
  body('txId').isMongoId(),
  body('plan').isIn(VALID_PLANS),
]), ctrl.verifyRazorpayPayment);

router.post('/stripe/session', paymentRateLimiter, validate([
  body('plan').isIn(VALID_PLANS).withMessage('Invalid subscription plan'),
]), ctrl.createStripeSession);

module.exports = router;