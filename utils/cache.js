const NodeCache = require('node-cache');

// TTL constants (in seconds)
const TTL = {
  WEATHER: 30 * 60,       // 30 minutes
  FORECAST: 60 * 60,      // 1 hour
  MANDI: 60 * 60,         // 1 hour
  NEWS: 2 * 60 * 60,      // 2 hours
  SCHEMES: 24 * 60 * 60,  // 24 hours
  STATIC: 24 * 60 * 60,   // 24 hours (crops, KVKs, calendar, disease alerts)
  GEOCODE: 12 * 60 * 60,  // 12 hours
};

const cache = new NodeCache({ stdTTL: TTL.WEATHER, checkperiod: 120, useClones: false });

/**
 * Get a value from cache
 * @param {string} key
 * @returns {any|undefined}
 */
const get = (key) => cache.get(key);

/**
 * Set a value in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - TTL in seconds
 */
const set = (key, value, ttl) => cache.set(key, value, ttl);

/**
 * Delete a cache entry
 * @param {string} key
 */
const del = (key) => cache.del(key);

/**
 * Get or compute and cache a value
 * @param {string} key
 * @param {Function} fn - async function to compute value
 * @param {number} ttl - TTL in seconds
 * @returns {Promise<any>}
 */
const getOrSet = async (key, fn, ttl) => {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  set(key, value, ttl);
  return value;
};

/**
 * Build a cache key from parts
 * @param {...string} parts
 * @returns {string}
 */
const makeKey = (...parts) => parts.map(p => String(p).toLowerCase().replace(/\s+/g, '_')).join(':');

module.exports = { get, set, del, getOrSet, makeKey, TTL };
