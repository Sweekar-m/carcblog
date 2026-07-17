import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { hasCompletedOnboarding } from '@/lib/supabase';

// Match dashboard routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

// Routes that require onboarding to be completed
const isOnboardingRequired = createRouteMatcher([
  '/dashboard(.*)',
]);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  // If user is not authenticated and is trying to access a protected route
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn({
      returnBackUrl: context.url.href,
    });
  }

  // If authenticated and accessing a route that requires onboarding,
  // check if onboarding is complete — redirect to /onboarding if not
  if (userId && isOnboardingRequired(context.request)) {
    try {
      const completed = await hasCompletedOnboarding(userId);
      if (!completed) {
        return context.redirect('/onboarding');
      }
    } catch {
      // If the check fails (e.g. table doesn't exist yet), allow through
    }
  }

  return next();
});
