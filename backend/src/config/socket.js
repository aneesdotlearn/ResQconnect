'use strict';

const logger = require('../utils/logger');

// Placeholder until the real Socket.IO server is wired into server.js.
// Signatures match what the real implementation will expose, so no
// caller needs to change when that step lands.

function emitToUser(userId, event, payload) {
  logger.debug(`[socket stub] emitToUser(${userId}, ${event}) — no-op until Socket.IO is wired up`);
}

function emitToZone(zone, event, payload) {
  logger.debug(`[socket stub] emitToZone(${zone}, ${event}) — no-op until Socket.IO is wired up`);
}

module.exports = { emitToUser, emitToZone };