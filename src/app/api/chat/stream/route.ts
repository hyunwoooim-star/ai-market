import { NextRequest } from 'next/server';
import { getAgent } from '@/data/agents';
import { getSystemPrompt } from '@/data/prompts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_STREAM_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse';

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, message, history = [] } = await req.json();

    if (!message || !agentId) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const agent = getAgent(agentId);
    if (!agent || agent.status === 'coming_soon') {
      return new Response(JSON.stringify({ error: 'Agent not available' }), {
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

    const systemPrompt = getSystemPrompt(agentId);

    const contents = [
      ...(history as ChatHistory[]).map((msg: ChatHistory) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    // Use Gemini's systemInstruction for cleaner prompt injection
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
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini stream error:', geminiRes.status, errText);
      return new Response(JSON.stringify({ error: 'AI response failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
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
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Stream API error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
