'use strict';

const router = require('express').Router();
const { protect, restrictTo } = require('../../../middleware/auth');
const ctrl = require('./analytics.controller');

router.use(protect);
router.get('/me', ctrl.getUserAnalytics);
router.get('/admin', restrictTo('admin'), ctrl.getAdminAnalytics);

module.exports = router;