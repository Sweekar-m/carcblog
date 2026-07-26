import { supabase, clearProfileCache } from './supabase';

export interface ExtendedProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  tagline: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  preferred_language: string | null;
  company: string | null;
  job_title: string | null;
  years_experience: number;
  industry: string | null;
  skills: string[];
  interests: string[];
  expertise: string[];
  writing_topics: string[];
  notification_prefs: Record<string, boolean>;
  role: 'reader' | 'writer' | 'admin' | string;
  verified: boolean;
  onboarding_completed: boolean;
  profile_completion_pct: number;
  created_at: string;
}

export interface SocialLink {
  id?: string;
  user_id: string;
  platform: 'linkedin' | 'github' | 'x' | 'instagram' | 'youtube' | 'medium' | 'devto' | 'hashnode' | 'website' | 'portfolio' | 'other' | string;
  url: string;
  is_verified?: boolean;
}

/**
 * Fetch full profile by username or ID
 */
export async function getProfileByUsername(username: string): Promise<ExtendedProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;
  return data as ExtendedProfile;
}

/**
 * Fetch full profile by User ID
 */
export async function getProfileByUserId(userId: string): Promise<ExtendedProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as ExtendedProfile;
}

/**
 * Fetch user social links
 */
export async function getUserSocialLinks(userId: string): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as SocialLink[];
}

/**
 * Save user social links (upsert/replace list)
 */
export async function saveUserSocialLinks(userId: string, links: { platform: string; url: string }[]): Promise<boolean> {
  // Delete existing links for user
  await supabase.from('social_links').delete().eq('user_id', userId);

  if (!links || links.length === 0) return true;

  const rows = links.map(l => ({
    user_id: userId,
    platform: l.platform,
    url: l.url
  }));

  const { error } = await supabase.from('social_links').insert(rows);
  return !error;
}

/**
 * Update full profile details
 */
export async function updateProfileDetails(userId: string, updates: Partial<ExtendedProfile>): Promise<ExtendedProfile | null> {
  clearProfileCache(userId);
  // Calculate completion percentage dynamically
  let score = 30; // base
  if (updates.full_name) score += 10;
  if (updates.avatar_url) score += 10;
  if (updates.bio) score += 10;
  if (updates.job_title || updates.company) score += 10;
  if (updates.skills && updates.skills.length > 0) score += 10;
  if (updates.writing_topics && updates.writing_topics.length > 0) score += 10;
  if (updates.country || updates.city) score += 10;
  
  const payload = {
    ...updates,
    profile_completion_pct: Math.min(100, score),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data as ExtendedProfile;
}

/**
 * Fetch profile statistics for public profile
 */
export async function getProfileStats(userId: string) {
  const [followersRes, followingRes, likesRes, bookmarksRes] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    followersCount: followersRes.count || 0,
    followingCount: followingRes.count || 0,
    likesCount: likesRes.count || 0,
    bookmarksCount: bookmarksRes.count || 0,
  };
}

/**
 * Fetch user activity feed
 */
export async function getUserActivityFeed(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

/**
 * Record activity feed item
 */
export async function recordActivity(userId: string, activityType: string, targetTitle: string, targetUrl: string, metadata = {}) {
  await supabase.from('activity_feed').insert({
    user_id: userId,
    activity_type: activityType,
    target_title: targetTitle,
    target_url: targetUrl,
    metadata
  });
}
