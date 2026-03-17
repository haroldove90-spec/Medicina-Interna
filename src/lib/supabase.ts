import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please check your environment variables.');
}

let client: any;
try {
  client = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
  );
} catch (error) {
  console.error('Error initializing Supabase client. Invalid URL?', error);
  // Fallback to a dummy client that won't crash the app
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
