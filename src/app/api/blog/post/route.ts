import { NextRequest, NextResponse } from 'next/server';
import { postToNaverBlog } from '@/lib/naver-blog';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, categoryNo } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 1. 사용자의 네이버 연결 정보 조회
    const { data: connection, error: connError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'naver')
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: '네이버 계정이 연결되지 않았습니다. 먼저 연결해주세요.' },
        { status: 401 }
      );
    }

    // 2. 토큰 만료 확인 및 갱신
    let accessToken = connection.access_token;
    
    if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
      // 토큰 갱신 필요
      const { refreshNaverToken } = await import('@/lib/naver-blog');
      const newTokens = await refreshNaverToken(connection.refresh_token);
      
      if (!newTokens) {
        return NextResponse.json(
          { error: '네이버 연결이 만료되었습니다. 다시 연결해주세요.' },
          { status: 401 }
        );
      }

      // 갱신된 토큰 저장
      await supabase
        .from('user_connections')
        .update({
          access_token: newTokens.accessToken,
          refresh_token: newTokens.refreshToken,
          token_expires_at: new Date(Date.now() + newTokens.expiresIn * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      accessToken = newTokens.accessToken;
    }

    // 3. 블로그 글 발행
    const result = await postToNaverBlog(accessToken, {
      title,
      contents: content,
      categoryNo,
    });

    if (!result.success) {
      // 실패 기록
      await supabase.from('blog_posts').insert({
        user_id: userId,
        connection_id: connection.id,
        title,
        content,
        platform: 'naver',
        status: 'failed',
        error_message: result.error,
      });

      return NextResponse.json(
        { error: result.error || '발행에 실패했습니다' },
        { status: 500 }
      );
    }

    // 4. 성공 기록
    const { data: post } = await supabase
      .from('blog_posts')
      .insert({
        user_id: userId,
        connection_id: connection.id,
        title,
        content,
        platform: 'naver',
        platform_post_id: result.postId,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 5. 활동 로그 기록
    await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'blog_post',
      activity_status: 'completed',
      description: `네이버 블로그 발행: ${title}`,
      related_entity_type: 'blog_post',
      related_entity_id: post?.id,
    });

    return NextResponse.json({
      success: true,
      postId: result.postId,
      message: '블로그 글이 발행되었습니다!',
    });
  } catch (error) {
    console.error('Blog post error:', error);
    return NextResponse.json(
      { error: '블로그 발행 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
