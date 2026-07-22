import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for user data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 0 rows / Not found
    throw error;
  }
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
  role: 'reader' | 'writer' | 'admin';

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
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Article helper functions
export async function createArticle(
  article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'author'> & { author_id: string }
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('articles')
    .insert([
      {
        ...article,
        excerpt: article.excerpt ?? null,
        cover_image_url: article.cover_image_url ?? null,
        created_at: now,
        updated_at: now,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getArticlesByAuthor(authorId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPublishedArticles(limit = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 0 rows / Not found
    throw error;
  }
  return data;
}

// Mock data for development fallback
const mockArticles: Article[] = [];

export async function getArticlesByAuthorWithFallback(authorId: string) {
  try {
    const articles = await getArticlesByAuthor(authorId);
    if (!articles || articles.length === 0) {
      return mockArticles.filter(a => a.author_id === authorId);
    }
    return articles;
  } catch (error) {
    console.warn('Failed to fetch articles by author, using mock data:', error);
    return mockArticles.filter(a => a.author_id === authorId);
  }
}

export async function getPublishedArticlesWithFallback(limit = 10) {
  try {
    const articles = await getPublishedArticles(limit);
    if (!articles || articles.length === 0) {
      return mockArticles.slice(0, limit);
    }
    return articles;
  } catch (error) {
    console.warn('Failed to fetch published articles, using mock data:', error);
    return mockArticles.slice(0, limit);
  }
}

export async function getArticleBySlugWithFallback(slug: string) {
  try {
    const article = await getArticleBySlug(slug);
    if (!article) {
      const match = mockArticles.find(a => a.slug === slug);
      if (match) return match;
    }
    return article;
  } catch (error) {
    console.warn('Failed to fetch article by slug, using mock data:', error);
    const match = mockArticles.find(a => a.slug === slug);
    if (match) return match;
    throw error;
  }
}


