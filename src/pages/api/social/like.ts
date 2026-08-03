import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getLikeStatus, toggleLike } from '@/lib/social';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const articleId = url.searchParams.get('articleId');
  if (!articleId) {
    return errorResponse('articleId is required', 400);
  }

  try {
    const userId = await requireAuth(locals);
    const status = await getLikeStatus(userId, articleId);
    return jsonResponse(status, 200);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch like status', 500, error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { articleId, authorId } = body;
    if (!articleId) {
      return errorResponse('articleId is required', 400);
    }

    const result = await toggleLike(userId, articleId, authorId);
    return jsonResponse(result, 200);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to toggle like', 500, error);
  }
};

