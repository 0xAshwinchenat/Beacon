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

    // Completely bypass any SDK storage bugs by manually calling the GoTrue API
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Auth API Error:', tokenData);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    if (tokenData.access_token) {
      // Use SSR client solely to save the successfully exchanged session cookies
      const ssrSupabase = createServerSupabaseClient();
      await ssrSupabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      });
      return NextResponse.redirect(`${origin}${next}`);
    }


    // If it reached here, tokenData is weird! Let's log it!
    return NextResponse.redirect(`${origin}/login?error=no_code&tokenData=${encodeURIComponent(JSON.stringify(tokenData))}&full_url=${encodeURIComponent(request.url)}`);
  }

  // If there's an error, redirect to login page with error param
  return NextResponse.redirect(`${origin}/login?error=no_code&full_url=${encodeURIComponent(request.url)}`);
}
