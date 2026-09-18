import api, { locationService } from './client';

export { locationService };

export const authService = {
  signup: (payload) => api.post('/auth/signup', payload),
  register: (payload) => api.post('/auth/register', payload),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  resendVerification: (payload) => api.post('/auth/resend-verification', payload),
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


