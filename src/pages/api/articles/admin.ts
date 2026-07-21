import type { APIRoute } from 'astro';
import { sanityClient } from '@/lib/sanity';
import { authorizeArticleAction } from '@/lib/articleAuth';
import { jsonResponse, errorResponse, parsePagination, CACHE_CONTROL_PRIVATE } from '@/lib/apiResponse';

export const prerender = false;

/**
 * GET: Return all articles across all authors & statuses.
 * Access: Admin only (Authenticated, Admin role required).
 * Hardened: no-store Cache-Control, parsePagination, errorResponse.
 */
export const GET: APIRoute = async ({ locals, request }) => {
  const authResult = await authorizeArticleAction(locals, { requiredRole: 'admin' });
  if (authResult.errorResponse) return authResult.errorResponse;

  try {
    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url, 50, 20);

    const articles = await sanityClient.fetch(
      `*[_type == "article"]
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
      { limit, offset }
    );

    return jsonResponse({ success: true, articles }, 200, CACHE_CONTROL_PRIVATE);
  } catch (err: any) {
    return errorResponse('Failed to fetch admin articles', 500, err);
  }
};