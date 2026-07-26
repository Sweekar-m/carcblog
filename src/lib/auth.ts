import { supabase } from './supabase';

/**
 * getCurrentUser — resolve a typed user profile from Astro locals.
 *
 * Used by SSR pages (dashboard/*.astro) to display user data.
 * Returns null if the request is unauthenticated or if the Clerk session
 * is invalid. NEVER fabricates a user or falls back to a mock identity.
 *
 * For API route auth, use requireAuth() from '@/lib/requireAuth' instead.
 */
export async function getCurrentUser(locals?: any): Promise<{
  id: string;
  full_name: string | null;
  username: string;
  role: 'reader' | 'writer';
  bio: string | null;
  avatar_url: string | null;
} | null> {
  // Fast path: middleware already populated locals.user with a verified profile.
  // Only trust this path when the middleware-set userId is present.
  if (locals?.user?.userId) {
    return {
      id: locals.user.userId,
      full_name: locals.user.full_name ?? null,
      username: locals.user.username || locals.user.userId,
      role: locals.user.role ?? 'reader',
      bio: locals.user.bio ?? null,
      avatar_url: locals.user.avatar_url ?? null,
    };
  }

  // Slow path: call Clerk auth() directly.
  if (locals && typeof locals.auth === 'function') {
    try {
      const auth = await locals.auth();
      const userId: string | undefined | null = auth?.userId;

      // No valid session — return null, do not fabricate a user.
      if (!userId) return null;

      if (typeof locals.currentUser === 'function') {
        const clerkUser = await locals.currentUser();
        if (clerkUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          return {
            id: userId,
            full_name:
              clerkUser.fullName ||
              `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
              null,
            username:
              clerkUser.username ||
              clerkUser.emailAddresses?.[0]?.emailAddress.split('@')[0] ||
              userId,
            role: profile?.role ?? 'reader',
            bio: profile?.bio ?? null,
            avatar_url: clerkUser.imageUrl ?? null,
          };
        }
      }

      // Clerk userId exists but currentUser() is unavailable — fail securely.
      return null;
    } catch (e) {
      // Clerk threw an error — do not fall back to a mock. Fail securely.
      console.error('getCurrentUser: Clerk auth failed:', e);
      return null;
    }
  }

  // No locals or auth function available — unauthenticated context.
  return null;
}