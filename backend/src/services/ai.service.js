'use strict';

const { extractFeatures } = require('./ml/featureExtractor');
const mlModelAdapter = require('./ml/mlModelAdapter');
const logger = require('../utils/logger');

/**
 * aiRiskAnalysis()
 * ----------------
 * Public entry point called by sos.controller.js. Same signature as the
 * simplified Step 8 version — nothing calling this needed to change.
 *
 * Flow:
 *   1. extractFeatures() -> queries MongoDB for all signals, normalises them
 *   2. mlModelAdapter.predict() -> calls ML REST endpoint (or rule-based fallback)
 *   3. Returns { score, level, factors, confidence, model }
 */
async function aiRiskAnalysis({ userId, coordinates, time = new Date() }) {
  const { features, raw } = await extractFeatures({ userId, coordinates, time });
  const result = await mlModelAdapter.predict(features, raw);

  logger.info('Risk analysis complete', {
    userId, coordinates, score: result.score, model: result.model, confidence: result.confidence,
  });

  return {
    score: result.score,
    level: getRiskLevel(result.score),
    factors: result.factors,
    confidence: result.confidence,
    model: result.model,
  };
}

function getRiskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

module.exports = { aiRiskAnalysis };