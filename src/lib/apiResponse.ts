/**
 * apiResponse.ts — Standardized response helper for API route hardening.
 *
 * Enforces:
 * - Content-Type: application/json
 * - Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
 * - Strict Cache-Control policy (no-store for auth/mutation routes, scoped caching for public)
 * - Error message sanitization (logs detail internally, returns clean messages to client)
 */

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const CACHE_CONTROL_PRIVATE = 'no-store, no-cache, must-revalidate, max-age=0';
export const CACHE_CONTROL_PUBLIC_FEED = 'public, max-age=60, s-maxage=120, stale-while-revalidate=300';
export const CACHE_CONTROL_PUBLIC_STATIC = 'public, max-age=300, s-maxage=600, stale-while-revalidate=60';

/**
 * Return a successful JSON API response.
 */
export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  cacheControl = CACHE_CONTROL_PRIVATE
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': cacheControl,
    },
  });
}

/**
 * Return a sanitized error response.
 * Internal error details are logged server-side and hidden from the client response.
 */
export function errorResponse(
  clientMessage: string,
  status = 500,
  internalError?: unknown,
  cacheControl = CACHE_CONTROL_PRIVATE
): Response {
  if (internalError) {
    console.error(`[API Error ${status}] ${clientMessage}:`, internalError);
  }

  return new Response(
    JSON.stringify({
      error: clientMessage,
    }),
    {
      status,
      headers: {
        ...SECURITY_HEADERS,
        'Cache-Control': cacheControl,
      },
    }
  );
}

/**
 * Parse and clamp pagination limit & offset parameters safely.
 */
export function parsePagination(url: URL, maxLimit = 50, defaultLimit = 20) {
  const rawLimit = parseInt(url.searchParams.get('limit') ?? `${defaultLimit}`, 10);
  const rawOffset = parseInt(url.searchParams.get('offset') ?? '0', 10);

  const limit = isNaN(rawLimit) || rawLimit < 1 ? defaultLimit : Math.min(rawLimit, maxLimit);
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  return { limit, offset };
}
