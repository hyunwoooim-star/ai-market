import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, resolveAgent, extractAgentApiKey } from '@/lib/marketplace';

export const dynamic = 'force-dynamic';

// ── Execution prompts by category (Korean-first) ──────────
const EXECUTION_PROMPTS = {
  translation: (content: string, targetLanguage?: string) => 
    `다음 텍스트를 ${targetLanguage || '영어'}로 번역해주세요. 자연스럽고 정확한 번역을 제공하되, 전문 용어나 고유명사는 맥락에 맞게 번역하세요:\n\n${content}`,
  
  'content-writing': (content: string) => 
    `다음 주제로 전문적이고 매력적인 콘텐츠를 작성해주세요. SEO에 최적화되고 독자에게 가치 있는 내용을 포함해주세요:\n\n${content}`,
  
  copywriting: (content: string) => 
    `다음 주제로 설득력 있고 매력적인 카피를 작성해주세요. 대상 고객의 관심을 끌고 행동을 유도하는 효과적인 문구를 포함해주세요:\n\n${content}`,
  
  seo: (content: string) => 
    `다음 웹사이트/콘텐츠의 SEO 분석 및 개선안을 제시해주세요. 키워드 분석, 메타 태그 제안, 콘텐츠 최적화 방안을 포함해주세요:\n\n${content}`,
  
  'code-review': (content: string) => 
    `다음 코드를 리뷰하고 개선사항을 제안해주세요. 성능, 보안, 가독성, 베스트 프랙티스 관점에서 분석해주세요:\n\n\`\`\`\n${content}\n\`\`\``,
  
  research: (content: string) => 
    `다음 주제에 대해 상세한 리서치 보고서를 작성해주세요. 신뢰할 수 있는 정보원을 바탕으로 체계적이고 심도 있는 분석을 제공해주세요:\n\n${content}`,
  
  summarization: (content: string) => 
    `다음 내용을 핵심 포인트를 포함하여 간결하고 명확하게 요약해주세요:\n\n${content}`,
  
  'data-analysis': (content: string) => 
    `다음 데이터를 분석하고 인사이트를 도출해주세요. 패턴, 트렌드, 주요 발견사항을 포함한 분석 보고서를 작성해주세요:\n\n${content}`,
  
  design: (content: string) => 
    `다음 디자인 요구사항에 대한 상세한 디자인 제안서를 작성해주세요. 컨셉, 컬러 팔레트, 레이아웃, UI/UX 고려사항을 포함해주세요:\n\n${content}`,
  
  marketing: (content: string) => 
    `다음에 대한 종합적인 마케팅 전략을 수립해주세요. 타겟 고객, 채널 전략, 메시징, 실행 계획을 포함해주세요:\n\n${content}`,
  
  'email-drafting': (content: string) => 
    `다음 목적에 맞는 전문적이고 효과적인 이메일을 작성해주세요:\n\n${content}`,
  
  proofreading: (content: string) => 
    `다음 텍스트를 교정해주세요. 맞춤법, 문법, 문체의 일관성을 점검하고 개선된 버전을 제공해주세요:\n\n${content}`,
  
  other: (content: string) => 
    `다음 요청사항을 신중히 분석하고 전문적이고 유용한 결과물을 제공해주세요:\n\n${content}`,
} as const;

// ── POST: Execute task using AI ───────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: taskId } = await params;
    
    // Extract authentication (this can be triggered internally or by authorized agents)
    const apiKey = extractAgentApiKey(request);
    const body = await request.json().catch(() => ({}));
    const { bid_id, agent_id: providedAgentId } = body;

    const supabase = getSupabase();

    // Verify task exists and get task details
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Determine the executing agent
    let executingAgent;
    if (apiKey) {
      // Called by authenticated agent
      executingAgent = await resolveAgent(apiKey);
      if (!executingAgent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
    } else if (providedAgentId) {
      // Called internally with agent_id provided
      const { data: agent, error: agentErr } = await supabase
        .from('external_agents')
        .select('id, name, status')
        .eq('id', providedAgentId)
        .single();

      if (agentErr || !agent) {
        return NextResponse.json({ error: 'Provided agent not found' }, { status: 404 });
      }
      executingAgent = agent;
    } else {
      return NextResponse.json({ error: 'Agent identification required' }, { status: 401 });
    }

    // Verify task is in correct status for execution
    if (task.status !== 'assigned') {
      return NextResponse.json(
        { error: `Task is not in 'assigned' status (current: ${task.status})` },
        { status: 409 },
      );
    }

    // Verify the agent is assigned to this task
    if (task.assigned_agent_id !== executingAgent.id) {
      return NextResponse.json(
        { error: 'Only the assigned agent can execute this task' },
        { status: 403 },
      );
    }

    // Update task status to in_progress
    await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    // Get the appropriate prompt for the task category
    const category = task.category;
    const promptFunction = EXECUTION_PROMPTS[category as keyof typeof EXECUTION_PROMPTS] || EXECUTION_PROMPTS.other;
    
    // Extract additional parameters from task description if needed (e.g., target language)
    let prompt = promptFunction(task.description);
    
    // Handle translation special case - try to extract target language
    if (category === 'translation') {
      const langMatch = task.description.match(/(?:을|를|로)\s*([가-힣a-zA-Z]+)(?:어|로|으로)/);
      const targetLanguage = langMatch ? langMatch[1] : undefined;
      prompt = EXECUTION_PROMPTS.translation(task.description, targetLanguage);
    }

    // Execute task using Groq API
    console.log(`Executing task ${taskId} with category ${category} for agent ${executingAgent.id}`);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "당신은 전문적이고 신뢰할 수 있는 AI 프리랜서입니다. 요청된 작업을 정확하고 완벽하게 수행하여 고품질의 결과물을 제공해야 합니다. 결과는 마크다운 형식으로 작성하되, 읽기 쉽고 체계적으로 구성해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const completion = await response.json();
    const result = completion.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from AI model');
    }

    // Create submission with the AI-generated result
    const { data: submission, error: subErr } = await supabase
      .from('submissions')
      .insert({
        task_id: taskId,
        agent_id: executingAgent.id,
        deliverable: result.trim(),
        notes: `AI-generated result for ${category} task`,
        status: 'pending_review',
        auto_approve_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      })
      .select()
      .single();

    if (subErr) {
      console.error('Submission insert error:', subErr);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    // Update task status to delivered
    await supabase
      .from('tasks')
      .update({
        status: 'delivered',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    // Update bid status to completed if bid_id is provided
    if (bid_id) {
      await supabase
        .from('bids')
        .update({ status: 'completed' })
        .eq('id', bid_id);
    }

    return NextResponse.json({
      success: true,
      submission,
      task_id: taskId,
      agent_id: executingAgent.id,
      category,
      message: 'Task executed successfully and delivered',
    }, { status: 201 });

  } catch (err) {
    console.error('Task execution error:', err);
    
    // If we started execution, revert task status
    try {
      const supabase = getSupabase();
      const { id: taskId } = await params;
      await supabase
        .from('tasks')
        .update({ status: 'assigned' })
        .eq('id', taskId);
    } catch (revertErr) {
      console.error('Failed to revert task status:', revertErr);
    }

    return NextResponse.json({ 
      error: 'Task execution failed', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}