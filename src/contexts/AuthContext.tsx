'use client';

import { createContext, useContext, ReactNode } from 'react';
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

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  // NextAuth 세션에서 유저 정보 추출
  const user: User | null = session?.user 
    ? {
        id: (session.user as any).id || session.user.email || '',
        name: session.user.name || 'User',
        email: session.user.email || undefined,
        image: session.user.image || undefined,
        provider: (session as any).provider,
      }
    : null;

  // 둘 다 NextAuth 사용
  const signInWithKakao = () => {
    nextAuthSignIn('kakao', { callbackUrl: '/' });
  };

  const signInWithNaver = () => {
    nextAuthSignIn('naver', { callbackUrl: '/' });
  };

  const signOut = () => {
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
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
