import type { APIRoute } from 'astro';
import { OnboardingService } from '@/features/onboarding/services/onboarding.service';
import { requireAuth } from '@/lib/requireAuth';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const userId = await requireAuth(locals);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    let data: any;
    try {
      data = await request.json();
    } catch (err) {
      return errorResponse('Invalid JSON body', 400, err);
    }

    const role = data.role === 'writer' ? 'writer' : 'reader';
    const profilePayload = {
      role,
      full_name: data.fullName || data.full_name || 'Creator',
      bio: data.bio || null,
      job_title: data.occupation || null,
    };

    await OnboardingService.saveOnboardingProfile(userId, profilePayload as any);
    logger.info('Legacy /api/onboarding delegated successfully to OnboardingService', { userId, role });

    return jsonResponse({ success: true, role }, 200);
  } catch (error: any) {
    logger.error('Legacy /api/onboarding error', error);
    return errorResponse(error?.message || 'Internal server error', error?.statusCode || 500, error);
  }
};