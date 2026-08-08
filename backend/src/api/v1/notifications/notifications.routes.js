'use strict';

const router = require('express').Router();
const { body, param } = require('express-validator');
const { validate } = require('../../../middleware/validate');
const { protect } = require('../../../middleware/auth');
const ctrl = require('./notifications.controller');

router.use(protect);

router.get('/', ctrl.getNotifications);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', validate([param('id').isMongoId()]), ctrl.markRead);
router.delete('/:id', validate([param('id').isMongoId()]), ctrl.deleteNotification);
router.post('/fcm-token', validate([
  body('token').notEmpty().withMessage('FCM token required'),
  body('platform').isIn(['ios', 'android', 'web']).withMessage('Invalid platform'),
]), ctrl.registerFCMToken);
router.patch('/preferences', ctrl.updatePreferences);

module.exports = router;