import { z } from 'zod';
import { UserRole } from '@/types/roles';

export const onboardingPayloadSchema = z.object({
  role: z.nativeEnum(UserRole).default(UserRole.WRITER),
  full_name: z.string().min(1, 'Full name is required').max(100),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional(),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  preferred_language: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  years_experience: z.number().optional(),
  industry: z.string().optional(),
  skills: z.array(z.string()).optional(),
  social_links: z.array(z.object({
    platform: z.string(),
    url: z.string(),
  })).optional(),
  writing_topics: z.array(z.string()).optional(),
  notification_prefs: z.record(z.boolean()).optional(),
});
