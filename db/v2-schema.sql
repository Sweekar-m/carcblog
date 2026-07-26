-- SQL Migration: CarcBlog V2 Complete Creator Platform Schema
-- Run this script in your Supabase SQL Editor (https://database.supabase.com)

-- 1. EXTEND PROFILES TABLE
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expertise TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS writing_topics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"likes": true, "comments": true, "followers": true, "mentions": true, "articles": true, "digest": true, "messages": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_completion_pct INTEGER DEFAULT 40;

-- 2. SOCIAL LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'github', 'x', 'instagram', 'youtube', 'medium', 'devto', 'hashnode', 'website', 'portfolio', 'other')),
  url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read social_links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "User manage own social_links" ON public.social_links FOR ALL USING (true);

-- 3. FOLLOWS TABLE EXTENSION
ALTER TABLE public.follows
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- 4. MULTI-TYPE ARTICLE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.article_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'celebrate', 'insightful', 'love', 'rocket', 'fire')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_article_reaction UNIQUE (user_id, article_id, reaction_type)
);

ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read article_reactions" ON public.article_reactions FOR SELECT USING (true);
CREATE POLICY "User manage own article_reactions" ON public.article_reactions FOR ALL USING (true);

-- 5. BOOKMARK FOLDERS & EXTENDED BOOKMARKS
CREATE TABLE IF NOT EXISTS public.bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bookmark_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User read own bookmark_folders" ON public.bookmark_folders FOR SELECT USING (true);
CREATE POLICY "User manage own bookmark_folders" ON public.bookmark_folders FOR ALL USING (true);

ALTER TABLE public.bookmarks
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.bookmark_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 6. EXTEND COMMENTS TABLE
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_author_badge BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 7. ACTIVITY FEED TABLE
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('article_published', 'article_liked', 'article_commented', 'started_following', 'achievement_unlocked', 'profile_updated')),
  target_id TEXT,
  target_title TEXT,
  target_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read activity_feed" ON public.activity_feed FOR SELECT USING (true);
CREATE POLICY "User manage own activity_feed" ON public.activity_feed FOR ALL USING (true);

-- 8. ARTICLE ANALYTICS & VIEWS TABLE
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  viewer_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  read_time_seconds INTEGER DEFAULT 0,
  completion_pct INTEGER DEFAULT 0,
  country TEXT DEFAULT 'Unknown',
  device_category TEXT DEFAULT 'desktop',
  traffic_source TEXT DEFAULT 'direct'
);

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Writer read own article_views" ON public.article_views FOR SELECT USING (true);
CREATE POLICY "Public insert article_views" ON public.article_views FOR INSERT WITH CHECK (true);

-- 9. CONVERSATIONS & MESSAGES (V2 messaging structure)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member access conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Member access members" ON public.conversation_members FOR ALL USING (true);
CREATE POLICY "Member access messages" ON public.messages FOR ALL USING (true);

-- 10. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_social_links_user ON public.social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON public.article_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_user ON public.article_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_folders_user ON public.bookmark_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON public.article_views(article_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
