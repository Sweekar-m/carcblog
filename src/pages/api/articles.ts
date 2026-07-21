import type { APIRoute } from 'astro';
import { sanityClient, createSanityArticle } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import {
  jsonResponse,
  errorResponse,
  parsePagination,
  CACHE_CONTROL_PUBLIC_FEED,
  CACHE_CONTROL_PRIVATE,
} from '@/lib/apiResponse';

export const prerender = false;

/**
 * GET: Direct API listing disabled.
 * Access: Disabled for everyone.
 */
export const GET: APIRoute = async () => {
  return errorResponse('Direct GET /api/articles endpoint is disabled.', 405);
};


/**
 * POST: Create a new article.
 * Access: Writer / Admin.
 * Identity is derived strictly from Clerk — client author input is ignored.
 */
export const POST: APIRoute = async ({ locals, request }) => {
  const authResult = await authorizeArticleAction(locals, { requiredRole: 'writer' });
  if (authResult.errorResponse) return authResult.errorResponse;

  const { userId, profile } = authResult;

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return errorResponse('Invalid JSON body', 400, err);
  }

  const { title, slug, coverImage, excerpt, body: content, status, categoryId, tags, scheduledAt } = body;

  if (!title || !slug || !content) {
    return errorResponse('Title, slug, and content are required fields', 400);
  }

  // Sanitize title & slug input lengths
  if (typeof title !== 'string' || title.length > 200) {
    return errorResponse('Title must be a string under 200 characters', 400);
  }

  if (typeof slug !== 'string' || slug.length > 100) {
    return errorResponse('Slug must be a string under 100 characters', 400);
  }

  // Validate initial status
  const allowedStatus = ['draft', 'published', 'scheduled'];
  const initialStatus = allowedStatus.includes(status) ? status : 'draft';

  const portableBody = typeof content === 'string' && content.trim()
    ? [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: content }],
        },
      ]
    : (Array.isArray(content) ? content : []);

  try {
    const article = await createSanityArticle({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: typeof excerpt === 'string' && excerpt.trim() ? excerpt.trim() : undefined,
      body: portableBody,
      coverImageUrl: typeof coverImage === 'string' && coverImage.trim() ? coverImage.trim() : undefined,
      authorClerkId: userId, // Server-derived identity
      status: initialStatus as 'draft' | 'published' | 'scheduled',
      authorName: profile.full_name ?? profile.username ?? 'Unknown',
      authorImageUrl: profile.avatar_url ?? undefined,
      categoryId: typeof categoryId === 'string' && categoryId.trim() ? categoryId.trim() : undefined,
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : undefined,
      scheduledAt: typeof scheduledAt === 'string' && scheduledAt.trim() ? scheduledAt.trim() : undefined,
    });

    return jsonResponse({ success: true, article }, 201, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    console.error('Error creating article in Sanity:', err);

    // Detect Sanity 401 write authorization failure (SIO-401-ANF)
    const isSanityAuthError =
      err?.statusCode === 401 ||
      err?.response?.body?.errorCode === 'SIO-401-ANF' ||
      err?.message?.includes('Session not found');

    if (isSanityAuthError) {
      return errorResponse(
        'Sanity CMS write authentication failed (Session not found / SIO-401-ANF). Please update SANITY_API_TOKEN in server environment.',
        503,
        err
      );
    }

    return errorResponse('Failed to create article', 500, err);
  }
};



