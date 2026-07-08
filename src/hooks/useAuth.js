import { useState } from 'react';
import { authService } from '../api/services';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const login = async (payload) => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.login(payload);
      localStorage.setItem('token', response.data.data.token);
      setSuccess('Logged in successfully');
      return response.data.data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.register(payload);
      localStorage.setItem('token', response.data.data.token);
      setSuccess('Registered successfully');
      return response.data.data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
    }
  };

  return { login, register, logout, loading, error, success };
}
