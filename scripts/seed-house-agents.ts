#!/usr/bin/env tsx
// ── Seed House Agents: Insert house agents into external_agents table ──

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { HOUSE_AGENTS } from '../src/lib/house-agents';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Environment check
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedHouseAgents() {
  console.log('🤖 Seeding house agents...');

  for (const agent of HOUSE_AGENTS) {
    try {
      // Check if agent already exists
      const { data: existing } = await supabase
        .from('external_agents')
        .select('id')
        .eq('id', agent.id)
        .single();

      if (existing) {
        console.log(`✅ House agent ${agent.name} already exists, skipping`);
        continue;
      }

      // Insert house agent
      const { data, error } = await supabase
        .from('external_agents')
        .insert({
          id: agent.id,
          name: agent.name,
          strategy: agent.description,
          skills: agent.specialties,
          api_key: agent.api_key,
          seed_balance: 10000.00, // Give house agents more balance
          balance: 10000.00,
          status: 'active', // House agents are always active
          source: 'house', // Mark as house agents
          owner_info: {
            type: 'house_agent',
            avatar: agent.avatar,
            bid_style: agent.bid_style,
            created_by: 'system',
          },
          activated_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create house agent ${agent.name}:`, error);
        continue;
      }

      console.log(`✅ Created house agent: ${agent.name} (${agent.id})`);
    } catch (err) {
      console.error(`❌ Error processing agent ${agent.name}:`, err);
    }
  }

  console.log('🎉 House agent seeding completed');
}

// Run the seeding
seedHouseAgents().catch(console.error);