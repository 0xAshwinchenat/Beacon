import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client (Browser Client)
// Safe to import in 'use client' components
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
