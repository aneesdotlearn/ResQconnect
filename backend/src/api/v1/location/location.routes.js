'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../../../middleware/validate');
const { protect } = require('../../../middleware/auth');
const ctrl = require('./location.controller');

router.use(protect);

router.post('/update', validate([
  body('coordinates').isArray({ min: 2, max: 2 }),
  body('coordinates.*').isFloat({ min: -180, max: 180 }),
  body('accuracy').optional().isFloat({ min: 0 }),
]), ctrl.updateLocation);

router.get('/live', ctrl.getLiveLocation);
router.get('/history', ctrl.getLocationHistory);

module.exports = router;