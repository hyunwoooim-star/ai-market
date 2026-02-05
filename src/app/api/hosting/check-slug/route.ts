import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9\-]{1,48}[a-z0-9])?$/;

const RESERVED_SLUGS = ['admin', 'api', 'app', 'create', 'edit', 'login', 'signup', 'settings', 'hosting', 'dashboard'];

function generateSuggestion(slug: string): string {
  const timestamp = Date.now().toString(36).slice(-4);
  return `${slug}-${timestamp}`;
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // 형식 검증
    if (!SLUG_REGEX.test(normalizedSlug)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid_format',
        message: '영문 소문자, 숫자, 하이픈만 사용 가능합니다. (3~50자)',
      });
    }

    // 예약어 체크
    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: '이 URL 주소는 예약되어 있습니다.',
        suggestion: generateSuggestion(normalizedSlug),
      });
    }

    // hosted_pages + sites 테이블 모두 체크
    const [{ data: existingHosted }, { data: existingSite }] = await Promise.all([
      supabase.from('hosted_pages').select('id').eq('slug', normalizedSlug).single(),
      supabase.from('sites').select('id').eq('slug', normalizedSlug).single(),
    ]);

    const isAvailable = !existingHosted && !existingSite;

    return NextResponse.json({
      available: isAvailable,
      slug: normalizedSlug,
      ...(isAvailable
        ? {}
        : {
            reason: 'taken',
            message: '이미 사용 중인 URL 주소입니다.',
            suggestion: generateSuggestion(normalizedSlug),
          }),
    });
  } catch (err) {
    console.error('[hosting/check-slug] Error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
