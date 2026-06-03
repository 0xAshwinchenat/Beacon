export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Redirect to dashboard by default after successful auth
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    // Safely grab both possible cookie names just in case
    const codeVerifier = cookieStore.get('sb-auth-code-verifier')?.value 
      || cookieStore.get('sb-xzipegyyvknwnfzkaimx-auth-token-code-verifier')?.value;

    if (!codeVerifier) {
      console.error('Code verifier completely missing from cookies');
      return NextResponse.redirect(`${origin}/login?error=Missing_Cookie`);
    }

    // Bypass @supabase/ssr read bugs by injecting it manually into vanilla client
    const { createClient } = await import('@supabase/supabase-js');
    const rawSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: false,
          persistSession: false,
          storage: {
            getItem: (key) => key.endsWith('-code-verifier') ? codeVerifier : null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
      }
    );

    const { data, error } = await rawSupabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth Callback Error:', error);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.session) {
      // Use SSR client solely to save the successfully exchanged session cookies
      const ssrSupabase = createServerSupabaseClient();
      await ssrSupabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error, redirect to login page with error param
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
