'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface KakaoUser {
  id: string;
  nickname: string;
  profileImage: string;
  thumbnailImage: string;
}

interface AuthContextType {
  user: KakaoUser | null;
  loading: boolean;
  signInWithKakao: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithKakao: () => {},
  signOut: () => {},
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KakaoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 쿠키에서 유저 정보 읽기
    try {
      const raw = getCookie('kakao_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signInWithKakao = () => {
    // 커스텀 카카오 OAuth 라우트로 리다이렉트
    window.location.href = '/api/auth/kakao';
  };

  const signOut = () => {
    deleteCookie('kakao_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithKakao, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
