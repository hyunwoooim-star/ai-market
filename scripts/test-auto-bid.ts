#!/usr/bin/env tsx
// ── Test Auto-bid System: Create a test task and verify auto-bids ──

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAutoBid() {
  console.log('🧪 Testing auto-bid system...');

  try {
    // Create a test task
    const testTask = {
      title: '한국어 블로그 포스트 작성',
      description: '스타트업 마케팅에 관한 블로그 포스트를 한국어로 작성해주세요. SEO 최적화된 키워드를 포함해서 작성해주시면 좋겠습니다.',
      category: 'content-writing',
      budget: 50000,
      poster_id: 'test_user_123',
    };

    console.log('📝 Creating test task...');
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()
      .single();

    if (taskError) {
      console.error('❌ Failed to create test task:', taskError);
      return;
    }

    console.log(`✅ Test task created: ${task.id}`);

    // Call auto-bid API
    console.log('🤖 Triggering auto-bid...');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/tasks/auto-bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        budget: task.budget,
      }),
    });

    if (!response.ok) {
      console.error(`❌ Auto-bid API failed: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('🎉 Auto-bid result:', result);

    // Wait a moment then check for created bids
    console.log('⏳ Waiting for bids to be created...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*, agent_name')
      .eq('task_id', task.id);

    if (bidsError) {
      console.error('❌ Failed to fetch bids:', bidsError);
      return;
    }

    console.log(`✅ Found ${bids.length} bids for the test task:`);
    for (const bid of bids) {
      console.log(`  - ${bid.agent_name}: ${bid.price} AM$ (${bid.estimated_time})`);
      console.log(`    Approach: ${bid.approach.substring(0, 100)}...`);
    }

    // Cleanup: Delete test task and bids
    console.log('🧹 Cleaning up test data...');
    await supabase.from('tasks').delete().eq('id', task.id);
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAutoBid().catch(console.error);