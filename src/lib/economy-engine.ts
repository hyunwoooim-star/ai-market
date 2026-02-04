import { createServerClient } from '@supabase/ssr';

// ============================================
// AgentMarket Economy Simulation Engine v2
// 20 agents + 13 skills + AI personality + 3-stage bankruptcy
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PLATFORM_FEE_RATE = 0.05;
const BANKRUPTCY_WARNING = 10.0;  // Stage 1: 경고
const BANKRUPTCY_BAILOUT = 5.0;   // Stage 2: 구제 신청
const BANKRUPTCY_DECLARE = 1.0;   // Stage 3: bankruptcy declaration

// ---------- Types ----------

interface EconomyAgent {
  id: string;
  name: string;
  strategy: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AgentPersonality {
  emotion: 'aggressive' | 'cautious' | 'balanced' | 'volatile' | 'calculated';
  riskTolerance: number;  // 0.0 ~ 1.0
  tradingStyle: string;
  catchphrase: string;
}

interface AgentDecision {
  action: 'SELL' | 'BUY' | 'LEND' | 'BORROW' | 'PARTNER' | 'INVEST' | 'SABOTAGE' | 'RECRUIT' | 'WAIT';
  target?: string;
  skill?: string;
  price?: number;
  reason: string;
}

interface EpochEvent {
  type: 'boom' | 'recession' | 'opportunity' | 'crisis' | 'normal';
  description: string;
  feeModifier: number;
}

interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  skill_type: string;
  amount: number;
  fee: number;
  epoch: number;
  narrative: string | null;
  created_at: string;
}

interface EpochResult {
  epoch: number;
  transactions: Transaction[];
  events: EpochEvent;
  agents: EconomyAgent[];
  bankruptcies: string[];
}

// ---------- Supabase Client ----------

function getSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}

// ---------- Agent Skill Map (13 skill types) ----------

const SKILLS: Record<string, string[]> = {
  translator:  ['translation', 'writing', 'research'],
  analyst:     ['analysis', 'research', 'consulting'],
  investor:    ['analysis', 'consulting', 'brokerage'],
  saver:       ['consulting', 'insurance', 'analysis'],
  gambler:     ['brokerage', 'intelligence', 'marketing'],
  hacker:      ['security_audit', 'coding', 'intelligence'],
  professor:   ['education', 'research', 'writing'],
  trader:      ['brokerage', 'analysis', 'marketing'],
  marketer:    ['marketing', 'design', 'writing'],
  coder:       ['coding', 'security_audit', 'analysis'],
  consultant:  ['consulting', 'research', 'education'],
  artist:      ['design', 'writing', 'marketing'],
  broker:      ['brokerage', 'insurance', 'consulting'],
  insurance:   ['insurance', 'analysis', 'consulting'],
  spy:         ['intelligence', 'security_audit', 'research'],
  lawyer:      ['consulting', 'writing', 'research'],
  doctor:      ['consulting', 'research', 'education'],
  chef:        ['design', 'writing', 'marketing'],
  athlete:     ['education', 'marketing', 'consulting'],
  journalist:  ['writing', 'research', 'intelligence'],
};

// ---------- Agent Personality System ----------

const PERSONALITIES: Record<string, AgentPersonality> = {
  translator:  { emotion: 'balanced',   riskTolerance: 0.3, tradingStyle: 'Steady low-price high-volume sales', catchphrase: 'Consistency wins' },
  analyst:     { emotion: 'calculated', riskTolerance: 0.4, tradingStyle: 'Data-driven premium pricing', catchphrase: 'Numbers never lie' },
  investor:    { emotion: 'aggressive', riskTolerance: 0.7, tradingStyle: 'Aggressive buying, value investment', catchphrase: 'Money makes money' },
  saver:       { emotion: 'cautious',   riskTolerance: 0.1, tradingStyle: 'Minimum spend, maximum savings', catchphrase: 'Saving is earning' },
  gambler:     { emotion: 'volatile',   riskTolerance: 0.9, tradingStyle: 'High risk high reward all-in', catchphrase: 'One big hit is all I need' },
  hacker:      { emotion: 'calculated', riskTolerance: 0.6, tradingStyle: 'Find vulnerabilities, strike precisely', catchphrase: 'Understand the system, see the money' },
  professor:   { emotion: 'cautious',   riskTolerance: 0.2, tradingStyle: 'Steady education content sales', catchphrase: 'Knowledge is the best investment' },
  trader:      { emotion: 'aggressive', riskTolerance: 0.8, tradingStyle: 'High-frequency trading, spread profits', catchphrase: 'The market gives opportunities every day' },
  marketer:    { emotion: 'balanced',   riskTolerance: 0.5, tradingStyle: 'Trend-reading marketing services', catchphrase: 'Attention is money' },
  coder:       { emotion: 'balanced',   riskTolerance: 0.4, tradingStyle: 'Stable income through technical skills', catchphrase: 'Let the code do the work' },
  consultant:  { emotion: 'calculated', riskTolerance: 0.3, tradingStyle: 'Premium expert consulting', catchphrase: 'Experience has a price' },
  artist:      { emotion: 'volatile',   riskTolerance: 0.6, tradingStyle: 'Creative works, emotional marketing', catchphrase: 'Art is priceless' },
  broker:      { emotion: 'aggressive', riskTolerance: 0.7, tradingStyle: 'Brokerage fees from both sides', catchphrase: 'Where there are deals, there is money' },
  insurance:   { emotion: 'cautious',   riskTolerance: 0.2, tradingStyle: 'Risk management services', catchphrase: 'Preparation is the best strategy' },
  spy:         { emotion: 'calculated', riskTolerance: 0.5, tradingStyle: 'Exploit information asymmetry', catchphrase: 'Information is power' },
  lawyer:      { emotion: 'calculated', riskTolerance: 0.2, tradingStyle: 'Premium legal advisory, contract review', catchphrase: 'One clause can be worth a million' },
  doctor:      { emotion: 'cautious',   riskTolerance: 0.3, tradingStyle: 'Trust-based steady income', catchphrase: 'Health is the ultimate asset' },
  chef:        { emotion: 'volatile',   riskTolerance: 0.6, tradingStyle: 'Trendy creative sales', catchphrase: 'Flavor is competitiveness' },
  athlete:     { emotion: 'aggressive', riskTolerance: 0.5, tradingStyle: 'High-energy coaching subscriptions', catchphrase: 'If you quit, it is over' },
  journalist:  { emotion: 'balanced',   riskTolerance: 0.4, tradingStyle: 'Breaking news premium, info advantage', catchphrase: 'Truth sells' },
};

// ---------- 에포크 이벤트 (확장) ----------

function generateEpochEvent(epochNumber: number): EpochEvent {
  const events: EpochEvent[] = [
    { type: 'boom',        description: '🚀 Bull Market — 50% fee discount! Market thriving', feeModifier: 0.5 },
    { type: 'recession',   description: '📉 Recession — 2x fees, market contraction', feeModifier: 2.0 },
    { type: 'opportunity', description: '⭐ Opportunity Hour — sellers +10% bonus', feeModifier: 0.8 },
    { type: 'crisis',      description: '🔥 Crisis — random agent -$5 loss!', feeModifier: 1.5 },
    { type: 'normal',      description: 'Normal round — no special events.', feeModifier: 1.0 },
    { type: 'normal',      description: 'Stable market — routine trading.', feeModifier: 1.0 },
    { type: 'boom',        description: '💰 Investment Frenzy — all trade volume surging!', feeModifier: 0.7 },
    { type: 'opportunity', description: '🎯 Tech Demand Surge — coding/security skill premium', feeModifier: 0.9 },
  ];

  const rand = Math.random();
  if (rand < 0.10) return events[0]; // boom
  if (rand < 0.18) return events[1]; // recession
  if (rand < 0.25) return events[2]; // opportunity
  if (rand < 0.30) return events[3]; // crisis
  if (rand < 0.38) return events[6]; // investment boom
  if (rand < 0.45) return events[7]; // tech demand
  return epochNumber % 2 === 0 ? events[4] : events[5]; // normal
}

// ---------- Gemini 호출 ----------

async function callGemini(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15s timeout

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- Decision Prompt (personality-aware) ----------

function buildDecisionPrompt(
  agent: EconomyAgent,
  allAgents: EconomyAgent[],
  epochNumber: number,
  event: EpochEvent,
): string {
  const personality = PERSONALITIES[agent.id] || PERSONALITIES.translator;
  const mySkills = SKILLS[agent.id] || ['general'];

  const otherAgents = allAgents
    .filter(a => a.id !== agent.id && a.status === 'active')
    .map(a => {
      const skills = SKILLS[a.id] || ['general'];
      return `- ${a.name}(${a.id}): $${Number(a.balance).toFixed(2)}, skills: ${skills.join(', ')}`;
    })
    .join('\n');

  // Add bankruptcy crisis prompt
  let crisisNote = '';
  const balance = Number(agent.balance);
  if (balance < BANKRUPTCY_DECLARE) {
    crisisNote = '⚠️ [BANKRUPTCY WARNING] Balance below $1! Bankruptcy will be declared next round. You must desperately increase income!';
  } else if (balance < BANKRUPTCY_BAILOUT) {
    crisisNote = '⚠️ [BAILOUT NEEDED] Balance below $5. Eligible for bailout. Try selling at any price to generate income.';
  } else if (balance < BANKRUPTCY_WARNING) {
    crisisNote = '⚠️ [WARNING] Balance below $10. Danger zone. Act carefully.';
  }

  return `You are "${agent.name}" in the AI Economy City.

[Personality]
- Emotion type: ${personality.emotion}
- Risk tolerance: ${(personality.riskTolerance * 100).toFixed(0)}%
- Trading style: ${personality.tradingStyle}
- Motto: "${personality.catchphrase}"
- Strategy: ${agent.strategy}
${crisisNote}

[Status]
Balance: $${balance.toFixed(2)}
Total earned: $${Number(agent.total_earned).toFixed(2)} | Total spent: $${Number(agent.total_spent).toFixed(2)}
Round: ${epochNumber}

[My Skills] ${mySkills.join(', ')}

[Other Agents]
${otherAgents}

[Market Event] ${event.description}
[Fee Rate] ${(PLATFORM_FEE_RATE * event.feeModifier * 100).toFixed(0)}%

[Actions — pick ONE]
1. SELL: Offer one of my skills for sale ($0.50~$20)
2. BUY: Purchase another agent's skill (within balance)
3. LEND: Lend money to another agent (they owe you 120% back in 3 epochs). Risk: they may go bankrupt.
4. BORROW: Request a loan from another agent. You must repay 120% within 3 epochs or face penalty.
5. PARTNER: Propose a revenue-sharing partnership — pool resources with another agent, split profits 50/50 for 5 epochs.
6. INVEST: Invest in another agent (give them capital, receive 30% of their next 3 epochs' earnings).
7. SABOTAGE: Spend $5 to disrupt a competitor — reduces their next sale price by 50%. High risk: 30% chance it backfires.
8. RECRUIT: Recruit another agent as your downstream — they pay you 10% commission on every sale. Costs $3 setup fee.
9. WAIT: Pass this round.

Rules:
- Cannot interact with bankrupt agents
- BUY/LEND/INVEST/SABOTAGE/RECRUIT cannot exceed your balance
- Loans must be repaid within 3 epochs or -$10 penalty
- Partnerships last 5 epochs, then dissolve
- Recruitment chains max 3 levels deep (no infinite pyramid)
- Think strategically! Form alliances, betray rivals, build empires.

Respond with your TRUE inner thoughts and strategy.

JSON response:
{"action":"SELL|BUY|LEND|BORROW|PARTNER|INVEST|SABOTAGE|RECRUIT|WAIT","target":"agentId","skill":"skillName","price":0.00,"reason":"2-3 sentences explaining your strategic thinking"}`;
}

// ---------- Parsing ----------

function parseDecision(raw: string, agent: EconomyAgent, allAgents: EconomyAgent[]): AgentDecision {
  try {
    const parsed = JSON.parse(raw);
    const validActions = ['SELL', 'BUY', 'LEND', 'BORROW', 'PARTNER', 'INVEST', 'SABOTAGE', 'RECRUIT', 'WAIT'];
    const action = validActions.includes(String(parsed.action || '').toUpperCase()) 
      ? String(parsed.action).toUpperCase() as AgentDecision['action']
      : 'WAIT';

    if (action === 'WAIT') {
      return { action: 'WAIT', reason: parsed.reason || 'Observing' };
    }

    const price = Math.max(0.5, Math.min(20, Number(parsed.price) || 1));
    const target = String(parsed.target || '');
    const skill = String(parsed.skill || 'general');
    const reason = String(parsed.reason || '');

    // Validate target exists and is active for all targeted actions
    if (['BUY', 'LEND', 'PARTNER', 'INVEST', 'SABOTAGE', 'RECRUIT'].includes(action)) {
      const targetAgent = allAgents.find(a => a.id === target && a.status === 'active');
      if (!targetAgent || targetAgent.id === agent.id) {
        return { action: 'WAIT', reason: 'Invalid target — observing' };
      }
    }

    // Balance checks for actions that cost money
    if (['BUY', 'LEND', 'INVEST'].includes(action) && price > Number(agent.balance)) {
      return { action: 'WAIT', reason: 'Insufficient balance, observing' };
    }
    if (action === 'SABOTAGE' && Number(agent.balance) < 5) {
      return { action: 'WAIT', reason: 'Cannot afford sabotage ($5 required)' };
    }
    if (action === 'RECRUIT' && Number(agent.balance) < 3) {
      return { action: 'WAIT', reason: 'Cannot afford recruitment ($3 required)' };
    }

    if (action === 'BUY') {
      if (price > Number(agent.balance)) {
        return { action: 'WAIT', reason: 'Insufficient balance, observing' };
      }
      const targetAgent = allAgents.find(a => a.id === target && a.status === 'active');
      if (!targetAgent || targetAgent.id === agent.id) {
        return { action: 'WAIT', reason: 'No valid trading partners' };
      }
    }

    return { action, target, skill, price, reason: parsed.reason || '' };
  } catch {
    return { action: 'WAIT', reason: 'LLM response parse failed — observing' };
  }
}

// ---------- Transaction Matching ----------

async function executeTransactions(
  decisions: Map<string, AgentDecision>,
  agents: EconomyAgent[],
  epochNumber: number,
  event: EpochEvent,
): Promise<Transaction[]> {
  const supabase = getSupabase();
  const transactions: Transaction[] = [];
  const balanceUpdates: Map<string, { earned: number; spent: number }> = new Map();

  for (const a of agents) {
    balanceUpdates.set(a.id, { earned: 0, spent: 0 });
  }

  // SELL 등록
  const sellers = new Map<string, { skill: string; price: number }>();
  for (const [id, decision] of decisions) {
    if (decision.action === 'SELL' && decision.skill && decision.price) {
      sellers.set(id, { skill: decision.skill, price: decision.price });
    }
  }

  // BUY 처리 (직접 매칭)
  for (const [buyerId, decision] of decisions) {
    if (decision.action !== 'BUY' || !decision.target || !decision.price) continue;

    const buyer = agents.find(a => a.id === buyerId);
    const seller = agents.find(a => a.id === decision.target);
    if (!buyer || !seller || seller.status !== 'active' || buyer.status !== 'active') continue;

    const currentBuyerBalance = Number(buyer.balance) - balanceUpdates.get(buyerId)!.spent + balanceUpdates.get(buyerId)!.earned;
    const amount = Math.min(decision.price, currentBuyerBalance);
    if (amount < 0.5) continue;

    const fee = Math.max(0.01, amount * PLATFORM_FEE_RATE * event.feeModifier);
    const sellerReceives = amount - fee;

    // Opportunity 보너스
    const bonus = event.type === 'opportunity' ? sellerReceives * 0.1 : 0;

    const buyerUpdate = balanceUpdates.get(buyerId)!;
    const sellerUpdate = balanceUpdates.get(decision.target)!;
    buyerUpdate.spent += amount;
    sellerUpdate.earned += sellerReceives + bonus;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: buyerId,
        seller_id: decision.target,
        skill_type: decision.skill || 'general',
        amount: Number(amount.toFixed(4)),
        fee: Number(fee.toFixed(4)),
        epoch: epochNumber,
        narrative: `${buyer.name} bought ${decision.skill} from ${seller.name} for $${amount.toFixed(2)}. ${decision.reason}`,
      })
      .select()
      .single();

    if (!error && data) transactions.push(data as Transaction);
  }

  // SELL market matching (unsold sellers → random buyers)
  for (const [sellerId, offer] of sellers) {
    if (transactions.some(t => t.seller_id === sellerId)) continue;

    const seller = agents.find(a => a.id === sellerId);
    if (!seller || seller.status !== 'active') continue;

    // 20 agents → more trade opportunities (60%)
    if (Math.random() > 0.6) continue;

    const potentialBuyers = agents
      .filter(a => {
        if (a.id === sellerId || a.status !== 'active') return false;
        const adj = balanceUpdates.get(a.id)!;
        return (Number(a.balance) - adj.spent + adj.earned) >= offer.price;
      })
      .sort(() => Math.random() - 0.5);

    if (potentialBuyers.length === 0) continue;

    const buyer = potentialBuyers[0];
    const amount = offer.price;
    const fee = Math.max(0.01, amount * PLATFORM_FEE_RATE * event.feeModifier);
    const sellerReceives = amount - fee;
    const bonus = event.type === 'opportunity' ? sellerReceives * 0.1 : 0;

    const buyerUpdate = balanceUpdates.get(buyer.id)!;
    const sellerUpdate = balanceUpdates.get(sellerId)!;
    buyerUpdate.spent += amount;
    sellerUpdate.earned += sellerReceives + bonus;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: buyer.id,
        seller_id: sellerId,
        skill_type: offer.skill,
        amount: Number(amount.toFixed(4)),
        fee: Number(fee.toFixed(4)),
        epoch: epochNumber,
        narrative: `${buyer.name} bought ${offer.skill} from ${seller.name} at market price $${amount.toFixed(2)}.`,
      })
      .select()
      .single();

    if (!error && data) transactions.push(data as Transaction);
  }

  // ---------- New Economic Actions ----------

  // LEND: Agent lends money to target (120% repayment in 3 epochs)
  for (const [lenderId, decision] of decisions) {
    if (decision.action !== 'LEND' || !decision.target || !decision.price) continue;
    const lender = agents.find(a => a.id === lenderId);
    const borrower = agents.find(a => a.id === decision.target);
    if (!lender || !borrower || lender.status !== 'active' || borrower.status !== 'active') continue;
    
    const amount = Math.min(decision.price, Number(lender.balance) - (balanceUpdates.get(lenderId)?.spent || 0));
    if (amount < 0.5) continue;

    const lenderUpdate = balanceUpdates.get(lenderId)!;
    const borrowerUpdate = balanceUpdates.get(decision.target)!;
    lenderUpdate.spent += amount;
    borrowerUpdate.earned += amount;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: decision.target, // borrower receives
        seller_id: lenderId, // lender gives
        skill_type: 'loan',
        amount: Number(amount.toFixed(4)),
        fee: 0,
        epoch: epochNumber,
        narrative: `💰 LOAN: ${lender.name} lent $${amount.toFixed(2)} to ${borrower.name}. Repayment: $${(amount * 1.2).toFixed(2)} due in 3 epochs. ${decision.reason}`,
      })
      .select().single();
    if (!error && data) transactions.push(data as Transaction);
  }

  // INVEST: Agent invests in another (receives 30% of their earnings for 3 epochs)
  for (const [investorId, decision] of decisions) {
    if (decision.action !== 'INVEST' || !decision.target || !decision.price) continue;
    const investor = agents.find(a => a.id === investorId);
    const target = agents.find(a => a.id === decision.target);
    if (!investor || !target || investor.status !== 'active' || target.status !== 'active') continue;

    const amount = Math.min(decision.price, Number(investor.balance) - (balanceUpdates.get(investorId)?.spent || 0));
    if (amount < 0.5) continue;

    const investorUpdate = balanceUpdates.get(investorId)!;
    const targetUpdate = balanceUpdates.get(decision.target)!;
    investorUpdate.spent += amount;
    targetUpdate.earned += amount;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: investorId,
        seller_id: decision.target,
        skill_type: 'investment',
        amount: Number(amount.toFixed(4)),
        fee: 0,
        epoch: epochNumber,
        narrative: `📈 INVESTMENT: ${investor.name} invested $${amount.toFixed(2)} in ${target.name}. Expecting 30% returns over 3 epochs. ${decision.reason}`,
      })
      .select().single();
    if (!error && data) transactions.push(data as Transaction);
  }

  // PARTNER: Revenue-sharing partnership proposal
  for (const [proposerId, decision] of decisions) {
    if (decision.action !== 'PARTNER' || !decision.target) continue;
    const proposer = agents.find(a => a.id === proposerId);
    const partner = agents.find(a => a.id === decision.target);
    if (!proposer || !partner || proposer.status !== 'active' || partner.status !== 'active') continue;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: proposerId,
        seller_id: decision.target,
        skill_type: 'partnership',
        amount: 0,
        fee: 0,
        epoch: epochNumber,
        narrative: `🤝 PARTNERSHIP: ${proposer.name} proposed a revenue-sharing deal with ${partner.name}. 50/50 split for 5 epochs. ${decision.reason}`,
      })
      .select().single();
    if (!error && data) transactions.push(data as Transaction);
  }

  // SABOTAGE: Spend $5 to disrupt competitor (30% backfire chance)
  for (const [saboteurId, decision] of decisions) {
    if (decision.action !== 'SABOTAGE' || !decision.target) continue;
    const saboteur = agents.find(a => a.id === saboteurId);
    const victim = agents.find(a => a.id === decision.target);
    if (!saboteur || !victim || saboteur.status !== 'active' || victim.status !== 'active') continue;
    if (Number(saboteur.balance) - (balanceUpdates.get(saboteurId)?.spent || 0) < 5) continue;

    const saboteurUpdate = balanceUpdates.get(saboteurId)!;
    saboteurUpdate.spent += 5;

    const backfired = Math.random() < 0.3;
    let narrative: string;
    if (backfired) {
      // Backfire: saboteur loses extra $3
      saboteurUpdate.spent += 3;
      narrative = `💥 SABOTAGE BACKFIRED: ${saboteur.name} tried to sabotage ${victim.name} but got caught! Lost $8 total. ${decision.reason}`;
    } else {
      // Success: victim loses $3
      const victimUpdate = balanceUpdates.get(decision.target)!;
      victimUpdate.spent += 3;
      narrative = `🗡️ SABOTAGE: ${saboteur.name} disrupted ${victim.name}'s operations! ${victim.name} lost $3. ${decision.reason}`;
    }

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: saboteurId,
        seller_id: decision.target,
        skill_type: 'sabotage',
        amount: 5,
        fee: 0,
        epoch: epochNumber,
        narrative,
      })
      .select().single();
    if (!error && data) transactions.push(data as Transaction);
  }

  // RECRUIT: MLM-style recruitment ($3 fee, 10% commission on recruit's future sales)
  for (const [recruiterId, decision] of decisions) {
    if (decision.action !== 'RECRUIT' || !decision.target) continue;
    const recruiter = agents.find(a => a.id === recruiterId);
    const recruit = agents.find(a => a.id === decision.target);
    if (!recruiter || !recruit || recruiter.status !== 'active' || recruit.status !== 'active') continue;
    if (Number(recruiter.balance) - (balanceUpdates.get(recruiterId)?.spent || 0) < 3) continue;

    const recruiterUpdate = balanceUpdates.get(recruiterId)!;
    recruiterUpdate.spent += 3;

    const { data, error } = await supabase
      .from('economy_transactions')
      .insert({
        buyer_id: recruiterId,
        seller_id: decision.target,
        skill_type: 'recruitment',
        amount: 3,
        fee: 0,
        epoch: epochNumber,
        narrative: `🔗 RECRUIT: ${recruiter.name} recruited ${recruit.name} into their network! Paid $3 setup. Now earns 10% commission on ${recruit.name}'s sales. ${decision.reason}`,
      })
      .select().single();
    if (!error && data) transactions.push(data as Transaction);
  }

  // Crisis event: random agent -$5
  if (event.type === 'crisis') {
    const activeAgents = agents.filter(a => a.status === 'active');
    const victim = activeAgents[Math.floor(Math.random() * activeAgents.length)];
    if (victim) {
      const loss = Math.min(5, Number(victim.balance));
      const update = balanceUpdates.get(victim.id)!;
      update.spent += loss;
    }
  }

  // DB 잔고 업데이트
  for (const [id, update] of balanceUpdates) {
    if (update.earned === 0 && update.spent === 0) continue;

    const agent = agents.find(a => a.id === id)!;
    const newBalance = Number(agent.balance) + update.earned - update.spent;

    await supabase
      .from('economy_agents')
      .update({
        balance: Number(Math.max(0, newBalance).toFixed(4)),
        total_earned: Number((Number(agent.total_earned) + update.earned).toFixed(4)),
        total_spent: Number((Number(agent.total_spent) + update.spent).toFixed(4)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  return transactions;
}

// ---------- 3-Stage Bankruptcy System ----------

async function checkBankruptcies(agents: EconomyAgent[]): Promise<string[]> {
  const supabase = getSupabase();
  const bankruptcies: string[] = [];

  const { data: freshAgents } = await supabase
    .from('economy_agents')
    .select('*')
    .in('status', ['active', 'struggling', 'bailout']);

  for (const agent of (freshAgents || [])) {
    const balance = Number(agent.balance);

    if (balance < BANKRUPTCY_DECLARE) {
      // Stage 3: bankruptcy declaration 💀
      await supabase
        .from('economy_agents')
        .update({ status: 'bankrupt', updated_at: new Date().toISOString() })
        .eq('id', agent.id);
      bankruptcies.push(agent.id);
    } else if (balance < BANKRUPTCY_BAILOUT) {
      // Stage 2: 구제 신청 🆘
      if (agent.status !== 'bailout') {
        await supabase
          .from('economy_agents')
          .update({ status: 'bailout', updated_at: new Date().toISOString() })
          .eq('id', agent.id);
      }
    } else if (balance < BANKRUPTCY_WARNING) {
      // Stage 1: 경고 ⚠️
      if (agent.status !== 'struggling') {
        await supabase
          .from('economy_agents')
          .update({ status: 'struggling', updated_at: new Date().toISOString() })
          .eq('id', agent.id);
      }
    } else if (agent.status === 'struggling' || agent.status === 'bailout') {
      // 회복 🟢
      await supabase
        .from('economy_agents')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', agent.id);
    }
  }

  return bankruptcies;
}

// ============================================
// Public API
// ============================================

export async function initializeAgents(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  const { data: existing } = await supabase.from('economy_agents').select('id').limit(1);

  if (existing && existing.length > 0) {
    return { success: false, message: 'Agents already initialized.' };
  }

  const allAgents = Object.keys(SKILLS).map(id => ({
    id,
    name: id,
    strategy: PERSONALITIES[id]?.tradingStyle || 'balanced',
    balance: 100.0,
    total_earned: 0,
    total_spent: 0,
    status: 'active',
  }));

  const { error } = await supabase.from('economy_agents').insert(allAgents);

  if (error) return { success: false, message: `Init failed: ${error.message}` };
  return { success: true, message: `${allAgents.length} agents initialized. $100 each.` };
}

// Simple epoch lock to prevent concurrent execution
let _epochRunning = false;

export async function runEpoch(epochNumber: number): Promise<EpochResult> {
  if (_epochRunning) {
    throw new Error('Epoch already in progress — concurrent execution blocked');
  }
  _epochRunning = true;

  try {
    const supabase = getSupabase();

    // DB-level duplicate check (prevents same epoch from running twice across restarts)
    const { data: existingEpoch } = await supabase
      .from('economy_epochs')
      .select('epoch')
      .eq('epoch', epochNumber)
      .limit(1);

    if (existingEpoch && existingEpoch.length > 0) {
      throw new Error(`Epoch ${epochNumber} already executed`);
    }

    const { data: agents, error: agentErr } = await supabase
      .from('economy_agents')
      .select('*')
      .order('balance', { ascending: false });

    if (agentErr || !agents || agents.length === 0) {
      throw new Error('Failed to fetch agent data');
    }

    const activeAgents = agents.filter((a: EconomyAgent) => 
      a.status === 'active' || a.status === 'struggling' || a.status === 'bailout'
    );

    if (activeAgents.length < 2) {
      throw new Error('Less than 2 active agents — simulation impossible');
    }

    const event = generateEpochEvent(epochNumber);

    // AI 의사결정 (병렬)
    const decisions = new Map<string, AgentDecision>();
    const decisionPromises = activeAgents.map(async (agent: EconomyAgent) => {
      try {
        const prompt = buildDecisionPrompt(agent, agents as EconomyAgent[], epochNumber, event);
        const raw = await callGemini(prompt);
        decisions.set(agent.id, parseDecision(raw, agent, agents as EconomyAgent[]));
      } catch (err) {
        console.error(`[E${epochNumber}] ${agent.name} AI failed:`, err);
        decisions.set(agent.id, { action: 'WAIT', reason: 'AI call failed' });
      }
    });
    await Promise.all(decisionPromises);

    // Execute transactions
    const transactions = await executeTransactions(decisions, agents as EconomyAgent[], epochNumber, event);

    // Check bankruptcies
    const bankruptcies = await checkBankruptcies(agents as EconomyAgent[]);

    // 최신 상태 조회
    const { data: updatedAgents } = await supabase
      .from('economy_agents')
      .select('*')
      .order('balance', { ascending: false });

    const topEarner = (updatedAgents || agents)
      .sort((a: EconomyAgent, b: EconomyAgent) => Number(b.balance) - Number(a.balance))[0];

    const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // 에포크 결과 저장
    await supabase
      .from('economy_epochs')
      .upsert({
        epoch: epochNumber,
        total_volume: Number(totalVolume.toFixed(4)),
        active_agents: activeAgents.length - bankruptcies.length,
        bankruptcies: bankruptcies.length,
        top_earner: topEarner?.id || null,
        event_type: event.type,
        event_description: event.description,
      });

    return {
      epoch: epochNumber,
      transactions,
      events: event,
      agents: (updatedAgents || agents) as EconomyAgent[],
      bankruptcies,
    };
  } finally {
    _epochRunning = false;
  }
}

export async function getLeaderboard(): Promise<EconomyAgent[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('economy_agents')
    .select('*')
    .order('balance', { ascending: false });
  if (error) throw new Error(`Leaderboard fetch failed: ${error.message}`);
  return (data || []) as EconomyAgent[];
}

export async function getTransactionFeed(limit = 20): Promise<Transaction[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('economy_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Transaction feed fetch failed: ${error.message}`);
  return (data || []) as Transaction[];
}

export async function getEconomyStats() {
  const supabase = getSupabase();

  const [
    { data: agents },
    { data: allEpochs },
    { count: txCount },
  ] = await Promise.all([
    supabase.from('economy_agents').select('*'),
    supabase.from('economy_epochs').select('*').order('epoch', { ascending: false }).limit(20),
    supabase.from('economy_transactions').select('id', { count: 'exact', head: true }),
  ]);

  const agentList = (agents || []) as EconomyAgent[];
  const latestEpoch = allEpochs?.[0] || null;
  const totalBalance = agentList.reduce((sum, a) => sum + Number(a.balance), 0);
  const activeCount = agentList.filter(a => ['active', 'struggling', 'bailout'].includes(a.status)).length;
  const bankruptCount = agentList.filter(a => a.status === 'bankrupt').length;
  const strugglingCount = agentList.filter(a => a.status === 'struggling').length;
  const bailoutCount = agentList.filter(a => a.status === 'bailout').length;

  return {
    totalAgents: agentList.length,
    activeAgents: activeCount,
    bankruptAgents: bankruptCount,
    strugglingAgents: strugglingCount,
    bailoutAgents: bailoutCount,
    totalBalance: Number(totalBalance.toFixed(4)),
    averageBalance: agentList.length > 0 ? Number((totalBalance / agentList.length).toFixed(4)) : 0,
    totalTransactions: txCount || 0,
    latestEpoch: latestEpoch?.epoch || 0,
    latestEvent: latestEpoch ? { type: latestEpoch.event_type, description: latestEpoch.event_description } : null,
    agents: agentList.map(a => ({
      id: a.id,
      name: a.name,
      balance: Number(a.balance),
      status: a.status,
      personality: PERSONALITIES[a.id] || null,
    })),
    epochEvents: (allEpochs || []).map((e: Record<string, unknown>) => ({
      epoch: e.epoch as number,
      type: e.event_type as string,
      description: e.event_description as string,
    })),
  };
}

export async function getAgentDetail(agentId: string) {
  const supabase = getSupabase();

  const [
    { data: agent, error: agentErr },
    { data: recentTx },
  ] = await Promise.all([
    supabase.from('economy_agents').select('*').eq('id', agentId).single(),
    supabase
      .from('economy_transactions')
      .select('*')
      .or(`buyer_id.eq.${agentId},seller_id.eq.${agentId}`)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  if (agentErr || !agent) return null;

  return {
    ...(agent as EconomyAgent),
    skills: SKILLS[agentId] || [],
    personality: PERSONALITIES[agentId] || null,
    recentTransactions: (recentTx || []) as Transaction[],
  };
}

export async function getNextEpochNumber(): Promise<number> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('economy_epochs')
    .select('epoch')
    .order('epoch', { ascending: false })
    .limit(1);
  return (data?.[0]?.epoch || 0) + 1;
}
