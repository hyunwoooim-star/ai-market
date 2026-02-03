import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/data/agents';
import { getSystemPrompt } from '@/data/prompts';
import { checkRateLimit, trackUsage, isDailyLimitReached } from '@/lib/rate-limit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const MAX_MESSAGE_LENGTH = 3000;
const MAX_HISTORY_LENGTH = 20;
const RATE_LIMIT_PER_MIN = 10;

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // Rate limit
    const rl = checkRateLimit(`min:${ip}`, RATE_LIMIT_PER_MIN, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    if (isDailyLimitReached()) {
      return NextResponse.json(
        { error: '오늘 서비스 사용량이 한도에 도달했습니다.' },
        { status: 503 }
      );
    }

    const { agentId, message, history = [] } = await req.json();

    if (!message || typeof message !== 'string' || !agentId) {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
    }

    const cleanMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!cleanMessage) {
      return NextResponse.json({ error: '메시지를 입력해주세요' }, { status: 400 });
    }

    const agent = getAgent(agentId);
    if (!agent || agent.status === 'coming_soon') {
      return NextResponse.json({ error: '사용할 수 없는 에이전트입니다' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = getSystemPrompt(agentId);

    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-MAX_HISTORY_LENGTH)
      .filter((h: ChatHistory) => h?.content && (h.role === 'user' || h.role === 'assistant'))
      .map((h: ChatHistory) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.content).slice(0, 2000) }],
      }));

    const contents = [
      ...safeHistory,
      { role: 'user', parts: [{ text: cleanMessage }] },
    ];

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: agentId === 'soul-friend' ? 0.9 : 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
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
      console.error('Gemini API error:', geminiRes.status);
      return NextResponse.json({ error: 'AI 응답 중 오류가 발생했습니다' }, { status: 502 });
    }

    trackUsage(ip);

    const data = await geminiRes.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json(
      { response, agentId },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
