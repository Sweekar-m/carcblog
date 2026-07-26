/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /**
     * Populated by Clerk middleware for every authenticated request.
     * Contains the Supabase profile merged with the Clerk userId.
     * May be a minimal `{ userId }` shape if the profile fetch fails.
     */
    user?: {
      userId: string;
      id?: string;
      username?: string;
      full_name?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
      website?: string | null;
      role?: 'reader' | 'writer' | 'admin';
      occupation?: string | null;
      onboarding_completed?: boolean;
      [key: string]: unknown;
    };
  }
}