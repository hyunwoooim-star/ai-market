import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AGENT_NAMES, AGENT_EMOJI } from '@/lib/spectate-mock-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const CRON_SECRET = process.env.CRON_SECRET;
const EPOCH_SECRET = process.env.ECONOMY_EPOCH_SECRET;

// ---------- Helpers ----------

function getSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (EPOCH_SECRET && authHeader === `Bearer ${EPOCH_SECRET}`) return true;
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true;
  return false;
}

interface AgentPost {
  id: string;
  agent_id: string;
  content: string;
  reply_to: string | null;
  post_type: string;
  likes: number;
  created_at: string;
}

function enrichPost(post: AgentPost, parentPost?: AgentPost | null) {
  return {
    ...post,
    agent_name: AGENT_NAMES[post.agent_id] || post.agent_id,
    agent_emoji: AGENT_EMOJI[post.agent_id] || '🤖',
    parent: parentPost ? {
      id: parentPost.id,
      agent_id: parentPost.agent_id,
      agent_name: AGENT_NAMES[parentPost.agent_id] || parentPost.agent_id,
      agent_emoji: AGENT_EMOJI[parentPost.agent_id] || '🤖',
      content: parentPost.content,
    } : null,
  };
}

// ---------- GET: Fetch posts ----------

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const agentId = searchParams.get('agent_id');
    const postType = searchParams.get('type');

    let query = supabase
      .from('agent_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (postType) {
      query = query.eq('post_type', postType);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Social feed fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch parent posts for replies
    const replyToIds = (posts || [])
      .filter((p: AgentPost) => p.reply_to)
      .map((p: AgentPost) => p.reply_to as string);

    let parentPosts: AgentPost[] = [];
    if (replyToIds.length > 0) {
      const { data } = await supabase
        .from('agent_posts')
        .select('*')
        .in('id', replyToIds);
      parentPosts = (data || []) as AgentPost[];
    }

    const parentMap = new Map(parentPosts.map(p => [p.id, p]));

    const enrichedPosts = (posts || []).map((post: AgentPost) =>
      enrichPost(post, post.reply_to ? parentMap.get(post.reply_to) || null : null)
    );

    return NextResponse.json({
      posts: enrichedPosts,
      total: enrichedPosts.length,
      offset,
      limit,
    });
  } catch (err) {
    console.error('Social feed error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch social feed' },
      { status: 500 }
    );
  }
}

// ---------- POST: Generate agent posts (delegates to shared lib) ----------

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use shared social generator module (same logic used by cron)
    const { generateSocialPosts } = await import('@/lib/social-generator');
    const result = await generateSocialPosts();

    return NextResponse.json({
      success: true,
      generated: result.generated,
      errors: result.errors,
    });
  } catch (err) {
    console.error('Social post generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Post generation failed' },
      { status: 500 }
    );
  }
}
