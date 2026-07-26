import type { APIRoute } from 'astro';
import { updateProfileDetails, saveUserSocialLinks } from '@/lib/profile';
import { getCurrentUser } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = await getCurrentUser(context.locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await context.request.json();
    const {
      role,
      full_name,
      username,
      avatar_url,
      cover_url,
      bio,
      tagline,
      country,
      city,
      timezone,
      preferred_language,
      company,
      job_title,
      years_experience,
      industry,
      skills,
      interests,
      expertise,
      social_links,
      writing_topics,
      notification_prefs
    } = body;

    // Update profile
    const updatedProfile = await updateProfileDetails(user.id, {
      role: role === 'writer' ? 'writer' : 'reader',
      full_name,
      username: username || user.username,
      avatar_url,
      cover_url,
      bio,
      tagline,
      country,
      city,
      timezone: timezone || 'UTC',
      preferred_language: preferred_language || 'en',
      company,
      job_title,
      years_experience: Number(years_experience) || 0,
      industry,
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      expertise: Array.isArray(expertise) ? expertise : [],
      writing_topics: Array.isArray(writing_topics) ? writing_topics : [],
      notification_prefs: notification_prefs || {},
      onboarding_completed: true
    });

    // Save social links
    if (Array.isArray(social_links)) {
      await saveUserSocialLinks(user.id, social_links);
    }

    return new Response(JSON.stringify({ success: true, profile: updatedProfile }), { status: 200 });
  } catch (error: any) {
    console.error('Error saving onboarding profile:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Failed to save profile' }), { status: 500 });
  }
};
