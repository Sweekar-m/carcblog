import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { hasCompletedOnboarding, getUserProfile } from '@/lib/supabase';

// Match dashboard routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  // 1. If authenticated, fetch profile and set context.locals.user for ALL pages
  if (userId) {
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        context.locals.user = {
          userId,
          ...profile
        };
      }
    } catch (e) {
      console.warn('Failed to fetch user profile in middleware:', e);
    }
  }

  // 2. Route gating for protected routes (/dashboard/*)
  if (isProtectedRoute(context.request)) {
    // If not authenticated
    if (!userId) {
      return redirectToSignIn({
        returnBackUrl: context.url.href,
      });
    }

    // Check onboarding completion
    const completed = await hasCompletedOnboarding(userId);
    if (!completed) {
      return context.redirect('/onboarding');
    }

    // Check if user is a writer (readers redirected to home)
    const user = context.locals.user;
    if (!user || user.role !== 'writer') {
      return context.redirect('/');
    }
  }

  return next();
});
