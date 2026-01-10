import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_AVAILABLE = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const supabase: SupabaseClient | null = SUPABASE_AVAILABLE && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  service: string;
  environment: string;
  status: string;
  last_rotated: string;
  created_at: string;
  created_by: string;
}

export interface IpAddress {
  id: string;
  ip_address: string;
  hostname: string;
  location: string;
  risk_level: string;
  category: string;
  notes: string;
  last_seen: string;
  created_at: string;
  created_by: string;
}
