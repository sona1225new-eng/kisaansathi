import { useEffect, useState } from 'react';
import { dashboardService } from '../api/services';

export function useDashboardData(city = 'Madhepura') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getOverview(city);
        if (mounted) {
          setData(response.data.data);
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
    return () => {
      mounted = false;
    };
  }, [city]);

  return { data, loading, error };
}
