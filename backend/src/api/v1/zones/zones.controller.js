'use strict';

const { SafeZone } = require('../../../models/index');
const AppError = require('../../../utils/AppError');

exports.createZone = async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const count = await SafeZone.countDocuments({ user: userId });
  const maxZones = req.user.subscription?.plan === 'free' ? 3 : 20;
  if (count >= maxZones) return next(new AppError(`Maximum ${maxZones} safe zones allowed on your plan`, 400, 'LIMIT_EXCEEDED'));

  const { name, description, coordinates, radius, address, schedules, alertOnExit, alertOnEntry } = req.body;
  const zone = await SafeZone.create({
    user: userId,
    name, description, radius, address, schedules, alertOnExit, alertOnEntry,
    location: { type: 'Point', coordinates },
  });
  res.status(201).json({ status: 'success', data: { zone } });
};

exports.getZones = async (req, res) => {
  const zones = await SafeZone.find({ user: req.user._id || req.user.id }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ status: 'success', data: { zones } });
};

exports.getZone = async (req, res, next) => {
  const zone = await SafeZone.findOne({ _id: req.params.id, user: req.user._id || req.user.id }).lean();
  if (!zone) return next(new AppError('Zone not found', 404, 'NOT_FOUND'));
  res.status(200).json({ status: 'success', data: { zone } });
};

exports.updateZone = async (req, res, next) => {
  const { name, description, radius, address, schedules, alertOnExit, alertOnEntry, isActive, coordinates } = req.body;
  const updates = { name, description, radius, address, schedules, alertOnExit, alertOnEntry, isActive };
  if (coordinates) updates.location = { type: 'Point', coordinates };
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const zone = await SafeZone.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id || req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!zone) return next(new AppError('Zone not found', 404, 'NOT_FOUND'));
  res.status(200).json({ status: 'success', data: { zone } });
};

exports.deleteZone = async (req, res, next) => {
  const zone = await SafeZone.findOneAndDelete({ _id: req.params.id, user: req.user._id || req.user.id });
  if (!zone) return next(new AppError('Zone not found', 404, 'NOT_FOUND'));
  res.status(204).json({ status: 'success', data: null });
};

exports.getNearbyZones = async (req, res) => {
  const { lng, lat, radius = 5000 } = req.query;
  const zones = await SafeZone.find({
    user: req.user._id || req.user.id, // scoped to the requesting user — see step notes
    location: {
      $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius, 10) },
    },
    isActive: true,
  }).limit(20).lean();
  res.status(200).json({ status: 'success', data: { zones } });
};