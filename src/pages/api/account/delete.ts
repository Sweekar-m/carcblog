import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { supabase } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';
import { createClerkClient } from '@clerk/backend';

export const prerender = false;

export const DELETE: APIRoute = async ({ locals }) => {
  try {
    // 1. Enforce authentication — verify server session
    const userId = await requireAuth(locals);
    if (!userId) {
      return errorResponse('Unauthorized. Please sign in to delete your account.', 401);
    }

    // 2. Delete user profile from Supabase database
    const { error: dbError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('[delete-account] Supabase profile deletion failed:', dbError);
      // Log warning but proceed to delete Clerk user to avoid orphaned auth accounts
    }

    // 3. Delete user account from Clerk Auth using Clerk Backend SDK
    const secretKey = import.meta.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY;
    if (secretKey) {
      try {
        const clerkClient = createClerkClient({ secretKey });
        await clerkClient.users.deleteUser(userId);
      } catch (clerkErr: any) {
        console.error('[delete-account] Clerk user deletion failed:', clerkErr);
        return errorResponse('Failed to delete account from authentication provider', 500, clerkErr);
      }
    } else {
      console.warn('[delete-account] CLERK_SECRET_KEY missing — skipped Clerk user deletion');
    }

    return jsonResponse({ success: true, message: 'Account deleted successfully' }, 200);
  } catch (err: any) {
    console.error('[delete-account] Server error:', err);
    return errorResponse('Failed to delete account', 500, err);
  }
};
