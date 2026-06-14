import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. App will not function properly without them.");
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy-project.supabase.co', 
  supabaseAnonKey || 'dummy-key'
);
