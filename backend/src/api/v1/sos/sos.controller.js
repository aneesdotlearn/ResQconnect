'use strict';

const SOS = require('../../../models/SOS');
const { Contact } = require('../../../models/index');
const AppError = require('../../../utils/AppError');
const { emitToUser, emitToZone } = require('../../../config/socket');
const { aiRiskAnalysis } = require('../../../services/ai.service');
const { reverseGeocode } = require('../../../services/location.service');
const { sendSMS } = require('../../../services/sms.service');
const { sendEmail } = require('../../../services/email.service');
// const { createInAppNotification } = require('../../../services/notification.service');
const logger = require('../../../utils/logger');

exports.triggerSOS = async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const { coordinates, accuracy, triggerMethod = 'button', deviceInfo } = req.body;

  let address = null;
  try { address = await reverseGeocode(coordinates[1], coordinates[0]); }
  catch (e) { logger.warn('Reverse geocode failed:', e.message); }

  let risk = { score: 50, factors: [], confidence: null, level: 'medium', model: null };
  try {
    risk = await aiRiskAnalysis({ userId, coordinates, time: new Date() });
  } catch (e) {
    logger.warn('Risk analysis failed:', e.message);
  }

  const sos = await SOS.create({
    user: userId,
    triggerMethod,
    location: { type: 'Point', coordinates, accuracy, address },
    locationHistory: [{ coordinates, accuracy, timestamp: new Date() }],
    aiRiskScore:   risk.score,
    aiRiskFactors: risk.factors,
    aiConfidence:  risk.confidence,
    aiLevel:       risk.level,
    aiModel:       risk.model,
    deviceInfo,
  });

  const contacts = await Contact.find({ user: userId, 'notifyOn.sos': true })
    .sort({ priority: 1 }).limit(5).lean();

  const trackUrl = `${process.env.CLIENT_URL}/track/${sos._id}`;
  const notifiedContacts = [];

  for (const contact of contacts) {
    sendSMS({
      to: contact.phone,
      message: `EMERGENCY: ${req.user.name} triggered SOS at ${address || `${coordinates[1]}, ${coordinates[0]}`}. Track: ${trackUrl}`,
    }).catch((e) => logger.error(`SOS SMS failed for contact ${contact._id}:`, e.message));

    if (contact.email) {
      sendEmail({
        to: contact.email,
        template: 'sos-alert',
        data: { contactName: contact.name, userName: req.user.name, address, coordinates, sosId: sos._id, trackUrl },
      }).catch((e) => logger.error(`SOS email failed for contact ${contact._id}:`, e.message));
    }
    notifiedContacts.push({ contact: contact._id, notifiedAt: new Date(), method: 'sms', status: 'sent' });
  }

  await SOS.findByIdAndUpdate(sos._id, { $set: { notifiedContacts } });

  emitToUser(userId.toString(), 'sos:triggered', {
    sosId: sos._id, location: sos.location,
    aiRiskScore: risk.score, aiRiskFactors: risk.factors, aiConfidence: risk.confidence,
    aiLevel: risk.level, aiModel: risk.model,
  });

//   createInAppNotification({
//     userId,
//     title: 'SOS Alert Sent',
//     body: `Emergency alert sent to ${contacts.length} contact(s) - Risk: ${risk.score}/100 (${risk.level})`,
//     type: 'sos',
//     data: { sosId: sos._id },
//   }).catch((e) => logger.error('In-app notification failed:', e.message));

  res.status(201).json({
    status: 'success',
    message: 'SOS alert triggered',
    data: {
      sosId: sos._id,
      notifiedContacts: contacts.length,
      aiRiskScore: risk.score, aiRiskFactors: risk.factors, aiConfidence: risk.confidence,
      aiLevel: risk.level, aiModel: risk.model,
    },
  });
};

exports.updateLocation = async (req, res, next) => {
  const { sosId } = req.params;
  const { coordinates, accuracy } = req.body;
  const userId = req.user._id || req.user.id;

  const sos = await SOS.findOne({ _id: sosId, user: userId, status: 'active' });
  if (!sos) return next(new AppError('Active SOS not found', 404, 'NOT_FOUND'));

  sos.location.coordinates = coordinates;
  sos.location.accuracy    = accuracy;
  sos.locationHistory.push({ coordinates, accuracy, timestamp: new Date() });
  await sos.save();

  emitToZone(`sos:${sosId}`, 'sos:location_update', { sosId, coordinates, accuracy, timestamp: new Date() });

  res.status(200).json({ status: 'success', data: { coordinates, accuracy } });
};

exports.resolveSOS = async (req, res, next) => {
  const { sosId } = req.params;
  const userId = req.user._id || req.user.id;
  const { resolutionNote, isFalseAlarm } = req.body;

  const sos = await SOS.findOne({ _id: sosId, user: userId });
  if (!sos) return next(new AppError('SOS not found', 404, 'NOT_FOUND'));
  if (sos.status !== 'active') return next(new AppError('SOS is not active', 400, 'INVALID_STATE'));

  sos.status         = isFalseAlarm ? 'false_alarm' : 'resolved';
  sos.resolvedAt     = new Date();
  sos.resolvedBy     = userId;
  sos.resolutionNote = resolutionNote;
  await sos.save();

  emitToUser(userId.toString(), 'sos:resolved', { sosId, status: sos.status });
  emitToZone(`sos:${sosId}`,   'sos:resolved', { sosId, status: sos.status });

  res.status(200).json({ status: 'success', message: 'SOS resolved', data: { status: sos.status } });
};

exports.getSOSHistory = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const page  = Math.max(parseInt(req.query.page,  10) || 1,   1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    SOS.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('status triggerMethod location aiRiskScore aiRiskFactors aiConfidence aiLevel aiModel createdAt resolvedAt')
      .lean(),
    SOS.countDocuments({ user: userId }),
  ]);

  res.status(200).json({ status: 'success', data: { sos: data, total, page, pages: Math.ceil(total / limit) } });
};

exports.getActiveSOSForContact = async (req, res, next) => {
  const sos = await SOS.findById(req.params.sosId)
    .select('location locationHistory status createdAt user aiRiskScore aiLevel')
    .populate('user', 'name phone avatar')
    .lean();
  if (!sos) return next(new AppError('SOS not found', 404, 'NOT_FOUND'));
  res.status(200).json({ status: 'success', data: { sos } });
};

exports.getActiveSOS = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const sos = await SOS.findOne({ user: userId, status: 'active' }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ status: 'success', data: { sos: sos || null } });
};