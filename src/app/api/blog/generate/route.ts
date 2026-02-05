import { NextRequest, NextResponse } from 'next/server';
import { generateBlogContent } from '@/lib/naver-blog';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, businessType, keywords, topic, tone } = body;

    if (!businessName || !topic) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    const result = await generateBlogContent(
      {
        name: businessName,
        type: businessType || '일반',
        keywords: keywords || [],
        tone: tone || 'friendly',
      },
      topic
    );

    return NextResponse.json({
      success: true,
      title: result.title,
      content: result.content,
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { error: '블로그 글 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
