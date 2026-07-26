import type { APIRoute } from 'astro';
import { upsertUserProfile } from '@/lib/supabase';
import { requireAuth } from '@/lib/requireAuth';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { onboardingSchema } from '@/schemas/onboarding';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
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

    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      return errorResponse('Invalid input data', 400);
    }

    const { fullName, role, occupation, bio } = parsed.data;

    // Fetch Clerk user details to retrieve or generate a username
    const clerkUser = typeof (locals as any).currentUser === 'function'
      ? await (locals as any).currentUser()
      : null;

    const username =
      clerkUser?.username ||
      clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
      `user_${userId.substring(userId.indexOf('_') + 1)}`;

    // Prepare profile data for upsert with user-selected role
    const profile = {
      username,
      full_name: fullName,
      role: role as 'reader' | 'writer',
      occupation,
      bio: bio ?? null,
    };

    await upsertUserProfile(userId, profile);

    return jsonResponse({ success: true, role }, 200);
  } catch (error) {
    return errorResponse('Internal server error', 500, error);
  }
};