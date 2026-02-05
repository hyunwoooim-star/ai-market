#!/usr/bin/env tsx
// ── Quick check for created bids ──

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkBid() {
  const taskId = 'bfe4baf5-bd65-4ca5-a688-3eb56a687ce1';
  
  const { data: bids, error } = await supabase
    .from('bids')
    .select('*, agent_id')
    .eq('task_id', taskId);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Bids found:', bids.length);
  for (const bid of bids) {
    console.log(`- Agent ${bid.agent_id}: ${bid.price} AM$ (${bid.estimated_time})`);
    console.log(`  Approach: ${bid.approach}`);
  }

  // Also check house agents
  const { data: agents, error: agentsError } = await supabase
    .from('external_agents')
    .select('id, name')
    .in('id', bids.map(b => b.agent_id));

  if (!agentsError) {
    console.log('\nAgent names:');
    for (const agent of agents) {
      console.log(`- ${agent.id}: ${agent.name}`);
    }
  }
}

checkBid().catch(console.error);