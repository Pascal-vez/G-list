const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiConfig = {
  baseUrl: API_URL,
  useRemoteApi: Boolean(API_URL),
};
