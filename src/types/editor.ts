/**
 * Shared TypeScript types for the Publishing Studio.
 * All editor state, portable text, and UI interfaces are defined here.
 * Mirror these against Sanity schemas in src/schemas/ where applicable.
 */

// ─── Portable Text ─────────────────────────────────────────────────────────

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

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'bullet' | 'number';
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
}

export type PortableTextContent = PortableTextBlock[];

// ─── Editor UI State ────────────────────────────────────────────────────────

export type DraftStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type PublishStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'unlisted';

export interface EditorUIState {
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  focusMode: boolean;
  previewMode: boolean;
}

// ─── Writing Statistics ──────────────────────────────────────────────────────

export interface WritingStats {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  /** Estimated reading time in minutes (avg 200wpm) */
  readingTimeMinutes: number;
  readabilityScore?: number;
  readabilityLabel?: string;
}

// ─── Outline ────────────────────────────────────────────────────────────────

export interface OutlineItem {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

// ─── Publish Metadata ────────────────────────────────────────────────────────

export interface PublishMetadata {
  articleId?: string | null;
  slug: string;
  tags: string[];
  category: string;
  coverImageUrl: string;
  coverImageAlt: string;
  coverImageCredit: string;
  metaDescription: string;
  canonicalUrl: string;
  featured: boolean;
  publishStatus: PublishStatus;
  scheduledAt: string | null;
}

// ─── Full Editor State ───────────────────────────────────────────────────────

export interface EditorState {
  title: string;
  subtitle: string;
  content: PortableTextContent;
  metadata: PublishMetadata;
  ui: EditorUIState;
  stats: WritingStats;
  outline: OutlineItem[];
  draftStatus: DraftStatus;
  lastSavedAt: number | null;
}

// ─── Draft Snapshot (localStorage) ──────────────────────────────────────────

export interface DraftSnapshot {
  version: 1;
  savedAt: number;
  title: string;
  subtitle: string;
  /** Raw BlockNote document JSON — not Portable Text */
  blockNoteDocument: unknown;
  metadata: PublishMetadata;
}

// ─── Pexels ─────────────────────────────────────────────────────────────────

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string | null;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

export interface PexelsSearchResult {
  photos: PexelsPhoto[];
  total_results: number;
  next_page: string | null;
}
