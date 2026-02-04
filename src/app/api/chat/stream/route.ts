import { NextRequest } from 'next/server';
import { getAgent } from '@/data/agents';
import { getSystemPrompt } from '@/data/prompts';
import { checkRateLimit, trackUsage, isDailyLimitReached } from '@/lib/rate-limit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_STREAM_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse';

// Security constants
const MAX_MESSAGE_LENGTH = 3000;   // Max 3,000 chars per message
const MAX_HISTORY_LENGTH = 20;     // Max 20 turns of history
const MAX_HISTORY_CHARS = 15000;   // Max 15,000 chars total history
const RATE_LIMIT_PER_MIN = 10;     // 10 requests per minute per IP
const RATE_LIMIT_PER_HOUR = 60;    // 60 requests per hour per IP

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
  // Basic sanitization — remove control characters
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // === Security check 1: Origin validation ===
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = [
      'https://agentmarket.kr',
      'https://ai-market-delta.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    // Also allow Vercel preview deployments
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.includes('.vercel.app') ||
      !origin; // Server-side calls

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // === Security check 2: Rate Limiting ===
    const minuteCheck = checkRateLimit(`min:${ip}`, RATE_LIMIT_PER_MIN, 60_000);
    if (!minuteCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
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
          error: 'Hourly usage limit exceeded. Please try again later.',
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

    // === Security check 3: Daily global limit ===
    if (isDailyLimitReached()) {
      return new Response(
        JSON.stringify({ error: 'Daily usage limit reached. Please try again tomorrow.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // === Input validation ===
    const body = await req.json();
    const { agentId, message, history = [] } = body;

    if (!message || typeof message !== 'string' || !agentId || typeof agentId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Message length limit
    const cleanMessage = sanitizeInput(message);
    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (cleanMessage.length === 0) {
      return new Response(JSON.stringify({ error: 'Please enter a message.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Agent validation
    const agent = getAgent(agentId);
    if (!agent || agent.status === 'coming_soon') {
      return new Response(JSON.stringify({ error: 'Agent not available' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // History validation + limits
    let safeHistory: ChatHistory[] = [];
    if (Array.isArray(history)) {
      safeHistory = history
        .slice(-MAX_HISTORY_LENGTH) // Keep only last N turns
        .filter(
          (h: ChatHistory) =>
            h &&
            typeof h.content === 'string' &&
            (h.role === 'user' || h.role === 'assistant')
        )
        .map((h: ChatHistory) => ({
          role: h.role,
          content: sanitizeInput(h.content).slice(0, 2000), // 2,000 chars per turn limit
        }));

      // Total history character limit
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
    const temperature = agentId === 'soul-friend' || agentId === 'mood-diary' ? 0.9 : 0.7;

    // Build OpenAI-compatible messages for Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...safeHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: cleanMessage },
    ];

    // Build Gemini-format contents
    const geminiContents = [
      ...safeHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: cleanMessage }],
      },
    ];

    let llmRes: Response | null = null;
    let useGroq = false;

    // Try Groq first
    if (GROQ_API_KEY) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            temperature,
            max_tokens: 2048,
            stream: true,
          }),
        });
        if (res.ok) {
          llmRes = res;
          useGroq = true;
        } else {
          console.warn('[Chat] Groq stream failed:', res.status, 'falling back to Gemini');
        }
      } catch (e) {
        console.warn('[Chat] Groq stream error, falling back to Gemini:', e);
      }
    }

    // Fallback to Gemini
    if (!llmRes && GEMINI_API_KEY) {
      const res = await fetch(`${GEMINI_STREAM_URL}&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          generationConfig: {
            temperature,
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
      if (res.ok) {
        llmRes = res;
      } else {
        const errText = await res.text();
        console.error('Gemini stream error:', res.status, errText);
      }
    }

    if (!llmRes) {
      return new Response(JSON.stringify({ error: 'AI response error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Track usage
    trackUsage(ip);

    // Transform SSE → clean SSE for the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = llmRes!.body!.getReader();
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
                let text: string | undefined;
                if (useGroq) {
                  // OpenAI-compatible SSE: choices[0].delta.content
                  text = data.choices?.[0]?.delta?.content;
                } else {
                  // Gemini SSE: candidates[0].content.parts[0].text
                  text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                }
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
