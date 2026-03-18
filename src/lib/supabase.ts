import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. App will run in Demo Mode.');
}

let client: any;
try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co') {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Fallback to a dummy client that won't crash the app
    client = createClient('https://placeholder.supabase.co', 'placeholder');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
