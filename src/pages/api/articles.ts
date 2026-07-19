import type { APIRoute } from 'astro';
import { sanityClient, createSanityArticle } from '@/lib/sanity';
import { getUserProfile } from '@/lib/supabase';

export const prerender = false;

/**
 * GET: Return published articles (public feed).
 */
export const GET: APIRoute = async () => {
  try {
    const articles = await sanityClient.fetch(`
      *[_type == "article" && defined(publishedAt)]
        | order(publishedAt desc)
      {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        "coverImage": coverImage.asset->url,
        "author": {
          "name": author->name,
          "image": author->image.asset->url
        }
      }
    `);
    return new Response(JSON.stringify({ success: true, articles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error fetching articles:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Failed to fetch articles' }), { status: 500 });
  }
};

/**
 * POST: Create a new article (writer only).
 */
export const POST: APIRoute = async ({ locals, request }) => {
  // Auth check
  const auth = await (locals as any).auth();
  if (!auth?.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  // Get user profile to verify writer role
  let profile;
  try {
    console.log('auth.userId:', auth.userId);
    profile = await getUserProfile(auth.userId);
  } catch (err) {
    console.error('getUserProfile error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), { status: 500 });
  }
  console.log('profile:', profile);
  console.log('profile.role:', profile?.role);
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

  // Prepare article data (convert plain text to portable text block if needed)
  const portableBody = typeof content === 'string' && content.trim()
    ? [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: content }],
        },
      ]
    : (Array.isArray(content) ? content : []);

  try {
    const article = await createSanityArticle({
      title,
      slug,
      excerpt: excerpt ?? null,
      body: portableBody,
      coverImageUrl: coverImage ?? undefined,
      authorClerkId: auth.userId,
      status: status as 'draft' | 'published',
    });

    return new Response(JSON.stringify({ success: true, article }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error creating article:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Failed to create article' }), { status: 500 });
  }
};
