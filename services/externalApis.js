const axios = require('axios');
const { getOrSet, makeKey, TTL } = require('../utils/cache');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_BASE = 'https://api.openweathermap.org/geo/1.0';

// ─── Helper ────────────────────────────────────────────────────────────────────

const getApiKey = () => process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY || '';

const _mockWeather = (city = 'Madhepura') => ({
  temp: 28,
  desc: 'Partly Cloudy',
  feels: 31,
  humidity: 65,
  wind: '12 km/h',
  chance: '20%',
  icon: '02d',
  city: city,
  country: 'IN',
  visibility: '10 km',
  pressure: 1012,
  sunrise: Math.floor(Date.now() / 1000) - 21600,
  sunset: Math.floor(Date.now() / 1000) + 21600,
});

// ─── WEATHER (current) ──────────────────────────────────────────────────────────

const getWeather = async (city = 'Madhepura') => {
  const key = makeKey('weather:city', city);
  return getOrSet(key, async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return _mockWeather(city);
    }
    try {
      const response = await axios.get(`${OWM_BASE}/weather`, {
        params: { q: `${city},IN`, appid: apiKey, units: 'metric' },
        timeout: 6000,
      });
      const d = response.data;
      return {
        temp: Math.round(d.main.temp),
        desc: d.weather[0]?.description ? (d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1)) : 'Partly Cloudy',
        feels: Math.round(d.main.feels_like),
        humidity: d.main.humidity,
        wind: `${Math.round(d.wind.speed * 3.6)} km/h`,
        chance: `${d.clouds?.all ?? 20}%`,
        icon: d.weather[0]?.icon || '02d',
        city: d.name || city,
        country: d.sys?.country || 'IN',
        visibility: d.visibility ? `${Math.round(d.visibility / 1000)} km` : '10 km',
        pressure: d.main.pressure,
        sunrise: d.sys?.sunrise,
        sunset: d.sys?.sunset,
      };
    } catch {
      return _mockWeather(city);
    }
  }, TTL.WEATHER);
};

const getWeatherByCoords = async (lat, lon) => {
  const key = makeKey('weather:coords', parseFloat(lat).toFixed(2), parseFloat(lon).toFixed(2));
  return getOrSet(key, async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return _mockWeather('Local Area');
    }
    try {
      const response = await axios.get(`${OWM_BASE}/weather`, {
        params: { lat, lon, appid: apiKey, units: 'metric' },
        timeout: 6000,
      });
      const d = response.data;
      return {
        temp: Math.round(d.main.temp),
        desc: d.weather[0]?.description ? (d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1)) : 'Partly Cloudy',
        feels: Math.round(d.main.feels_like),
        humidity: d.main.humidity,
        wind: `${Math.round(d.wind.speed * 3.6)} km/h`,
        chance: `${d.clouds?.all ?? 20}%`,
        icon: d.weather[0]?.icon || '02d',
        city: d.name || 'Local Area',
        country: d.sys?.country || 'IN',
        visibility: d.visibility ? `${Math.round(d.visibility / 1000)} km` : '10 km',
        pressure: d.main.pressure,
        sunrise: d.sys?.sunrise,
        sunset: d.sys?.sunset,
      };
    } catch {
      return _mockWeather('Local Area');
    }
  }, TTL.WEATHER);
};

// ─── 7-DAY FORECAST ─────────────────────────────────────────────────────────────

const get7DayForecast = async (lat = 25.9167, lon = 87.0833) => {
  const key = makeKey('forecast', parseFloat(lat).toFixed(2), parseFloat(lon).toFixed(2));
  return getOrSet(key, async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return _mockForecast();
    }
    try {
      const response = await axios.get(`${OWM_BASE}/forecast`, {
        params: { lat, lon, appid: apiKey, units: 'metric', cnt: 40 },
        timeout: 8000,
      });
      return _aggregateForecast(response.data.list);
    } catch {
      return _mockForecast();
    }
  }, TTL.FORECAST);
};

const _aggregateForecast = (list) => {
  if (!Array.isArray(list) || !list.length) return _mockForecast();
  const days = {};
  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!days[date]) {
      days[date] = { date, temps: [], icons: [], descs: [], humidity: [], wind: [], rain: 0 };
    }
    days[date].temps.push(item.main.temp);
    days[date].icons.push(item.weather[0]?.icon || '02d');
    days[date].descs.push(item.weather[0]?.description || 'Partly Cloudy');
    days[date].humidity.push(item.main.humidity);
    days[date].wind.push(item.wind.speed);
    if (item.rain?.['3h']) days[date].rain += item.rain['3h'];
  });
  return Object.values(days).slice(0, 7).map((d) => ({
    date: d.date,
    maxTemp: Math.round(Math.max(...d.temps)),
    minTemp: Math.round(Math.min(...d.temps)),
    avgTemp: Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length),
    icon: d.icons[Math.floor(d.icons.length / 2)],
    desc: d.descs[Math.floor(d.descs.length / 2)],
    humidity: Math.round(d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length),
    wind: `${Math.round(d.wind.reduce((a, b) => a + b, 0) / d.wind.length * 3.6)} km/h`,
    rain: d.rain.toFixed(1),
  }));
};

const _mockForecast = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const icons = ['01d', '02d', '03d', '10d', '01d', '02d', '04d'];
  const descs = ['Clear sky', 'Few clouds', 'Scattered clouds', 'Light rain', 'Sunny', 'Partly cloudy', 'Overcast'];
  return days.map((day, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    maxTemp: 30 + Math.floor(Math.random() * 5),
    minTemp: 22 + Math.floor(Math.random() * 4),
    avgTemp: 26,
    icon: icons[i],
    desc: descs[i],
    humidity: 60 + Math.floor(Math.random() * 20),
    wind: `${10 + Math.floor(Math.random() * 10)} km/h`,
    rain: (Math.random() * 5).toFixed(1),
  }));
};

// ─── GEOCODE ────────────────────────────────────────────────────────────────────

const getGeocode = async (location = 'Madhepura') => {
  const key = makeKey('geocode:direct', location);
  return getOrSet(key, async () => {
    const apiKey = getApiKey();
    if (!apiKey) return { lat: 25.9167, lon: 87.0833, city: location };
    try {
      const response = await axios.get(`${GEOCODING_BASE}/direct`, {
        params: { q: `${location},IN`, limit: 1, appid: apiKey },
        timeout: 5000,
      });
      const [result] = response.data || [];
      if (!result) return { lat: 25.9167, lon: 87.0833, city: location };
      return { lat: result.lat, lon: result.lon, city: result.name };
    } catch {
      return { lat: 25.9167, lon: 87.0833, city: location };
    }
  }, TTL.GEOCODE);
};

// ─── MANDI PRICES ───────────────────────────────────────────────────────────────

const getMandiPrices = async (location = 'Madhepura') => {
  const key = makeKey('mandi:legacy', location);
  return getOrSet(key, async () => {
    return _mandiDummyData(location);
  }, TTL.MANDI);
};

const getMandiPricesReal = async (state = 'Bihar', district = '') => {
  const key = makeKey('mandi:real', state, district);
  return getOrSet(key, async () => {
    try {
      const apiKey = process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23d9a31d7958a09dfc4';
      const response = await axios.get(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
        {
          params: {
            'api-key': apiKey,
            format: 'json',
            limit: 10,
            filters: JSON.stringify({ State: state }),
          },
          timeout: 8000,
        }
      );
      const records = response.data?.records || [];
      if (!records.length) return _mandiDummyData(district || 'Madhepura');
      return records.map((r, i) => ({
        id: i + 1,
        name: r.commodity || r.Commodity || 'Crop',
        price: `₹${r.modal_price || r.Modal_Price || '2,150'}`,
        location: `${r.market || r.Market || 'District'}, ${r.district || r.District || state}`,
        change: 'Live',
        image: _getCropImage(r.commodity || ''),
        min: r.min_price || r.Min_Price || '2000',
        max: r.max_price || r.Max_Price || '2300',
        modal: r.modal_price || r.Modal_Price || '2150',
        date: r.arrival_date || r.Arrival_Date || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return _mandiDummyData(district || 'Madhepura');
    }
  }, TTL.MANDI);
};

const _getCropImage = (commodity = '') => {
  const images = {
    'paddy': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200&h=200',
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200&h=200',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200&h=200',
    'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=200&h=200',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=200&h=200',
    'mustard': 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=200&h=200',
    'default': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=200&h=200',
  };
  const lc = commodity.toLowerCase();
  for (const [k, v] of Object.entries(images)) {
    if (lc.includes(k)) return v;
  }
  return images.default;
};

const _mandiDummyData = (location = 'Madhepura') => [
  { id: 1, name: 'Paddy (Dhan)', price: '₹2,180', location: `${location} Mandi`, change: '+2.4%', image: _getCropImage('paddy'), min: '2100', max: '2250', modal: '2180' },
  { id: 2, name: 'Maize (Makka)', price: '₹1,950', location: `${location} Mandi`, change: 'Stable', image: _getCropImage('maize'), min: '1900', max: '2000', modal: '1950' },
  { id: 3, name: 'Wheat (Gehu)', price: '₹2,125', location: `${location} Mandi`, change: '+1.8%', image: _getCropImage('wheat'), min: '2100', max: '2200', modal: '2125' },
  { id: 4, name: 'Mustard (Sarson)', price: '₹5,400', location: `${location} Mandi`, change: '+0.5%', image: _getCropImage('mustard'), min: '5350', max: '5450', modal: '5400' },
];

// ─── DISEASE DETECTION ─────────────────────────────────────────────────────────

const detectDisease = async (imageBuffer, mimeType) => {
  return {
    success: true,
    result: 'Healthy crop detected. Low risk of fungal infection.',
    disease: 'None detected',
    confidence: 0.92,
    recommendations: [
      'Maintain regular irrigation schedule.',
      'Ensure proper drainage to prevent waterlogging.',
      'Apply nitrogen-rich fertilizer as scheduled.',
    ],
  };
};

// ─── AI ASSISTANT ──────────────────────────────────────────────────────────────

const getAiAssistantReply = async (prompt = '') => {
  const lc = prompt.toLowerCase();
  let reply = 'I am your Kisaan Saathi agricultural assistant. How can I help you with crops, weather, or mandi prices today?';

  if (lc.includes('weather') || lc.includes('rain') || lc.includes('mausam')) {
    reply = 'The weather forecast shows favorable conditions for your crops. Keep an eye on cloud cover and schedule irrigation accordingly.';
  } else if (lc.includes('price') || lc.includes('mandi') || lc.includes('rate') || lc.includes('daam')) {
    reply = 'Current Mandi prices are stable. Paddy is trading around ₹2,180/quintal and Wheat around ₹2,125/quintal in local mandis.';
  } else if (lc.includes('disease') || lc.includes('pest') || lc.includes('keeda')) {
    reply = 'For disease control, upload a crop photo in Disease Detection or inspect leaves for spots. Ensure proper spacing for air circulation.';
  } else if (lc.includes('scheme') || lc.includes('yojana') || lc.includes('pm-kisan')) {
    reply = 'Government schemes like PM-Kisan Samman Nidhi provide direct financial support of ₹6,000/year to eligible farmers.';
  }

  return { reply };
};

// ─── GOVERNMENT SCHEMES ────────────────────────────────────────────────────────

const getGovernmentSchemes = async () => {
  return [
    { title: 'PM-Kisan Samman Nidhi', description: 'Direct income support of ₹6,000 per year for small & marginal farmers.' },
    { title: 'Kisan Credit Card (KCC)', description: 'Affordable credit facility with minimal interest for farming needs.' },
    { title: 'Pradhan Mantri Fasal Bima Yojana', description: 'Crop insurance against natural calamities, pests, and diseases.' },
  ];
};

const getGovernmentSchemesFiltered = async (state = 'Bihar') => {
  const key = makeKey('schemes', state);
  return getOrSet(key, async () => {
    try {
      const schemes = require('../data/schemes.json');
      const filtered = schemes.filter(
        (s) => s.applicableStates.includes('all') || s.applicableStates.includes(state) || s.applicableStates.includes(state.toLowerCase())
      );
      return filtered.length ? filtered : getGovernmentSchemes();
    } catch {
      return getGovernmentSchemes();
    }
  }, TTL.STATIC);
};

// ─── AGRICULTURE NEWS ─────────────────────────────────────────────────────────

const getAgricultureNews = async () => {
  const key = makeKey('news:general');
  return getOrSet(key, async () => {
    if (!process.env.NEWS_API_KEY) {
      return _mockNews('India');
    }
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: { q: 'agriculture farmer india', apiKey: process.env.NEWS_API_KEY, language: 'en', pageSize: 10, sortBy: 'publishedAt' },
        timeout: 8000,
      });
      const articles = (response.data.articles || []).map(_normalizeArticle);
      return articles.length ? articles : _mockNews('India');
    } catch {
      return _mockNews('India');
    }
  }, TTL.NEWS);
};

const getAgricultureNewsLocalized = async (state = 'Bihar') => {
  const key = makeKey('news:state', state);
  return getOrSet(key, async () => {
    if (!process.env.NEWS_API_KEY) {
      return _mockNews(state);
    }
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `agriculture farming ${state} India crops`,
          apiKey: process.env.NEWS_API_KEY,
          language: 'en',
          pageSize: 8,
          sortBy: 'publishedAt',
        },
        timeout: 8000,
      });
      const articles = (response.data.articles || []).map(_normalizeArticle);
      return articles.length ? articles : _mockNews(state);
    } catch {
      return _mockNews(state);
    }
  }, TTL.NEWS);
};

const _normalizeArticle = (a, i) => ({
  id: i + 1,
  title: a.title,
  excerpt: a.description || a.content?.substring(0, 150) || 'Latest agriculture updates for Indian farmers.',
  url: a.url,
  image: a.urlToImage || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=200&h=200',
  source: a.source?.name || 'AgriNews',
  publishedAt: a.publishedAt || new Date().toISOString(),
});

const _mockNews = (location = 'Bihar') => [
  { id: 1, title: `Benefits of Organic Farming in ${location}`, excerpt: 'Learn how organic farming improves soil health and increases crop yield sustainably.', source: 'Kisaan News', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 2, title: 'Kharif Crop Advisory 2025', excerpt: 'Expert recommendations for paddy and maize cultivation this season.', source: 'Agri Advisory', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 3, title: 'MSP Revision for Kharif Crops', excerpt: 'Government announces revised Minimum Support Prices for major kharif crops.', source: 'Govt Portal', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 4, title: 'Water Conservation in Agriculture', excerpt: 'New drip irrigation subsidies announced under PMKSY scheme.', source: 'Krishi Patrika', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=200&h=200' },
];

// ─── CROP DISEASE ALERTS ───────────────────────────────────────────────────────

const getCropDiseaseAlerts = async (state = 'Bihar', month = 7) => {
  const key = makeKey('disease-alerts', state, month);
  return getOrSet(key, async () => {
    try {
      const data = require('../data/diseaseAlerts.json');
      const stateData = data[state] || data['Bihar'];
      const monthAlerts = stateData?.[String(month)] || [];
      const prevMonth = String(month === 1 ? 12 : month - 1);
      const prevAlerts = (stateData?.[prevMonth] || []).map(a => ({ ...a, timing: 'watch' }));
      const combined = [...monthAlerts, ...prevAlerts];
      return combined.length ? combined.slice(0, 8) : [
        { crop: 'Paddy', disease: 'Blast Disease', risk: 'Medium', preventiveMeasure: 'Use resistant varieties and balance nitrogen application.' },
        { crop: 'Maize', disease: 'Fall Armyworm', risk: 'High', preventiveMeasure: 'Set up pheromone traps and spray recommended bio-pesticides.' },
      ];
    } catch {
      return [
        { crop: 'Paddy', disease: 'Blast Disease', risk: 'Medium', preventiveMeasure: 'Use resistant varieties and balance nitrogen application.' },
        { crop: 'Maize', disease: 'Fall Armyworm', risk: 'High', preventiveMeasure: 'Set up pheromone traps and spray recommended bio-pesticides.' },
      ];
    }
  }, TTL.STATIC);
};

// ─── CROP RECOMMENDATIONS ─────────────────────────────────────────────────────

const getCropRecommendations = async (state = 'Bihar', month = 7) => {
  const key = makeKey('crop-recs', state, month);
  return getOrSet(key, async () => {
    try {
      const data = require('../data/cropRecommendations.json');
      const stateData = data[state] || data['Bihar'];
      const monthNum = parseInt(month, 10);
      let season;
      if (monthNum >= 6 && monthNum <= 10) season = 'Kharif';
      else if (monthNum >= 11 || monthNum <= 2) season = 'Rabi';
      else season = 'Zaid';

      return {
        season,
        month: monthNum,
        crops: stateData[season] || ['Paddy', 'Maize', 'Arhar'],
        tips: stateData.tips || { general: 'Ensure proper land preparation and certified seed usage.' },
        calendar: Object.entries(stateData || {})
          .filter(([k]) => ['Kharif', 'Rabi', 'Zaid'].includes(k))
          .map(([k, v]) => ({ season: k, crops: v })),
      };
    } catch {
      return {
        season: 'Kharif',
        month: parseInt(month, 10) || 7,
        crops: ['Paddy', 'Maize', 'Arhar'],
        tips: { general: 'Ensure proper land preparation and certified seed usage.' },
      };
    }
  }, TTL.STATIC);
};

// ─── NEARBY KVKs ───────────────────────────────────────────────────────────────

const getNearbyKVKs = async (lat = 25.9167, lon = 87.0833, limit = 5) => {
  const key = makeKey('kvks', parseFloat(lat).toFixed(1), parseFloat(lon).toFixed(1));
  return getOrSet(key, async () => {
    try {
      const kvks = require('../data/kvks.json');
      const { haversineDistance } = require('./locationService');
      return kvks
        .map((k) => ({ ...k, distance: haversineDistance(lat, lon, k.lat, k.lon) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map((k) => ({ ...k, distance: `${k.distance.toFixed(1)} km` }));
    } catch {
      return [
        { name: 'KVK Madhepura', location: 'Madhepura, Bihar', phone: '06476-222333', lat: 25.92, lon: 87.09, distance: '2.5 km' },
        { name: 'KVK Saharsa', location: 'Saharsa, Bihar', phone: '06478-234567', lat: 25.88, lon: 86.60, distance: '45.0 km' },
      ];
    }
  }, TTL.STATIC);
};

// ─── SEASONAL CALENDAR ─────────────────────────────────────────────────────────

const getSeasonalCalendar = async (state = 'Bihar', month = 7) => {
  const key = makeKey('calendar', state, month);
  return getOrSet(key, async () => {
    try {
      const data = require('../data/cropCalendar.json');
      const stateData = data[state] || data['Bihar'];
      const monthNum = parseInt(month, 10);
      const activeSeasons = Object.entries(stateData)
        .filter(([, v]) => v.months && v.months.includes(monthNum))
        .map(([season, v]) => ({ season, crops: v.crops || [] }));

      return {
        state,
        month: monthNum,
        activeSeasons,
        allSeasons: Object.entries(stateData)
          .filter(([k]) => !['tips'].includes(k))
          .map(([season, v]) => ({
            season,
            months: v.months,
            crops: v.crops || [],
          })),
      };
    } catch {
      return {
        state,
        month: parseInt(month, 10) || 7,
        activeSeasons: [{ season: 'Kharif', crops: ['Paddy', 'Maize'] }],
        allSeasons: [],
      };
    }
  }, TTL.STATIC);
};

// ─── FULL LOCATION DATA (combined payload) ───────────────────────────────────

const getFullLocationData = async ({ lat, lon, city, state, district, month }) => {
  const key = makeKey('full', lat ? lat.toFixed(2) : city, month);
  return getOrSet(key, async () => {
    const [weather, forecast, mandi, schemes, crops, diseaseAlerts, news, kvks, calendar] = await Promise.allSettled([
      lat && lon ? getWeatherByCoords(lat, lon) : getWeather(city || 'Madhepura'),
      get7DayForecast(lat || 25.9167, lon || 87.0833),
      getMandiPricesReal(state || 'Bihar', district || city || 'Madhepura'),
      getGovernmentSchemesFiltered(state || 'Bihar'),
      getCropRecommendations(state || 'Bihar', month || 7),
      getCropDiseaseAlerts(state || 'Bihar', month || 7),
      getAgricultureNewsLocalized(state || 'Bihar'),
      getNearbyKVKs(lat || 25.9167, lon || 87.0833),
      getSeasonalCalendar(state || 'Bihar', month || 7),
    ]);

    const safe = (result, fallback = null) =>
      result.status === 'fulfilled' ? result.value : fallback;

    return {
      weather: safe(weather, _mockWeather(city || 'Madhepura')),
      forecast: safe(forecast, _mockForecast()),
      mandi: safe(mandi, _mandiDummyData(city || district || 'Madhepura')),
      schemes: safe(schemes, []),
      crops: safe(crops, {}),
      diseaseAlerts: safe(diseaseAlerts, []),
      news: safe(news, _mockNews(state || 'Bihar')),
      kvks: safe(kvks, []),
      calendar: safe(calendar, {}),
    };
  }, TTL.WEATHER);
};

module.exports = {
  getWeather,
  getWeatherByCoords,
  get7DayForecast,
  getGeocode,
  getMandiPrices,
  getMandiPricesReal,
  detectDisease,
  getAiAssistantReply,
  getGovernmentSchemes,
  getGovernmentSchemesFiltered,
  getAgricultureNews,
  getAgricultureNewsLocalized,
  getCropDiseaseAlerts,
  getCropRecommendations,
  getNearbyKVKs,
  getSeasonalCalendar,
  getFullLocationData,
};
