import { useAuth } from '../context/AuthContext';

export function useApiClient() {
  const { getAuthToken, logout } = useAuth();

  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 403) {
        logout();
        throw new Error('Invalid token. Please login again.');
      }

      return response;
    } catch (err) {
      throw err;
    }
  };

  return { apiCall };
}
