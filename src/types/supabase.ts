/**
 * TypeScript interfaces for Supabase/PostgreSQL table rows in CarcBlog.
 *
 * These are hand-written to match the actual current schema as observed in
 * supabase.ts helper functions and the ai-settings.ts API route.
 *
 * IMPORTANT: Regenerate from the Supabase CLI when available:
 *   npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
 */

// ─── Profiles ─────────────────────────────────────────────────────────────

/**
 * Row type for the `profiles` table.
 * Created on first user sign-up; extended by the onboarding flow.
 */
export interface Profile {
  id: string;                           // = Clerk userId
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: 'reader' | 'writer' | 'admin';
  occupation: string | null;
  onboarding_completed: boolean;
  /** Encrypted AI provider API key (AES-256-GCM). Never send to client. */
  ai_api_key_encrypted: string | null;
  /** AI provider selection ('gemini' | 'openrouter'). */
  ai_provider: 'gemini' | 'openrouter' | null;
  created_at: string;
  updated_at: string;
}

// ─── Startups ─────────────────────────────────────────────────────────────

/**
 * Row type for the `startups` table.
 */
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

// ─── Founders ─────────────────────────────────────────────────────────────

/**
 * Row type for the `founders` table.
 */
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

// ─── Investors ────────────────────────────────────────────────────────────

/**
 * Row type for the `investors` table (sourced from OpenVC).
 */
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

// ─── Founder ↔ Startup Junction ────────────────────────────────────────────

/**
 * Row type for the `founder_startups` join table.
 * Tracks which founders belong to which startups, and their role/title.
 */
export interface FounderStartup {
  id: string;
  founder_id: string;
  startup_id: string;
  job_title: string | null;
  created_at: string;
}

// ─── Joined/extended types ──────────────────────────────────────────────────

/** Startup with its founders resolved from the join table. */
export interface StartupWithFounders extends Startup {
  founders: Array<Founder & { job_title: string | null }>;
}

/** Founder with their associated startups resolved from the join table. */
export interface FounderWithStartups extends Founder {
  startups: Array<Startup & { job_title: string | null }>;
}

// ─── Social Layer Tables ──────────────────────────────────────────────────

export interface Follow {
  id: string;
  follower_id: string;  // Clerk userId of follower
  following_id: string; // Clerk userId of user being followed
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;      // Clerk userId
  article_id: string;   // Sanity article _id
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;      // Clerk userId
  article_id: string;   // Sanity article _id
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;   // Sanity article _id
  user_id: string;      // Clerk userId of commenter
  parent_id: string | null; // Null for top-level comments, parent comment ID for replies
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profile?: Partial<Profile> | null;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  user_id: string;      // Recipient Clerk userId
  actor_id: string;     // Triggering Clerk userId
  type: 'follow' | 'like' | 'comment_reply';
  article_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Partial<Profile> | null;
}

export interface ReadingHistory {
  id: string;
  user_id: string;      // Clerk userId
  article_id: string;   // Sanity article _id
  last_read_at: string;
}
