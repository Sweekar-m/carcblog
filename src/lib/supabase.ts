import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for user data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
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
  role: 'reader' | 'writer';
  occupation: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}