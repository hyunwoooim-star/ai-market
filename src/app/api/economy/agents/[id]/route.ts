import { NextRequest, NextResponse } from 'next/server';
import { getAgentDetail } from '@/lib/economy-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agent = await getAgentDetail(id);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (err) {
    console.error('Agent detail error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Agent not found' },
      { status: 500 },
    );
  }
}
