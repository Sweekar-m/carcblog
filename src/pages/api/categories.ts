/**
 * API proxy endpoint to fetch available categories from Sanity CMS.
 * Hardened with security headers and public static caching.
 */
import type { APIRoute } from 'astro';
import { sanityClient } from '@/lib/sanity';
import { jsonResponse, errorResponse, CACHE_CONTROL_PUBLIC_STATIC } from '@/lib/apiResponse';

export const prerender = false;

const FALLBACK_CATEGORIES = [
  { _id: 'cat-ai', title: 'Artificial Intelligence', slug: { current: 'ai' } },
  { _id: 'cat-saas', title: 'SaaS & Enterprise', slug: { current: 'saas' } },
  { _id: 'cat-fintech', title: 'Fintech & Web3', slug: { current: 'fintech' } },
  { _id: 'cat-vc', title: 'Venture Capital & Funding', slug: { current: 'funding' } },
  { _id: 'cat-startups', title: 'Startup Stories', slug: { current: 'startups' } },
  { _id: 'cat-tech', title: 'Product & Engineering', slug: { current: 'engineering' } },
  { _id: 'cat-design', title: 'Design & UX', slug: { current: 'design' } },
  { _id: 'cat-growth', title: 'Growth & Marketing', slug: { current: 'growth' } },
];

export const GET: APIRoute = async () => {
  try {
    const categories = await sanityClient.fetch(`
      *[_type == "category"] {
        _id,
        title,
        slug
      } | order(title asc)
    `);

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return jsonResponse({ categories: FALLBACK_CATEGORIES }, 200, CACHE_CONTROL_PUBLIC_STATIC);
    }

    return jsonResponse({ categories }, 200, CACHE_CONTROL_PUBLIC_STATIC);
  } catch (error: unknown) {
    return jsonResponse({ categories: FALLBACK_CATEGORIES }, 200, CACHE_CONTROL_PUBLIC_STATIC);
  }
};
