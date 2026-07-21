import type { APIRoute } from 'astro';
import { upsertUserProfile } from '@/lib/supabase';
import { requireAuth } from '@/lib/requireAuth';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { z } from 'zod';

export const prerender = false;

/**
 * Onboarding schema — note: `role` is intentionally absent.
 * All new users are created as 'reader'. Role elevation to 'writer'
 * must be performed by an admin; never trust the client to set its own role.
 */
const onboardingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  occupation: z.string().min(1, 'Occupation is required').max(100, 'Occupation too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
});

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

    const { fullName, occupation, bio } = parsed.data;

    // Fetch Clerk user details to retrieve or generate a username
    const clerkUser = typeof (locals as any).currentUser === 'function'
      ? await (locals as any).currentUser()
      : null;

    const username =
      clerkUser?.username ||
      clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
      `user_${userId.substring(userId.indexOf('_') + 1)}`;

    // Prepare profile data for upsert.
    // Role is always 'reader' on initial onboarding — never client-controlled.
    const profile = {
      username,
      full_name: fullName,
      role: 'reader' as const,
      occupation,
      bio: bio ?? null,
    };

    await upsertUserProfile(userId, profile);

    return jsonResponse({ success: true, role: 'reader' }, 200);
  } catch (error) {
    return errorResponse('Internal server error', 500, error);
  }
};