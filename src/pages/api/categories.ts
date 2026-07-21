/**
 * API proxy endpoint to fetch available categories from Sanity CMS.
 * Hardened with security headers and public static caching.
 */
import type { APIRoute } from 'astro';
import { sanityClient } from '@/lib/sanity';
import { jsonResponse, errorResponse, CACHE_CONTROL_PUBLIC_STATIC } from '@/lib/apiResponse';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const categories = await sanityClient.fetch(`
      *[_type == "category"] {
        _id,
        title,
        slug
      } | order(title asc)
    `);

    return jsonResponse({ categories }, 200, CACHE_CONTROL_PUBLIC_STATIC);
  } catch (error: unknown) {
    return errorResponse('Failed to fetch categories.', 500, error, CACHE_CONTROL_PUBLIC_STATIC);
  }
};
