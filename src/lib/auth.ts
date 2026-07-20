import { supabase } from './supabase';

// Auth utilities
export async function getCurrentUser(locals?: any) {
  // If locals has the user profile populated by middleware, reuse it
  if (locals?.user && locals.user.username) {
    return {
      id: locals.user.userId,
      full_name: locals.user.full_name || 'Carcblog Writer',
      username: locals.user.username,
      role: locals.user.role || 'writer',
      bio: locals.user.bio || 'Carcblog staff writer.',
      avatar_url: locals.user.avatar_url || null
    };
  }

  // If Astro locals is provided, attempt to retrieve authentic Clerk user
  if (locals && typeof locals.auth === 'function') {
    try {
      const auth = await locals.auth();
      const userId = auth?.userId;
      if (userId) {
        // Retrieve Clerk user details if available
        if (typeof locals.currentUser === 'function') {
          const clerkUser = await locals.currentUser();
          if (clerkUser) {
            // Get profile from Supabase database if it exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            return {
              id: userId,
              full_name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || 'Carcblog Writer',
              username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress.split('@')[0] || 'writer',
              role: profile?.role || 'writer',
              bio: profile?.bio || 'Carcblog staff writer.',
              avatar_url: clerkUser.imageUrl || null
            };
          }
        }
      } else {
        // Explicitly unauthenticated
        return null;
      }
    } catch (e) {
      console.warn("Clerk getCurrentUser failed, using fallback:", e);
    }
  }

  // Fallback / Development Mock User when no locals or active Clerk middleware context exists
  return {
    id: 'user_123',
    full_name: 'John Doe',
    username: 'johndoe',
    role: 'writer',
    bio: 'Software engineer and technical writer',
    avatar_url: null
  };
}