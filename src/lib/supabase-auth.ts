import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Get authenticated user from Supabase session (for API routes / server components).
 * Returns null if not authenticated.
 */
export async function getAuthUser(request?: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서는 쿠키 설정 불가
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

/**
 * Get authenticated user ID, or return a fallback anonymous ID.
 * Useful for APIs that should work both with and without auth.
 */
export async function getAuthUserIdOrAnon(): Promise<{
  userId: string;
  isAnonymous: boolean;
}> {
  const user = await getAuthUser();
  if (user) {
    return { userId: user.id, isAnonymous: false };
  }
  return { userId: 'anonymous', isAnonymous: true };
}
