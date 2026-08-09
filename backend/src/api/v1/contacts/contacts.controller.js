'use strict';

const { Contact } = require('../../../models/index');
const AppError = require('../../../utils/AppError');

// Only these fields are ever settable by the client. isVerified, verificationToken,
// and user are server-managed and must never come from req.body directly.
const WRITABLE_FIELDS = ['name', 'phone', 'email', 'relationship', 'priority', 'notifyOn'];

function pickWritableFields(body) {
  const updates = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  return updates;
}

exports.addContact = async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const count = await Contact.countDocuments({ user: userId });
  if (count >= 10) return next(new AppError('Maximum 10 emergency contacts allowed', 400, 'LIMIT_EXCEEDED'));

  const contact = await Contact.create({ ...pickWritableFields(req.body), user: userId });
  res.status(201).json({ status: 'success', data: { contact } });
};

exports.getContacts = async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id || req.user.id }).sort({ priority: 1 }).lean();
  res.status(200).json({ status: 'success', data: { contacts } });
};

exports.updateContact = async (req, res, next) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id || req.user.id },
    { $set: pickWritableFields(req.body) },
    { new: true, runValidators: true }
  );
  if (!contact) return next(new AppError('Contact not found', 404, 'NOT_FOUND'));
  res.status(200).json({ status: 'success', data: { contact } });
};

exports.deleteContact = async (req, res, next) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id || req.user.id });
  if (!contact) return next(new AppError('Contact not found', 404, 'NOT_FOUND'));
  res.status(204).json({ status: 'success', data: null });
};