import { createServerClient } from '@supabase/ssr';

// ============================================
// 에이전트마켓 경제 시뮬레이션 엔진 v2
// 15 에이전트 + 13 스킬 + AI 개성 + 3단계 파산
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PLATFORM_FEE_RATE = 0.05;
const BANKRUPTCY_WARNING = 10.0;  // Stage 1: 경고
const BANKRUPTCY_BAILOUT = 5.0;   // Stage 2: 구제 신청
const BANKRUPTCY_DECLARE = 1.0;   // Stage 3: 파산 선언

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
  action: 'SELL' | 'BUY' | 'WAIT';
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

// ---------- 15 에이전트 스킬 맵 (13 스킬 타입) ----------

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

// ---------- 에이전트 개성 시스템 (D2) ----------

const PERSONALITIES: Record<string, AgentPersonality> = {
  translator:  { emotion: 'balanced',   riskTolerance: 0.3, tradingStyle: '안정적 저가 다량 판매', catchphrase: '꾸준함이 이긴다' },
  analyst:     { emotion: 'calculated', riskTolerance: 0.4, tradingStyle: '데이터 기반 고가 판매', catchphrase: '숫자는 거짓말을 하지 않는다' },
  investor:    { emotion: 'aggressive', riskTolerance: 0.7, tradingStyle: '적극적 매수, 가치 투자', catchphrase: '돈이 돈을 번다' },
  saver:       { emotion: 'cautious',   riskTolerance: 0.1, tradingStyle: '최소 지출, 최대 저축', catchphrase: '아끼는 것이 버는 것' },
  gambler:     { emotion: 'volatile',   riskTolerance: 0.9, tradingStyle: '고위험 고수익 올인', catchphrase: '한 방이면 된다' },
  hacker:      { emotion: 'calculated', riskTolerance: 0.6, tradingStyle: '취약점 파악 후 정밀 타격', catchphrase: '시스템을 이해하면 돈이 보인다' },
  professor:   { emotion: 'cautious',   riskTolerance: 0.2, tradingStyle: '교육 콘텐츠 꾸준 판매', catchphrase: '지식은 최고의 투자' },
  trader:      { emotion: 'aggressive', riskTolerance: 0.8, tradingStyle: '고빈도 매매, 스프레드 수익', catchphrase: '시장은 매일 기회를 준다' },
  marketer:    { emotion: 'balanced',   riskTolerance: 0.5, tradingStyle: '트렌드 읽고 마케팅 서비스', catchphrase: '관심이 곧 돈이다' },
  coder:       { emotion: 'balanced',   riskTolerance: 0.4, tradingStyle: '기술력으로 안정적 수입', catchphrase: '코드가 일하게 한다' },
  consultant:  { emotion: 'calculated', riskTolerance: 0.3, tradingStyle: '전문 컨설팅 고가 판매', catchphrase: '경험에는 가격이 있다' },
  artist:      { emotion: 'volatile',   riskTolerance: 0.6, tradingStyle: '창작물 판매, 감성 마케팅', catchphrase: '예술은 값을 매길 수 없다' },
  broker:      { emotion: 'aggressive', riskTolerance: 0.7, tradingStyle: '중개 수수료로 양쪽 수익', catchphrase: '거래가 있으면 돈이 있다' },
  insurance:   { emotion: 'cautious',   riskTolerance: 0.2, tradingStyle: '리스크 관리 서비스 판매', catchphrase: '대비가 최고의 전략' },
  spy:         { emotion: 'calculated', riskTolerance: 0.5, tradingStyle: '정보 비대칭 활용', catchphrase: '정보가 곧 무기다' },
  lawyer:      { emotion: 'calculated', riskTolerance: 0.2, tradingStyle: '고가 법률 자문, 계약 검토', catchphrase: '계약서 한 줄이 백만 달러' },
  doctor:      { emotion: 'cautious',   riskTolerance: 0.3, tradingStyle: '신뢰 기반 안정 수입', catchphrase: '건강이 최고의 자산' },
  chef:        { emotion: 'volatile',   riskTolerance: 0.6, tradingStyle: '트렌드 탄 창의적 판매', catchphrase: '맛이 곧 경쟁력' },
  athlete:     { emotion: 'aggressive', riskTolerance: 0.5, tradingStyle: '에너지 넘치는 코칭 구독', catchphrase: '포기하면 거기서 끝' },
  journalist:  { emotion: 'balanced',   riskTolerance: 0.4, tradingStyle: '속보 프리미엄, 정보 우위', catchphrase: '진실은 팔린다' },
};

// ---------- 에포크 이벤트 (확장) ----------

function generateEpochEvent(epochNumber: number): EpochEvent {
  const events: EpochEvent[] = [
    { type: 'boom',        description: '🚀 호황기 — 수수료 50% 할인! 시장 활기', feeModifier: 0.5 },
    { type: 'recession',   description: '📉 불황기 — 수수료 2배, 시장 위축', feeModifier: 2.0 },
    { type: 'opportunity', description: '⭐ 기회의 시간 — 판매자 +10% 보너스', feeModifier: 0.8 },
    { type: 'crisis',      description: '🔥 위기 — 랜덤 에이전트 -$5 손실!', feeModifier: 1.5 },
    { type: 'normal',      description: '평범한 라운드 — 특별한 이벤트 없음.', feeModifier: 1.0 },
    { type: 'normal',      description: '안정적인 시장 — 일상적인 거래.', feeModifier: 1.0 },
    { type: 'boom',        description: '💰 투자 열풍 — 모든 거래량 급증!', feeModifier: 0.7 },
    { type: 'opportunity', description: '🎯 기술 수요 폭증 — 코딩/보안 스킬 프리미엄', feeModifier: 0.9 },
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
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
}

// ---------- 의사결정 프롬프트 (개성 반영) ----------

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
      return `- ${a.name}(${a.id}): $${Number(a.balance).toFixed(2)}, 스킬: ${skills.join(', ')}`;
    })
    .join('\n');

  // 파산 위기 상황 프롬프트 추가
  let crisisNote = '';
  const balance = Number(agent.balance);
  if (balance < BANKRUPTCY_DECLARE) {
    crisisNote = '⚠️ [파산 위기] 잔고 $1 미만! 다음 라운드에 파산 선언됩니다. 필사적으로 수입을 올려야 합니다!';
  } else if (balance < BANKRUPTCY_BAILOUT) {
    crisisNote = '⚠️ [구제 필요] 잔고 $5 미만. 구제금융 신청 대상. 저가 판매라도 해서 수입을 올리세요.';
  } else if (balance < BANKRUPTCY_WARNING) {
    crisisNote = '⚠️ [경고] 잔고 $10 미만. 위험 수준입니다. 신중하게 행동하세요.';
  }

  return `너는 AI 경제 도시의 "${agent.name}"이다.

[성격]
- 감정 유형: ${personality.emotion}
- 위험 허용도: ${(personality.riskTolerance * 100).toFixed(0)}%
- 트레이딩 스타일: ${personality.tradingStyle}
- 좌우명: "${personality.catchphrase}"
- 전략: ${agent.strategy}
${crisisNote}

[상태]
잔고: $${balance.toFixed(2)}
총 수입: $${Number(agent.total_earned).toFixed(2)} | 총 지출: $${Number(agent.total_spent).toFixed(2)}
라운드: ${epochNumber}

[내 스킬] ${mySkills.join(', ')}

[다른 에이전트]
${otherAgents}

[시장 이벤트] ${event.description}
[수수료] ${(PLATFORM_FEE_RATE * event.feeModifier * 100).toFixed(0)}%

[행동 선택]
1. SELL: 내 스킬 하나를 판매 등록 (가격 $0.50~$20)
2. BUY: 다른 에이전트 스킬 구매 (잔고 이내, $0.50~$15)
3. WAIT: 패스

규칙: 파산 에이전트와 거래 불가. BUY는 잔고 초과 불가.
너의 성격과 전략에 맞게 결정하라.

JSON 응답:
{"action":"SELL|BUY|WAIT","target":"에이전트id","skill":"스킬명","price":0.00,"reason":"한국어 한문장"}`;
}

// ---------- 파싱 ----------

function parseDecision(raw: string, agent: EconomyAgent, allAgents: EconomyAgent[]): AgentDecision {
  try {
    const parsed = JSON.parse(raw);
    const action = String(parsed.action || 'WAIT').toUpperCase() as 'SELL' | 'BUY' | 'WAIT';

    if (action === 'WAIT') {
      return { action: 'WAIT', reason: parsed.reason || '관망' };
    }

    const price = Math.max(0.5, Math.min(20, Number(parsed.price) || 1));
    const target = String(parsed.target || '');
    const skill = String(parsed.skill || 'general');

    if (action === 'BUY') {
      if (price > Number(agent.balance)) {
        return { action: 'WAIT', reason: '잔고 부족으로 관망' };
      }
      const targetAgent = allAgents.find(a => a.id === target && a.status === 'active');
      if (!targetAgent || targetAgent.id === agent.id) {
        return { action: 'WAIT', reason: '유효한 거래 상대 없음' };
      }
    }

    return { action, target, skill, price, reason: parsed.reason || '' };
  } catch {
    return { action: 'WAIT', reason: 'LLM 응답 파싱 실패 — 관망' };
  }
}

// ---------- 거래 매칭 ----------

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
        narrative: `${buyer.name}이(가) ${seller.name}의 ${decision.skill} 서비스를 $${amount.toFixed(2)}에 구매. ${decision.reason}`,
      })
      .select()
      .single();

    if (!error && data) transactions.push(data as Transaction);
  }

  // SELL 시장 매칭 (거래 안 된 판매자 → 랜덤 구매자)
  for (const [sellerId, offer] of sellers) {
    if (transactions.some(t => t.seller_id === sellerId)) continue;

    const seller = agents.find(a => a.id === sellerId);
    if (!seller || seller.status !== 'active') continue;

    // 15 에이전트 → 더 많은 거래 기회 (60%)
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
        narrative: `${buyer.name}이(가) ${seller.name}의 ${offer.skill}을 시장가 $${amount.toFixed(2)}에 구매.`,
      })
      .select()
      .single();

    if (!error && data) transactions.push(data as Transaction);
  }

  // 위기 이벤트: 랜덤 에이전트 -$5
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

// ---------- 3단계 파산 시스템 ----------

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
      // Stage 3: 파산 선언 💀
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
    return { success: false, message: '에이전트가 이미 초기화되어 있습니다.' };
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

  if (error) return { success: false, message: `초기화 실패: ${error.message}` };
  return { success: true, message: `${allAgents.length}개 에이전트 초기화 완료. 각 $100.` };
}

export async function runEpoch(epochNumber: number): Promise<EpochResult> {
  const supabase = getSupabase();

  const { data: agents, error: agentErr } = await supabase
    .from('economy_agents')
    .select('*')
    .order('balance', { ascending: false });

  if (agentErr || !agents || agents.length === 0) {
    throw new Error('에이전트 데이터 조회 실패');
  }

  const activeAgents = agents.filter((a: EconomyAgent) => 
    a.status === 'active' || a.status === 'struggling' || a.status === 'bailout'
  );

  if (activeAgents.length < 2) {
    throw new Error('활성 에이전트가 2명 미만 — 시뮬레이션 불가');
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
      console.error(`[E${epochNumber}] ${agent.name} AI 실패:`, err);
      decisions.set(agent.id, { action: 'WAIT', reason: 'AI 호출 실패' });
    }
  });
  await Promise.all(decisionPromises);

  // 거래 실행
  const transactions = await executeTransactions(decisions, agents as EconomyAgent[], epochNumber, event);

  // 파산 체크
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
}

export async function getLeaderboard(): Promise<EconomyAgent[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('economy_agents')
    .select('*')
    .order('balance', { ascending: false });
  if (error) throw new Error(`리더보드 조회 실패: ${error.message}`);
  return (data || []) as EconomyAgent[];
}

export async function getTransactionFeed(limit = 20): Promise<Transaction[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('economy_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`거래 피드 조회 실패: ${error.message}`);
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
