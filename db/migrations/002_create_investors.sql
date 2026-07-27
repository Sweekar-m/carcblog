-- SQL Migration: Setup Investors table in Supabase
-- RLS Enabled with Public SELECT access and Service Role full access.

CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  investor_type TEXT, -- e.g. "VC firm", "Angel network", "Family office", "Corporate VC", "PE fund"
  website TEXT,
  profile_url TEXT,
  application_url TEXT,
  thesis TEXT,
  value_add TEXT,
  first_check TEXT,
  investment_stage TEXT,
  solicitation_policy TEXT,
  reply_rate TEXT,
  target_geography TEXT[], -- Array of target countries/regions
  linkedin_urls TEXT[],   -- Array of LinkedIn URLs
  team_members JSONB,      -- Array of [{ name, profile_url, linkedin_url }]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public select on investors" ON public.investors;
DROP POLICY IF EXISTS "Allow service_role full access on investors" ON public.investors;

-- RLS Policies
CREATE POLICY "Allow public select on investors" ON public.investors FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access on investors" ON public.investors FOR ALL USING (true) WITH CHECK (true);

-- Indexes for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_investors_slug ON public.investors(slug);
CREATE INDEX IF NOT EXISTS idx_investors_name ON public.investors(name);
CREATE INDEX IF NOT EXISTS idx_investors_type ON public.investors(investor_type);
