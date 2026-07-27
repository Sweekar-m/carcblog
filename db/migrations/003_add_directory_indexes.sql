-- Migration: 003_add_directory_indexes.sql
-- Performance optimization indexes for CarcBlog Startups, Founders, and Investors directories.

-- 1. Startups Indexes
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_country ON public.startups(country);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry);
CREATE INDEX IF NOT EXISTS idx_startups_name ON public.startups(name);

-- 2. Founders Indexes
CREATE INDEX IF NOT EXISTS idx_founders_slug ON public.founders(slug);
CREATE INDEX IF NOT EXISTS idx_founders_country ON public.founders(country);
CREATE INDEX IF NOT EXISTS idx_founders_name ON public.founders(name);

-- 3. Investors Indexes
CREATE INDEX IF NOT EXISTS idx_investors_slug ON public.investors(slug);
CREATE INDEX IF NOT EXISTS idx_investors_type ON public.investors(investor_type);
CREATE INDEX IF NOT EXISTS idx_investors_name ON public.investors(name);

-- 4. Founder-Startups Link Table Indexes
CREATE INDEX IF NOT EXISTS idx_founder_startups_startup ON public.founder_startups(startup_id);
CREATE INDEX IF NOT EXISTS idx_founder_startups_founder ON public.founder_startups(founder_id);
