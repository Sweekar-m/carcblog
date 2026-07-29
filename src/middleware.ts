import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { getUserProfile } from '@/lib/supabase';

// Protected dashboard routes
const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

// Helper to identify static files that should bypass middleware redirection
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon.') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|js|css|woff2?|json|xml|map)$/) !== null
  );
}

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Bypass checks for static assets completely
  if (isStaticAsset(pathname)) {
    return next();
  }

  // 1. If authenticated, fetch profile and set context.locals.user for ALL pages
  if (userId) {
    try {
      const profile = await getUserProfile(userId);
      context.locals.user = {
        userId,
        ...profile // Safe merge (even if profile is null, userId remains)
      };
    } catch (e) {
      console.warn('Failed to fetch user profile in middleware:', e);
      context.locals.user = { userId };
    }
  }

  const isOnboardingRoute = pathname === '/onboarding';
  const isOnboardingApi = pathname.startsWith('/api/onboarding');
  const isAuthRoute = ['/auth/sign-in', '/auth/sign-up', '/sign-in', '/sign-up'].includes(pathname);

  // 2. Dev-mode bypass strictly for explicit automated test runs with ?dev_test=true
  const hasDevTestQuery = process.env.NODE_ENV === 'development' && url.searchParams.get('dev_test') === 'true';

  if (hasDevTestQuery && !userId) {
    const customUserId = url.searchParams.get('test_as_user') || 'user_3GxVczR4xrrhZPPFGQHOj2TILhY';
    try {
      const realProfile = await getUserProfile(customUserId);
      context.locals.user = {
        userId: customUserId,
        id: customUserId,
        onboarding_completed: true,
        ...(realProfile || { role: customUserId.includes('reader') ? 'reader' : 'writer', full_name: customUserId })
      };
    } catch {
      context.locals.user = {
        id: customUserId,
        userId: customUserId,
        username: customUserId,
        full_name: 'Test User (' + customUserId + ')',
        role: customUserId.includes('reader') ? 'reader' : 'writer',
        onboarding_completed: true
      };
    }
    return next();
  }

  // 3. Unauthenticated User Logic
  if (!userId) {
    if (isDashboardRoute(context.request) || isOnboardingRoute) {
      return redirectToSignIn({
        returnBackUrl: context.url.href,
      });
    }
    return next();
  }

  // 3. Authenticated User Logic
  const profile = context.locals.user;
  const isOnboarded = !!profile?.onboarding_completed;

  // Scenario A: Authenticated but NOT onboarded
  if (!isOnboarded) {
    // If not already on onboarding page or onboarding API, force redirect to /onboarding
    if (!isOnboardingRoute && !isOnboardingApi && !isAuthRoute) {
      const redirectParam = pathname !== '/' ? `?redirect_url=${encodeURIComponent(pathname + url.search)}` : '';
      return context.redirect(`/onboarding${redirectParam}`);
    }
    return next();
  }

  // Scenario B: Authenticated and ONBOARDED
  if (isOnboardingRoute) {
    // Prevent onboarded users from filling the onboarding form again
    return context.redirect('/dashboard');
  }

  if (isAuthRoute) {
    // Prevent logged-in users from hitting sign-in/sign-up pages
    return context.redirect('/dashboard');
  }

  if (isDashboardRoute(context.request)) {
    /**
     * Dashboard Route Access Policy:
     * - Root '/dashboard' is accessible to both Readers and Writers.
     *   Page-level routing in `src/pages/dashboard/index.astro` redirects Readers to `/dashboard/bookmarks`.
     * - Personal reader tabs ('/dashboard/bookmarks', '/dashboard/likes', '/dashboard/following', '/dashboard/history', '/dashboard/notifications', '/dashboard/settings') are accessible to ALL roles.
     * - Writer-only management sub-routes ('/dashboard/articles', '/dashboard/analytics', '/dashboard/drafts', '/dashboard/published') are strictly gated to role === 'writer' | 'admin'.
     */
    const writerOnlyRoutes = ['/dashboard/articles', '/dashboard/analytics', '/dashboard/drafts', '/dashboard/published'];
    const isWriterOnly = writerOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    if (isWriterOnly && profile?.role !== 'writer' && profile?.role !== 'admin') {
      return context.redirect('/dashboard/bookmarks');
    }
  }

  return next();
});

