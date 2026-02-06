import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// ── i18n middleware ────────────────────────────────────────
const intlMiddleware = createIntlMiddleware(routing);

// ── Protected routes (locale-stripped paths) ───────────────
const PROTECTED_PATHS = ['/tasks/new', '/dashboard'];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix if present (e.g. /ko/dashboard → /dashboard)
  const localePattern = /^\/(ko|en|ja|zh)(\/|$)/;
  const stripped = pathname.replace(localePattern, '/');
  return PROTECTED_PATHS.some(
    (p) => stripped === p || stripped.startsWith(p + '/'),
  );
}

export async function middleware(request: NextRequest) {
  // ── 1. Check NextAuth session ───────────────────────────
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── 2. Route protection ─────────────────────────────────
  if (!token && isProtectedPath(request.nextUrl.pathname)) {
    const locale =
      request.nextUrl.pathname.match(/^\/(ko|en|ja|zh)\//)?.[1] || '';
    const loginUrl = new URL(
      locale ? `/${locale}/login` : '/login',
      request.url,
    );
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Run i18n middleware ──────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Exclude: api, _next, static files, AND /s/ (hosted pages)
    '/((?!api|_next|s/|.*\\.[\\w]+$).*)',
    '/',
    '/(ko|en|ja|zh)/:path*',
  ],
};
