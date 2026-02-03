-- 예측 마켓 스키마 (Phase 1: 포인트 기반)

-- 유저 포인트 테이블
CREATE TABLE IF NOT EXISTS user_points (
  user_id TEXT PRIMARY KEY,  -- kakao user ID or wallet address
  points INTEGER DEFAULT 1000, -- 가입 시 1000P 지급
  total_won INTEGER DEFAULT 0,
  total_lost INTEGER DEFAULT 0,
  total_bets INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 베팅 테이블
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_points(user_id),
  agent_id TEXT NOT NULL,          -- 베팅 대상 에이전트
  epoch INTEGER NOT NULL,          -- 어떤 에포크에 대한 예측인지
  prediction TEXT NOT NULL,        -- 'up' | 'down' | 'bankrupt' | 'survive'
  amount INTEGER NOT NULL,         -- 베팅 포인트
  odds DECIMAL(4,2) DEFAULT 2.0,   -- 배당률
  result TEXT,                     -- 'win' | 'lose' | null (미정산)
  payout INTEGER DEFAULT 0,        -- 정산 포인트
  created_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ
);

-- 베팅 리더보드 뷰
CREATE OR REPLACE VIEW prediction_leaderboard AS
SELECT 
  user_id,
  points,
  total_bets,
  total_won,
  CASE WHEN total_bets > 0 
    THEN ROUND((total_won::decimal / total_bets) * 100, 1)
    ELSE 0 
  END as win_rate,
  best_streak
FROM user_points
WHERE total_bets > 0
ORDER BY points DESC;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_epoch ON predictions(epoch);
CREATE INDEX IF NOT EXISTS idx_predictions_agent ON predictions(agent_id);
CREATE INDEX IF NOT EXISTS idx_predictions_unsettled ON predictions(result) WHERE result IS NULL;
