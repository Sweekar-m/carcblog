import type { APIRoute } from 'astro';
import { updateSanityArticle, getSanityArticleById } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { jsonResponse, errorResponse, CACHE_CONTROL_PRIVATE } from '@/lib/apiResponse';

export const prerender = false;

/**
 * POST /api/articles/[id]/archive
 * Archive an article (removes from public feeds without deletion).
 * Access: Writer (Owner) or Admin.
 * Hardened: jsonResponse, errorResponse, no-store Cache-Control.
 */
export const POST: APIRoute = async ({ locals, params }) => {
  const articleId = params.id;
  if (!articleId) {
    return errorResponse('Article ID is required', 400);
  }

  const authResult = await authorizeArticleAction(locals, {
    articleId,
    requiredRole: 'writer',
    requireOwnership: true,
  });

  if (authResult.errorResponse) return authResult.errorResponse;

  try {
    await updateSanityArticle(articleId, {
      status: 'archived',
      publishedAt: null,
      scheduledAt: null,
    });

    const updated = await getSanityArticleById(articleId);
    return jsonResponse({ success: true, article: updated }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to archive article', 500, err);
  }
};
