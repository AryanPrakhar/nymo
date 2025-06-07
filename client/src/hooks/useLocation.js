import { useState, useEffect } from 'react';
import { locationUtils } from '../utils/helpers';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await locationUtils.getCurrentPosition();
      setLocation(position);
    } catch (err) {
      setError(err.message);
      // Fallback to default location
      setLocation(locationUtils.getDefaultLocation());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refetch: getCurrentLocation
  };
}
