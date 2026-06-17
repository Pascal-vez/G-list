const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export const apiConfig = {
  baseUrl: API_URL,
  useRemoteApi: Boolean(API_URL),
  useSupabase: Boolean(SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};
