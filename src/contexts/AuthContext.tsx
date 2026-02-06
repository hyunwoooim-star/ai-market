'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithKakao: () => void;
  signInWithNaver: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithKakao: () => {},
  signInWithNaver: () => {},
  signOut: () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [kakaoUser, setKakaoUser] = useState<User | null>(null);
  const loading = status === 'loading';

  useEffect(() => {
    // 카카오 쿠키 체크 (레거시 지원)
    try {
      const raw = getCookie('kakao_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setKakaoUser({
          id: parsed.id,
          name: parsed.nickname,
          image: parsed.profileImage,
          provider: 'kakao',
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // NextAuth 세션 우선, 없으면 카카오 쿠키
  const user: User | null = session?.user 
    ? {
        id: (session.user as any).id || session.user.email || '',
        name: session.user.name || 'User',
        email: session.user.email || undefined,
        image: session.user.image || undefined,
        provider: (session as any).provider,
      }
    : kakaoUser;

  const signInWithKakao = () => {
    window.location.href = '/api/auth/kakao';
  };

  const signInWithNaver = () => {
    nextAuthSignIn('naver', { callbackUrl: '/' });
  };

  const signOut = () => {
    // 카카오 쿠키 삭제
    deleteCookie('kakao_user');
    setKakaoUser(null);
    // NextAuth 로그아웃
    nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithKakao, signInWithNaver, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
