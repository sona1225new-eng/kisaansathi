import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export const locationService = {
  /**
   * Resolve city name or GPS coords to a structured location object
   */
  resolveLocation: (params) => api.get('/location/resolve', { params }),

  /**
   * Current weather for lat/lon or city
   */
  getWeather: (params) => api.get('/location/weather', { params }),

  /**
   * 7-day forecast for lat/lon
   */
  getForecast: (params) => api.get('/location/forecast', { params }),

  /**
   * Mandi prices for state/district
   */
  getMandi: (params) => api.get('/location/mandi', { params }),

  /**
   * Government schemes filtered by state
   */
  getSchemes: (params) => api.get('/location/schemes', { params }),

  /**
   * Crop recommendations for state/month
   */
  getCrops: (params) => api.get('/location/crops', { params }),

  /**
   * Crop disease alerts for state/month
   */
  getDiseaseAlerts: (params) => api.get('/location/disease-alerts', { params }),

  /**
   * Localized agriculture news for state
   */
  getNews: (params) => api.get('/location/news', { params }),

  /**
   * Nearby KVK/agri offices for lat/lon
   */
  getKVKs: (params) => api.get('/location/kvks', { params }),

  /**
   * Seasonal crop calendar for state/month
   */
  getCalendar: (params) => api.get('/location/calendar', { params }),

  /**
   * All location data in one request (main entry point)
   */
  getFullLocationData: (params, signal) => api.get('/location/full', { params, signal }),
};
