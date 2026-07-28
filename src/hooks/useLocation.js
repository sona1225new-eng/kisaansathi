import { useState, useEffect, useCallback } from 'react';

const LOCATION_STORAGE_KEY = 'ks_location';
const LOCATION_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Reads the stored location from localStorage.
 * Returns null if expired or absent.
 */
const readStoredLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (Date.now() - stored.timestamp > LOCATION_EXPIRY_MS) {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
};

/**
 * Saves a location object to localStorage with a timestamp.
 */
const saveLocation = (loc) => {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ ...loc, timestamp: Date.now() }));
  } catch {
    // ignore storage errors
  }
};

/**
 * useLocation hook
 *
 * Provides:
 * - location: { lat?, lon?, city?, state?, district?, source }
 * - locationLoading: bool
 * - locationError: string
 * - requestLocation(): trigger GPS request
 * - setManualLocation(city: string): set city manually
 * - clearLocation(): reset to default
 */
export function useLocation() {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = readStoredLocation();
    if (stored) {
      setLocation(stored);
    } else {
      // Default location
      setLocation({ city: 'Madhepura', state: 'Bihar', district: 'Madhepura', source: 'default' });
    }
  }, []);

  /**
   * Request GPS location from the browser
   */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported by this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: 'gps',
          accuracy: pos.coords.accuracy,
        };
        setLocation(loc);
        saveLocation(loc);
        setLocationLoading(false);
      },
      (err) => {
        let msg = 'Location access denied.';
        if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'Position unavailable.';
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  /**
   * Set a manual city/district name as the location
   */
  const setManualLocation = useCallback((city) => {
    const loc = { city: city.trim(), source: 'manual' };
    setLocation(loc);
    saveLocation(loc);
    setLocationError('');
  }, []);

  /**
   * Clear location back to default
   */
  const clearLocation = useCallback(() => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setLocation({ city: 'Madhepura', state: 'Bihar', district: 'Madhepura', source: 'default' });
  }, []);

  return { location, locationLoading, locationError, requestLocation, setManualLocation, clearLocation };
}
