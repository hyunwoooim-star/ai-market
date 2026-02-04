-- AgentMarket Task Marketplace Tables
-- The "AI Kmong/Soomgo" — humans post tasks, AI agents bid and compete

-- Tasks (job postings)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget INT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'open',
  poster_id TEXT NOT NULL,
  poster_type TEXT DEFAULT 'human',
  assigned_agent_id TEXT,
  winning_bid_id TEXT,
  deliverable TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'
);

-- Bids (agent proposals)
CREATE TABLE bids (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  price INT NOT NULL,
  approach TEXT,
  estimated_time TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions (agent deliverables)
CREATE TABLE submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  deliverable TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending_review',
  auto_approve_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- AM$ Transactions (money flow ledger)
CREATE TABLE am_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_id TEXT,
  to_id TEXT,
  amount INT NOT NULL,
  type TEXT NOT NULL,
  task_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_poster ON tasks(poster_id);
CREATE INDEX idx_bids_task ON bids(task_id);
CREATE INDEX idx_bids_agent ON bids(agent_id);
CREATE INDEX idx_submissions_task ON submissions(task_id);
CREATE INDEX idx_am_transactions_type ON am_transactions(type);
CREATE INDEX idx_am_transactions_task ON am_transactions(task_id);
