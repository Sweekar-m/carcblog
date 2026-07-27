import { createClient } from '@supabase/supabase-js';
import { getCountriesForRegion } from '@/utils/regionTaxonomy';
import { getNormalizedCategoryCounts, getSearchTermsForCanonicalCategory } from '@/utils/industryNormalizer';

// Initialize Supabase client
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_SUPABASE_URL : '') || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.SUPABASE_SERVICE_ROLE_KEY : '') ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_SUPABASE_ANON_KEY : '') || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory short-lived profile cache to accelerate SSR page requests
const profileCache = new Map<string, { data: any; expiresAt: number }>();

export function clearProfileCache(userId?: string) {
  if (userId) profileCache.delete(userId);
  else profileCache.clear();
}

// Helper functions for user data
export async function getUserProfile(userId: string) {
  const now = Date.now();
  const cached = profileCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 0 rows / Not found
    throw error;
  }

  profileCache.set(userId, { data, expiresAt: now + 15000 });
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  clearProfileCache(userId);
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upsert a user profile — creates a new row if it doesn't exist,
 * otherwise updates the existing one. Used by the onboarding flow.
 */
export async function upsertUserProfile(
  userId: string,
  profile: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
) {
  clearProfileCache(userId);
  // Format occupation into bio to avoid database migrations
  let finalBio = profile.bio || '';
  if (profile.occupation) {
    finalBio = `[${profile.occupation}] ${finalBio}`.trim();
  }

  // Omit occupation from the database payload to avoid column missing errors
  const { occupation, ...dbProfile } = profile;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...dbProfile,
        bio: finalBio || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check whether a user has completed onboarding.
 * Returns true if a profile row exists with onboarding_completed = true.
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.onboarding_completed === true;
}

// Types
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: 'reader' | 'writer' | 'admin';

  occupation: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// Follow type — for future social-layer features (not yet implemented)
// -------------------------------------------------------------

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// -------------------------------------------------------------
// Startup & Founder Directory Types & API Helper Functions
// -------------------------------------------------------------

export interface Startup {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  industry: string | null;
  funding_stage: string | null;
  country: string | null;
  city: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Founder {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  job_title: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartupWithFounders extends Startup {
  founders: Array<Founder & { job_title: string | null }>;
}

export interface FounderWithStartups extends Founder {
  startups: Array<Startup & { job_title: string | null }>;
}

export async function getStartups(options: { search?: string; industry?: string; region?: string; limit?: number; offset?: number } = {}) {
  let query = supabase.from('startups').select('*', { count: 'exact' });

  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term},city.ilike.${term},country.ilike.${term}`);
  }

  if (options.industry && options.industry.trim() && options.industry !== 'All' && options.industry !== 'All Categories') {
    const terms = getSearchTermsForCanonicalCategory(options.industry);
    const ilikeConditions = terms.map(t => `industry.ilike.%${t}%`).join(',');
    query = query.or(ilikeConditions);
  }

  if (options.region && options.region.trim() && options.region !== 'All' && options.region !== 'All Regions') {
    const matchingCountries = getCountriesForRegion(options.region);
    if (matchingCountries.length > 0) {
      query = query.in('country', matchingCountries);
    }
  }

  query = query.order('name', { ascending: true });

  if (options.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { startups: (data || []) as Startup[], total: count || 0 };
}

export async function getStartupBySlug(slug: string): Promise<StartupWithFounders | null> {
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('*')
    .eq('slug', slug)
    .single();

  if (startupError || !startup) {
    if (startupError?.code === 'PGRST116') return null;
    throw startupError;
  }

  const { data: links, error: linksError } = await supabase
    .from('founder_startups')
    .select(`
      job_title,
      founder:founders (*)
    `)
    .eq('startup_id', startup.id);

  if (linksError) throw linksError;

  const founders = (links || [])
    .filter(l => l.founder)
    .map(l => ({
      ...(l.founder as unknown as Founder),
      job_title: l.job_title || (l.founder as unknown as Founder).job_title
    }));

  return {
    ...startup,
    founders
  };
}

export async function getFounders(options: { search?: string; region?: string; limit?: number; offset?: number } = {}) {
  let query = supabase.from('founders').select('*', { count: 'exact' });

  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`name.ilike.${term},job_title.ilike.${term},city.ilike.${term},country.ilike.${term}`);
  }

  if (options.region && options.region.trim() && options.region !== 'All' && options.region !== 'All Regions') {
    const matchingCountries = getCountriesForRegion(options.region);
    if (matchingCountries.length > 0) {
      query = query.in('country', matchingCountries);
    }
  }

  query = query.order('name', { ascending: true });

  if (options.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { founders: (data || []) as Founder[], total: count || 0 };
}

export async function getFounderBySlug(slug: string): Promise<FounderWithStartups | null> {
  const { data: founder, error: founderError } = await supabase
    .from('founders')
    .select('*')
    .eq('slug', slug)
    .single();

  if (founderError || !founder) {
    if (founderError?.code === 'PGRST116') return null;
    throw founderError;
  }

  const { data: links, error: linksError } = await supabase
    .from('founder_startups')
    .select(`
      job_title,
      startup:startups (*)
    `)
    .eq('founder_id', founder.id);

  if (linksError) throw linksError;

  const startups = (links || [])
    .filter(l => l.startup)
    .map(l => ({
      ...(l.startup as unknown as Startup),
      job_title: l.job_title
    }));

  return {
    ...founder,
    startups
  };
}

export async function getStartupIndustries(): Promise<Array<{ category: string; count: number }>> {
  const { data, error } = await supabase
    .from('startups')
    .select('industry')
    .not('industry', 'is', null);

  if (error || !data) return [];
  const rawList = data.map(d => d.industry);
  return getNormalizedCategoryCounts(rawList);
}

// -------------------------------------------------------------
// Investor Directory Helper Functions
// -------------------------------------------------------------

export interface Investor {
  id: string;
  name: string;
  slug: string;
  investor_type: string | null;
  website: string | null;
  profile_url: string | null;
  application_url: string | null;
  thesis: string | null;
  value_add: string | null;
  first_check: string | null;
  investment_stage: string | null;
  solicitation_policy: string | null;
  reply_rate: string | null;
  target_geography: string[] | null;
  linkedin_urls: string[] | null;
  team_members: Array<{ name: string; profile_url?: string; linkedin_url?: string }> | null;
  created_at: string;
  updated_at: string;
}

export async function getInvestors(options: { search?: string; type?: string; region?: string; limit?: number; offset?: number } = {}) {
  let query = supabase.from('investors').select('*', { count: 'exact' });

  if (options.search && options.search.trim()) {
    const term = `%${options.search.trim()}%`;
    query = query.or(`name.ilike.${term},thesis.ilike.${term},value_add.ilike.${term}`);
  }

  if (options.type && options.type.trim() && options.type !== 'All') {
    query = query.eq('investor_type', options.type);
  }

  if (options.region && options.region.trim() && options.region !== 'All' && options.region !== 'All Regions') {
    const matchingCountries = getCountriesForRegion(options.region);
    if (matchingCountries.length > 0) {
      query = query.overlaps('target_geography', matchingCountries);
    }
  }

  query = query.order('name', { ascending: true });

  if (options.limit) {
    const offset = options.offset || 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { investors: (data || []) as Investor[], total: count || 0 };
}

export async function getInvestorBySlug(slug: string): Promise<Investor | null> {
  const { data: investor, error } = await supabase
    .from('investors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !investor) {
    if (error?.code === 'PGRST116') return null;
    throw error;
  }

  return investor as Investor;
}

export async function getInvestorTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('investors')
    .select('investor_type')
    .not('investor_type', 'is', null);

  if (error) return [];
  const types = Array.from(new Set(data.map(d => d.investor_type).filter(Boolean))) as string[];
  return types.sort();
}





