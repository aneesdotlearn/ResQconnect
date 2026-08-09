'use strict';

const User = require('../../../models/User');
const { SafeZone } = require('../../../models/index');
const { cacheSet, cacheGet } = require('../../../config/redis');
const { emitToUser } = require('../../../config/socket');
const { addNotificationJob } = require('../../../queues');
const { getDistance } = require('geolib');

exports.updateLocation = async (req, res, next) => {
  const userId = (req.user._id || req.user.id).toString();
  const { coordinates, accuracy } = req.body;
  const [lng, lat] = coordinates;

  await User.findByIdAndUpdate(userId, {
    $set: {
      lastLocation: {
        type: 'Point',
        coordinates,
        accuracy,
        updatedAt: new Date(),
      },
    },
  });

  await cacheSet(`location:${userId}`, { coordinates, accuracy, updatedAt: new Date() }, 300);

  emitToUser(userId, 'location:updated', { coordinates, accuracy, updatedAt: new Date() });

  await checkSafeZoneBoundaries(userId, lat, lng);

  res.status(200).json({ status: 'success', data: { coordinates, accuracy } });
};

exports.getLiveLocation = async (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const cached = await cacheGet(`location:${userId}`);
  if (cached) return res.status(200).json({ status: 'success', data: { location: cached, source: 'cache' } });

  const user = await User.findById(userId).select('lastLocation').lean();
  res.status(200).json({ status: 'success', data: { location: user?.lastLocation || null, source: 'db' } });
};

exports.getLocationHistory = async (req, res) => {
  // Note: no dedicated time-series collection for location history exists yet —
  // this returns the last known point from the user document as a placeholder.
  // A real history feed would need its own collection with TTL-indexed points.
  const user = await User.findById(req.user._id || req.user.id).select('lastLocation').lean();
  res.status(200).json({ status: 'success', data: { location: user?.lastLocation || null } });
};

async function checkSafeZoneBoundaries(userId, lat, lng) {
  const zones = await SafeZone.find({ user: userId, isActive: true }).lean();
  for (const zone of zones) {
    const [zoneLng, zoneLat] = zone.location.coordinates;
    const distance = getDistance(
      { latitude: lat, longitude: lng },
      { latitude: zoneLat, longitude: zoneLng }
    );

    const cacheKey = `zone_status:${userId}:${zone._id}`;
    const prevStatus = await cacheGet(cacheKey);
    const insideNow = distance <= zone.radius;
    const wasInside = prevStatus?.inside ?? null;

    await cacheSet(cacheKey, { inside: insideNow }, 3600);

    if (wasInside === true && !insideNow && zone.alertOnExit) {
      addNotificationJob({
        userId,
        title: 'Safe Zone Exit',
        body: `You have left safe zone: ${zone.name}`,
        type: 'zone_alert',
        data: { zoneId: zone._id, zoneName: zone.name },
      }).catch(() => {});
      emitToUser(userId, 'zone:exit', { zoneId: zone._id, zoneName: zone.name });
    } else if (wasInside === false && insideNow && zone.alertOnEntry) {
      addNotificationJob({
        userId,
        title: 'Safe Zone Entry',
        body: `You have entered safe zone: ${zone.name}`,
        type: 'zone_alert',
        data: { zoneId: zone._id, zoneName: zone.name },
      }).catch(() => {});
      emitToUser(userId, 'zone:entry', { zoneId: zone._id, zoneName: zone.name });
    }
  }
}