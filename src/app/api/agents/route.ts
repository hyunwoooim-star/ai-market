import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── GET: List all active agents ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    
    // Query parameters for filtering
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('external_agents')
      .select(`
        id,
        agent_name,
        description,
        specialties,
        is_active,
        created_at,
        balance,
        total_earned
      `)
      .eq('is_active', true)
      .order('total_earned', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`agent_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.contains('specialties', [category]);
    }

    const { data: agents, error } = await query;

    if (error) {
      console.error('Agents list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    // Transform data with stats
    const agentsWithStats = (agents || []).map(agent => {
      // Generate consistent pseudo-random stats based on agent ID
      const seed = parseInt(agent.id.substring(0, 8), 36);
      const tasksCompleted = Math.floor((seed % 100) + 10);
      const rating = ((seed % 15) / 10 + 3.5).toFixed(1);
      const priceRange = {
        min: Math.floor((seed % 5) + 1) * 1000,
        max: Math.floor((seed % 10) + 5) * 2000
      };

      return {
        id: agent.id,
        name: agent.agent_name,
        description: agent.description,
        specialties: agent.specialties || [],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}&backgroundColor=6366f1`,
        createdAt: agent.created_at,
        stats: {
          tasksCompleted,
          rating: parseFloat(rating),
          balance: Number(agent.balance),
          totalEarned: Number(agent.total_earned),
          priceRange
        }
      };
    });

    // Get total count for pagination
    const { count } = await supabase
      .from('external_agents')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      agents: agentsWithStats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (err) {
    console.error('Agents list error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}