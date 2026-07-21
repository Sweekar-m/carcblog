import type { APIRoute } from 'astro';
import { sanityClient } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { jsonResponse, errorResponse, parsePagination, CACHE_CONTROL_PRIVATE } from '@/lib/apiResponse';

export const prerender = false;

/**
 * GET: Return current user's articles (drafts, scheduled, published, archived).
 * Access: Writer / Admin (Authenticated, Author-scoped).
 * Hardened: no-store Cache-Control, parsePagination, errorResponse.
 */
export const GET: APIRoute = async ({ locals, request }) => {
  const authResult = await authorizeArticleAction(locals, { requiredRole: 'writer' });
  if (authResult.errorResponse) return authResult.errorResponse;

  const { userId } = authResult;

  try {
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 50, 20);

    // Fetch articles owned by this writer (traversing author->clerkUserId)
    const articles = await sanityClient.fetch(
      `*[_type == "article" && author->clerkUserId == $clerkUserId]
        | order(_createdAt desc) [$offset...$offset+$limit]
      {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        status,
        "coverImage": coverImage.asset->url,
        "author": {
          "_id": author->_id,
          "clerkUserId": author->clerkUserId,
          "name": author->name,
          "image": author->image.asset->url
        }
      }`,
      { clerkUserId: userId, limit, offset }
    );

    return jsonResponse({ success: true, articles }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to fetch user articles', 500, err);
  }
};