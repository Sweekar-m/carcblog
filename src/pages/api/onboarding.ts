import type { APIRoute } from 'astro';
import { upsertUserProfile } from '@/lib/supabase';
import { z } from 'zod';

export const prerender = false;

const onboardingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['reader', 'writer']),
  occupation: z.string().min(1, 'Occupation is required'),
  bio: z.string().optional(),
});

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    // Auth check using the same pattern as articles.ts
    const auth = await (locals as any).auth();
    if (!auth?.userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await request.json();
    const parsed = onboardingSchema.safeParse(data);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { fullName, role, occupation, bio } = parsed.data;

    // Fetch Clerk user details to retrieve or generate a username
    const clerkUser = typeof (locals as any).currentUser === 'function' ? await (locals as any).currentUser() : null;
    const username = clerkUser?.username || 
                     clerkUser?.emailAddresses?.[0]?.emailAddress.split('@')[0] || 
                     `user_${auth.userId.substring(auth.userId.indexOf('_') + 1)}`;

    // Prepare profile data for upsert
    const profile = {
      username,
      full_name: fullName,
      role,
      occupation,
      bio: bio ?? null,
    };

    await upsertUserProfile(auth.userId, profile);

    return new Response(
      JSON.stringify({ success: true, role }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Onboarding API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};