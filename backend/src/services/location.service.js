'use strict';

const axios = require('axios');

/**
 * Reverse geocode using OpenStreetMap Nominatim (no API key required).
 * In production, swap for a paid provider (Google Maps, HERE, etc.) for
 * higher rate limits and reliability.
 */
async function reverseGeocode(lat, lng) {
  const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
    params: { lat, lon: lng, format: 'json', addressdetails: 1 },
    headers: { 'User-Agent': 'ResQconnect-App/1.0' },
    timeout: 5000,
  });
  return response.data.display_name || null;
}

module.exports = { reverseGeocode };