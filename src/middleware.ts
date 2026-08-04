import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { getUserProfile } from '@/lib/supabase';
import { isStaticAsset } from '@/middleware/guards/assetGuard';
import { checkOnboardingRedirection } from '@/middleware/guards/onboardingGuard';
import { validateRoleAccess } from '@/middleware/guards/roleGuard';
import { logger } from '@/lib/logger';

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Bypass middleware for static asset requests
  if (isStaticAsset(pathname)) {
    return next();
  }

  // 1. Populate authenticated user profile context
  if (userId) {
    try {
      const profile = await getUserProfile(userId);
      context.locals.user = {
        userId,
        ...profile,
      };
    } catch (e) {
      logger.warn('Failed to fetch user profile in middleware', { userId, error: e });
      context.locals.user = { userId };
    }
  }

  // 2. Dev-mode automated test bypass
  const hasDevTestQuery = process.env.NODE_ENV === 'development' && url.searchParams.get('dev_test') === 'true';
  if (hasDevTestQuery && !userId) {
    const customUserId = url.searchParams.get('test_as_user') || 'user_3GxVczR4xrrhZPPFGQHOj2TILhY';
    try {
      const realProfile = await getUserProfile(customUserId);
      context.locals.user = {
        userId: customUserId,
        id: customUserId,
        onboarding_completed: true,
        ...(realProfile || { role: customUserId.includes('reader') ? 'reader' : 'writer', full_name: customUserId }),
      };
    } catch {
      context.locals.user = {
        id: customUserId,
        userId: customUserId,
        username: customUserId,
        full_name: 'Test User (' + customUserId + ')',
        role: customUserId.includes('reader') ? 'reader' : 'writer',
        onboarding_completed: true,
      };
    }
    return next();
  }

  // 3. Unauthenticated User Gating
  if (!userId) {
    const isOnboardingRoute = pathname === '/onboarding';
    if (isDashboardRoute(context.request) || isOnboardingRoute) {
      return redirectToSignIn({
        returnBackUrl: context.url.href,
      });
    }
    return next();
  }

  // 4. Authenticated User Onboarding Guard
  const profile = context.locals.user;
  const isOnboarded = !!profile?.onboarding_completed;
  const onboardingCheck = checkOnboardingRedirection(isOnboarded, pathname, url.search);

  if (onboardingCheck.shouldRedirect && onboardingCheck.targetUrl) {
    return context.redirect(onboardingCheck.targetUrl);
  }

  // 5. Dashboard Role Access Policy Guard
  if (isDashboardRoute(context.request)) {
    const hasAccess = validateRoleAccess(pathname, profile?.role);
    if (!hasAccess) {
      logger.warn('Unauthorized role access attempt to writer route', { userId, role: profile?.role, pathname });
      return context.redirect('/dashboard/profile');
    }
  }

  return next();
});
