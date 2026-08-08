'use strict';

const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../../../middleware/validate');
const { protect } = require('../../../middleware/auth');
const ctrl = require('./zones.controller');

router.use(protect);

const zoneValidators = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('coordinates').isArray({ min: 2, max: 2 }),
  body('coordinates.*').isFloat({ min: -180, max: 180 }),
  body('radius').isInt({ min: 50, max: 50000 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('alertOnExit').optional().isBoolean(),
  body('alertOnEntry').optional().isBoolean(),
];

router.get('/', ctrl.getZones);
router.post('/', validate(zoneValidators), ctrl.createZone);
router.get('/nearby', validate([
  query('lng').isFloat({ min: -180, max: 180 }),
  query('lat').isFloat({ min: -90, max: 90 }),
  query('radius').optional().isInt({ min: 100, max: 50000 }),
]), ctrl.getNearbyZones);
router.get('/:id', validate([param('id').isMongoId()]), ctrl.getZone);
router.patch('/:id', validate([param('id').isMongoId()]), ctrl.updateZone);
router.delete('/:id', validate([param('id').isMongoId()]), ctrl.deleteZone);

module.exports = router;