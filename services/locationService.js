const axios = require('axios');
const { getOrSet, makeKey, TTL } = require('../utils/cache');

const OWM_BASE = 'https://api.openweathermap.org';
const GEOCODE_BASE = `${OWM_BASE}/geo/1.0`;

/**
 * Local city dictionary for fast, reliable geocoding fallbacks
 */
const CITY_DATABASE = {
  'madhepura': { city: 'Madhepura', district: 'Madhepura', state: 'Bihar', lat: 25.9167, lon: 87.0833 },
  'patna': { city: 'Patna', district: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  'gaya': { city: 'Gaya', district: 'Gaya', state: 'Bihar', lat: 24.7914, lon: 85.0002 },
  'muzaffarpur': { city: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647 },
  'bhagalpur': { city: 'Bhagalpur', district: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lon: 86.9842 },
  'purnia': { city: 'Purnia', district: 'Purnia', state: 'Bihar', lat: 25.7771, lon: 87.4753 },
  'saharsa': { city: 'Saharsa', district: 'Saharsa', state: 'Bihar', lat: 25.8833, lon: 86.6000 },
  'darbhanga': { city: 'Darbhanga', district: 'Darbhanga', state: 'Bihar', lat: 26.1542, lon: 85.8918 },
  'delhi': { city: 'Delhi', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  'new delhi': { city: 'New Delhi', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  'mumbai': { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  'lucknow': { city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  'varanasi': { city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  'kanpur': { city: 'Kanpur', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  'jaipur': { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  'bhopal': { city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  'ranchi': { city: 'Ranchi', district: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  'kolkata': { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  'bengaluru': { city: 'Bengaluru', district: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  'hyderabad': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  'chandigarh': { city: 'Chandigarh', district: 'Chandigarh', state: 'Punjab', lat: 30.7333, lon: 76.7794 },
};

/**
 * Normalize state name to standard Indian format
 */
const normalizeState = (name = '') => {
  const map = {
    'up': 'Uttar Pradesh', 'mp': 'Madhya Pradesh', 'hp': 'Himachal Pradesh',
    'wb': 'West Bengal', 'ap': 'Andhra Pradesh', 'tn': 'Tamil Nadu',
    'jk': 'Jammu and Kashmir', 'uk': 'Uttarakhand', 'pb': 'Punjab',
    'hr': 'Haryana', 'rj': 'Rajasthan', 'mh': 'Maharashtra',
  };
  const key = name.toLowerCase().trim();
  return map[key] || name.trim();
};

/**
 * Lookup fallback city data
 */
const getLocalCityFallback = (cityName = 'Madhepura') => {
  const key = cityName.toLowerCase().trim();
  if (CITY_DATABASE[key]) return { ...CITY_DATABASE[key] };
  return {
    city: cityName,
    district: cityName,
    state: 'Bihar',
    lat: 25.9167,
    lon: 87.0833,
  };
};

/**
 * Forward geocode: city name → { city, district, state, lat, lon }
 */
const geocodeCity = async (cityName = 'Madhepura') => {
  const key = makeKey('geocode:city', cityName);
  return getOrSet(key, async () => {
    const apiKey = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      return getLocalCityFallback(cityName);
    }
    try {
      const res = await axios.get(`${GEOCODE_BASE}/direct`, {
        params: { q: `${cityName},IN`, limit: 1, appid: apiKey },
        timeout: 5000,
      });
      const [r] = res.data || [];
      if (!r) return getLocalCityFallback(cityName);
      return {
        city: r.name,
        district: r.state_district || r.name,
        state: normalizeState(r.state || 'Bihar'),
        lat: r.lat,
        lon: r.lon,
      };
    } catch {
      return getLocalCityFallback(cityName);
    }
  }, TTL.GEOCODE);
};

/**
 * Reverse geocode: lat/lon → { city, district, state, lat, lon }
 */
const reverseGeocode = async (lat, lon) => {
  const key = makeKey('geocode:reverse', parseFloat(lat).toFixed(2), parseFloat(lon).toFixed(2));
  return getOrSet(key, async () => {
    const apiKey = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      return { city: 'Madhepura', district: 'Madhepura', state: 'Bihar', lat: Number(lat), lon: Number(lon) };
    }
    try {
      const res = await axios.get(`${GEOCODE_BASE}/reverse`, {
        params: { lat, lon, limit: 1, appid: apiKey },
        timeout: 5000,
      });
      const [r] = res.data || [];
      if (!r) return { city: 'Madhepura', district: 'Madhepura', state: 'Bihar', lat: Number(lat), lon: Number(lon) };
      return {
        city: r.name || 'Madhepura',
        district: r.state_district || r.name || 'Madhepura',
        state: normalizeState(r.state || 'Bihar'),
        lat: Number(lat),
        lon: Number(lon),
      };
    } catch {
      return { city: 'Madhepura', district: 'Madhepura', state: 'Bihar', lat: Number(lat), lon: Number(lon) };
    }
  }, TTL.GEOCODE);
};

/**
 * Haversine distance between two points in km
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { geocodeCity, reverseGeocode, normalizeState, haversineDistance, getLocalCityFallback };
