import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const EDIT_SYSTEM_PROMPT = `당신은 웹 페이지 HTML 수정 전문가입니다.
사용자의 수정 지시에 따라 기존 HTML을 정확하게 수정합니다.

규칙:
- 수정된 전체 HTML만 출력하세요 (설명 텍스트 없이)
- 코드블록 마커(\`\`\`html, \`\`\`) 절대 포함하지 마세요
- <!DOCTYPE html>로 시작해서 </html>로 끝나야 합니다
- 기존 스타일과 구조를 최대한 유지하면서 요청된 부분만 수정하세요
- 한국어 콘텐츠를 자연스럽게 유지하세요
- Tailwind CSS 클래스를 활용하세요`;

interface EditRequestBody {
  slug: string;
  instruction: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: EditRequestBody = await req.json();
    const { slug, instruction } = body;

    // 필수 필드 체크
    if (!slug || !instruction) {
      return NextResponse.json(
        { error: 'slug와 instruction은 필수 항목입니다.' },
        { status: 400 }
      );
    }

    if (instruction.length > 1000) {
      return NextResponse.json(
        { error: '수정 지시는 1000자 이내로 입력해주세요.' },
        { status: 400 }
      );
    }

    // 현재 HTML 조회 (hosted_pages → sites 순서)
    let currentHtml: string | null = null;
    let sourceTable: 'hosted_pages' | 'sites' = 'hosted_pages';

    const { data: hostedPage } = await supabase
      .from('hosted_pages')
      .select('html_content')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (hostedPage) {
      currentHtml = hostedPage.html_content;
      sourceTable = 'hosted_pages';
    } else {
      const { data: site } = await supabase
        .from('sites')
        .select('html_content')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (site) {
        currentHtml = site.html_content;
        sourceTable = 'sites';
      }
    }

    if (!currentHtml) {
      return NextResponse.json(
        { error: '해당 페이지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Groq API 키 체크
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('[hosting/edit] GROQ_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI 수정 기능을 사용할 수 없습니다. 관리자에게 문의해주세요.' },
        { status: 503 }
      );
    }

    // HTML이 너무 크면 잘라서 전송 (Groq 컨텍스트 제한 대응)
    const MAX_HTML_LENGTH = 60000;
    const trimmedHtml = currentHtml.length > MAX_HTML_LENGTH
      ? currentHtml.slice(0, MAX_HTML_LENGTH) + '\n<!-- ... 이하 생략 ... -->\n</html>'
      : currentHtml;

    // Groq API로 수정 요청
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: EDIT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `다음 HTML을 수정해주세요.\n\n수정 지시: ${instruction}\n\n현재 HTML:\n${trimmedHtml}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[hosting/edit] Groq API error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: 'AI 수정 요청에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    let modifiedHtml = groqData.choices?.[0]?.message?.content;

    if (!modifiedHtml) {
      return NextResponse.json(
        { error: 'AI가 유효한 응답을 반환하지 않았습니다.' },
        { status: 502 }
      );
    }

    // 코드블록 마커 제거 (혹시 포함된 경우)
    modifiedHtml = modifiedHtml
      .replace(/^```html?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // 기본 HTML 유효성 체크
    if (!modifiedHtml.includes('<!DOCTYPE') && !modifiedHtml.includes('<html')) {
      return NextResponse.json(
        { error: 'AI가 유효한 HTML을 생성하지 못했습니다. 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    // Supabase 업데이트
    const updateColumn = sourceTable === 'hosted_pages' ? 'html_content' : 'html_content';
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({
        [updateColumn]: modifiedHtml,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (updateError) {
      console.error('[hosting/edit] Supabase update error:', updateError);
      return NextResponse.json(
        { error: '수정된 페이지 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      url: `https://agentmarket.kr/s/${slug}`,
      message: '페이지가 성공적으로 수정되었습니다.',
    });
  } catch (err) {
    console.error('[hosting/edit] Unexpected error:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
