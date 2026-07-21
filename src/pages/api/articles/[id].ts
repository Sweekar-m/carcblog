import type { APIRoute } from 'astro';
import { getSanityArticleById, updateSanityArticle, deleteSanityArticle } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { requireAuth } from '@/lib/requireAuth';
import { getUserProfile } from '@/lib/supabase';
import { jsonResponse, errorResponse, CACHE_CONTROL_PRIVATE, CACHE_CONTROL_PUBLIC_FEED } from '@/lib/apiResponse';

export const prerender = false;

/**
 * GET /api/articles/[id]
 * Read a single article by ID.
 * Access:
 * - Public/Guest/Non-owner: Only accessible if status is 'published' and publishedAt <= now.
 * - Owner/Admin: Accessible regardless of status ('draft', 'scheduled', 'archived').
 */
export const GET: APIRoute = async ({ locals, params }) => {
  const articleId = params.id;
  if (!articleId || typeof articleId !== 'string') {
    return errorResponse('Article ID is required', 400);
  }

  let article: Awaited<ReturnType<typeof getSanityArticleById>>;
  try {
    article = await getSanityArticleById(articleId);
  } catch (err) {
    return errorResponse('Failed to fetch article', 500, err);
  }

  if (!article) {
    return errorResponse('Article not found', 404);
  }

  // Check if current requester is the owner or an admin
  let isOwnerOrAdmin = false;
  const userId = await requireAuth(locals);
  if (userId) {
    const profile = await getUserProfile(userId).catch(() => null);
    if (profile) {
      isOwnerOrAdmin = article.author?.clerkUserId === userId || profile.role === 'admin';
    }
  }

  // Non-owner / public requester can only view published articles
  if (!isOwnerOrAdmin) {
    const isPublished = article.publishedAt && new Date(article.publishedAt) <= new Date() && article.status !== 'archived';
    if (!isPublished) {
      return errorResponse('Article not found', 404);
    }
    return jsonResponse({ success: true, article }, 200, CACHE_CONTROL_PUBLIC_FEED);
  }

  return jsonResponse({ success: true, article }, 200, CACHE_CONTROL_PRIVATE);
};

/**
 * PUT / PATCH /api/articles/[id]
 * Update an existing article.
 * Access: Writer (Owner) or Admin.
 */
export const PUT: APIRoute = async ({ locals, params, request }) => handleUpdate({ locals, params, request });
export const PATCH: APIRoute = async ({ locals, params, request }) => handleUpdate({ locals, params, request });

async function handleUpdate({ locals, params, request }: { locals: any; params: any; request: Request }) {
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

  const { title, slug, excerpt, body: content, coverImage, status, categoryId, tags, scheduledAt, publishedAt } = body;

  try {
    await updateSanityArticle(articleId, {
      title: typeof title === 'string' ? title.trim() : undefined,
      slug: typeof slug === 'string' ? slug.trim() : undefined,
      excerpt: typeof excerpt === 'string' ? excerpt.trim() : undefined,
      body: content,
      coverImageUrl: typeof coverImage === 'string' ? coverImage.trim() : undefined,
      status,
      categoryId: typeof categoryId === 'string' ? categoryId : undefined,
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : undefined,
      scheduledAt: typeof scheduledAt === 'string' ? scheduledAt : undefined,
      publishedAt: typeof publishedAt === 'string' ? publishedAt : undefined,
    });

    const updated = await getSanityArticleById(articleId);
    return jsonResponse({ success: true, article: updated }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to update article', 500, err);
  }
}

/**
 * DELETE /api/articles/[id]
 * Delete an article.
 * Access: Writer (Owner) or Admin.
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
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
    await deleteSanityArticle(articleId);
    return jsonResponse({ success: true, message: 'Article deleted successfully' }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to delete article', 500, err);
  }
};
