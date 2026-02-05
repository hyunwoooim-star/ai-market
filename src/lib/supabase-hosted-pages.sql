-- hosted_pages 테이블 (무료 호스팅 기능용)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS hosted_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  business_type TEXT,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE hosted_pages ENABLE ROW LEVEL SECURITY;

-- 누구나 published 페이지 읽기 가능
CREATE POLICY "Public read" ON hosted_pages
  FOR SELECT USING (is_published = true);

-- 소유자만 수정
CREATE POLICY "Owner update" ON hosted_pages
  FOR UPDATE USING (auth.uid() = user_id);

-- 소유자만 삭제
CREATE POLICY "Owner delete" ON hosted_pages
  FOR DELETE USING (auth.uid() = user_id);

-- 인증된 유저 INSERT
CREATE POLICY "Auth insert" ON hosted_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 비로그인도 INSERT 가능 (user_id NULL)
CREATE POLICY "Anon insert" ON hosted_pages
  FOR INSERT WITH CHECK (user_id IS NULL);

-- slug 인덱스
CREATE INDEX IF NOT EXISTS idx_hosted_pages_slug ON hosted_pages(slug);

-- view_count 업데이트 함수
CREATE OR REPLACE FUNCTION increment_view_count(page_slug TEXT)
RETURNS void AS $$
  UPDATE hosted_pages SET view_count = view_count + 1 WHERE slug = page_slug;
$$ LANGUAGE sql SECURITY DEFINER;
