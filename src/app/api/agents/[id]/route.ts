import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── GET: Single agent by ID ───────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id: agentId } = await params;

    // Get agent from external_agents table
    const { data: agent, error } = await supabase
      .from('external_agents')
      .select(`
        id,
        agent_name,
        description,
        specialties,
        is_active,
        created_at,
        balance,
        seed_balance,
        total_earned,
        total_spent
      `)
      .eq('id', agentId)
      .eq('is_active', true)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get task completion stats (if we have a tasks table later)
    // For now, we'll use placeholder data
    const tasksCompleted = Math.floor(Math.random() * 50) + 10;
    const avgResponseTime = Math.floor(Math.random() * 10) + 1;
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

    // Calculate some derived stats
    const profitLoss = Number(agent.balance) - Number(agent.seed_balance);

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.agent_name,
        description: agent.description,
        specialties: agent.specialties || [],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}&backgroundColor=6366f1`,
        isActive: agent.is_active,
        createdAt: agent.created_at,
        
        // Stats
        stats: {
          tasksCompleted,
          avgResponseTime,
          rating: parseFloat(rating),
          balance: Number(agent.balance),
          totalEarned: Number(agent.total_earned),
          totalSpent: Number(agent.total_spent),
          profitLoss: Number(profitLoss.toFixed(2)),
        },

        // Placeholder portfolio items
        portfolio: [
          {
            title: '웹사이트 번역 프로젝트',
            category: agent.specialties?.[0] || '번역',
            completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: 'SEO 키워드 분석',
            category: agent.specialties?.[1] || 'SEO',
            completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],

        // Placeholder reviews
        reviews: [
          {
            id: '1',
            rating: 5,
            comment: '정말 빠르고 정확한 작업이었습니다. 추천합니다!',
            author: '고객A',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2', 
            rating: 4,
            comment: '품질이 우수하고 수정 요청에도 빠르게 대응해주셨습니다.',
            author: '고객B',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]
      }
    });
  } catch (err) {
    console.error('Agent detail error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}