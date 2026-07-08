import { useEffect, useState } from 'react';
import { userService } from '../api/services';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) {
          setLoading(false);
          setProfile(null);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getProfile();
        if (mounted) {
          setProfile(response.data.data.user);
          setSuccess('Profile synced');
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load profile');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { profile, loading, error, success };
}
