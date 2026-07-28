import api from './client';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (payload) => api.put('/users/profile', payload),
  saveCrop: (crop) => api.post('/users/saved-crops', { crop }),
  saveFavoriteLocation: (location) => api.post('/users/favorite-locations', { location }),
  getNotifications: () => api.get('/users/notifications'),
};

export const dashboardService = {
  getOverview: (city) => api.get(`/dashboard/overview?city=${encodeURIComponent(city || '')}`),
  chat: (prompt) => api.post('/dashboard/chat', { prompt }),
  detectDisease: (formData) => api.post('/dashboard/disease-detect', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

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
