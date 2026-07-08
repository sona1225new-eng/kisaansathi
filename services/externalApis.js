const axios = require('axios');

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

const getWeather = async (city) => {
  if (!process.env.WEATHER_API_KEY) return { temp: 28, desc: 'Partly Cloudy', feels: 31, humidity: 65, wind: '12 km/h', chance: '20%' };

  const response = await axios.get(WEATHER_BASE_URL, {
    params: { q: city, appid: process.env.WEATHER_API_KEY, units: 'metric' },
  });

  const data = response.data;
  return {
    temp: Math.round(data.main.temp),
    desc: data.weather[0].description,
    feels: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    wind: `${data.wind.speed} km/h`,
    chance: 'Moderate',
  };
};

const getGeocode = async (location) => {
  if (!process.env.GEOCODING_API_KEY) return { lat: 25.9, lon: 87.5, city: location };

  const response = await axios.get(`${GEOCODING_BASE_URL}/direct`, {
    params: { q: location, limit: 1, appid: process.env.GEOCODING_API_KEY },
  });
  const [result] = response.data;
  return { lat: result.lat, lon: result.lon, city: result.name };
};

const getMandiPrices = async (location) => {
  if (!process.env.MANDI_API_KEY) {
    return [
      { name: 'Paddy (Dhan)', price: '₹2,180', location: 'Katihar Mandi', change: '+2.4%' },
      { name: 'Maize (Makka)', price: '₹1,950', location: 'Purnea Mandi', change: 'Stable' },
    ];
  }

  const response = await axios.get('https://api.example.com/mandi', {
    params: { location, api_key: process.env.MANDI_API_KEY },
  });
  return response.data;
};

const detectDisease = async (imageBuffer, mimeType) => {
  if (!process.env.CROP_DISEASE_API_KEY) {
    return { result: 'Healthy crop', confidence: 0.84 };
  }

  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer], { type: mimeType }));
  const response = await axios.post('https://api.example.com/disease-detect', formData, {
    headers: { Authorization: `Bearer ${process.env.CROP_DISEASE_API_KEY}` },
  });
  return response.data;
};

const getAiAssistantReply = async (prompt) => {
  if (!process.env.AI_CHAT_API_KEY) {
    return { reply: 'I can help with crop care, mandi trends, government schemes, and weather updates.' };
  }

  const response = await axios.post('https://api.example.com/chat', { prompt }, {
    headers: { Authorization: `Bearer ${process.env.AI_CHAT_API_KEY}` },
  });
  return response.data;
};

const getGovernmentSchemes = async () => {
  if (!process.env.GOVERNMENT_SCHEMES_API_KEY) {
    return [
      { title: 'PM-Kisan Samman Nidhi', description: 'Direct income support for farmers' },
      { title: 'Kisan Credit Card', description: 'Affordable loans for agriculture' },
    ];
  }

  const response = await axios.get('https://api.example.com/schemes', {
    params: { api_key: process.env.GOVERNMENT_SCHEMES_API_KEY },
  });
  return response.data;
};

const getAgricultureNews = async () => {
  if (!process.env.NEWS_API_KEY) {
    return [
      { title: 'Benefits of Organic Farming', excerpt: 'Learn how organic farming improves yield and soil health.' },
    ];
  }

  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: { q: 'agriculture farmer india', apiKey: process.env.NEWS_API_KEY, language: 'en' },
  });
  return response.data.articles || [];
};

module.exports = { getWeather, getGeocode, getMandiPrices, detectDisease, getAiAssistantReply, getGovernmentSchemes, getAgricultureNews };
