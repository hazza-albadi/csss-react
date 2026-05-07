import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client — null when env vars are missing (app falls back to localStorage).
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable.
 */
export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseReady = !!(url && key);
