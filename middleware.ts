// middleware.ts - Route Protection for Full Implementation

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const isAuthenticated = !!user;
  const isEmailVerified = user?.email_confirmed_at != null;

  // Define route protection rules
  const protectedRoutes = [
    '/dashboard',
    '/form',
    '/stage-detection', 
    '/results',
    '/profile',
    '/settings'
  ];

  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];

  const emailVerificationRequiredRoutes = [
    '/form',
    '/stage-detection',
    '/results',
    '/dashboard'
  ];

  const currentPath = req.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(currentPath)) {
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Check if route needs authentication
  const needsAuth = protectedRoutes.some(route => 
    currentPath.startsWith(route)
  );

  if (needsAuth) {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', currentPath);
      return NextResponse.redirect(loginUrl);
    }

    // Check email verification for specific routes
    const needsEmailVerification = emailVerificationRequiredRoutes.some(route =>
      currentPath.startsWith(route)
    );

    if (needsEmailVerification && !isEmailVerified) {
      const verifyUrl = new URL('/auth/verify-email', req.url);
      verifyUrl.searchParams.set('redirect', currentPath);
      return NextResponse.redirect(verifyUrl);
    }

    // Check if user has completed onboarding for main app routes
    const mainAppRoutes = ['/form', '/stage-detection', '/results', '/dashboard'];
    const needsOnboarding = mainAppRoutes.some(route => 
      currentPath.startsWith(route)
    );

    if (needsOnboarding && isAuthenticated && isEmailVerified) {
      try {
        // Check if user profile is complete
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, role, company_name')
          .eq('id', user.id)
          .single();

        if (!profile?.onboarding_completed) {
          const onboardingUrl = new URL('/onboarding', req.url);
          onboardingUrl.searchParams.set('redirect', currentPath);
          return NextResponse.redirect(onboardingUrl);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // If there's an error, redirect to onboarding to be safe
        const onboardingUrl = new URL('/onboarding', req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  // Special handling for root path
  if (currentPath === '/') {
    if (isAuthenticated && isEmailVerified) {
      // Check if onboarding is complete
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      } catch (error) {
        // If error, let them stay on landing page
        return res;
      }
    }
    // Unauthenticated users stay on landing page
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
