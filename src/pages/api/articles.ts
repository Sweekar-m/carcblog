import type { APIRoute } from 'astro';
import { sanityClient, createSanityArticle } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { createArticleSchema } from '@/schemas/articles';
import {
  jsonResponse,
  errorResponse,
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

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (err) {
    return errorResponse('Invalid JSON body', 400, err);
  }

  const parsed = createArticleSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse(
      'Validation failed: ' + parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      400
    );
  }

  const { title, slug, body: content, excerpt, coverImage, status, categoryId, tags, scheduledAt } = parsed.data;

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
      excerpt: excerpt?.trim() ?? undefined,
      body: portableBody,
      coverImageUrl: coverImage?.trim() || undefined,
      authorClerkId: userId, // Server-derived identity
      status: status as 'draft' | 'published' | 'scheduled',
      authorName: profile.full_name ?? profile.username ?? 'Unknown',
      authorImageUrl: profile.avatar_url ?? undefined,
      categoryId: categoryId?.trim() || undefined,
      tags: tags?.filter((t) => typeof t === 'string') ?? undefined,
      scheduledAt: scheduledAt ?? undefined,
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



