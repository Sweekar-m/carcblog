import type { APIRoute } from 'astro';
import { updateSanityArticle, getSanityArticleById } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { jsonResponse, errorResponse, CACHE_CONTROL_PRIVATE } from '@/lib/apiResponse';

export const prerender = false;

/**
 * POST /api/articles/[id]/schedule
 * Schedule an article for future publication.
 * Access: Writer (Owner) or Admin.
 * Payload requires `{ scheduledAt: ISO_STRING }` in the future.
 * Hardened: jsonResponse, errorResponse, no-store Cache-Control, input validation.
 */
export const POST: APIRoute = async ({ locals, params, request }) => {
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

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return errorResponse('Invalid JSON body', 400, err);
  }

  const { scheduledAt } = body;
  if (!scheduledAt || typeof scheduledAt !== 'string') {
    return errorResponse('scheduledAt ISO date string is required', 400);
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return errorResponse('Invalid scheduledAt date format', 400);
  }

  if (scheduledDate <= new Date()) {
    return errorResponse('scheduledAt must be a future date and time', 400);
  }

  try {
    await updateSanityArticle(articleId, {
      status: 'scheduled',
      scheduledAt: scheduledDate.toISOString(),
      publishedAt: scheduledDate.toISOString(),
    });

    const updated = await getSanityArticleById(articleId);
    return jsonResponse({ success: true, article: updated }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to schedule article', 500, err);
  }
};
