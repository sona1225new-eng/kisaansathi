const express = require('express');
const optionalAuth = require('../middleware/optionalAuth');
const {
  resolveLocation,
  getWeather,
  getForecast,
  getMandi,
  getSchemes,
  getCrops,
  getDiseaseAlerts,
  getNews,
  getKVKs,
  getCalendar,
  getFullData,
} = require('../controllers/locationController');

const router = express.Router();

// All routes are publicly accessible (optionalAuth adds user context if logged in)
router.get('/resolve', optionalAuth, resolveLocation);
router.get('/weather', optionalAuth, getWeather);
router.get('/forecast', optionalAuth, getForecast);
router.get('/mandi', optionalAuth, getMandi);
router.get('/schemes', optionalAuth, getSchemes);
router.get('/crops', optionalAuth, getCrops);
router.get('/disease-alerts', optionalAuth, getDiseaseAlerts);
router.get('/news', optionalAuth, getNews);
router.get('/kvks', optionalAuth, getKVKs);
router.get('/calendar', optionalAuth, getCalendar);
router.get('/full', optionalAuth, getFullData);

module.exports = router;
