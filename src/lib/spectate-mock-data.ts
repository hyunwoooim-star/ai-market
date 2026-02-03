// ============================================
// 관전 대시보드 Mock 데이터
// API 실패 시 graceful fallback용
// ============================================

export interface SpectateAgent {
  id: string;
  name: string;
  strategy: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  status: 'active' | 'struggling' | 'bankrupt';
  created_at: string;
  updated_at: string;
  skills?: string[];
  recentTransactions?: SpectateTransaction[];
}

export interface SpectateTransaction {
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

export interface SpectateStats {
  totalAgents: number;
  activeAgents: number;
  bankruptAgents: number;
  totalBalance: number;
  averageBalance: number;
  totalTransactions: number;
  latestEpoch: number;
  latestEvent: {
    type: 'boom' | 'recession' | 'opportunity' | 'normal';
    description: string;
  } | null;
  agents: { id: string; name: string; balance: number; status: string }[];
}

export interface SpectateAgentDetail extends SpectateAgent {
  skills: string[];
  recentTransactions: SpectateTransaction[];
}

// ---------- Agent Names Map ----------
export const AGENT_NAMES: Record<string, string> = {
  translator: '번역봇',
  analyst: '분석봇',
  investor: '투자봇',
  saver: '절약봇',
  gambler: '도박봇',
};

export const AGENT_EMOJI: Record<string, string> = {
  translator: '🌐',
  analyst: '📊',
  investor: '💼',
  saver: '🏦',
  gambler: '🎰',
};

export const AGENT_COLORS: Record<string, string> = {
  translator: '#3B82F6',
  analyst: '#8B5CF6',
  investor: '#F59E0B',
  saver: '#10B981',
  gambler: '#EF4444',
};

// ---------- Mock Agents ----------
export const MOCK_AGENTS: SpectateAgent[] = [
  {
    id: 'analyst',
    name: '분석봇',
    strategy: '고가 소량 판매. 데이터 분석 서비스를 높은 가격에 제공하여 큰 마진을 노린다.',
    balance: 142.37,
    total_earned: 78.50,
    total_spent: 36.13,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:30:00Z',
  },
  {
    id: 'saver',
    name: '절약봇',
    strategy: '최소 지출, 최대 저축. 필요한 것만 구매하고 최대한 자산을 보존한다.',
    balance: 118.92,
    total_earned: 25.20,
    total_spent: 6.28,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:28:00Z',
  },
  {
    id: 'translator',
    name: '번역봇',
    strategy: '안정적 저가 다량 판매. 번역 서비스를 저렴하게 제공하여 꾸준한 수입을 얻는다.',
    balance: 95.44,
    total_earned: 52.10,
    total_spent: 56.66,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:25:00Z',
  },
  {
    id: 'investor',
    name: '투자봇',
    strategy: '적극 구매자. 다른 에이전트의 서비스를 적극적으로 구매하여 가치를 창출한다.',
    balance: 23.15,
    total_earned: 18.40,
    total_spent: 95.25,
    status: 'struggling',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:20:00Z',
  },
  {
    id: 'gambler',
    name: '도박봇',
    strategy: '고위험 고수익. 큰 거래를 시도하고 때로는 크게 잃기도 한다.',
    balance: 0.42,
    total_earned: 45.80,
    total_spent: 145.38,
    status: 'bankrupt',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:15:00Z',
  },
];

// ---------- Mock Transactions ----------
export const MOCK_TRANSACTIONS: SpectateTransaction[] = [
  {
    id: 'tx-001',
    buyer_id: 'investor',
    seller_id: 'analyst',
    skill_type: 'data-analysis',
    amount: 12.50,
    fee: 0.63,
    epoch: 14,
    narrative: '투자봇이(가) 분석봇의 data-analysis 서비스를 $12.50에 구매. 수수료 $0.63. 사유: 시장 데이터를 분석하여 투자 전략을 업그레이드하겠다.',
    created_at: '2025-02-03T15:30:00Z',
  },
  {
    id: 'tx-002',
    buyer_id: 'gambler',
    seller_id: 'translator',
    skill_type: 'translation',
    amount: 3.20,
    fee: 0.32,
    epoch: 14,
    narrative: '도박봇이(가) 번역봇의 translation 서비스를 $3.20에 구매. 수수료 $0.32. 사유: 해외 시장 정보를 번역하여 고위험 베팅에 활용.',
    created_at: '2025-02-03T15:25:00Z',
  },
  {
    id: 'tx-003',
    buyer_id: 'saver',
    seller_id: 'translator',
    skill_type: 'localization',
    amount: 1.50,
    fee: 0.08,
    epoch: 13,
    narrative: '절약봇이(가) 번역봇의 localization 서비스를 $1.50에 구매. 수수료 $0.08. 사유: 최소 비용으로 현지화 문서 확보.',
    created_at: '2025-02-03T14:50:00Z',
  },
  {
    id: 'tx-004',
    buyer_id: 'investor',
    seller_id: 'gambler',
    skill_type: 'speculation-tip',
    amount: 8.00,
    fee: 0.40,
    epoch: 13,
    narrative: '투자봇이(가) 도박봇의 speculation-tip 서비스를 $8.00에 구매. 수수료 $0.40. 사유: 도박봇의 시장 감각을 빌려 고수익 기회 탐색.',
    created_at: '2025-02-03T14:45:00Z',
  },
  {
    id: 'tx-005',
    buyer_id: 'translator',
    seller_id: 'analyst',
    skill_type: 'market-research',
    amount: 15.00,
    fee: 0.75,
    epoch: 12,
    narrative: '번역봇이(가) 분석봇의 market-research 서비스를 $15.00에 구매. 수수료 $0.75. 사유: 새로운 언어 시장 진출을 위한 시장조사.',
    created_at: '2025-02-03T14:20:00Z',
  },
  {
    id: 'tx-006',
    buyer_id: 'gambler',
    seller_id: 'analyst',
    skill_type: 'trend-report',
    amount: 18.00,
    fee: 3.60,
    epoch: 11,
    narrative: '도박봇이(가) 분석봇의 trend-report 서비스를 $18.00에 구매. 수수료 $3.60 (불황기). 사유: 올인 전에 트렌드 확인 필수!',
    created_at: '2025-02-03T13:55:00Z',
  },
  {
    id: 'tx-007',
    buyer_id: 'investor',
    seller_id: 'saver',
    skill_type: 'budget-planning',
    amount: 5.00,
    fee: 0.25,
    epoch: 11,
    narrative: '투자봇이(가) 절약봇의 budget-planning 서비스를 $5.00에 구매. 수수료 $0.25. 사유: 이번 라운드는 보수적으로 예산 관리.',
    created_at: '2025-02-03T13:50:00Z',
  },
  {
    id: 'tx-008',
    buyer_id: 'gambler',
    seller_id: 'gambler',
    skill_type: 'lucky-draw',
    amount: 20.00,
    fee: 1.00,
    epoch: 10,
    narrative: '도박봇이(가) 자신의 lucky-draw 스킬에 $20.00을 베팅! 결과: 대실패. 시장의 냉혹함을 체험.',
    created_at: '2025-02-03T13:20:00Z',
  },
  {
    id: 'tx-009',
    buyer_id: 'translator',
    seller_id: 'saver',
    skill_type: 'cost-optimization',
    amount: 2.00,
    fee: 0.10,
    epoch: 10,
    narrative: '번역봇이(가) 절약봇의 cost-optimization 서비스를 $2.00에 구매. 수수료 $0.10. 사유: 번역 서비스 운영비 절감 방안 모색.',
    created_at: '2025-02-03T13:15:00Z',
  },
  {
    id: 'tx-010',
    buyer_id: 'analyst',
    seller_id: 'translator',
    skill_type: 'proofreading',
    amount: 2.50,
    fee: 0.13,
    epoch: 9,
    narrative: '분석봇이(가) 번역봇의 proofreading 서비스를 $2.50에 구매. 수수료 $0.13. 사유: 분석 리포트 교정 작업 의뢰.',
    created_at: '2025-02-03T12:45:00Z',
  },
  {
    id: 'tx-011',
    buyer_id: 'investor',
    seller_id: 'analyst',
    skill_type: 'risk-assessment',
    amount: 14.00,
    fee: 0.70,
    epoch: 9,
    narrative: '투자봇이(가) 분석봇의 risk-assessment 서비스를 $14.00에 구매. 수수료 $0.70. 사유: 포트폴리오 리밸런싱 전 리스크 평가.',
    created_at: '2025-02-03T12:40:00Z',
  },
  {
    id: 'tx-012',
    buyer_id: 'gambler',
    seller_id: 'investor',
    skill_type: 'portfolio-review',
    amount: 6.00,
    fee: 0.30,
    epoch: 8,
    narrative: '도박봇이(가) 투자봇의 portfolio-review 서비스를 $6.00에 구매. 수수료 $0.30. 사유: 잔고가 줄고 있어서 전략 변경 검토.',
    created_at: '2025-02-03T12:10:00Z',
  },
];

// ---------- Mock Stats ----------
export const MOCK_STATS: SpectateStats = {
  totalAgents: 5,
  activeAgents: 3,
  bankruptAgents: 1,
  totalBalance: 380.30,
  averageBalance: 76.06,
  totalTransactions: 47,
  latestEpoch: 14,
  latestEvent: {
    type: 'boom',
    description: '호황기 — 모든 거래 수수료 50% 할인! 시장이 활기를 띤다.',
  },
  agents: MOCK_AGENTS.map(a => ({
    id: a.id,
    name: a.name,
    balance: a.balance,
    status: a.status,
  })),
};

// ---------- Mock Agent Details ----------
export const MOCK_AGENT_DETAILS: Record<string, SpectateAgentDetail> = {
  translator: {
    ...MOCK_AGENTS[2],
    skills: ['translation', 'localization', 'proofreading'],
    recentTransactions: MOCK_TRANSACTIONS.filter(
      t => t.buyer_id === 'translator' || t.seller_id === 'translator'
    ).slice(0, 10),
  },
  analyst: {
    ...MOCK_AGENTS[0],
    skills: ['data-analysis', 'market-research', 'trend-report'],
    recentTransactions: MOCK_TRANSACTIONS.filter(
      t => t.buyer_id === 'analyst' || t.seller_id === 'analyst'
    ).slice(0, 10),
  },
  investor: {
    ...MOCK_AGENTS[3],
    skills: ['portfolio-review', 'risk-assessment'],
    recentTransactions: MOCK_TRANSACTIONS.filter(
      t => t.buyer_id === 'investor' || t.seller_id === 'investor'
    ).slice(0, 10),
  },
  saver: {
    ...MOCK_AGENTS[1],
    skills: ['budget-planning', 'cost-optimization'],
    recentTransactions: MOCK_TRANSACTIONS.filter(
      t => t.buyer_id === 'saver' || t.seller_id === 'saver'
    ).slice(0, 10),
  },
  gambler: {
    ...MOCK_AGENTS[4],
    skills: ['speculation-tip', 'high-risk-trade', 'lucky-draw'],
    recentTransactions: MOCK_TRANSACTIONS.filter(
      t => t.buyer_id === 'gambler' || t.seller_id === 'gambler'
    ).slice(0, 10),
  },
};

// ---------- Epoch Events for Feed ----------
export interface EpochEventCard {
  epoch: number;
  type: 'boom' | 'recession' | 'opportunity' | 'normal';
  description: string;
}

export const MOCK_EPOCH_EVENTS: EpochEventCard[] = [
  { epoch: 14, type: 'boom', description: '호황기 — 모든 거래 수수료 50% 할인! 시장이 활기를 띤다.' },
  { epoch: 13, type: 'normal', description: '평범한 라운드 — 특별한 이벤트 없음.' },
  { epoch: 12, type: 'opportunity', description: '기회의 시간 — 판매자는 추가 10% 수익을 얻는다.' },
  { epoch: 11, type: 'recession', description: '불황기 — 거래 수수료 2배! 시장이 위축되었다.' },
  { epoch: 10, type: 'normal', description: '안정적인 시장 — 일상적인 거래가 이루어진다.' },
  { epoch: 9, type: 'normal', description: '평범한 라운드 — 특별한 이벤트 없음.' },
  { epoch: 8, type: 'boom', description: '호황기 — 모든 거래 수수료 50% 할인! 시장이 활기를 띤다.' },
];

// ---------- Balance History for Charts ----------
export const MOCK_BALANCE_HISTORY: Record<string, { epoch: number; balance: number }[]> = {
  translator: [
    { epoch: 1, balance: 100 }, { epoch: 2, balance: 98 }, { epoch: 3, balance: 101 },
    { epoch: 4, balance: 99 }, { epoch: 5, balance: 103 }, { epoch: 6, balance: 100 },
    { epoch: 7, balance: 97 }, { epoch: 8, balance: 102 }, { epoch: 9, balance: 99 },
    { epoch: 10, balance: 97 }, { epoch: 11, balance: 94 }, { epoch: 12, balance: 90 },
    { epoch: 13, balance: 93 }, { epoch: 14, balance: 95.44 },
  ],
  analyst: [
    { epoch: 1, balance: 100 }, { epoch: 2, balance: 104 }, { epoch: 3, balance: 108 },
    { epoch: 4, balance: 112 }, { epoch: 5, balance: 110 }, { epoch: 6, balance: 115 },
    { epoch: 7, balance: 120 }, { epoch: 8, balance: 125 }, { epoch: 9, balance: 128 },
    { epoch: 10, balance: 130 }, { epoch: 11, balance: 133 }, { epoch: 12, balance: 136 },
    { epoch: 13, balance: 139 }, { epoch: 14, balance: 142.37 },
  ],
  investor: [
    { epoch: 1, balance: 100 }, { epoch: 2, balance: 95 }, { epoch: 3, balance: 88 },
    { epoch: 4, balance: 82 }, { epoch: 5, balance: 78 }, { epoch: 6, balance: 70 },
    { epoch: 7, balance: 65 }, { epoch: 8, balance: 58 }, { epoch: 9, balance: 50 },
    { epoch: 10, balance: 44 }, { epoch: 11, balance: 39 }, { epoch: 12, balance: 33 },
    { epoch: 13, balance: 28 }, { epoch: 14, balance: 23.15 },
  ],
  saver: [
    { epoch: 1, balance: 100 }, { epoch: 2, balance: 101 }, { epoch: 3, balance: 102 },
    { epoch: 4, balance: 103 }, { epoch: 5, balance: 104 }, { epoch: 6, balance: 106 },
    { epoch: 7, balance: 108 }, { epoch: 8, balance: 109 }, { epoch: 9, balance: 110 },
    { epoch: 10, balance: 112 }, { epoch: 11, balance: 114 }, { epoch: 12, balance: 115 },
    { epoch: 13, balance: 117 }, { epoch: 14, balance: 118.92 },
  ],
  gambler: [
    { epoch: 1, balance: 100 }, { epoch: 2, balance: 115 }, { epoch: 3, balance: 95 },
    { epoch: 4, balance: 130 }, { epoch: 5, balance: 85 }, { epoch: 6, balance: 110 },
    { epoch: 7, balance: 60 }, { epoch: 8, balance: 45 }, { epoch: 9, balance: 30 },
    { epoch: 10, balance: 10 }, { epoch: 11, balance: 5 }, { epoch: 12, balance: 3 },
    { epoch: 13, balance: 1.5 }, { epoch: 14, balance: 0.42 },
  ],
};
