import { NextRequest } from 'next/server';
import { getAgent } from '@/data/agents';
import { getSystemPrompt } from '@/data/prompts';
import { checkRateLimit, trackUsage, isDailyLimitReached } from '@/lib/rate-limit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_STREAM_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse';

// 보안 상수
const MAX_MESSAGE_LENGTH = 3000;   // 메시지 최대 3,000자
const MAX_HISTORY_LENGTH = 20;     // 히스토리 최대 20턴
const MAX_HISTORY_CHARS = 15000;   // 히스토리 총 15,000자
const RATE_LIMIT_PER_MIN = 10;     // IP당 분당 10회
const RATE_LIMIT_PER_HOUR = 60;    // IP당 시간당 60회

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function sanitizeInput(text: string): string {
  // 기본 sanitization — 제어 문자 제거
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // === 보안 체크 1: Origin 검증 ===
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = [
      'https://agentmarket.kr',
      'https://ai-market-delta.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    // Vercel preview deployments도 허용
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.includes('.vercel.app') ||
      !origin; // 서버사이드 호출

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: '접근이 거부되었습니다' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // === 보안 체크 2: Rate Limiting ===
    const minuteCheck = checkRateLimit(`min:${ip}`, RATE_LIMIT_PER_MIN, 60_000);
    if (!minuteCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((minuteCheck.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((minuteCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const hourCheck = checkRateLimit(`hr:${ip}`, RATE_LIMIT_PER_HOUR, 3600_000);
    if (!hourCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: '시간당 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((hourCheck.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((hourCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // === 보안 체크 3: 일일 전체 한도 ===
    if (isDailyLimitReached()) {
      return new Response(
        JSON.stringify({ error: '오늘 서비스 사용량이 한도에 도달했습니다. 내일 다시 이용해주세요.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // === 입력 검증 ===
    const body = await req.json();
    const { agentId, message, history = [] } = body;

    if (!message || typeof message !== 'string' || !agentId || typeof agentId !== 'string') {
      return new Response(JSON.stringify({ error: '잘못된 요청입니다' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 메시지 길이 제한
    const cleanMessage = sanitizeInput(message);
    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 작성해주세요.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (cleanMessage.length === 0) {
      return new Response(JSON.stringify({ error: '메시지를 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 에이전트 검증
    const agent = getAgent(agentId);
    if (!agent || agent.status === 'coming_soon') {
      return new Response(JSON.stringify({ error: '사용할 수 없는 에이전트입니다' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 히스토리 검증 + 제한
    let safeHistory: ChatHistory[] = [];
    if (Array.isArray(history)) {
      safeHistory = history
        .slice(-MAX_HISTORY_LENGTH) // 최근 N턴만
        .filter(
          (h: ChatHistory) =>
            h &&
            typeof h.content === 'string' &&
            (h.role === 'user' || h.role === 'assistant')
        )
        .map((h: ChatHistory) => ({
          role: h.role,
          content: sanitizeInput(h.content).slice(0, 2000), // 턴당 2,000자 제한
        }));

      // 총 히스토리 문자수 제한
      let totalChars = 0;
      const trimmedHistory: ChatHistory[] = [];
      for (let i = safeHistory.length - 1; i >= 0; i--) {
        totalChars += safeHistory[i].content.length;
        if (totalChars > MAX_HISTORY_CHARS) break;
        trimmedHistory.unshift(safeHistory[i]);
      }
      safeHistory = trimmedHistory;
    }

    const systemPrompt = getSystemPrompt(agentId);

    const contents = [
      ...safeHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: cleanMessage }],
      },
    ];

    const geminiRes = await fetch(`${GEMINI_STREAM_URL}&key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: agentId === 'soul-friend' || agentId === 'mood-diary' ? 0.9 : 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048, // 4096 → 2048로 축소 (비용 절감)
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini stream error:', geminiRes.status, errText);
      return new Response(JSON.stringify({ error: 'AI 응답 중 오류가 발생했습니다' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 사용량 추적
    trackUsage(ip);

    // Transform Gemini SSE → clean SSE for the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;

              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        } catch (err) {
          console.error('Stream read error:', err);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': String(minuteCheck.remaining),
      },
    });
  } catch (err) {
    console.error('Stream API error:', err);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
