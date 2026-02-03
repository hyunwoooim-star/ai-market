import { NextResponse } from 'next/server';

const KAKAO_CLIENT_ID = 'c4adbc33d3183591159fd8a4052ffb0f';
const REDIRECT_URI = 'https://agentmarket.kr/api/auth/kakao/callback';

export async function GET() {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile_nickname,profile_image`;

  return NextResponse.redirect(kakaoAuthUrl);
}
