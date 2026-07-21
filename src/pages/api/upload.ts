/**
 * API upload endpoint for media files.
 *
 * Security model:
 * - Requires a valid Clerk session (401 for anonymous)
 * - Requires the `writer` role (403 for readers)
 * - Validates Content-Length header before buffering the body (413 early-out)
 * - Validates MIME type against an explicit allowlist (no SVG, no executables)
 * - Validates file extension and cross-checks it against the declared MIME type
 * - Validates file size after buffering
 * - Does NOT auto-create the storage bucket in production
 * - Does NOT allow upsert (prevents silent file overwrite)
 * - No base64 fallback — missing storage config is a server misconfiguration error
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/requireAuth';
import { getUserProfile } from '@/lib/supabase';
import {
  validateContentLength,
  validateFile,
} from '@/lib/fileValidation';
import { jsonResponse, errorResponse } from '@/lib/apiResponse';

export const prerender = false;

// ── Storage client (server-side only) ─────────────────────────────────────────
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = import.meta.env.SUBBASE_SERVICE_ROLE_KEY || '';

/**
 * Admin Supabase client initialised at module scope.
 * Only available when the service-role key is present in the environment.
 * If absent, uploads will fail with a 503 — never silently fall back to base64.
 */
const adminSupabase =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

/** Name of the pre-existing Supabase Storage bucket. Must exist before deployment. */
const MEDIA_BUCKET = 'media';

export const POST: APIRoute = async ({ locals, request }) => {
  // ── 1. Authentication ────────────────────────────────────────────────────────
  const userId = await requireAuth(locals);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }

  // ── 2. Role authorisation — writers & admins only ───────────────────────────
  let profile: Awaited<ReturnType<typeof getUserProfile>>;
  try {
    profile = await getUserProfile(userId);
  } catch (err) {
    return errorResponse('Failed to verify user permissions.', 500, err);
  }

  if (!profile || (profile.role !== 'writer' && profile.role !== 'admin')) {
    return errorResponse('Forbidden: only writers may upload files.', 403);
  }

  // ── 3. Content-Length pre-check (before buffering the body) ──────────────────
  const clCheck = validateContentLength(request);
  if (!clCheck.ok) {
    return errorResponse(clCheck.error!, clCheck.status!);
  }

  // ── 4. Parse multipart body ───────────────────────────────────────────────────
  let file: File | null;
  try {
    const formData = await request.formData();
    file = formData.get('image') as File | null;
  } catch (err) {
    return errorResponse('Could not parse multipart form data.', 400, err);
  }

  if (!file || typeof file === 'string') {
    return errorResponse('No file provided. Send a multipart field named "image".', 400);
  }

  // ── 5. File validation (MIME allowlist + extension cross-check + size) ────────
  const fileCheck = validateFile(file);
  if (!fileCheck.ok) {
    return errorResponse(fileCheck.error!, fileCheck.status!);
  }

  // ── 6. Storage upload ─────────────────────────────────────────────────────────
  if (!adminSupabase) {
    return errorResponse('Storage service is not configured.', 503, 'Supabase admin client missing');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Namespace files by userId to prevent cross-user overwrites
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${userId}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await adminSupabase.storage
    .from(MEDIA_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false, // never silently overwrite
    });

  if (uploadError) {
    return errorResponse(`Upload failed: ${uploadError.message}`, 500, uploadError);
  }

  const { data: publicUrlData } = adminSupabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(filename);

  return jsonResponse({ url: publicUrlData.publicUrl }, 200);
};
