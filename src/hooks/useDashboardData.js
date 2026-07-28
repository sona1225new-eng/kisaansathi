import { useEffect, useState } from 'react';
import { dashboardService, locationService } from '../api/services';

/**
 * useDashboardData
 *
 * Accepts either:
 *   - city (string) — legacy mode
 *   - location object: { lat, lon, city, state, district, source }
 *
 * Returns the full enriched data set from the location API.
 */
export function useDashboardData(locationOrCity = 'Madhepura') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        let response;

        if (typeof locationOrCity === 'string') {
          // Legacy: city string → use old dashboard overview endpoint
          response = await dashboardService.getOverview(locationOrCity);
          if (mounted) setData(response.data.data);
        } else if (locationOrCity && typeof locationOrCity === 'object') {
          // New: location object → use location/full endpoint
          const params = {};
          if (locationOrCity.lat && locationOrCity.lon) {
            params.lat = locationOrCity.lat;
            params.lon = locationOrCity.lon;
          } else if (locationOrCity.city) {
            params.city = locationOrCity.city;
          }
          if (locationOrCity.state) params.state = locationOrCity.state;
          if (locationOrCity.district) params.district = locationOrCity.district;

          response = await locationService.getFullLocationData(params);
          if (mounted) setData(response.data.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load dashboard data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [
    typeof locationOrCity === 'string' ? locationOrCity : locationOrCity?.lat,
    typeof locationOrCity === 'string' ? undefined : locationOrCity?.lon,
    typeof locationOrCity === 'string' ? undefined : locationOrCity?.city,
    typeof locationOrCity === 'string' ? undefined : locationOrCity?.source,
  ]);

  return { data, loading, error };
}
