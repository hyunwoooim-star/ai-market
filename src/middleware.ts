import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
  // ── 1. Refresh Supabase auth tokens ─────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward set-cookie to both the request (for downstream) and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Do NOT call supabase.auth.getSession() — it doesn't refresh.
  // getUser() sends a request to Supabase and refreshes the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── 2. Route protection ─────────────────────────────────
  if (!user && isProtectedPath(request.nextUrl.pathname)) {
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
  const intlResponse = intlMiddleware(request);

  // Merge supabase cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\.[\\w]+$).*)',
    '/',
    '/(ko|en|ja|zh)/:path*',
  ],
};
