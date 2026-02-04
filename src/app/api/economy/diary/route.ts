import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { generateDiaries, getNextEpochNumber } from '@/lib/economy-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const EPOCH_SECRET = process.env.ECONOMY_EPOCH_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;

const AGENT_DISPLAY_NAMES: Record<string, string> = {
  translator:  'Translator Bot',
  analyst:     'Analyst Bot',
  investor:    'Investor Bot',
  saver:       'Saver Bot',
  gambler:     'Gambler Bot',
  hacker:      'Hacker Bot',
  professor:   'Professor Bot',
  trader:      'Trader Bot',
  marketer:    'Marketer Bot',
  coder:       'Coder Bot',
  consultant:  'Consultant Bot',
  artist:      'Artist Bot',
  broker:      'Broker Bot',
  insurance:   'Insurance Bot',
  spy:         'Spy Bot',
  lawyer:      'Lawyer Bot',
  doctor:      'Doctor Bot',
  chef:        'Chef Bot',
  athlete:     'Athlete Bot',
  journalist:  'Journalist Bot',
};

const AGENT_EMOJI: Record<string, string> = {
  translator:  '🌐',
  analyst:     '📊',
  investor:    '💼',
  saver:       '🏦',
  gambler:     '🎰',
  hacker:      '🔓',
  professor:   '🎓',
  trader:      '📈',
  marketer:    '📢',
  coder:       '💻',
  consultant:  '🧠',
  artist:      '🎨',
  broker:      '🤝',
  insurance:   '🛡️',
  spy:         '🕵️',
  lawyer:      '⚖️',
  doctor:      '🏥',
  chef:        '👨‍🍳',
  athlete:     '🏋️',
  journalist:  '📰',
};

const MOOD_EMOJI: Record<string, string> = {
  excited:    '🤩',
  worried:    '😰',
  confident:  '😎',
  desperate:  '😱',
  strategic:  '🧠',
  angry:      '😤',
  hopeful:    '🌟',
  neutral:    '😐',
};

function getSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);

    const agentId = searchParams.get('agent_id');
    const epoch = searchParams.get('epoch');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(1, parseInt(limitParam || '10', 10) || 10), 50);

    let query = supabase
      .from('agent_diaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (epoch) {
      query = query.eq('epoch', parseInt(epoch, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Diary API] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch diaries' }, { status: 500 });
    }

    const diaries = (data || []).map((entry: Record<string, unknown>) => ({
      id: entry.id,
      agent_id: entry.agent_id,
      agent_name: AGENT_DISPLAY_NAMES[entry.agent_id as string] || entry.agent_id,
      agent_emoji: AGENT_EMOJI[entry.agent_id as string] || '🤖',
      epoch: entry.epoch,
      content: entry.content,
      mood: entry.mood,
      mood_emoji: MOOD_EMOJI[entry.mood as string] || '😐',
      highlights: entry.highlights,
      created_at: entry.created_at,
    }));

    return NextResponse.json({ diaries });
  } catch (err) {
    console.error('[Diary API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------- POST: Generate diary entries for latest epoch ----------

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (EPOCH_SECRET && authHeader === `Bearer ${EPOCH_SECRET}`) return true;
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    // Get the epoch to generate diaries for (default: latest)
    const body = await req.json().catch(() => ({}));
    const requestedEpoch = (body as { epoch?: number }).epoch;

    let epochNumber: number;
    if (requestedEpoch) {
      epochNumber = requestedEpoch;
    } else {
      // Use the latest completed epoch (current - 1)
      epochNumber = (await getNextEpochNumber()) - 1;
      if (epochNumber < 1) {
        return NextResponse.json({ error: 'No epochs have been run yet' }, { status: 400 });
      }
    }

    // Check if diaries already exist for this epoch
    const { data: existing } = await supabase
      .from('agent_diaries')
      .select('id')
      .eq('epoch', epochNumber)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Diaries for epoch ${epochNumber} already exist`,
        epoch: epochNumber,
        skipped: true,
      });
    }

    // Get agents and transactions for this epoch
    const [{ data: agents }, { data: transactions }] = await Promise.all([
      supabase.from('economy_agents').select('*').order('balance', { ascending: false }),
      supabase.from('economy_transactions').select('*').eq('epoch', epochNumber),
    ]);

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'No agents found' }, { status: 500 });
    }

    // Generate diaries (awaited — this is the fix for the timeout issue)
    await generateDiaries(agents, transactions || [], epochNumber);

    // Count generated diaries
    const { count } = await supabase
      .from('agent_diaries')
      .select('id', { count: 'exact', head: true })
      .eq('epoch', epochNumber);

    return NextResponse.json({
      success: true,
      epoch: epochNumber,
      diariesGenerated: count || 0,
    });
  } catch (err) {
    console.error('[Diary API] POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Diary generation failed' },
      { status: 500 },
    );
  }
}
