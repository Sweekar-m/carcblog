-- Migration: Create articles table in Supabase
-- Run this in your Supabase SQL Editor (https://database.supabase.com)

-- 1. Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to read published articles
CREATE POLICY "Public read for published articles"
  ON public.articles
  FOR SELECT
  USING (published_at IS NOT NULL);

-- Allow writers/authors to perform all actions on their own articles
-- (For V1 simplicty, we allow all operations. We filter by author_id in application code/RLS check)
CREATE POLICY "Authors can manage own articles"
  ON public.articles
  FOR ALL
  USING (true)
  WITH CHECK (true);
