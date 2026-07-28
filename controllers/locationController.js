const {
  getWeatherByCoords, getWeather,
  get7DayForecast,
  getMandiPricesReal,
  getGovernmentSchemesFiltered,
  getCropRecommendations,
  getCropDiseaseAlerts,
  getAgricultureNewsLocalized,
  getNearbyKVKs,
  getSeasonalCalendar,
  getFullLocationData,
} = require('../services/externalApis');
const { geocodeCity, reverseGeocode, getLocalCityFallback } = require('../services/locationService');
const { sendSuccess, sendError, sendCached } = require('../utils/apiResponse');
const { get, set, makeKey, TTL } = require('../utils/cache');

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getCurrentMonth = () => new Date().getMonth() + 1;

const extractParams = (req) => {
  const { lat, lon, city, state = 'Bihar', district = '', month } = req.query;
  const parsedLat = lat !== undefined && lat !== '' && !isNaN(parseFloat(lat)) ? parseFloat(lat) : null;
  const parsedLon = lon !== undefined && lon !== '' && !isNaN(parseFloat(lon)) ? parseFloat(lon) : null;

  return {
    lat: parsedLat,
    lon: parsedLon,
    city: city ? String(city).trim() : '',
    state: state ? String(state).trim() : 'Bihar',
    district: district ? String(district).trim() : (city ? String(city).trim() : ''),
    month: month ? parseInt(month, 10) : getCurrentMonth(),
  };
};

// ─── Resolve location ─────────────────────────────────────────────────────────

/**
 * GET /api/location/resolve?lat=&lon= OR ?city=
 * Returns normalized location metadata
 */
exports.resolveLocation = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    let location;
    if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
      location = await reverseGeocode(parseFloat(lat), parseFloat(lon));
    } else if (city) {
      location = await geocodeCity(String(city).trim());
    } else {
      location = getLocalCityFallback('Madhepura');
    }
    return sendSuccess(res, location);
  } catch (err) {
    return sendSuccess(res, getLocalCityFallback('Madhepura'));
  }
};

// ─── Current Weather ─────────────────────────────────────────────────────────

/**
 * GET /api/location/weather?lat=&lon= OR ?city=
 */
exports.getWeather = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    const cacheKey = lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))
      ? makeKey('weather:coords', parseFloat(lat).toFixed(2), parseFloat(lon).toFixed(2))
      : makeKey('weather:city', city || 'Madhepura');

    const cached = get(cacheKey);
    const data = cached
      ? cached
      : (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))
          ? await getWeatherByCoords(parseFloat(lat), parseFloat(lon))
          : await getWeather(city || 'Madhepura'));

    return sendCached(res, data, TTL.WEATHER, !!cached);
  } catch (err) {
    const fallback = await getWeather(req.query.city || 'Madhepura');
    return sendCached(res, fallback, TTL.WEATHER);
  }
};

// ─── 7-Day Forecast ───────────────────────────────────────────────────────────

/**
 * GET /api/location/forecast?lat=&lon=
 */
exports.getForecast = async (req, res) => {
  try {
    const { lat = 25.9167, lon = 87.0833 } = req.query;
    const parsedLat = !isNaN(parseFloat(lat)) ? parseFloat(lat) : 25.9167;
    const parsedLon = !isNaN(parseFloat(lon)) ? parseFloat(lon) : 87.0833;
    const data = await get7DayForecast(parsedLat, parsedLon);
    return sendCached(res, data, TTL.FORECAST);
  } catch (err) {
    const fallback = await get7DayForecast(25.9167, 87.0833);
    return sendCached(res, fallback, TTL.FORECAST);
  }
};

// ─── Mandi Prices ─────────────────────────────────────────────────────────────

/**
 * GET /api/location/mandi?state=&district=
 */
exports.getMandi = async (req, res) => {
  try {
    const { state = 'Bihar', district = '' } = req.query;
    const data = await getMandiPricesReal(state, district);
    return sendCached(res, data, TTL.MANDI);
  } catch (err) {
    const fallback = await getMandiPricesReal('Bihar', 'Madhepura');
    return sendCached(res, fallback, TTL.MANDI);
  }
};

// ─── Government Schemes ───────────────────────────────────────────────────────

/**
 * GET /api/location/schemes?state=
 */
exports.getSchemes = async (req, res) => {
  try {
    const { state = 'Bihar' } = req.query;
    const data = await getGovernmentSchemesFiltered(state);
    return sendCached(res, data, TTL.STATIC);
  } catch (err) {
    const fallback = await getGovernmentSchemesFiltered('Bihar');
    return sendCached(res, fallback, TTL.STATIC);
  }
};

// ─── Crop Recommendations ─────────────────────────────────────────────────────

/**
 * GET /api/location/crops?state=&month=
 */
exports.getCrops = async (req, res) => {
  try {
    const { state = 'Bihar', month } = req.query;
    const data = await getCropRecommendations(state, month || getCurrentMonth());
    return sendCached(res, data, TTL.STATIC);
  } catch (err) {
    const fallback = await getCropRecommendations('Bihar', getCurrentMonth());
    return sendCached(res, fallback, TTL.STATIC);
  }
};

// ─── Disease Alerts ───────────────────────────────────────────────────────────

/**
 * GET /api/location/disease-alerts?state=&month=
 */
exports.getDiseaseAlerts = async (req, res) => {
  try {
    const { state = 'Bihar', month } = req.query;
    const data = await getCropDiseaseAlerts(state, month || getCurrentMonth());
    return sendCached(res, data, TTL.STATIC);
  } catch (err) {
    const fallback = await getCropDiseaseAlerts('Bihar', getCurrentMonth());
    return sendCached(res, fallback, TTL.STATIC);
  }
};

// ─── Localized News ───────────────────────────────────────────────────────────

/**
 * GET /api/location/news?state=
 */
exports.getNews = async (req, res) => {
  try {
    const { state = 'Bihar' } = req.query;
    const data = await getAgricultureNewsLocalized(state);
    return sendCached(res, data, TTL.NEWS);
  } catch (err) {
    const fallback = await getAgricultureNewsLocalized('Bihar');
    return sendCached(res, fallback, TTL.NEWS);
  }
};

// ─── Nearby KVKs ─────────────────────────────────────────────────────────────

/**
 * GET /api/location/kvks?lat=&lon=&limit=
 */
exports.getKVKs = async (req, res) => {
  try {
    const { lat = 25.9167, lon = 87.0833, limit = 5 } = req.query;
    const parsedLat = !isNaN(parseFloat(lat)) ? parseFloat(lat) : 25.9167;
    const parsedLon = !isNaN(parseFloat(lon)) ? parseFloat(lon) : 87.0833;
    const data = await getNearbyKVKs(parsedLat, parsedLon, parseInt(limit, 10) || 5);
    return sendCached(res, data, TTL.STATIC);
  } catch (err) {
    const fallback = await getNearbyKVKs(25.9167, 87.0833, 5);
    return sendCached(res, fallback, TTL.STATIC);
  }
};

// ─── Seasonal Calendar ────────────────────────────────────────────────────────

/**
 * GET /api/location/calendar?state=&month=
 */
exports.getCalendar = async (req, res) => {
  try {
    const { state = 'Bihar', month } = req.query;
    const data = await getSeasonalCalendar(state, month || getCurrentMonth());
    return sendCached(res, data, TTL.STATIC);
  } catch (err) {
    const fallback = await getSeasonalCalendar('Bihar', getCurrentMonth());
    return sendCached(res, fallback, TTL.STATIC);
  }
};

// ─── Full Data (all-in-one endpoint) ──────────────────────────────────────────

/**
 * GET /api/location/full?lat=&lon= OR ?city=
 * Returns all location-specific data in one request
 */
exports.getFullData = async (req, res) => {
  try {
    const params = extractParams(req);

    // If city is provided without coords, resolve city coords
    if (!params.lat && params.city) {
      try {
        const resolved = await geocodeCity(params.city);
        params.lat = resolved.lat;
        params.lon = resolved.lon;
        if (!req.query.state) params.state = resolved.state;
        if (!req.query.district) params.district = resolved.district || params.city;
      } catch {
        const fallback = getLocalCityFallback(params.city);
        params.lat = fallback.lat;
        params.lon = fallback.lon;
        params.state = fallback.state;
        params.district = fallback.district;
      }
    }

    // Default coordinates if still missing
    if (!params.lat || !params.lon) {
      params.lat = 25.9167;
      params.lon = 87.0833;
      if (!params.city) params.city = 'Madhepura';
    }

    // If lat/lon provided without custom state, reverse geocode
    if (params.lat && params.lon && (!req.query.state || req.query.state === 'Bihar')) {
      try {
        const resolved = await reverseGeocode(params.lat, params.lon);
        params.state = resolved.state || params.state;
        params.district = resolved.district || resolved.city || params.district;
        if (!params.city) params.city = resolved.city;
      } catch {
        // keep defaults
      }
    }

    const data = await getFullLocationData(params);
    const responsePayload = {
      ...data,
      resolvedLocation: {
        lat: params.lat,
        lon: params.lon,
        city: params.city || 'Madhepura',
        state: params.state || 'Bihar',
        district: params.district || params.city || 'Madhepura',
      },
    };

    return sendCached(res, responsePayload, TTL.WEATHER);
  } catch (err) {
    // Fallback payload to ensure 0 failures
    const fallbackParams = { lat: 25.9167, lon: 87.0833, city: 'Madhepura', state: 'Bihar', district: 'Madhepura', month: getCurrentMonth() };
    const data = await getFullLocationData(fallbackParams);
    return sendCached(res, {
      ...data,
      resolvedLocation: { lat: 25.9167, lon: 87.0833, city: 'Madhepura', state: 'Bihar', district: 'Madhepura' },
    }, TTL.WEATHER);
  }
};
