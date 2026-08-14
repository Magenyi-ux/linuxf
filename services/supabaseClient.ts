import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.'
  );
}

/**
 * The anon/publishable key is safe for browser use only when RLS is enabled on
 * every user-data table. A service_role key must never be bundled here.
 */
// Custom cookie-based storage for 14-day persistence and cross-subdomain support
const cookieStorage = {
  getItem: (key: string) => {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    const date = new Date();
    date.setTime(date.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
    const expires = "; expires=" + date.toUTCString();
    // Use domain: ".spherelearn.name.ng" to allow cross-subdomain auth if needed
    const domain = window.location.hostname.includes('spherelearn.name.ng') ? "; domain=.spherelearn.name.ng" : "";
    document.cookie = key + "=" + (value || "") + expires + "; path=/" + domain + "; SameSite=Lax; Secure";
  },
  removeItem: (key: string) => {
    document.cookie = key + "=; Max-Age=-99999999; path=/; SameSite=Lax; Secure";
    if (window.location.hostname.includes('spherelearn.name.ng')) {
      document.cookie = key + "=; Max-Age=-99999999; path=/; domain=.spherelearn.name.ng; SameSite=Lax; Secure";
    }
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'examply-supabase-auth',
      storage: cookieStorage,
    },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
