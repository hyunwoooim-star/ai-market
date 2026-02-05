import NextAuth from "next-auth"
import type { NextAuthConfig, Account, Profile } from "next-auth"
import type { OAuthConfig } from "next-auth/providers"

// Naver OAuth Provider (커스텀) - NextAuth v5 완전한 설정
const NaverProvider: OAuthConfig<any> = {
  id: "naver",
  name: "Naver",
  type: "oauth",
  clientId: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: {
      response_type: "code",
    },
  },
  token: {
    url: "https://nid.naver.com/oauth2.0/token",
    params: {
      grant_type: "authorization_code",
    },
  },
  userinfo: {
    url: "https://openapi.naver.com/v1/nid/me",
    async request({ tokens, provider }: { tokens: any; provider: any }) {
      const res = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })
      return await res.json()
    },
  },
  profile(profile: any) {
    return {
      id: profile.response?.id ?? profile.id,
      name: profile.response?.name ?? profile.response?.nickname ?? "User",
      email: profile.response?.email,
      image: profile.response?.profile_image,
    }
  },
  checks: ["state"],
  style: {
    brandColor: "#03C75A",
  },
}

// Kakao OAuth Provider (커스텀) - NextAuth v5 완전한 설정
const KakaoProvider: OAuthConfig<any> = {
  id: "kakao",
  name: "Kakao",
  type: "oauth",
  clientId: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: {
      response_type: "code",
    },
  },
  token: {
    url: "https://kauth.kakao.com/oauth/token",
    params: {
      grant_type: "authorization_code",
    },
  },
  userinfo: {
    url: "https://kapi.kakao.com/v2/user/me",
  },
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname ?? "User",
      email: profile.kakao_account?.email,
      image: profile.kakao_account?.profile?.thumbnail_image_url,
    }
  },
  checks: ["state"],
  style: {
    brandColor: "#FEE500",
  },
}

export const authConfig: NextAuthConfig = {
  providers: [
    NaverProvider,
    KakaoProvider,
  ],
  callbacks: {
    async jwt({ token, account }) {
      // OAuth 연결 시 토큰 정보 저장
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
        token.expiresAt = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      // 세션에 토큰 정보 전달
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
