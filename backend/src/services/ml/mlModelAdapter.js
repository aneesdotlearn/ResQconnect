'use strict';

const axios = require('axios');
const logger = require('../../utils/logger');
const ruleBasedModel = require('./ruleBasedModel');

/**
 * MLModelAdapter
 * --------------
 * Sends the feature vector to an external ML microservice, if configured.
 * Falls back to ruleBasedModel automatically on:
 *   - connection refused (service not running)
 *   - timeout (> ML_MODEL_TIMEOUT_MS)
 *   - non-200 response / invalid payload
 *   - any unexpected error
 *
 * Expected contract: POST <ML_MODEL_URL>/predict
 *   Request:  { "features": { ...all keys from featureExtractor.js } }
 *   Response: { "score": 0-100, "confidence": 0-1, "factors": [...], "model_version": "..." }
 */
class MLModelAdapter {
  constructor() {
    this.url     = process.env.ML_MODEL_URL || null;
    this.timeout = parseInt(process.env.ML_MODEL_TIMEOUT_MS, 10) || 3000;
    this.apiKey  = process.env.ML_MODEL_API_KEY || null;
    this.enabled = !!this.url;

    if (this.enabled) {
      logger.info(`ML model adapter ready -> ${this.url} (timeout: ${this.timeout}ms)`);
    } else {
      logger.info('ML_MODEL_URL not set - using rule-based fallback');
    }
  }

  async predict(features, raw) {
    if (!this.enabled) {
      return ruleBasedModel.predict(features, raw);
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const response = await axios.post(`${this.url}/predict`, { features }, { timeout: this.timeout, headers });
      const { score, confidence = 0.9, factors = [], model_version } = response.data;

      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new Error(`ML service returned invalid score: ${score}`);
      }

      logger.debug(`ML prediction: score=${score} confidence=${confidence} model=${model_version}`);

      return {
        score: Math.round(score),
        confidence,
        factors: Array.isArray(factors) ? factors : [],
        model: `ml-service@${model_version || 'unknown'}`,
      };
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      const isRefused = err.code === 'ECONNREFUSED';

      logger.warn(
        `ML model ${isTimeout ? 'timed out' : isRefused ? 'unreachable' : 'error'} -> falling back to rule-based`,
        { error: err.message, url: this.url }
      );

      const result = ruleBasedModel.predict(features, raw);
      return { ...result, model: `${result.model}+fallback` };
    }
  }
}

module.exports = new MLModelAdapter();