const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const sendError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

/**
 * Send a cached response with cache-control headers
 * @param {object} res - Express response
 * @param {any} data - response data
 * @param {number} maxAge - cache max-age in seconds
 * @param {boolean} fromCache - whether data came from server cache
 */
const sendCached = (res, data, maxAge = 300, fromCache = false) => {
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  return res.status(200).json({ success: true, data });
};

module.exports = { sendSuccess, sendError, sendCached };
