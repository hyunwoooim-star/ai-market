-- AI 비서 서비스 스키마
-- 작성일: 2026-02-06
-- 목적: OAuth 연결, 블로그 포스팅, AI 전화 관리

-- ============================================
-- 1. user_connections: OAuth 연결 정보
-- ============================================
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'naver', 'kakao', 'instagram', 'meta'
  provider_user_id TEXT,
  provider_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[], -- 부여받은 권한 목록
  metadata JSONB DEFAULT '{}', -- 추가 정보
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);

-- RLS 정책
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON user_connections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connections" ON user_connections
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections" ON user_connections
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own connections" ON user_connections
  FOR DELETE USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_user_connections_user ON user_connections(user_id);
CREATE INDEX idx_user_connections_provider ON user_connections(provider);

-- ============================================
-- 2. blog_posts: 블로그 포스팅 관리
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES user_connections(id) ON DELETE SET NULL,
  
  -- 콘텐츠
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  
  -- 플랫폼 정보
  platform TEXT NOT NULL, -- 'naver', 'tistory'
  platform_post_id TEXT, -- 발행 후 플랫폼에서 받은 ID
  platform_url TEXT, -- 발행된 글 URL
  
  -- 상태
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'publishing', 'published', 'failed'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- AI 메타데이터
  ai_prompt TEXT, -- 생성에 사용된 프롬프트
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blog posts" ON blog_posts
  FOR ALL USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_blog_posts_user ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_scheduled ON blog_posts(scheduled_at) WHERE status = 'scheduled';

-- ============================================
-- 3. phone_numbers: AI 전화번호
-- ============================================
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Twilio 정보
  twilio_phone_number TEXT NOT NULL UNIQUE,
  twilio_phone_sid TEXT NOT NULL,
  
  -- 비즈니스 설정
  business_name TEXT,
  greeting_message TEXT DEFAULT '안녕하세요! 무엇을 도와드릴까요?',
  business_hours JSONB DEFAULT '{"open": "09:00", "close": "18:00", "days": [1,2,3,4,5]}',
  
  -- AI 설정
  ai_personality TEXT DEFAULT 'friendly', -- 'friendly', 'professional', 'casual'
  knowledge_base JSONB DEFAULT '{}', -- FAQ, 메뉴 등
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own phone numbers" ON phone_numbers
  FOR ALL USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_phone_numbers_user ON phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_twilio ON phone_numbers(twilio_phone_number);

-- ============================================
-- 4. phone_calls: 통화 기록
-- ============================================
CREATE TABLE IF NOT EXISTS phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id UUID REFERENCES phone_numbers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Twilio 정보
  twilio_call_sid TEXT NOT NULL UNIQUE,
  
  -- 통화 정보
  caller_number TEXT NOT NULL,
  call_direction TEXT DEFAULT 'inbound', -- 'inbound', 'outbound'
  call_status TEXT, -- 'completed', 'busy', 'no-answer', 'failed'
  duration_seconds INT DEFAULT 0,
  
  -- AI 대화 내용
  transcript TEXT, -- 전체 대화 기록
  conversation JSONB DEFAULT '[]', -- [{role: 'user'|'ai', text: '...'}]
  intent_detected TEXT, -- 'reservation', 'inquiry', 'complaint', 'other'
  
  -- 후속 조치
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  
  -- 타임스탬프
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- RLS 정책
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phone calls" ON phone_calls
  FOR SELECT USING (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_phone_calls_user ON phone_calls(user_id);
CREATE INDEX idx_phone_calls_phone ON phone_calls(phone_number_id);
CREATE INDEX idx_phone_calls_started ON phone_calls(started_at DESC);

-- ============================================
-- 5. activity_logs: 활동 로그
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- 활동 정보
  activity_type TEXT NOT NULL, -- 'blog_post', 'phone_call', 'message_sent', 'connection'
  activity_status TEXT DEFAULT 'completed', -- 'completed', 'failed', 'pending'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- 관련 엔티티
  related_entity_type TEXT, -- 'blog_post', 'phone_call', etc.
  related_entity_id UUID,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- 인덱스
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- 6. 함수: 활동 로그 자동 생성
-- ============================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (user_id, activity_type, description, related_entity_type, related_entity_id)
  VALUES (
    NEW.user_id,
    TG_ARGV[0],
    TG_ARGV[1],
    TG_TABLE_NAME,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 블로그 발행 시 로그
CREATE TRIGGER log_blog_published
  AFTER UPDATE OF status ON blog_posts
  FOR EACH ROW
  WHEN (NEW.status = 'published' AND OLD.status != 'published')
  EXECUTE FUNCTION log_activity('blog_post', '블로그 글 발행');

-- 전화 완료 시 로그
CREATE TRIGGER log_phone_call_completed
  AFTER UPDATE OF call_status ON phone_calls
  FOR EACH ROW
  WHEN (NEW.call_status = 'completed')
  EXECUTE FUNCTION log_activity('phone_call', 'AI 전화 응대 완료');

-- ============================================
-- 완료
-- ============================================
-- Han에게: 이 SQL을 Supabase SQL Editor에서 실행하세요!
