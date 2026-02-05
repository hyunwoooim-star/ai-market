import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // hosted_pages 먼저 확인
    const { data: hostedPage } = await supabase
      .from('hosted_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (hostedPage) {
      return NextResponse.json({
        ...hostedPage,
        source: 'hosted_pages',
      });
    }

    // sites 테이블 fallback
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .single();

    if (site) {
      return NextResponse.json({
        ...site,
        source: 'sites',
      });
    }

    return NextResponse.json(
      { error: '페이지를 찾을 수 없습니다.' },
      { status: 404 }
    );
  } catch (err) {
    console.error('[hosting/get] Error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
