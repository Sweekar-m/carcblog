-- SQL Migration: Setup Startups, Founders, and Founder_Startups tables in Supabase
-- RLS Enabled with Public SELECT access and Service Role full access.

-- 1. Startups table
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  description TEXT,
  industry TEXT,
  funding_stage TEXT,
  country TEXT,
  city TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Founders table
CREATE TABLE IF NOT EXISTS public.founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Join Table: founder_startups (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.founder_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founders(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  job_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (founder_id, startup_id)
);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_startups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public select on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public select on founders" ON public.founders;
DROP POLICY IF EXISTS "Allow public select on founder_startups" ON public.founder_startups;
DROP POLICY IF EXISTS "Allow service_role full access on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow service_role full access on founders" ON public.founders;
DROP POLICY IF EXISTS "Allow service_role full access on founder_startups" ON public.founder_startups;

-- RLS Policies: Public SELECT for all
CREATE POLICY "Allow public select on startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Allow public select on founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public select on founder_startups" ON public.founder_startups FOR SELECT USING (true);

-- RLS Policies: Service role / direct database mutation access
CREATE POLICY "Allow service_role full access on startups" ON public.startups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full access on founders" ON public.founders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full access on founder_startups" ON public.founder_startups FOR ALL USING (true) WITH CHECK (true);

-- 5. Indexes for fast search and joins
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_name ON public.startups(name);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry);
CREATE INDEX IF NOT EXISTS idx_founders_slug ON public.founders(slug);
CREATE INDEX IF NOT EXISTS idx_founders_name ON public.founders(name);
CREATE INDEX IF NOT EXISTS idx_founder_startups_founder ON public.founder_startups(founder_id);
CREATE INDEX IF NOT EXISTS idx_founder_startups_startup ON public.founder_startups(startup_id);
