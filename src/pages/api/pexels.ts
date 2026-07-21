/**
 * API proxy endpoint for Pexels search.
 * Protects the private PEXELS_API_KEY from exposure on the client side.
 * Uses Astro's import.meta.env for reliable env variable loading.
 *
 * Auth: Authentication is required. Anonymous requests receive 401.
 * Prevents quota exhaustion attacks against the PEXELS_API_KEY.
 */
import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { jsonResponse, errorResponse, CACHE_CONTROL_PRIVATE } from '@/lib/apiResponse';

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  // ── Auth check ────────────────────────────────────────────────────────────
  const userId = await requireAuth(locals);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }

  const url = new URL(request.url);
  const rawQuery = url.searchParams.get('q') || '';
  const query = rawQuery.trim().slice(0, 100); // Truncate to max 100 characters

  if (!query) {
    return errorResponse('Query parameter "q" is required.', 400);
  }

  // Safe pagination limits
  const rawPage = parseInt(url.searchParams.get('page') || '1', 10);
  const rawPerPage = parseInt(url.searchParams.get('per_page') || '20', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 100);
  const perPage = isNaN(rawPerPage) || rawPerPage < 1 ? 20 : Math.min(rawPerPage, 30);

  const apiKey = import.meta.env.PEXELS_API_KEY;
  if (!apiKey) {
    return errorResponse('Pexels API key not configured on server.', 500, 'PEXELS_API_KEY missing');
  }

  try {
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const response = await fetch(pexelsUrl, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      return errorResponse(`Pexels API responded with status ${response.status}`, 502);
    }

    const data = await response.json();
    return jsonResponse(data, 200, CACHE_CONTROL_PRIVATE);
  } catch (error: unknown) {
    return errorResponse('An error occurred proxying the Pexels request.', 500, error);
  }
};
