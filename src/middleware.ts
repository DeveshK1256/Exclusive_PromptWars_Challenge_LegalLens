import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    user = null;
  }

  // Protected Routes verification
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/documents') ||
                           request.nextUrl.pathname.startsWith('/compare') ||
                           request.nextUrl.pathname.startsWith('/action-plans') ||
                           request.nextUrl.pathname.startsWith('/settings');

  // Comprehensive session detection across demo mode, local auth, and Supabase cookies
  const allCookies = request.cookies.getAll();
  const hasUserEmail = request.cookies.has('legallens_user_email');
  const hasDemoSession = request.cookies.has('legallens_demo_session');
  const hasSbAccessToken = request.cookies.has('sb-access-token');
  const hasAnySbAuthCookie = allCookies.some(c =>
    c.name.startsWith('sb-') ||
    c.name.includes('auth-token') ||
    c.name.includes('session')
  );

  const isAuthenticated = !!user || hasUserEmail || hasDemoSession || hasSbAccessToken || hasAnySbAuthCookie;

  // If user is not authenticated and accessing a protected route, redirect to login
  if (isProtectedRoute && !isAuthenticated && process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
