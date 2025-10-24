import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get user role from app_users table
  let isAdmin = false;
  if (session?.user) {
    const { data: appUser } = await supabase
      .from('app_users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    isAdmin = appUser?.is_admin || false;
  }

  const { pathname } = req.nextUrl;

  // Define route protection rules
  const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const isAdminRoute = pathname.startsWith('/admin');
  const isDisplayRoute = pathname.startsWith('/display');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Redirect unauthenticated users to sign-in
  if (!session && !isAuthRoute) {
    const redirectUrl = new URL('/sign-in', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth routes
  if (session && isAuthRoute) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else {
      return NextResponse.redirect(new URL('/display', req.url));
    }
  }

  // Protect admin routes
  if (session && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/display', req.url));
  }

  // Protect display routes from admins (should go to admin instead)
  if (session && isDisplayRoute && isAdmin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Handle dashboard route redirection based on role
  if (session && isDashboardRoute) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else {
      return NextResponse.redirect(new URL('/display', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};