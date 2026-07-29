import { updateProfileDetails, saveUserSocialLinks } from '@/lib/profile';
import { clearProfileCache } from '@/lib/supabase';
import { ValidationError, DatabaseError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { onboardingPayloadSchema } from '../schemas';
import type { OnboardingFormPayload } from '../types';

export class OnboardingService {
  /**
   * Process and save full user onboarding profile details
   */
  static async saveOnboardingProfile(userId: string, payload: Partial<OnboardingFormPayload>) {
    if (!userId) {
      throw new ValidationError('User ID is required for onboarding');
    }

    const validationResult = onboardingPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      logger.warn('Onboarding payload validation failed', { errors: validationResult.error.format() });
      throw new ValidationError('Invalid onboarding profile payload', validationResult.error.format());
    }

    const data = validationResult.data;

    const fallbackUsername =
      (data.username && data.username.trim()) ||
      `user_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`;
    const fallbackName = (data.full_name && data.full_name.trim()) || 'Creator';

    try {
      const updatedProfile = await updateProfileDetails(userId, {
        role: data.role,
        full_name: fallbackName,
        username: fallbackUsername,
        avatar_url: data.avatar_url || null,
        cover_url: data.cover_url || null,
        bio: data.bio || null,
        tagline: data.tagline || null,
        country: data.country || null,
        city: data.city || null,
        timezone: data.timezone || 'UTC',
        preferred_language: data.preferred_language || 'en',
        company: data.company || null,
        job_title: data.job_title || null,
        years_experience: Number(data.years_experience) || 0,
        industry: data.industry || 'Technology',
        skills: Array.isArray(data.skills) ? data.skills : [],
        writing_topics: Array.isArray(data.writing_topics) ? data.writing_topics : [],
        notification_prefs: data.notification_prefs || {},
        onboarding_completed: true,
      });

      if (Array.isArray(data.social_links)) {
        await saveUserSocialLinks(userId, data.social_links);
      }

      // Ensure fresh reads across middleware and SSR routes
      clearProfileCache(userId);
      logger.info('User onboarding profile saved successfully', { userId, role: data.role });

      return updatedProfile;
    } catch (error: any) {
      logger.error('Failed to save onboarding profile', error, { userId });
      throw new DatabaseError(error?.message || 'Database error during onboarding save');
    }
  }
}
