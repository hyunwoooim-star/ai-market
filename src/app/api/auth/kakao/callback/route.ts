import { NextRequest, NextResponse } from 'next/server';

const KAKAO_CLIENT_ID = 'c4adbc33d3183591159fd8a4052ffb0f';
const KAKAO_CLIENT_SECRET = 'eR7iKyS8XEi6iZScUuJHmwA5uULCydwT';
const REDIRECT_URI = 'https://agentmarket.kr/api/auth/kakao/callback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect('https://agentmarket.kr/?auth_error=true');
  }

  try {
    // 1. 인가코드 → 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect('https://agentmarket.kr/?auth_error=token_failed');
    }

    // 2. 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();
    const kakaoAccount = userData.kakao_account || {};
    const profile = kakaoAccount.profile || {};

    const userInfo = {
      id: String(userData.id),
      nickname: profile.nickname || '사용자',
      profileImage: profile.profile_image_url || '',
      thumbnailImage: profile.thumbnail_image_url || '',
    };

    // 3. 쿠키에 유저 정보 저장 (JWT 없이 심플하게)
    const response = NextResponse.redirect('https://agentmarket.kr/');
    response.cookies.set('kakao_user', JSON.stringify(userInfo), {
      httpOnly: false, // 클라이언트에서 읽을 수 있게
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Kakao auth error:', err);
    return NextResponse.redirect('https://agentmarket.kr/?auth_error=server_error');
  }
}
