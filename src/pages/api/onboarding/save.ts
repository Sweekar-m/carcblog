import type { APIRoute } from 'astro';
import { OnboardingService } from '@/features/onboarding/services/onboarding.service';
import { getCurrentUser } from '@/lib/auth';
import { AuthError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const user = await getCurrentUser(context.locals);
    if (!user) {
      throw new AuthError('Unauthorized access to onboarding endpoint');
    }

    const body = await context.request.json();
    const updatedProfile = await OnboardingService.saveOnboardingProfile(user.id, body);

    return new Response(JSON.stringify({ success: true, profile: updatedProfile }), { status: 200 });
  } catch (error: any) {
    logger.error('API /api/onboarding/save execution error', error);
    const statusCode = error?.statusCode || 500;
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to save onboarding profile', details: error?.details }),
      { status: statusCode }
    );
  }
};
