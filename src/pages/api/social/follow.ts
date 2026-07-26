import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getFollowStatus, toggleFollow } from '@/lib/social';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const targetId = url.searchParams.get('targetId');
  if (!targetId) {
    return new Response(JSON.stringify({ error: 'targetId is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const userId = await requireAuth(locals);
    const status = await getFollowStatus(userId, targetId);
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch follow status' }), {
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
    const { targetId } = body;
    if (!targetId) {
      return new Response(JSON.stringify({ error: 'targetId is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const result = await toggleFollow(userId, targetId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to toggle follow' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
};
