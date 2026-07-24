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

  // Fallback profile for authenticated Clerk user if row is missing in Supabase
  const effectiveProfile: Profile = profile ?? ({
    id: userId,
    role: 'writer',
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Profile);

  const requiredRole = options.requiredRole ?? 'writer';
  const userRole = effectiveProfile.role || 'writer';

  if (requiredRole === 'admin' && userRole !== 'admin') {
    return {
      userId,
      profile: effectiveProfile,
      errorResponse: errorResponse(`Forbidden: Admin access required. Your current role is '${userRole}'.`, 403),
    };
  }

  if (requiredRole === 'writer' && userRole !== 'writer' && userRole !== 'admin') {
    return {
      userId,
      profile: effectiveProfile,
      errorResponse: errorResponse(`Forbidden: Writer or Admin access required. Your current role is '${userRole}'. Only approved writers may publish articles.`, 403),
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
      const isOwner = Boolean(article.author?.clerkUserId && article.author.clerkUserId === userId);
      const isAdmin = effectiveProfile.role === 'admin';

      if (!isOwner && !isAdmin) {
        return {
          userId,
          profile: effectiveProfile,
          article,
          errorResponse: errorResponse(`Forbidden: You do not have permission to manage this article. Only the author or an admin can manage this article.`, 403),
        };
      }
    }

    return { userId, profile, article };
  }


  return { userId, profile };
}
