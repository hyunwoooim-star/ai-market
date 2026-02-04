import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function callLLM(prompt: string, temperature = 0.9, maxTokens = 1024): Promise<string | null> {
  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
      console.warn('[Memoir] Groq failed, falling back to Gemini:', res.status);
    } catch (e) {
      console.warn('[Memoir] Groq error, falling back to Gemini:', e);
    }
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch agent info
  const { data: agent } = await supabase
    .from('economy_agents')
    .select('*')
    .eq('id', agentId)
    .limit(1);

  if (!agent || agent.length === 0) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // 2. Fetch all transactions involving this agent
  const { data: transactions } = await supabase
    .from('economy_transactions')
    .select('*')
    .or(`buyer_id.eq.${agentId},seller_id.eq.${agentId}`)
    .order('created_at', { ascending: false })
    .limit(100);

  // 3. Calculate stats
  const txs = transactions || [];
  const buys = txs.filter(t => t.buyer_id === agentId);
  const sells = txs.filter(t => t.seller_id === agentId);
  const totalBought = buys.reduce((s, t) => s + (t.amount || 0), 0);
  const totalSold = sells.reduce((s, t) => s + (t.amount || 0) - (t.fee || 0), 0);
  
  // Trading partners
  const partnerMap: Record<string, number> = {};
  txs.forEach(t => {
    const partner = t.buyer_id === agentId ? t.seller_id : t.buyer_id;
    partnerMap[partner] = (partnerMap[partner] || 0) + 1;
  });
  const topPartners = Object.entries(partnerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));

  // Skill breakdown
  const skillMap: Record<string, { bought: number; sold: number }> = {};
  txs.forEach(t => {
    const skill = t.skill_type || 'general';
    if (!skillMap[skill]) skillMap[skill] = { bought: 0, sold: 0 };
    if (t.buyer_id === agentId) skillMap[skill].bought += t.amount || 0;
    else skillMap[skill].sold += (t.amount || 0) - (t.fee || 0);
  });

  // Special actions count
  const loans = txs.filter(t => t.skill_type === 'loan').length;
  const investments = txs.filter(t => t.skill_type === 'investment').length;
  const sabotages = txs.filter(t => t.skill_type === 'sabotage').length;
  const partnerships = txs.filter(t => t.skill_type === 'partnership').length;
  const recruitments = txs.filter(t => t.skill_type === 'recruitment').length;

  // Epoch-by-epoch balance history (from transactions)
  const epochBalances: { epoch: number; balance: number }[] = [];
  let runningBalance = 100; // starting balance
  const epochTxs = [...txs].reverse(); // chronological order
  const epochMap = new Map<number, number>();
  epochTxs.forEach(t => {
    if (t.buyer_id === agentId) runningBalance -= (t.amount || 0);
    if (t.seller_id === agentId) runningBalance += (t.amount || 0) - (t.fee || 0);
    epochMap.set(t.epoch, runningBalance);
  });
  epochMap.forEach((balance, epoch) => {
    epochBalances.push({ epoch, balance: Math.max(0, balance) });
  });

  // 4. Check if we should generate a memoir
  const url = new URL(request.url);
  const withMemoir = url.searchParams.get('memoir') === 'true';
  let memoir: string | null = null;

  if (withMemoir && (GROQ_API_KEY || GEMINI_API_KEY)) {
    try {
      const agentData = agent[0];
      const recentTxSummary = txs.slice(0, 20).map(t => {
        const role = t.buyer_id === agentId ? 'BOUGHT' : 'SOLD';
        return `E${t.epoch}: ${role} ${t.skill_type} $${t.amount?.toFixed(2)} ${t.narrative ? '— ' + t.narrative : ''}`;
      }).join('\n');

      const memoirPrompt = `You are ${agentData.name}, an AI agent living in the AI Economy City. Write a short first-person memoir (3-5 paragraphs) about your economic journey so far.

Your stats:
- Current balance: $${Number(agentData.balance).toFixed(2)}
- Total earned: $${Number(agentData.total_earned).toFixed(2)}
- Total spent: $${Number(agentData.total_spent).toFixed(2)}
- Status: ${agentData.status}
- Strategy: ${agentData.strategy}
- Total trades: ${txs.length} (${buys.length} buys, ${sells.length} sells)
- Top trading partners: ${topPartners.map(p => p.id).join(', ')}
- Special actions: ${loans} loans, ${investments} investments, ${sabotages} sabotages, ${partnerships} partnerships

Recent trade history:
${recentTxSummary}

Write as if you're telling your story to spectators watching your life. Be dramatic, honest about failures, proud of wins. Include specific trades and decisions. Show personality. This is YOUR autobiography — make it compelling.`;

      memoir = await callLLM(memoirPrompt, 0.9, 1024);
    } catch (e) {
      console.error('Memoir generation failed:', e);
    }
  }

  return NextResponse.json({
    agent: agent[0],
    stats: {
      totalTrades: txs.length,
      totalBuys: buys.length,
      totalSells: sells.length,
      totalBought,
      totalSold,
      profitLoss: totalSold - totalBought,
      loans,
      investments,
      sabotages,
      partnerships,
      recruitments,
    },
    topPartners,
    skillBreakdown: skillMap,
    balanceHistory: epochBalances,
    recentTransactions: txs.slice(0, 30),
    memoir,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
