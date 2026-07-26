import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getArticleComments, postComment, deleteComment } from '@/lib/social';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const articleId = url.searchParams.get('articleId');
  if (!articleId) {
    return new Response(JSON.stringify({ error: 'articleId is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const comments = await getArticleComments(articleId);
    return new Response(JSON.stringify({ comments }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch comments' }), {
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
    const { articleId, content, parentId, authorId } = body;
    if (!articleId || !content) {
      return new Response(JSON.stringify({ error: 'articleId and content are required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const comment = await postComment(userId, articleId, content, parentId, authorId);
    return new Response(JSON.stringify({ success: true, comment }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to post comment' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const commentId = url.searchParams.get('commentId');
    if (!commentId) {
      return new Response(JSON.stringify({ error: 'commentId is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const comment = await deleteComment(userId, commentId);
    return new Response(JSON.stringify({ success: true, comment }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete comment' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
