import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { recordReadingHistory } from '@/lib/social';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return new Response(JSON.stringify({ success: false, reason: 'Unauthenticated' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { articleId } = body;
    if (articleId) {
      await recordReadingHistory(userId, articleId);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
