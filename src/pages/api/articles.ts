import type { APIRoute } from 'astro';
import { createArticle, getUserProfile } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  // Auth check
  const auth = await (locals as any).auth();
  if (!auth?.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  // Get user profile to check role
  let profile;
  try {
    profile = await getUserProfile(auth.userId);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), { status: 500 });
  }

  if (!profile || profile.role !== 'writer') {
    return new Response(JSON.stringify({ error: 'Only writers can create articles' }), { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { title, slug, coverImage, excerpt, body: content, status } = body;

  // Validation
  if (!title || !slug || !content) {
    return new Response(JSON.stringify({ error: 'Title, slug, and content are required' }), { status: 400 });
  }

  // Determine published_at based on status
  const publishedAt = status === 'published' ? new Date().toISOString() : null;

  // Create article in Supabase
  try {
    const article = await createArticle({
      title,
      slug,
      cover_image_url: coverImage || null,
      excerpt: excerpt || null,
      content,
      author_id: auth.userId,
      published_at: publishedAt,
    });

    return new Response(JSON.stringify({ success: true, article }), { status: 201 });
  } catch (err: any) {
    console.error('Error creating article:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Failed to create article' }), { status: 500 });
  }
};
