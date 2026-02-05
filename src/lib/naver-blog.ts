/**
 * 네이버 블로그 API 연동
 * 
 * API 문서: https://developers.naver.com/docs/blog/post/blogpost.md
 * OAuth: https://developers.naver.com/docs/login/api/api.md
 */

interface NaverBlogPostParams {
  title: string;
  contents: string;
  categoryNo?: string;
}

interface NaverBlogResponse {
  message: string;
  result: {
    logNo: string;
    blogId: string;
  };
}

/**
 * 네이버 블로그에 글 발행
 */
export async function postToNaverBlog(
  accessToken: string,
  params: NaverBlogPostParams
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const response = await fetch(
      'https://openapi.naver.com/blog/writePost.json',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          title: params.title,
          contents: params.contents,
          ...(params.categoryNo && { categoryNo: params.categoryNo }),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Naver Blog API Error:', error);
      return { 
        success: false, 
        error: `네이버 API 오류: ${response.status}` 
      };
    }

    const data: NaverBlogResponse = await response.json();
    
    if (data.message === 'success') {
      return {
        success: true,
        postId: data.result.logNo,
      };
    }

    return { success: false, error: data.message };
  } catch (error) {
    console.error('Naver Blog post error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    };
  }
}

/**
 * 네이버 블로그 카테고리 목록 조회
 */
export async function getNaverBlogCategories(
  accessToken: string
): Promise<{ id: string; name: string }[]> {
  try {
    const response = await fetch(
      'https://openapi.naver.com/blog/listCategory.json',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch categories:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.result?.categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * 네이버 OAuth 토큰 갱신
 */
export async function refreshNaverToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Token refresh error:', data.error_description);
      return null;
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * AI로 블로그 글 생성
 */
export async function generateBlogContent(
  businessInfo: {
    name: string;
    type: string;
    keywords: string[];
    tone?: 'friendly' | 'professional' | 'casual';
  },
  topic: string
): Promise<{ title: string; content: string }> {
  const systemPrompt = `당신은 한국 소상공인을 위한 블로그 글 작성 전문가입니다.
SEO에 최적화된, 자연스럽고 읽기 좋은 블로그 글을 작성합니다.

비즈니스 정보:
- 상호: ${businessInfo.name}
- 업종: ${businessInfo.type}
- 키워드: ${businessInfo.keywords.join(', ')}
- 톤: ${businessInfo.tone || 'friendly'}

작성 규칙:
1. 제목은 클릭을 유도하되 어그로는 피하기
2. 본문은 500-800자 정도로 적당히
3. 키워드를 자연스럽게 2-3회 포함
4. 문단을 나누어 가독성 높이기
5. 마지막에 자연스럽게 가게 소개

HTML 형식으로 작성하세요.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `주제: ${topic}\n\n위 주제로 블로그 글을 작성해주세요. JSON 형식으로 {"title": "제목", "content": "HTML 내용"} 반환.` },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    title: result.title,
    content: result.content,
  };
}
