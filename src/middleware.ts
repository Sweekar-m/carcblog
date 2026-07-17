@
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { hasCompletedOnboarding, getUserProfile } from '@/lib/supabase';

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

  // If authenticated and accessing a protected route
  if (userId && isProtectedRoute(context.request)) {
    // Check onboarding completion
    const completed = await hasCompletedOnboarding(userId);
    if (!completed) {
      return context.redirect('/onboarding');
    }
    // Check if user is a writer
    const profile = await getUserProfile(userId);
    if (!profile || profile.role !== 'writer') {
      // Redirect to home if not a writer
      return context.redirect('/ ');
    }
    // Set user data in context.locals for use in endpoints and components
    context.locals.user = {
      userId,
      ...profile
    };
  }

  return next();
});

