import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../api/services';

const LOCATION_STORAGE_KEY = 'ks_location';
const LOCATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const DEFAULT_LOCATION = {
  city: 'Madhepura',
  state: 'Bihar',
  district: 'Madhepura',
  lat: 25.9167,
  lon: 87.0833,
  source: 'default',
};

const readStoredLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATION;
    const stored = JSON.parse(raw);
    if (stored.timestamp && Date.now() - stored.timestamp > LOCATION_EXPIRY_MS) {
      return stored; // Keep saved location even if timestamp is old
    }
    return stored;
  } catch {
    return DEFAULT_LOCATION;
  }
};

const saveStoredLocation = (loc) => {
  try {
    const dataToSave = { ...loc, timestamp: Date.now() };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToSave));
    // Dispatch custom window event so standalone HTML scripts / tabs update instantly
    window.dispatchEvent(new CustomEvent('ks_location_changed', { detail: dataToSave }));
  } catch {
    // Ignore storage quota errors
  }
};

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(readStoredLocation);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Sync state changes to storage
  const updateLocation = useCallback((newLoc) => {
    const merged = { ...DEFAULT_LOCATION, ...newLoc };
    setLocationState(merged);
    saveStoredLocation(merged);
    setLocationError('');
  }, []);

  // Listen for storage changes across tabs or standalone scripts
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === LOCATION_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLocationState(parsed);
        } catch {
          // ignore
        }
      }
    };
    const handleCustomChange = (e) => {
      if (e.detail) setLocationState(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ks_location_changed', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ks_location_changed', handleCustomChange);
    };
  }, []);

  /**
   * Request GPS Location from browser geolocation API
   */
  const requestGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported by this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          // Resolve lat/lon into city, state, district using backend endpoint
          const res = await locationService.resolveLocation({ lat, lon });
          const resolved = res.data.data;
          updateLocation({
            lat,
            lon,
            city: resolved.city || 'Local Area',
            state: resolved.state || 'Bihar',
            district: resolved.district || resolved.city || 'Madhepura',
            source: 'gps',
          });
        } catch {
          updateLocation({
            lat,
            lon,
            city: 'Current Location',
            state: 'Bihar',
            district: 'Madhepura',
            source: 'gps',
          });
        } finally {
          setLocationLoading(false);
          setIsLocationModalOpen(false);
        }
      },
      (err) => {
        let msg = 'Location access denied.';
        if (err.code === err.TIMEOUT) msg = 'GPS request timed out.';
        if (err.code === err.POSITION_UNAVAILABLE) msg = 'GPS position unavailable.';
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [updateLocation]);

  /**
   * Set manual location by city/district search
   */
  const setManualLocation = useCallback(async (cityName) => {
    if (!cityName || !cityName.trim()) return;
    const cleanCity = cityName.trim();
    setLocationLoading(true);
    setLocationError('');

    try {
      const res = await locationService.resolveLocation({ city: cleanCity });
      const resolved = res.data.data;
      updateLocation({
        city: resolved.city || cleanCity,
        state: resolved.state || 'Bihar',
        district: resolved.district || cleanCity,
        lat: resolved.lat || 25.9167,
        lon: resolved.lon || 87.0833,
        source: 'manual',
      });
    } catch {
      updateLocation({
        city: cleanCity,
        state: 'Bihar',
        district: cleanCity,
        source: 'manual',
      });
    } finally {
      setLocationLoading(false);
      setIsLocationModalOpen(false);
    }
  }, [updateLocation]);

  /**
   * Reset to default location
   */
  const clearLocation = useCallback(() => {
    updateLocation(DEFAULT_LOCATION);
    setIsLocationModalOpen(false);
  }, [updateLocation]);

  const openLocationModal = useCallback(() => setIsLocationModalOpen(true), []);
  const closeLocationModal = useCallback(() => setIsLocationModalOpen(false), []);

  return (
    <LocationContext.Provider
      value={{
        location,
        locationLoading,
        locationError,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        requestGPS,
        setManualLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
