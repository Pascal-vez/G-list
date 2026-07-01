import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('unsupported');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.code === 1 ? 'denied' : 'failed');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('glist_user_location');
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (location) {
      localStorage.setItem('glist_user_location', JSON.stringify(location));
    }
  }, [location]);

  return { location, error, loading, requestLocation, clearLocation: () => {
    setLocation(null);
    localStorage.removeItem('glist_user_location');
  }};
}
