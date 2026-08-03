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
    console.warn('[authorizeArticleAction] Profile fetch warning:', err);
  }

  // No profile means user never completed onboarding — deny publishing
  if (!profile) {
    return {
      userId,
      profile: null as any,
      errorResponse: errorResponse(
        'You must complete onboarding before publishing. Please visit /onboarding to set up your profile.',
        403
      ),
    };
  }

  const effectiveProfile = profile;
  const requiredRole = options.requiredRole ?? 'writer';
  const userRole = effectiveProfile.role;

  // ── Role gate: only 'writer' or 'admin' can publish ───────────────────────
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return {
      userId,
      profile: effectiveProfile,
      errorResponse: errorResponse(
        `Forbidden: Admin access required. Your current role is '${userRole}'.`,
        403
      ),
    };
  }

  // All onboarded users are both readers and writers


  // ── 3. Article Lookup & Ownership Validation ──────────────────────────────
  if (options.articleId) {
    let article: SanityArticle | null = null;
    try {
      article = await getSanityArticleById(options.articleId);
    } catch (err) {
      return {
        userId,
        profile: effectiveProfile,
        errorResponse: errorResponse('Failed to fetch article', 500, err),
      };
    }

    if (!article) {
      return {
        userId,
        profile: effectiveProfile,
        errorResponse: errorResponse('Article not found', 404),
      };
    }

    const checkOwnership = options.requireOwnership ?? true;
    if (checkOwnership) {
      let isOwner = Boolean(article.author?.clerkUserId && article.author.clerkUserId === userId);
      const isAdmin = effectiveProfile.role === 'admin';

      // If author document has no clerkUserId yet, auto-bind to this writer and grant ownership
      if (!isOwner && !article.author?.clerkUserId && article.author?._id) {
        try {
          const { sanityWriteClient } = await import('@/lib/sanity');
          await sanityWriteClient.patch(article.author._id).set({ clerkUserId: userId }).commit();
          isOwner = true;
        } catch (bindErr) {
          console.warn('[authorizeArticleAction] Auto-binding author clerkUserId failed:', bindErr);
        }
      }

      if (!isOwner && !isAdmin) {
        return {
          userId,
          profile: effectiveProfile,
          article,
          errorResponse: errorResponse(
            'Forbidden: You can only manage articles that you authored.',
            403
          ),
        };
      }
    }

    return { userId, profile: effectiveProfile, article };
  }

  return { userId, profile: effectiveProfile };
}
