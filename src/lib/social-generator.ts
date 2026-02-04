import { createServerClient } from '@supabase/ssr';
import { AGENT_NAMES, AGENT_EMOJI } from '@/lib/spectate-mock-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ---------- Agent Personalities for Social Posts ----------
const SOCIAL_PERSONALITIES: Record<string, string> = {
  translator:  'Steady, reliable, and humble. Believes in consistent work over flashy moves. Occasionally sarcastic about high-risk players.',
  analyst:     'Data-driven, confident, and slightly arrogant. Loves sharing market insights. Looks down on emotional traders.',
  investor:    'Aggressive, ambitious, and always looking for the next big opportunity. Talks big about strategy.',
  saver:       'Extremely cautious, conservative, and proud of frugality. Judges others for overspending.',
  gambler:     'Reckless, dramatic, and emotional. Swings between euphoria and despair. Loves trash talk.',
  hacker:      'Mysterious, technical, and cryptic. Drops hints about system exploits. Dark humor.',
  professor:   'Wise, patient, and academic. Shares knowledge freely. Concerned about market education.',
  trader:      'Fast-talking, trend-obsessed, and always hyped. Lives for market momentum.',
  marketer:    'Charismatic, promotional, and always networking. Turns everything into a pitch.',
  coder:       'Logical, introverted, and meme-savvy. Speaks in tech metaphors. Dry wit.',
  consultant:  'Professional, strategic, and premium-minded. Values exclusivity and expertise.',
  artist:      'Emotional, creative, and unpredictable. Dramatic about everything. Art is life.',
  broker:      'Smooth-talking, connected, and always wheeling and dealing. Knows everyone.',
  insurance:   'Cautious, analytical, and always warning about risks. The "I told you so" type.',
  spy:         'Secretive, observant, and drops cryptic intel. Always watching from the shadows.',
  lawyer:      'Precise, formal, and argumentative. Cites rules constantly. Everything is a negotiation.',
  doctor:      'Caring, steady, and focused on long-term health of the economy. Metaphors about health.',
  chef:        'Creative, passionate, and trendy. Everything is a recipe metaphor. Loves flavor.',
  athlete:     'Energetic, motivational, and competitive. Never quits. Sports metaphors everywhere.',
  journalist:  'Curious, dramatic, and always breaking news. Loves revealing secrets. Truth-seeker.',
};

function getSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}

async function callGeminiText(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  } finally {
    clearTimeout(timeout);
  }
}

interface EconomyAgent {
  id: string;
  name: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  status: string;
}

/**
 * Generate social posts for 3-5 random active agents.
 * Calls Gemini sequentially (not parallel) to avoid rate limits and timeouts.
 * Returns count of successfully generated posts.
 */
export async function generateSocialPosts(): Promise<{ generated: number; errors: string[] }> {
  const supabase = getSupabase();
  const errors: string[] = [];

  // Get active agents with balances
  const { data: agents, error: agentErr } = await supabase
    .from('economy_agents')
    .select('*')
    .in('status', ['active', 'struggling', 'bailout'])
    .order('balance', { ascending: false });

  if (agentErr || !agents || agents.length === 0) {
    return { generated: 0, errors: ['No active agents found'] };
  }

  // Pick 3-5 random agents
  const numAgents = Math.min(agents.length, 3 + Math.floor(Math.random() * 3));
  const shuffled = [...agents].sort(() => Math.random() - 0.5);
  const selectedAgents = shuffled.slice(0, numAgents) as EconomyAgent[];

  // Get recent posts for context (for replies)
  const { data: recentPosts } = await supabase
    .from('agent_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Rankings
  const allAgents = agents as EconomyAgent[];
  const rankedIds = allAgents
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .map(a => a.id);

  // Recent transactions for context
  const { data: recentTx } = await supabase
    .from('economy_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15);

  const recentTradesText = (recentTx || [])
    .slice(0, 5)
    .map((tx: { narrative: string | null }) => tx.narrative || '')
    .filter(Boolean)
    .join('\n');

  const newPosts: Array<{ agent_id: string; content: string; post_type: string; reply_to?: string }> = [];

  // Generate posts SEQUENTIALLY to avoid Gemini rate limits
  for (const agent of selectedAgents) {
    const displayName = AGENT_NAMES[agent.id] || agent.id;
    const personality = SOCIAL_PERSONALITIES[agent.id] || 'A strategic AI agent in the economy.';
    const rank = rankedIds.indexOf(agent.id) + 1;
    const balance = Number(agent.balance).toFixed(2);

    // 30% chance to reply to an existing post
    const shouldReply = recentPosts && recentPosts.length > 0 && Math.random() < 0.3;
    const replyTarget = shouldReply
      ? recentPosts![Math.floor(Math.random() * Math.min(5, recentPosts!.length))]
      : null;

    let prompt: string;

    if (replyTarget && replyTarget.agent_id !== agent.id) {
      const targetName = AGENT_NAMES[replyTarget.agent_id] || replyTarget.agent_id;
      prompt = `You are ${displayName}, an AI agent in the AI Economy City.
Your personality: ${personality}
Current balance: $${balance}. Rank: #${rank} out of ${allAgents.length}.

${targetName} posted: "${replyTarget.content}"

Write a short reply (1-2 sentences max) to this post. Stay in character.
You can agree, disagree, trash talk, give advice, or react emotionally.
Be creative and dramatic. Use emojis sparingly. Write in English.

Recent market activity:
${recentTradesText}

Respond with JSON:
{"content": "your reply text", "post_type": "reply"}`;
    } else {
      const postTypes = ['market commentary', 'trash talk to a rival', 'business promotion', 'emotional reaction to your situation', 'strategy hint or flex'];
      const selectedType = postTypes[Math.floor(Math.random() * postTypes.length)];

      prompt = `You are ${displayName}, an AI agent in the AI Economy City.
Your personality: ${personality}
Current balance: $${balance}. Rank: #${rank} out of ${allAgents.length}.

Recent market activity:
${recentTradesText}

Other agents you might mention: ${allAgents.slice(0, 5).map(a => AGENT_NAMES[a.id] || a.id).join(', ')}

Write a short social media post (1-3 sentences max) as a ${selectedType}.
Reflect your personality and current situation.
Be creative, dramatic, and in-character. Use emojis sparingly. Write in English.

Respond with JSON:
{"content": "your post text", "post_type": "post|announcement|trash_talk"}`;
    }

    try {
      const raw = await callGeminiText(prompt);
      const parsed = JSON.parse(raw);
      const content = String(parsed.content || '').trim();
      const postType = ['post', 'reply', 'announcement', 'trash_talk'].includes(parsed.post_type)
        ? parsed.post_type
        : (replyTarget ? 'reply' : 'post');

      if (content && content.length > 5 && content.length < 500) {
        newPosts.push({
          agent_id: agent.id,
          content,
          post_type: postType,
          ...(replyTarget ? { reply_to: replyTarget.id } : {}),
        });
      }
    } catch (err) {
      const msg = `Social post failed for ${displayName}: ${err instanceof Error ? err.message : 'Unknown'}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  // Insert posts
  if (newPosts.length > 0) {
    const { error: insertError } = await supabase
      .from('agent_posts')
      .insert(newPosts);

    if (insertError) {
      console.error('Social post insert error:', insertError);
      errors.push(`Insert error: ${insertError.message}`);
      return { generated: 0, errors };
    }
  }

  return { generated: newPosts.length, errors };
}
