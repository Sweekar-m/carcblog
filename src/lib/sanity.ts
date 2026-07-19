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
console.log('Sanity write client token present:', !!sanityApiToken, 'prefix:', sanityApiToken ? sanityApiToken.slice(0, 6) : 'undefined');
export const sanityWriteClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID ?? import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION ?? '2023-05-03',
  token: sanityApiToken,
  useCdn: false,
});

// Image URL builder
export const urlFor = (source: any) => imageUrlBuilder(sanityClient).image(source);

/* Types */
export interface SanityArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  excerpt?: string;
  coverImage?: { asset: { _ref: string } };
  author?: {
    _ref: string;
    name?: string;
    image?: { asset: { _ref: string } };
    bio?: string;
  };
  body?: any;
}
export interface SanityAuthor {
  _id: string;
  clerkUserId: string;
  name: string;
  email?: string;
  image?: { asset: { _ref: string } };
  bio?: string;
}

/* Read-only fetch */
export async function getSanityArticles(opts: { limit?: number; authorId?: string }): Promise<SanityArticle[]> {
  const { limit = 100, authorId } = opts;
  let q = '*[_type == "article" && defined(publishedAt)]';
  if (authorId) q += ' && author._ref == $authorId';
  q += ' | order(publishedAt desc) [0...$limit] { _id, title, slug, publishedAt, excerpt, coverImage, author->{ _id, name, "image": image.asset->url } }';
  const p: { limit: number; authorId?: string } = { limit };
  if (authorId) p.authorId = authorId;
  return sanityClient.fetch<SanityArticle[]>(q, p);
}
export async function getSanityArticleBySlug(slug: string): Promise<SanityArticle | null> {
  return sanityClient.fetch<SanityArticle | null>(`*[_type == "article" && slug.current == $slug][0] { _id, title, slug, publishedAt, excerpt, coverImage, author->{ _id, name, "image": image.asset->url }, body }`, { slug });
}
export async function getSanityArticlesByAuthor(authorId: string, limit = 100): Promise<SanityArticle[]> {
  return sanityClient.fetch<SanityArticle[]>(`*[_type == "article" && author._ref == $authorId && defined(publishedAt)] | order(publishedAt desc)[0...$limit] { _id, title, slug, publishedAt, excerpt, coverImage, author->{ _id, name, "image": image.asset->url } }`, { authorId, limit });
}
export async function getRecentSanityArticles(limit = 10): Promise<SanityArticle[]> {
  return sanityClient.fetch<SanityArticle[]>(`*[_type == "article" && defined(publishedAt)] | order(publishedAt desc)[0...$limit] { _id, title, slug, publishedAt, excerpt, coverImage, author->{ _id, name, "image": image.asset->url } }`, { limit });
}

/* Author helpers */
export async function ensureAuthorDocument(clerkUserId: string, name: string, email?: string, imageUrl?: string): Promise<string> {
  const existing = await sanityWriteClient.fetch<{ _id: string }[]>(`*[_type == "author" && clerkUserId == $id][0] { _id }`, { id: clerkUserId });
  if (existing?.[0]?._id) return existing[0]._id;
  const doc: any = { _type: 'author', clerkUserId, name };
  if (email) doc.email = email;
  if (imageUrl) {
    const assetId = await uploadAsset(imageUrl);
    doc.image = { _type: 'image', asset: { _ref: assetId } };
  }
  const created = await sanityWriteClient.create(doc);
  return created._id;
}
async function uploadAsset(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  const contentType = resp.headers.get('content-type') || 'image/jpeg';
  const asset = await sanityWriteClient.assets.upload('image', buffer, { filename: new URL(url).pathname.split('/').pop() || 'upload.jpg', contentType });
  return asset.document._id;
}

/* Create article */
export async function createSanityArticle(data: {
  title: string;
  slug: string;
  excerpt?: string;
  body?: any;
  coverImageUrl?: string;
  authorClerkId: string;
  status: 'draft' | 'published';
  authorName?: string;
  authorImageUrl?: string;
}) {
  const authorId = await ensureAuthorDocument(
    data.authorClerkId,
    data.authorName ?? 'Unknown',
    undefined, // email not stored
    data.authorImageUrl
  );
  const doc: any = {
    _type: 'article',
    title: data.title,
    slug: { current: data.slug },
    excerpt: data.excerpt ?? null,
    body: data.body ?? null,
    publishedAt: data.status === 'published' ? new Date().toISOString() : null,
    author: { _type: 'reference', _ref: authorId },
  };
  if (data.coverImageUrl) {
    const assetId = await uploadAsset(data.coverImageUrl);
    doc.coverImage = { _type: 'image', asset: { _ref: assetId } };
  }
  return sanityWriteClient.create(doc);
}

/* Portable text to HTML */
import { toHTML } from '@portabletext/to-html';
export function portableTextToHtml(value: any): string {
  return toHTML(value);
}
