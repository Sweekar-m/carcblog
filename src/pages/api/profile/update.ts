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
    const { social_links, ...profileUpdates } = body;

    const profile = await updateProfileDetails(user.id, profileUpdates);
    if (Array.isArray(social_links)) {
      await saveUserSocialLinks(user.id, social_links);
    }

    return new Response(JSON.stringify({ success: true, profile }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Update failed' }), { status: 500 });
  }
};
