import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// ---------- READ-ONLY (public) client ----------
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION ?? '2023-05-03',
  useCdn: true,
});

// ---------- WRITER (private) client ----------
const sanityApiToken = import.meta.env.SANITY_API_TOKEN;
// Token presence is verified at startup — never log token values.
export const sanityWriteClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID ?? import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION ?? '2023-05-03',
  token: sanityApiToken,
  useCdn: false,
});

// Image URL builder
export const urlFor = (source: any) => imageUrlBuilder(sanityClient).image(source);

/**
 * Safely resolves any Sanity image source (CDN string URL, external URL, or Sanity asset object)
 * into a valid image URL string.
 */
export function safeImageUrl(source: any, body?: any): string | undefined {
  if (source) {
    if (typeof source === 'string' && source.trim()) return source.trim();
    if (typeof source === 'object') {
      if (typeof source.url === 'string' && source.url.trim()) return source.url.trim();
      if (source.asset || source._ref || source._type === 'image') {
        try {
          const built = urlFor(source).url();
          if (built) return built;
        } catch {
          // Fall through
        }
      }
    }
  }

  // Fallback: extract the first image inserted in the body content
  if (body) {
    return extractFirstBodyImage(body);
  }

  return undefined;
}

/**
 * Extract the URL of the first image block inserted in article content body.
 */
export function extractFirstBodyImage(body: any): string | undefined {
  if (!body || !Array.isArray(body)) return undefined;
  for (const block of body) {
    if (!block) continue;
    if (block._type === 'imageBlock' && block.url) return block.url;
    if (block._type === 'image' || block.type === 'image') {
      const url = block.url || block.props?.url || block.src || (block.asset ? safeImageUrl(block) : undefined);
      if (url) return url;
    }
  }
  return undefined;
}

/* Types */
export interface SanityArticle {
  _id: string;
  title: string;
  slug: { current: string } | string;
  publishedAt?: string;
  excerpt?: string;
  status?: string;
  coverImage?: any;
  author?: {
    _id: string;
    clerkUserId?: string;
    name: string;
    image?: any;
  };
  body?: any;
}

/* Read-only fetch — public feed (published articles only) */
export async function getSanityArticles(opts: { limit?: number } = {}): Promise<SanityArticle[]> {
  const { limit = 10 } = opts;
  return sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && (status == "published" || defined(publishedAt)) && status != "archived"]
     | order(coalesce(publishedAt, _createdAt) desc)[0...$limit]
     { _id, title, slug, publishedAt, excerpt, status, body,
       "coverImage": coalesce(coverImage.asset->url, coverImage),
       author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
    { limit }
  );
}


/**
 * Fetch a single published article by slug (public guest view).
 * Strictly filters to published content where publishedAt <= now and status != "archived".
 */
export async function getSanityArticleBySlug(slug: string): Promise<SanityArticle | null> {
  const now = new Date().toISOString();
  return sanityClient.fetch<SanityArticle | null>(
    `*[_type == "article" && slug.current == $slug && defined(publishedAt) && publishedAt <= $now && status != "archived"][0]
     { _id, title, slug, publishedAt, excerpt, status, body,
       "coverImage": coalesce(coverImage.asset->url, coverImage),
       author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
    { slug, now }
  );
}

/**
 * Fetch a single article by slug with role and ownership awareness.
 * - Anonymous: published content only.
 * - Writer: own drafts, scheduled, archived, and published content; published content for others.
 * - Admin: all article statuses.
 */
export async function getSanityArticleBySlugForUser(
  slug: string,
  clerkUserId?: string | null,
  isAdmin = false
): Promise<SanityArticle | null> {
  const now = new Date().toISOString();

  // Admin role: can view any article by slug regardless of status
  if (isAdmin) {
    return sanityClient.fetch<SanityArticle | null>(
      `*[_type == "article" && slug.current == $slug][0]
       { _id, title, slug, publishedAt, excerpt, status, body,
         "coverImage": coalesce(coverImage.asset->url, coverImage),
         author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
      { slug }
    );
  }

  // Authenticated user: can view own drafts/scheduled/archived OR published content
  if (clerkUserId) {
    return sanityClient.fetch<SanityArticle | null>(
      `*[_type == "article" && slug.current == $slug && (
        (defined(publishedAt) && publishedAt <= $now && status != "archived") ||
        author->clerkUserId == $clerkUserId
      )][0]
       { _id, title, slug, publishedAt, excerpt, status, body,
         "coverImage": coalesce(coverImage.asset->url, coverImage),
         author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
      { slug, now, clerkUserId }
    );
  }

  // Anonymous guest: strictly published content
  return getSanityArticleBySlug(slug);
}


/**
 * Fetch ALL articles belonging to a specific writer (published + drafts).
 */
export async function getSanityArticlesByAuthor(
  clerkUserId: string,
  limit = 100
): Promise<SanityArticle[]> {
  return sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && author->clerkUserId == $clerkUserId]
     | order(_createdAt desc)[0...$limit]
     { _id, title, slug, publishedAt, excerpt, status, body,
       "coverImage": coalesce(coverImage.asset->url, coverImage),
       author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
    { clerkUserId, limit }
  );
}

/**
 * Recent published articles for the public homepage / feed widgets.
 */
export async function getRecentSanityArticles(opts: { limit?: number; now?: string } = {}): Promise<SanityArticle[]> {
  const { limit = 10, now = new Date().toISOString() } = opts;
  return sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && defined(publishedAt) && publishedAt <= $now]
     | order(publishedAt desc)[0...$limit]
     { _id, title, slug, publishedAt, excerpt, status, body,
       "coverImage": coalesce(coverImage.asset->url, coverImage),
       author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
    { limit, now }
  );
}

/**
 * Fetch a single article by ID (regardless of published status).
 * Includes dereferenced author information for ownership checks.
 */
export async function getSanityArticleById(id: string): Promise<SanityArticle | null> {
  return sanityClient.fetch<SanityArticle | null>(
    `*[_type == "article" && _id == $id][0]
     { _id, title, slug, publishedAt, excerpt, status, body,
       "coverImage": coalesce(coverImage.asset->url, coverImage),
       author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) } }`,
    { id }
  );
}

/**
 * Update an existing article's fields.
 */
export async function updateSanityArticle(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    body?: any;
    coverImageUrl?: string;
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    categoryId?: string;
    tags?: string[];
    scheduledAt?: string | null;
    publishedAt?: string | null;
  }
) {
  const patch = sanityWriteClient.patch(id);

  if (data.title !== undefined) patch.set({ title: data.title });
  if (data.slug !== undefined) patch.set({ slug: { current: data.slug } });
  if (data.excerpt !== undefined) patch.set({ excerpt: data.excerpt });
  if (data.body !== undefined) patch.set({ body: data.body });
  if (data.status !== undefined) patch.set({ status: data.status });
  if (data.publishedAt !== undefined) patch.set({ publishedAt: data.publishedAt });
  if (data.scheduledAt !== undefined) patch.set({ scheduledAt: data.scheduledAt });
  if (data.tags !== undefined) patch.set({ tags: data.tags });

  if (data.categoryId !== undefined) {
    patch.set({ categories: [{ _type: 'reference', _ref: data.categoryId }] });
  }

  if (data.coverImageUrl !== undefined) {
    if (data.coverImageUrl) {
      const assetId = await uploadAsset(data.coverImageUrl);
      patch.set({ coverImage: { _type: 'image', asset: { _ref: assetId } } });
    } else {
      patch.unset(['coverImage']);
    }
  }

  return patch.commit();
}

/**
 * Delete an article document by ID.
 */
export async function deleteSanityArticle(id: string) {
  const publishedId = id.replace(/^drafts\./, '');
  const draftId = `drafts.${publishedId}`;

  return sanityWriteClient
    .transaction()
    .delete(publishedId)
    .delete(draftId)
    .commit();
}

/* Author helpers */

export async function ensureAuthorDocument(clerkUserId: string, name: string, email?: string, imageUrl?: string): Promise<string> {
  // Use read-only sanityClient (no token needed) for author lookup
  try {
    const existing = await sanityClient.fetch<{ _id: string } | null>(`*[_type == "author" && clerkUserId == $id][0] { _id }`, { id: clerkUserId });
    if (existing?._id) return existing._id;
  } catch (err: any) {
    console.error('[ensureAuthorDocument] Lookup failed:', err?.message);
  }

  const doc: any = { _type: 'author', clerkUserId, name };
  if (email) doc.email = email;

  if (imageUrl) {
    try {
      const assetId = await uploadAsset(imageUrl);
      doc.image = { _type: 'image', asset: { _ref: assetId } };
    } catch (err: any) {
      console.warn('[ensureAuthorDocument] Avatar upload failed, continuing without avatar:', err?.message);
    }
  }

  try {
    const created = await sanityWriteClient.create(doc);
    return created._id;
  } catch (err: any) {
    console.error('[ensureAuthorDocument] Failed to create author document in Sanity:', err?.message);
    throw err;
  }
}

async function uploadAsset(url: string): Promise<string> {
  let resp: Response;
  try {
    resp = await fetch(url);
  } catch (err: any) {
    throw new Error(`Failed to fetch image URL (${url}): ${err?.message}`);
  }

  if (!resp.ok) {
    throw new Error(`Failed to fetch image (${url}) status: ${resp.status}`);
  }

  const buffer = Buffer.from(await resp.arrayBuffer());
  const contentType = resp.headers.get('content-type') || 'image/jpeg';
  let filename = 'upload.jpg';
  try {
    filename = new URL(url).pathname.split('/').pop() || 'upload.jpg';
  } catch {
    filename = 'upload.jpg';
  }

  const asset = await sanityWriteClient.assets.upload('image', buffer, { filename, contentType });
  return asset._id;
}

export async function createSanityArticle(data: {
  title: string;
  slug: string;
  excerpt?: string;
  body?: any;
  coverImageUrl?: string;
  authorClerkId: string;
  status: 'draft' | 'published' | 'scheduled';
  authorName?: string;
  authorImageUrl?: string;
  categoryId?: string;
  tags?: string[];
  scheduledAt?: string | null;
}) {
  const authorId = await ensureAuthorDocument(
    data.authorClerkId,
    data.authorName ?? 'Unknown',
    undefined, // email not stored
    data.authorImageUrl
  );

  let publishedAt: string | null = null;
  if (data.status === 'published') {
    publishedAt = new Date().toISOString();
  } else if (data.status === 'scheduled' && data.scheduledAt) {
    publishedAt = new Date(data.scheduledAt).toISOString();
  }

  const doc: any = {
    _type: 'article',
    title: data.title,
    slug: { current: data.slug },
    excerpt: data.excerpt ?? null,
    body: data.body ?? null,
    publishedAt,
    status: data.status,
    author: { _type: 'reference', _ref: authorId },
    tags: data.tags ?? [],
  };

  if (data.categoryId) {
    doc.categories = [{ _type: 'reference', _ref: data.categoryId }];
  }

  if (data.coverImageUrl) {
    try {
      const assetId = await uploadAsset(data.coverImageUrl);
      doc.coverImage = { _type: 'image', asset: { _ref: assetId } };
    } catch (err: any) {
      console.warn('[createSanityArticle] Cover image asset upload failed, continuing without cover image:', err?.message);
    }
  }

  return sanityWriteClient.create(doc);
}



/* Portable text to HTML */
import { toHTML } from '@portabletext/to-html';

export function portableTextToHtml(value: any, coverImageUrl?: string): string {
  if (!value) return '';

  const normCoverUrl = coverImageUrl && typeof coverImageUrl === 'string' ? coverImageUrl.trim().toLowerCase() : undefined;

  return toHTML(value, {
    components: {
      types: {
        imageBlock: ({ value }: any) => {
          const url = value?.url || value?.src || (value?.asset ? safeImageUrl(value) : '');
          if (!url) return '';
          if (normCoverUrl && url.trim().toLowerCase() === normCoverUrl) {
            return '';
          }
          const alt = value?.alt ? String(value.alt).replace(/"/g, '&quot;') : 'Blog image';
          const caption = value?.caption ? `<figcaption class="image-caption">${value.caption}</figcaption>` : '';
          return `<figure class="article-image-figure" style="margin: 24px 0;"><img src="${url}" alt="${alt}" class="article-body-img" loading="lazy" referrerpolicy="no-referrer" style="width:100%; height:auto; border-radius:12px; display:block;" />${caption}</figure>`;
        },
        image: ({ value }: any) => {
          const url = safeImageUrl(value) || value?.url || value?.src;
          if (!url) return '';
          if (normCoverUrl && url.trim().toLowerCase() === normCoverUrl) {
            return '';
          }
          const alt = value?.alt ? String(value.alt).replace(/"/g, '&quot;') : 'Blog image';
          const caption = value?.caption ? `<figcaption class="image-caption">${value.caption}</figcaption>` : '';
          return `<figure class="article-image-figure" style="margin: 24px 0;"><img src="${url}" alt="${alt}" class="article-body-img" loading="lazy" referrerpolicy="no-referrer" style="width:100%; height:auto; border-radius:12px; display:block;" />${caption}</figure>`;
        },
        img: ({ value }: any) => {
          const url = value?.url || value?.src || safeImageUrl(value);
          if (!url) return '';
          if (normCoverUrl && url.trim().toLowerCase() === normCoverUrl) {
            return '';
          }
          const alt = value?.alt ? String(value.alt).replace(/"/g, '&quot;') : 'Blog image';
          return `<img src="${url}" alt="${alt}" class="article-body-img" loading="lazy" referrerpolicy="no-referrer" style="width:100%; height:auto; border-radius:12px; display:block;" />`;
        },
      },
    },
  });
}
