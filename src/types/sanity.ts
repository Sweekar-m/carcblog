/**
 * TypeScript interfaces for Sanity CMS content types.
 * These mirror the actual Sanity schema definitions — keep in sync with the Studio schemas.
 *
 * NOTE: Portable Text `body` is represented as PortableTextBody (an array of typed blocks),
 * not `any`. Custom block types (imageBlock, image) are explicitly typed here.
 */

// ─── Asset & Image ─────────────────────────────────────────────────────────

/** A fully-dereferenced Sanity asset URL (resolved from ->url projection). */
export type SanityAssetUrl = string;

/** A raw Sanity image reference object (pre-projection). */
export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

/**
 * A Sanity image field as it arrives after GROQ projection:
 * `"coverImage": coalesce(coverImage.asset->url, coverImage)`
 * May be a resolved URL string OR a raw reference object.
 */
export type SanityImageField = SanityAssetUrl | SanityImageReference | null | undefined;

// ─── Portable Text Blocks ───────────────────────────────────────────────────

export interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

export interface PortableTextMarkDef {
  _type: string;
  _key: string;
  href?: string;
}

/** Standard Portable Text paragraph/heading/blockquote block. */
export interface PortableTextTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

/** Custom `imageBlock` type used in CarcBlog article bodies (from BlockNote editor). */
export interface PortableTextImageBlock {
  _type: 'imageBlock';
  _key?: string;
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
  asset?: SanityImageReference['asset'];
  props?: { url?: string };
}

/** Standard Sanity `image` block embedded inside Portable Text. */
export interface PortableTextEmbeddedImage {
  _type: 'image';
  _key?: string;
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
  asset?: SanityImageReference['asset'];
}

/** Union of all valid Portable Text block types in a CarcBlog article body. */
export type PortableTextBlock =
  | PortableTextTextBlock
  | PortableTextImageBlock
  | PortableTextEmbeddedImage;

/** The `body` field type on a Sanity article document. */
export type PortableTextBody = PortableTextBlock[];

// ─── Author ────────────────────────────────────────────────────────────────

/**
 * A Sanity author document as returned by GROQ projections.
 * Note: `image` arrives as coalesce(image.asset->url, image) — may be a string URL or raw ref.
 */
export interface SanityAuthor {
  _id: string;
  clerkUserId?: string;
  name: string;
  /** Resolved from `coalesce(image.asset->url, image)` — may be URL string or ref object. */
  image?: SanityImageField;
  bio?: string;
  email?: string;
}

// ─── Category ─────────────────────────────────────────────────────────────

export interface SanityCategory {
  _id: string;
  title: string;
  slug?: { current: string } | string;
  description?: string;
}

// ─── Article ───────────────────────────────────────────────────────────────

/**
 * A Sanity article document as returned by standard GROQ projections.
 *
 * Fields using coalesce projections:
 * - `coverImage`: `coalesce(coverImage.asset->url, coverImage)` — URL string or raw image ref
 * - `author.image`: `coalesce(image.asset->url, image)` — URL string or raw image ref
 */
export interface SanityArticle {
  _id: string;
  title: string;
  /** Slug may arrive as a full object `{ current: string }` or as a bare string. */
  slug: { current: string } | string;
  publishedAt?: string;
  excerpt?: string;
  /** Valid statuses matching the Sanity schema enum. */
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  /** Result of `coalesce(coverImage.asset->url, coverImage)`. */
  coverImage?: SanityImageField;
  /** Strongly-typed Portable Text body — not `any`. */
  body?: PortableTextBody;
  /** Dereferenced author document. */
  author?: SanityAuthor;
  categories?: SanityCategory[];
  tags?: string[];
  scheduledAt?: string;
}
