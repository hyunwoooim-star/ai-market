import { NextRequest, NextResponse } from 'next/server';

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID!;
const REDIRECT_URI = 'https://agentmarket.kr/api/auth/kakao/callback';

export async function GET(request: NextRequest) {
  // Save the page user came from so we can redirect back after login
  const referer = request.headers.get('referer') || '';
  const returnTo = referer.includes('agentmarket.kr') ? new URL(referer).pathname : '/';
  
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile_nickname,profile_image&state=${encodeURIComponent(returnTo)}`;

  return NextResponse.redirect(kakaoAuthUrl);
}
