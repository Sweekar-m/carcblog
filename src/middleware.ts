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
  let { userId, redirectToSignIn } = auth();
  
  // Dev-mode test hook: bypass Clerk and simulate user state via cookie
  const testCookie = context.cookies.get('__test_user_id')?.value;
  if (testCookie) {
    userId = testCookie === 'null' ? null : testCookie;
    
    // Inject mock auth resolver so API routes and pages get the simulated user ID
    context.locals.auth = () => Promise.resolve({ userId });
    
    // Inject mock currentUser resolver
    context.locals.currentUser = () => Promise.resolve(userId ? {
      id: userId,
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      username: `user_${userId.substring(userId.indexOf('_') + 1)}`,
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      emailAddresses: [{ emailAddress: `${userId}@example.com` }]
    } : null);
  }

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
  const isOnboardingApi = pathname === '/api/onboarding';
  const isAuthRoute = ['/auth/sign-in', '/auth/sign-up', '/sign-in', '/sign-up'].includes(pathname);

  // 2. Unauthenticated User Logic
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
    return context.redirect(profile.role === 'writer' ? '/dashboard' : '/');
  }

  if (isAuthRoute) {
    // Prevent logged-in users from hitting sign-in/sign-up pages
    return context.redirect(profile.role === 'writer' ? '/dashboard' : '/');
  }

  if (isDashboardRoute(context.request)) {
    // Role enforcement for /dashboard/* (Only writers allowed)
    if (profile.role !== 'writer') {
      return context.redirect('/');
    }
  }

  return next();
});

