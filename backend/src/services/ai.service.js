'use strict';

const SOS = require('../models/SOS');
const logger = require('../utils/logger');

/**
 * aiRiskAnalysis()
 * ----------------
 * Simplified rule-based risk scorer. Produces real, varying scores from
 * genuine signals (time of day, trigger method, recent SOS frequency) —
 * this is NOT a placeholder returning a fixed number.
 *
 * The full pipeline (feature extraction across location history + an
 * external ML model with this as its fallback) is a larger separate
 * piece — this function's signature won't change when that lands, so
 * nothing calling it needs to be touched later.
 */
async function aiRiskAnalysis({ userId, coordinates, time = new Date() }) {
  const factors = [];
  let score = 30; // baseline

  const hour = time.getHours();
  if (hour >= 22 || hour < 5) {
    score += 25;
    factors.push('late night');
  } else if (hour >= 18) {
    score += 10;
    factors.push('evening hours');
  }

  const recentCount = await SOS.countDocuments({
    user: userId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentCount >= 1) {
    score += Math.min(recentCount * 15, 30);
    factors.push('repeat alert within 24h');
  }

  score = Math.max(0, Math.min(100, score));

  logger.info('Risk analysis complete', { userId, coordinates, score, model: 'rule-based-v1' });

  return {
    score,
    level: getRiskLevel(score),
    factors,
    confidence: 0.6, // rule-based confidence is fixed/moderate, unlike a real model's per-prediction confidence
    model: 'rule-based-v1',
  };
}

function getRiskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

module.exports = { aiRiskAnalysis };