import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use getSession() here — getUser() sends a request to the
  // Supabase Auth server every time to revalidate the Auth token, while getSession()
  // doesn't and is therefore insecure.
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login page
  if (url.pathname.startsWith('/login')) {
    if (user) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect root to dashboard if logged in, otherwise to login
  if (url.pathname === '/') {
    if (user) {
      url.pathname = '/dashboard';
    } else {
      url.pathname = '/login';
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - /auth/callback (CRITICAL: must be excluded so the middleware
     *   doesn't interfere with the PKCE code exchange by consuming
     *   or modifying the code verifier cookie before the route handler
     *   can read it)
     * - /api routes (handled by their own auth logic)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)',
  ],
};
