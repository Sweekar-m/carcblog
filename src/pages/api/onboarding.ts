/**
 * POST /api/onboarding
 *
 * Accepts the onboarding form payload and upserts the user's profile
 * in Supabase. Requires an authenticated Clerk session.
 */
import type { APIRoute } from 'astro';
import { upsertUserProfile } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  // ── Auth check ──
  let userId: string | null = null;
  let clerkUser: any = null;

  if (typeof locals.auth === 'function') {
    try {
      const auth = await (locals as any).auth();
      userId = auth?.userId ?? null;
      if (userId && typeof (locals as any).currentUser === 'function') {
        clerkUser = await (locals as any).currentUser();
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Auth check failed' }), { status: 401 });
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  // ── Parse body ──
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { full_name, role, occupation, bio } = body;

  if (!role || !['reader', 'writer'].includes(role)) {
    return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
  }

  if (!occupation) {
    return new Response(JSON.stringify({ error: 'Occupation is required' }), { status: 400 });
  }

  // ── Derive username from Clerk or name ──
  const username =
    clerkUser?.username ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    (full_name || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // ── Upsert profile ──
  try {
    const profile = await upsertUserProfile(userId, {
      full_name: full_name || clerkUser?.fullName || 'Carcblog User',
      username,
      role,
      occupation,
      bio: bio || null,
      avatar_url: clerkUser?.imageUrl || null,
    });

    return new Response(JSON.stringify({ ok: true, profile }), { status: 200 });
  } catch (err: any) {
    console.error('Onboarding upsert failed:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Failed to save profile' }),
      { status: 500 }
    );
  }
};
