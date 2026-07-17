import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// Match dashboard routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  // If user is not authenticated and is trying to access a protected route
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn({
      returnBackUrl: context.url.href,
    });
  }

  return next();
});
