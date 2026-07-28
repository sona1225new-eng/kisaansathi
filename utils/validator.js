/**
 * Request parameter validation utilities
 */

const validateLatLon = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
};

const sanitizeString = (str = '', defaultValue = '') => {
  if (typeof str !== 'string') return defaultValue;
  return str.trim() || defaultValue;
};

const clampMonth = (month) => {
  const parsed = parseInt(month, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 12) {
    return new Date().getMonth() + 1;
  }
  return parsed;
};

module.exports = {
  validateLatLon,
  sanitizeString,
  clampMonth,
};
