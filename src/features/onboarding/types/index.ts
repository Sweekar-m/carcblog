import type { UserRoleType } from '@/types/roles';

export interface OnboardingUserProps {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  role?: string;
}

export interface SocialLinkInput {
  platform: string;
  url: string;
}

export interface OnboardingFormPayload {
  role: UserRoleType;
  full_name: string;
  username: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  tagline: string;
  country: string;
  city: string;
  timezone: string;
  preferred_language: string;
  company: string;
  job_title: string;
  years_experience: number;
  industry: string;
  skills: string[];
  social_links: SocialLinkInput[];
  writing_topics: string[];
  notification_prefs: Record<string, boolean>;
}

export interface SuggestedWriter {
  id: string;
  name: string;
  username: string;
  tagline: string;
}
