export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Redirect to dashboard by default after successful auth
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { cookies } = await import('next/headers');
    const allCookies = cookies().getAll();
    console.log('Server Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Incoming Cookies in Callback:', allCookies.map(c => `${c.name}=${c.value ? '[HAS VALUE]' : '[EMPTY]'}`));
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Auth Callback Error:', error);
      const { cookies } = await import('next/headers');
      const allCookies = cookies().getAll();
      return new NextResponse(
        JSON.stringify({
          error: error.message,
          env_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          cookiesReceivedByServer: allCookies.map(c => c.name),
          userAgent: request.headers.get('user-agent')
        }, null, 2),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // If there's an error, redirect to login page with error param
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
