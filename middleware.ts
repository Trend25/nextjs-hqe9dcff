// middleware.ts — UAT / Preview ortamı için güvenli bypass + normal koruma

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// 👇 UAT / Preview ortamında auth kontrolü dışında bırakılacak sayfalar
const UAT_PUBLIC_PATHS = [
  '/', '/auth', '/invite',
  '/evaluate', '/result',
  '/api/session/verify',
  '/favicon.ico', '/robots.txt'
];

function isPublicPath(pathname: string) {
  return UAT_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ 1. Eğer ortam staging/preview ise public pathleri tamamen serbest bırak
  const isPreviewEnv =
    process.env.NEXT_PUBLIC_APP_ENV === 'staging' ||
    process.env.VERCEL_ENV === 'preview';

  if (isPreviewEnv && isPublicPath(pathname)) {
    // Bypass auth entirely for UAT/staging
    return NextResponse.next();
  }

  // ✅ 2. Normal üretim kuralları (auth zorunlu sayfalar)
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const isAuthenticated = !!user;
  const isEmailVerified = user?.email_confirmed_at != null;

  const protectedRoutes = [
    '/form',
    '/stage-detection',
    '/results',
    '/profile',
    '/settings',
  ];

  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  const emailVerificationRequiredRoutes = [
    '/form',
    '/stage-detection',
    '/results',
  ];

  const currentPath = pathname;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(currentPath)) {
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Check if route needs authentication
  const needsAuth = protectedRoutes.some((route) => currentPath.startsWith(route));

  if (needsAuth) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', currentPath);
      return NextResponse.redirect(loginUrl);
    }

    const needsEmailVerification = emailVerificationRequiredRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    if (needsEmailVerification && !isEmailVerified) {
      const verifyUrl = new URL('/auth/verify-email', req.url);
      verifyUrl.searchParams.set('redirect', currentPath);
      return NextResponse.redirect(verifyUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
