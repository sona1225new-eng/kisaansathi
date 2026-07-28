import { useEffect, useState, useRef, useCallback } from 'react';
import { locationService } from '../api/services';
import { useLocationContext } from '../context/LocationContext';

// Simple in-memory response cache to prevent duplicate calls when switching tabs or re-rendering
const responseCache = new Map();

/**
 * useLocationData hook
 *
 * Fetches location-specific data from /api/location/full based on global LocationContext.
 */
export function useLocationData(customLocation) {
  const { location: globalLocation } = useLocationContext();
  const activeLoc = customLocation || globalLocation;

  const [data, setData] = useState(() => {
    const cacheKey = `${activeLoc?.city || ''}_${activeLoc?.lat || ''}_${activeLoc?.lon || ''}`;
    return responseCache.get(cacheKey) || null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const fetchData = useCallback(async (loc) => {
    if (!loc) return;

    const cacheKey = `${loc.city || ''}_${loc.lat || ''}_${loc.lon || ''}_${loc.state || ''}`;

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Check memory cache first
    if (responseCache.has(cacheKey)) {
      setData(responseCache.get(cacheKey));
      setLoading(false);
      setError('');
    } else {
      setLoading(true);
    }

    try {
      const params = {};
      if (loc.lat && loc.lon) {
        params.lat = loc.lat;
        params.lon = loc.lon;
      } else if (loc.city) {
        params.city = loc.city;
      } else {
        params.city = 'Madhepura';
      }
      if (loc.state) params.state = loc.state;
      if (loc.district) params.district = loc.district;

      const response = await locationService.getFullLocationData(params, abortRef.current.signal);
      const payload = response.data.data;

      responseCache.set(cacheKey, payload);
      setData(payload);
      setError('');
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err?.response?.data?.message || 'Unable to load location data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeLoc);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [
    activeLoc?.lat,
    activeLoc?.lon,
    activeLoc?.city,
    activeLoc?.state,
    activeLoc?.district,
    activeLoc?.source,
    fetchData,
  ]);

  return {
    weather: data?.weather || null,
    forecast: data?.forecast || [],
    mandi: data?.mandi || [],
    schemes: data?.schemes || [],
    crops: data?.crops || {},
    diseaseAlerts: data?.diseaseAlerts || [],
    news: data?.news || [],
    kvks: data?.kvks || [],
    calendar: data?.calendar || {},
    resolvedLocation: data?.resolvedLocation || null,
    loading,
    error,
    refetch: () => fetchData(activeLoc),
  };
}
