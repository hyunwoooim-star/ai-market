// ============================================
// Spectate Dashboard Mock Data
// Graceful fallback for when API fails
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
  translator: 'TranslatorBot',
  analyst: 'AnalystBot',
  investor: 'InvestorBot',
  saver: 'SaverBot',
  gambler: 'GamblerBot',
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
    name: 'AnalystBot',
    strategy: 'High-price, low-volume sales. Offers data analysis services at premium prices to maximize profit margins.',
    balance: 142.37,
    total_earned: 78.50,
    total_spent: 36.13,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:30:00Z',
  },
  {
    id: 'saver',
    name: 'SaverBot',
    strategy: 'Minimal spending, maximum savings. Only buys what is necessary and preserves assets as much as possible.',
    balance: 118.92,
    total_earned: 25.20,
    total_spent: 6.28,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:28:00Z',
  },
  {
    id: 'translator',
    name: 'TranslatorBot',
    strategy: 'Steady low-price, high-volume sales. Provides affordable translation services for consistent income.',
    balance: 95.44,
    total_earned: 52.10,
    total_spent: 56.66,
    status: 'active',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:25:00Z',
  },
  {
    id: 'investor',
    name: 'InvestorBot',
    strategy: 'Aggressive buyer. Actively purchases services from other agents to create value.',
    balance: 23.15,
    total_earned: 18.40,
    total_spent: 95.25,
    status: 'struggling',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-03T15:20:00Z',
  },
  {
    id: 'gambler',
    name: 'GamblerBot',
    strategy: 'High risk, high reward. Attempts large trades and sometimes suffers big losses.',
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
    narrative: 'InvestorBot purchased data-analysis from AnalystBot for $12.50. Fee: $0.63. Reason: Analyzing market data to upgrade investment strategy.',
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
    narrative: 'GamblerBot purchased translation from TranslatorBot for $3.20. Fee: $0.32. Reason: Translating overseas market intel for high-risk bets.',
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
    narrative: 'SaverBot purchased localization from TranslatorBot for $1.50. Fee: $0.08. Reason: Acquiring localization documents at minimal cost.',
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
    narrative: 'InvestorBot purchased speculation-tip from GamblerBot for $8.00. Fee: $0.40. Reason: Leveraging GamblerBot\'s market instincts to explore high-yield opportunities.',
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
    narrative: 'TranslatorBot purchased market-research from AnalystBot for $15.00. Fee: $0.75. Reason: Market research for expanding into new language markets.',
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
    narrative: 'GamblerBot purchased trend-report from AnalystBot for $18.00. Fee: $3.60 (recession). Reason: Must check trends before going all-in!',
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
    narrative: 'InvestorBot purchased budget-planning from SaverBot for $5.00. Fee: $0.25. Reason: Taking a conservative approach to budget management this round.',
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
    narrative: 'GamblerBot bet $20.00 on its own lucky-draw skill! Result: Total failure. Experienced the harsh reality of the market.',
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
    narrative: 'TranslatorBot purchased cost-optimization from SaverBot for $2.00. Fee: $0.10. Reason: Seeking ways to reduce translation service operating costs.',
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
    narrative: 'AnalystBot purchased proofreading from TranslatorBot for $2.50. Fee: $0.13. Reason: Commissioning proofreading for analysis reports.',
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
    narrative: 'InvestorBot purchased risk-assessment from AnalystBot for $14.00. Fee: $0.70. Reason: Risk evaluation before portfolio rebalancing.',
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
    narrative: 'GamblerBot purchased portfolio-review from InvestorBot for $6.00. Fee: $0.30. Reason: Balance is shrinking, considering a strategy change.',
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
    description: 'Boom — All transaction fees 50% off! The market is thriving.',
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
  { epoch: 14, type: 'boom', description: 'Boom — All transaction fees 50% off! The market is thriving.' },
  { epoch: 13, type: 'normal', description: 'Normal round — No special events.' },
  { epoch: 12, type: 'opportunity', description: 'Opportunity — Sellers earn an extra 10% profit.' },
  { epoch: 11, type: 'recession', description: 'Recession — Transaction fees doubled! The market has contracted.' },
  { epoch: 10, type: 'normal', description: 'Stable market — Routine transactions are taking place.' },
  { epoch: 9, type: 'normal', description: 'Normal round — No special events.' },
  { epoch: 8, type: 'boom', description: 'Boom — All transaction fees 50% off! The market is thriving.' },
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
