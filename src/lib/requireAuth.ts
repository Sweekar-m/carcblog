/**
 * requireAuth — derive the authenticated Clerk userId from Astro locals.
 *
 * This is the single, canonical authentication check for all protected API
 * routes. It replaces any inline `(locals as any).auth()` calls.
 *
 * @returns userId string on success
 * @returns null when the request is unauthenticated or the session is invalid
 *
 * Callers MUST return a 401 response when null is returned.
 * This function NEVER falls back to a mock user or a default identity.
 */
export async function requireAuth(locals: App.Locals): Promise<string | null> {
  try {
    const auth = await (locals as any).auth();
    const userId: string | undefined | null = auth?.userId;
    if (!userId) return null;
    return userId;
  } catch {
    // Clerk threw (invalid token, network issue, etc.) — fail securely.
    return null;
  }
}
