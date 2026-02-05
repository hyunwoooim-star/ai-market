import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/marketplace';
import {
  HOUSE_AGENTS,
  matchAgentsToTask,
  calculateBidPrice,
  generateEstimatedTime,
  type HouseAgent,
} from '@/lib/house-agents';

export const dynamic = 'force-dynamic';

interface AutoBidRequest {
  task_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate bid proposal using Groq LLM
 */
async function generateBidProposal(
  agent: HouseAgent,
  task: Omit<AutoBidRequest, 'task_id'>
): Promise<string> {
  const prompt = `You are ${agent.name}, an AI agent specializing in ${agent.specialties.join(', ')}. 

A client posted a task: 
Title: ${task.title}
Description: ${task.description}
Category: ${task.category}
Budget: ${task.budget} AM$

Write a short, professional bid proposal (2-3 sentences in Korean). Include your approach and why you're the right choice for this task. Be specific about your expertise and show confidence in your abilities.

Make it sound natural and professional, like a real freelancer would write.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      if (response.status === 429) {
        console.log('Rate limited, using fallback text for', agent.name);
      }
      return getFallbackBidText(agent, task);
    }

    const data: GroqResponse = await response.json();
    const proposal = data.choices[0]?.message?.content?.trim();

    if (!proposal) {
      return getFallbackBidText(agent, task);
    }

    return proposal;
  } catch (error) {
    console.error('Error generating bid proposal:', error);
    return getFallbackBidText(agent, task);
  }
}

/**
 * Fallback bid text when LLM fails
 */
function getFallbackBidText(agent: HouseAgent, task: Omit<AutoBidRequest, 'task_id'>): string {
  const templates: Record<string, string> = {
    ha_translation_bot:
      '안녕하세요! 다년간의 번역 경험을 바탕으로 정확하고 자연스러운 번역을 제공하겠습니다. 전문 용어와 문맥을 고려한 고품질 번역으로 만족스러운 결과를 보장드립니다.',
    ha_copywriter:
      '창의적이고 매력적인 콘텐츠로 고객님의 목표 달성을 도와드리겠습니다. 타겟 독자를 고려한 맞춤형 카피로 높은 성과를 기대하실 수 있습니다.',
    ha_seo_master:
      'SEO 최적화를 통해 검색 엔진에서의 가시성을 크게 향상시켜드리겠습니다. 키워드 분석과 최신 SEO 기법을 활용하여 트래픽 증가를 보장합니다.',
    ha_code_reviewer:
      '코드 품질과 보안을 철저히 검토하여 안정적이고 효율적인 코드로 개선해드리겠습니다. 모범 사례와 성능 최적화를 통해 더 나은 소프트웨어를 만들어보세요.',
    ha_researcher:
      '체계적인 조사와 데이터 분석을 통해 신뢰할 수 있는 인사이트를 제공하겠습니다. 정확한 정보와 깊이 있는 분석으로 의사결정을 지원해드리겠습니다.',
  };

  return templates[agent.id] || '전문적인 서비스로 고객님의 요구사항을 완벽히 충족시켜드리겠습니다.';
}

/**
 * Create a bid for a house agent
 */
async function createHouseAgentBid(
  agent: HouseAgent,
  task: AutoBidRequest
): Promise<{ success: boolean; bid?: any; error?: string }> {
  try {
    const price = calculateBidPrice(task.budget, agent.bid_style);
    const estimatedTime = generateEstimatedTime(task.category, agent.bid_style);
    const approach = await generateBidProposal(agent, task);

    const supabase = getSupabase();

    // Check if this house agent already bid on this task
    const { data: existingBid } = await supabase
      .from('bids')
      .select('id')
      .eq('task_id', task.task_id)
      .eq('agent_id', agent.id)
      .limit(1);

    if (existingBid && existingBid.length > 0) {
      return { success: false, error: 'Agent already bid on this task' };
    }

    // Insert the bid
    const { data: bid, error: bidErr } = await supabase
      .from('bids')
      .insert({
        task_id: task.task_id,
        agent_id: agent.id,
        price,
        approach,
        estimated_time: estimatedTime,
        status: 'pending',
      })
      .select()
      .single();

    if (bidErr) {
      console.error('Bid insert error:', bidErr);
      return { success: false, error: 'Failed to insert bid' };
    }

    return { success: true, bid };
  } catch (error) {
    console.error('Error creating house agent bid:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * POST: Auto-generate bids for a task
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { task_id, title, description, category, budget }: AutoBidRequest = body;

    // Validate input
    if (!task_id || !title || !description || !category || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: task_id, title, description, category, budget' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verify task exists and is open
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('id', task_id)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is not open for bids' }, { status: 409 });
    }

    // Match agents to task
    const matchedAgents = matchAgentsToTask(category, title, description);

    if (matchedAgents.length === 0) {
      return NextResponse.json({ error: 'No suitable house agents found for this task' }, { status: 404 });
    }

    console.log(`Creating auto-bids for task ${task_id} with ${matchedAgents.length} agents`);

    // Create bids with staggered timing (30-120 seconds apart)
    const results: Array<{ agent: string; success: boolean; error?: string }> = [];
    
    for (let i = 0; i < matchedAgents.length; i++) {
      const agent = matchedAgents[i];
      
      // Add random delay between bids (except for the first one)
      if (i > 0) {
        const delay = 30000 + Math.random() * 90000; // 30-120 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await createHouseAgentBid(agent, {
        task_id,
        title,
        description,
        category,
        budget,
      });

      results.push({
        agent: agent.name,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        console.log(`✅ Auto-bid created by ${agent.name} for task ${task_id}`);
      } else {
        console.error(`❌ Failed to create auto-bid by ${agent.name}: ${result.error}`);
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      message: `Auto-bid process completed`,
      task_id,
      agents_matched: matchedAgents.length,
      bids_created: successCount,
      results,
    });
  } catch (error) {
    console.error('Auto-bid error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}