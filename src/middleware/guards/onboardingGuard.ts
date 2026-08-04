/**
 * Onboarding Guard — Checks onboarding status and manages redirection rules
 */
export function checkOnboardingRedirection(
  isOnboarded: boolean,
  pathname: string,
  urlSearch: string
): { shouldRedirect: boolean; targetUrl?: string } {
  const isOnboardingRoute = pathname === '/onboarding';
  const isOnboardingApi = pathname.startsWith('/api/onboarding');
  const isAuthRoute = ['/auth/sign-in', '/auth/sign-up', '/sign-in', '/sign-up'].includes(pathname);

  // Authenticated but NOT onboarded
  if (!isOnboarded) {
    if (!isOnboardingRoute && !isOnboardingApi && !isAuthRoute) {
      const redirectParam = pathname !== '/' ? `?redirect_url=${encodeURIComponent(pathname + urlSearch)}` : '';
      return { shouldRedirect: true, targetUrl: `/onboarding${redirectParam}` };
    }
    return { shouldRedirect: false };
  }

  // Authenticated and ONBOARDED
  if (isOnboardingRoute || isAuthRoute) {
    return { shouldRedirect: true, targetUrl: '/dashboard/profile' };
  }

  return { shouldRedirect: false };
}
