-- ====================================================================
-- CarcBlog Ecosystem Migration: FEAT-018 through FEAT-028
-- Database Schema for Startups, Founders, Investors/VCs, Funding Rounds & Full-Text Search
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STARTUPS TABLE (FEAT-018)
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    one_liner TEXT NOT NULL,
    website_url TEXT,
    industry TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'IPO', 'Acquired')),
    funding_total NUMERIC DEFAULT 0,
    employee_count INT DEFAULT 1,
    location TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- FEAT-027 Full-Text Search tsvector
    fts_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(one_liner, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(industry, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED
);

-- Index for Startups Search & Filters
CREATE INDEX IF NOT EXISTS idx_startups_fts ON public.startups USING gin(fts_vector);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON public.startups(stage);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry);
CREATE INDEX IF NOT EXISTS idx_startups_location ON public.startups(location);

-- 2. FOUNDERS TABLE (FEAT-019)
CREATE TABLE IF NOT EXISTS public.founders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE, -- Clerk User ID
    full_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- FEAT-027 Full-Text Search tsvector
    fts_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(bio, '')), 'B')
    ) STORED
);

CREATE INDEX IF NOT EXISTS idx_founders_fts ON public.founders USING gin(fts_vector);

-- 3. VC FIRMS & INVESTORS TABLES (FEAT-020, FEAT-021)
CREATE TABLE IF NOT EXISTS public.vc_firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    aum TEXT, -- e.g. '$250M'
    thesis_sectors TEXT[] DEFAULT '{}',
    portfolio_startups TEXT[] DEFAULT '{}',
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- FEAT-027 Full-Text Search tsvector
    fts_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', array_to_string(thesis_sectors, ' ')), 'B')
    ) STORED
);

CREATE INDEX IF NOT EXISTS idx_vc_firms_fts ON public.vc_firms USING gin(fts_vector);

CREATE TABLE IF NOT EXISTS public.investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE, -- Clerk ID
    full_name TEXT NOT NULL,
    firm_id UUID REFERENCES public.vc_firms(id) ON DELETE SET NULL,
    role TEXT, -- Managing Partner, Angel, Syndicate Lead
    bio TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNDING ROUNDS TABLE (FEAT-022)
CREATE TABLE IF NOT EXISTS public.funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    round_type TEXT NOT NULL CHECK (round_type IN ('Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Grant', 'Debt')),
    amount NUMERIC NOT NULL,
    valuation NUMERIC,
    announced_at DATE DEFAULT CURRENT_DATE,
    lead_investor_id UUID REFERENCES public.vc_firms(id) ON DELETE SET NULL,
    other_investors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ARTICLES FULL-TEXT SEARCH EXTENSION (FEAT-027)
ALTER TABLE IF EXISTS public.articles 
ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles USING gin(fts_vector);

-- 6. GLOBAL UNIFIED FULL-TEXT SEARCH SQL FUNCTION (FEAT-027)
CREATE OR REPLACE FUNCTION public.global_search(query_text TEXT)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    subtitle TEXT,
    type TEXT,
    href TEXT,
    rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    -- Search Startups
    SELECT 
        s.id::TEXT,
        s.name AS title,
        (s.stage || ' • ' || s.industry || ' • ' || s.location) AS subtitle,
        'startup'::TEXT AS type,
        ('/startups/' || s.slug) AS href,
        ts_rank(s.fts_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM public.startups s
    WHERE s.fts_vector @@ websearch_to_tsquery('english', query_text)

    UNION ALL

    -- Search Founders
    SELECT 
        f.id::TEXT,
        f.full_name AS title,
        coalesce(f.bio, 'Founder') AS subtitle,
        'founder'::TEXT AS type,
        ('/founders/' || f.id) AS href,
        ts_rank(f.fts_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM public.founders f
    WHERE f.fts_vector @@ websearch_to_tsquery('english', query_text)

    UNION ALL

    -- Search VCs
    SELECT 
        v.id::TEXT,
        v.name AS title,
        ('VC Firm • AUM: ' || coalesce(v.aum, 'N/A')) AS subtitle,
        'investor'::TEXT AS type,
        ('/investors/' || v.slug) AS href,
        ts_rank(v.fts_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM public.vc_firms v
    WHERE v.fts_vector @@ websearch_to_tsquery('english', query_text)

    ORDER BY rank DESC
    LIMIT 20;
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vc_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all ecosystem data
CREATE POLICY "Allow public read access to startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public read access to vc_firms" ON public.vc_firms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to funding_rounds" ON public.funding_rounds FOR SELECT USING (true);

-- Allow authenticated users to insert startup submissions
CREATE POLICY "Allow auth insert startups" ON public.startups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
