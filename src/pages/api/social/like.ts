import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getLikeStatus, toggleLike } from '@/lib/social';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const articleId = url.searchParams.get('articleId');
  if (!articleId) {
    return new Response(JSON.stringify({ error: 'articleId is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const userId = await requireAuth(locals);
    const status = await getLikeStatus(userId, articleId);
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch like status' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { articleId, authorId } = body;
    if (!articleId) {
      return new Response(JSON.stringify({ error: 'articleId is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const result = await toggleLike(userId, articleId, authorId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to toggle like' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
