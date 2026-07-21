/**
 * articleAuth.ts — Article Authorization Guard
 *
 * Enforces:
 * 1. Authentication (Clerk session check via requireAuth) -> 401 Unauthorized
 * 2. Authorization (Supabase profile role check: 'writer' or 'admin') -> 403 Forbidden
 * 3. Article Existence -> 404 Not Found
 * 4. Ownership Verification (article.author.clerkUserId === userId OR role === 'admin') -> 403 Forbidden
 */
import type { APIContext } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getUserProfile, type Profile } from '@/lib/supabase';
import { getSanityArticleById, type SanityArticle } from '@/lib/sanity';
import { errorResponse } from '@/lib/apiResponse';

export interface AuthorizeArticleResult {
  userId: string;
  profile: Profile;
  article?: SanityArticle;
  errorResponse?: Response;
}

export async function authorizeArticleAction(
  locals: APIContext['locals'],
  options: {
    articleId?: string;
    requiredRole?: 'writer' | 'admin';
    requireOwnership?: boolean; // Default true when articleId is passed
  }
): Promise<AuthorizeArticleResult> {
  // ── 1. Authentication Check ───────────────────────────────────────────────
  const userId = await requireAuth(locals);
  if (!userId) {
    return {
      userId: '',
      profile: null as any,
      errorResponse: errorResponse('Unauthorized', 401),
    };
  }

  // ── 2. User Profile & Role Authorization ───────────────────────────────────
  let profile: Profile | null = null;
  try {
    profile = await getUserProfile(userId);
  } catch (err) {
    return {
      userId,
      profile: null as any,
      errorResponse: errorResponse('Failed to verify user profile', 500, err),
    };
  }

  if (!profile) {
    return {
      userId,
      profile: null as any,
      errorResponse: errorResponse('User profile not found. Please complete onboarding.', 404),
    };
  }

  const requiredRole = options.requiredRole ?? 'writer';
  if (requiredRole === 'admin' && profile.role !== 'admin') {
    return {
      userId,
      profile,
      errorResponse: errorResponse('Forbidden: Admin access required', 403),
    };
  }

  if (requiredRole === 'writer' && profile.role !== 'writer' && profile.role !== 'admin') {
    return {
      userId,
      profile,
      errorResponse: errorResponse('Forbidden: Writer or Admin access required', 403),
    };
  }

  // ── 3. Article Lookup & Ownership Validation ──────────────────────────────
  if (options.articleId) {
    let article: SanityArticle | null = null;
    try {
      article = await getSanityArticleById(options.articleId);
    } catch (err) {
      return {
        userId,
        profile,
        errorResponse: errorResponse('Failed to fetch article', 500, err),
      };
    }

    if (!article) {
      return {
        userId,
        profile,
        errorResponse: errorResponse('Article not found', 404),
      };
    }

    const checkOwnership = options.requireOwnership ?? true;
    if (checkOwnership) {
      const isOwner = article.author?.clerkUserId === userId;
      const isAdmin = profile.role === 'admin';

      if (!isOwner && !isAdmin) {
        return {
          userId,
          profile,
          article,
          errorResponse: errorResponse('Forbidden: You do not own this article', 403),
        };
      }
    }

    return { userId, profile, article };
  }

  return { userId, profile };
}
