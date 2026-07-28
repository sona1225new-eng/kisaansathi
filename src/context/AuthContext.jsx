import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);
const TOKEN_KEY = 'token';
const USER_KEY = 'ks_user';

const readSession = () => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  try {
    const payload = token && JSON.parse(atob(token.split('.')[1]));
    if (!token || !payload?.exp || payload.exp * 1000 <= Date.now()) return { token: null, user: null };
    return { token, user: rawUser ? JSON.parse(rawUser) : null };
  } catch { return { token: null, user: null }; }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const persist = useCallback((data, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY);
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));
    setSession({ token: data.token, user: data.user });
  }, []);

  const login = useCallback(async (values) => {
    const response = await authService.login(values);
    const data = response.data.data;
    persist(data, values.remember !== false);
    return data;
  }, [persist]);

  const register = useCallback(async (values) => {
    const response = await authService.register(values);
    const data = response.data.data;
    persist(data, true);
    return data;
  }, [persist]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* local cleanup must still happen */ }
    [localStorage, sessionStorage].forEach((storage) => {
      [TOKEN_KEY, USER_KEY, 'ks_location', 'ks_preferences', 'ks_cached_location'].forEach((key) => storage.removeItem(key));
    });
    setSession({ token: null, user: null });
  }, []);

  const value = useMemo(() => ({ ...session, ready, isAuthenticated: Boolean(session.token), login, register, logout }), [session, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuthContext must be used within AuthProvider');
  return value;
}
