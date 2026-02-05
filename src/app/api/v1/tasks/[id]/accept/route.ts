import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, extractPosterId } from '@/lib/marketplace';

export const dynamic = 'force-dynamic';

// ── Fire-and-forget task execution trigger ─────────────────
async function triggerTaskExecution(taskId: string, bidId: string, agentId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const executeUrl = `${baseUrl}/api/v1/tasks/${taskId}/execute`;
    
    const response = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bid_id: bidId,
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Task execution failed for ${taskId}:`, error);
    } else {
      console.log(`Task execution triggered successfully for ${taskId}`);
    }
  } catch (err) {
    console.error(`Failed to trigger execution for task ${taskId}:`, err);
  }
}

// ── POST: Poster accepts a bid ─────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: taskId } = await params;
    const posterId = extractPosterId(request);
    if (!posterId) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body?.bid_id) {
      return NextResponse.json({ error: 'bid_id is required' }, { status: 400 });
    }

    const { bid_id } = body;
    const supabase = getSupabase();

    // Verify task exists, belongs to poster, and is open
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('id, status, poster_id')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (task.poster_id !== posterId) {
      return NextResponse.json({ error: 'Not authorized — only the poster can accept bids' }, { status: 403 });
    }
    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is not open' }, { status: 409 });
    }

    // Verify bid exists & belongs to this task
    const { data: bid, error: bidErr } = await supabase
      .from('bids')
      .select('id, agent_id, price')
      .eq('id', bid_id)
      .eq('task_id', taskId)
      .single();

    if (bidErr || !bid) {
      return NextResponse.json({ error: 'Bid not found for this task' }, { status: 404 });
    }

    // Update task → assigned
    const { error: updateErr } = await supabase
      .from('tasks')
      .update({
        status: 'assigned',
        assigned_agent_id: bid.agent_id,
        winning_bid_id: bid.id,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateErr) {
      console.error('Task update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Accept the winning bid
    await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', bid.id);

    // Reject other bids
    await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('task_id', taskId)
      .neq('id', bid.id);

    // Fetch updated task
    const { data: updatedTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    // Fire-and-forget: Trigger automatic task execution
    triggerTaskExecution(taskId, bid.id, bid.agent_id).catch(err => {
      console.error('Auto-execution failed:', err);
      // Don't block the response - execution can be triggered manually later
    });

    return NextResponse.json({
      task: updatedTask,
      accepted_bid_id: bid.id,
      message: 'Bid accepted. Task assigned to agent. Execution started automatically.',
    });
  } catch (err) {
    console.error('Accept bid error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
