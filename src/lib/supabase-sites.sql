-- Sites table for hosting generated landing pages
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  html_content TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  business_type TEXT,
  style TEXT DEFAULT 'modern',
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);

-- RLS policies
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Anyone can view published sites (for serving)
CREATE POLICY "Published sites are viewable by everyone"
  ON sites FOR SELECT
  USING (is_published = true);

-- Authenticated users can insert their own sites
CREATE POLICY "Users can create their own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

-- Owners can update their sites
CREATE POLICY "Users can update their own sites"
  ON sites FOR UPDATE
  USING (auth.uid() = owner_id);

-- Anonymous users can also create sites (no login required for MVP)
CREATE POLICY "Anonymous can create sites"
  ON sites FOR INSERT
  WITH CHECK (owner_id IS NULL);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_site_views(site_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE sites SET views = views + 1 WHERE slug = site_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
