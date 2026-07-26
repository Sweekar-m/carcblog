/**
 * Zod validation schemas for article API routes.
 * Used by POST /api/articles (create) and PUT/PATCH /api/articles/[id] (update).
 */
import { z } from 'zod';

const ARTICLE_STATUSES = ['draft', 'published', 'scheduled', 'archived'] as const;

/** Slug: lowercase, alphanumeric, hyphens only, 3-100 chars */
const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be under 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens');

/**
 * Schema for POST /api/articles — create a new article.
 * title, slug, and body are required; all others optional.
 */
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  slug: slugSchema,
  excerpt: z.string().max(500, 'Excerpt must be under 500 characters').optional(),
  /** Portable Text body — array of blocks, or a raw markdown string. */
  body: z.union([z.array(z.record(z.unknown())), z.string()]),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  status: z.enum(ARTICLE_STATUSES).default('draft'),
  categoryId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags').optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

/**
 * Schema for PUT/PATCH /api/articles/[id] — update an existing article.
 * All fields are optional (partial update).
 */
export const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(500).optional(),
  body: z.union([z.array(z.record(z.unknown())), z.string()]).optional(),
  coverImage: z.string().url().optional().or(z.literal('')).optional(),
  status: z.enum(ARTICLE_STATUSES).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
  publishedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
