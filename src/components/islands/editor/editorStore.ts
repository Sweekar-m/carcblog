/**
 * Nano Stores for the Publishing Studio.
 * Per AGENTS.md: cross-island and cross-component state lives in Nano Stores.
 * All stores are atom-based; derived state uses computed().
 */
import { atom, computed, map } from 'nanostores';
import type {
  DraftStatus,
  EditorUIState,
  OutlineItem,
  PortableTextContent,
  PublishMetadata,
  WritingStats,
} from '@/types/editor';

// ─── Clerk User ID ──────────────────────────────────────────────────────────
/**
 * The Clerk user ID of the currently authenticated writer.
 * Set once on editor mount from the server-rendered Astro page.
 * All localStorage keys and state resets are keyed to this value.
 */
export const $clerkUserId = atom<string | null>(null);

// ─── Draft key helpers ───────────────────────────────────────────────────────

/**
 * Returns the namespaced localStorage key for a user's draft.
 * Format: `carcblog:draft:{clerkUserId}`
 *
 * NEVER use a flat key — drafts must be isolated per user so that
 * User B does not see User A's draft after a logout→login cycle.
 */
export function draftKey(clerkUserId: string): string {
  return `carcblog:draft:${clerkUserId}`;
}

/**
 * The legacy unnamespaced draft key used before Phase 5.
 * Purge this on every editor mount so old drafts don't leak across users.
 */
export const LEGACY_DRAFT_KEY = 'carcblog_editor_draft_v1';

// ─── Default values ──────────────────────────────────────────────────────────

const DEFAULT_METADATA: PublishMetadata = {
  slug: '',
  tags: [],
  category: '',
  coverImageUrl: '',
  coverImageAlt: '',
  coverImageCredit: '',
  metaDescription: '',
  canonicalUrl: '',
  featured: false,
  publishStatus: 'draft',
  scheduledAt: null,
};

const DEFAULT_UI: EditorUIState = {
  leftSidebarOpen: true,
  rightPanelOpen: false,
  focusMode: false,
  previewMode: false,
};

const DEFAULT_STATS: WritingStats = {
  wordCount: 0,
  charCount: 0,
  paragraphCount: 0,
  readingTimeMinutes: 0,
};

// ─── Atoms ───────────────────────────────────────────────────────────────────

/** Article title — plain text, never raw HTML */
export const $title = atom<string>('');

/** Subtitle / excerpt — plain text */
export const $subtitle = atom<string>('');

/** Portable Text body — serialized from BlockNote on every change */
export const $content = atom<PortableTextContent>([]);

/** Raw BlockNote document — stored separately for draft snapshots */
export const $blockNoteDocument = atom<unknown>(null);

/** Publishing metadata */
export const $metadata = map<PublishMetadata>(DEFAULT_METADATA);

/** Draft save status */
export const $draftStatus = atom<DraftStatus>('idle');

/** Unix timestamp of last successful save */
export const $lastSavedAt = atom<number | null>(null);

/** UI state (sidebar open, focus mode, etc.) */
export const $ui = map<EditorUIState>(DEFAULT_UI);

/** Live writing statistics */
export const $stats = map<WritingStats>(DEFAULT_STATS);

/** Article outline extracted from headings in the document */
export const $outline = atom<OutlineItem[]>([]);

// ─── Derived atoms ───────────────────────────────────────────────────────────

/** Whether there are unsaved changes */
export const $isDirty = computed($draftStatus, (status) => status === 'dirty');

/** Human-readable save status label */
export const $saveStatusLabel = computed(
  [$draftStatus, $lastSavedAt],
  (status, savedAt): string => {
    switch (status) {
      case 'idle':
        return '';
      case 'dirty':
        return 'Unsaved';
      case 'saving':
        return 'Saving…';
      case 'saved': {
        if (!savedAt) return 'Saved';
        const diffSecs = Math.floor((Date.now() - savedAt) / 1000);
        if (diffSecs < 10) return 'Saved just now';
        if (diffSecs < 60) return `Saved ${diffSecs}s ago`;
        const diffMins = Math.floor(diffSecs / 60);
        return `Saved ${diffMins}m ago`;
      }
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  }
);

/** Word count target progress (0–1). Target is 1000 words. */
export const $wordCountProgress = computed($stats, (stats) =>
  Math.min(stats.wordCount / 1000, 1)
);

// ─── Actions ────────────────────────────────────────────────────────────────

/** Generate a URL-safe slug from a title string */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function countWordSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length <= 3) return 1;
  let count = (cleanWord.match(/[aeiouy]+/g) || []).length;
  if (cleanWord.endsWith('e')) count--;
  if (cleanWord.endsWith('le') && cleanWord.length > 2) count++;
  return Math.max(1, count);
}

/** Compute writing stats from a plain text string */
export function computeStats(plainText: string): WritingStats {
  const trimmed = plainText.trim();
  if (!trimmed) return DEFAULT_STATS;

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  // Count paragraphs as double-newline separated chunks (approximate)
  const paragraphCount = trimmed.split(/\n\n+/).filter(Boolean).length || 1;

  // Average adult reading speed: 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Count sentences
  const sentenceCount = Math.max(1, (trimmed.match(/[.!?]+/g) || []).length);

  // Count syllables
  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countWordSyllables(w);
  }

  // Flesch Reading Ease formula
  // Score = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const scoreRaw = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const readabilityScore = Math.max(0, Math.min(100, Math.round(scoreRaw)));

  let readabilityLabel = 'Standard';
  if (readabilityScore >= 90) readabilityLabel = 'Very Easy';
  else if (readabilityScore >= 80) readabilityLabel = 'Easy';
  else if (readabilityScore >= 70) readabilityLabel = 'Fairly Easy';
  else if (readabilityScore >= 60) readabilityLabel = 'Standard';
  else if (readabilityScore >= 50) readabilityLabel = 'Fairly Difficult';
  else if (readabilityScore >= 30) readabilityLabel = 'Difficult';
  else readabilityLabel = 'Very Confusing';

  return {
    wordCount,
    charCount,
    paragraphCount,
    readingTimeMinutes,
    readabilityScore,
    readabilityLabel,
  };
}

/** Extract title from BlockNote document for auto-slug generation */
export function syncSlugFromTitle(title: string): void {
  const currentSlug = $metadata.get().slug;
  // Only auto-generate if user hasn't manually set a slug
  if (!currentSlug || currentSlug === generateSlug($title.get())) {
    $metadata.setKey('slug', generateSlug(title));
  }
}

/** Toggle the left sidebar open/closed */
export function toggleLeftSidebar(): void {
  $ui.setKey('leftSidebarOpen', !$ui.get().leftSidebarOpen);
}

/** Toggle the right panel open/closed */
export function toggleRightPanel(): void {
  $ui.setKey('rightPanelOpen', !$ui.get().rightPanelOpen);
}

/** Toggle focus mode — hides both sidebars */
export function toggleFocusMode(): void {
  const next = !$ui.get().focusMode;
  $ui.setKey('focusMode', next);
  if (next) {
    // Hide both panels in focus mode
    $ui.setKey('leftSidebarOpen', false);
    $ui.setKey('rightPanelOpen', false);
  } else {
    // Restore left sidebar when exiting focus mode
    $ui.setKey('leftSidebarOpen', true);
  }
}

/** Toggle split preview mode */
export function togglePreviewMode(): void {
  $ui.setKey('previewMode', !$ui.get().previewMode);
}

// ─── Session isolation ───────────────────────────────────────────────────────

/**
 * Clear ALL editor state for a specific user, including:
 * - All Nano Store atoms and maps
 * - Their namespaced localStorage draft
 * - The legacy unnamespaced draft key
 *
 * Call this when the Clerk user changes (logout or account switch).
 * Accepts an optional `previousUserId` to also clear the outgoing user's draft.
 */
export function clearEditorState(previousUserId?: string | null): void {
  // 1. Nano Stores — atoms
  $title.set('');
  $subtitle.set('');
  $content.set([]);
  $blockNoteDocument.set(null);
  $draftStatus.set('idle');
  $lastSavedAt.set(null);
  $outline.set([]);

  // 2. Nano Stores — maps
  $metadata.set({
    slug: '',
    tags: [],
    category: '',
    coverImageUrl: '',
    coverImageAlt: '',
    coverImageCredit: '',
    metaDescription: '',
    canonicalUrl: '',
    featured: false,
    publishStatus: 'draft',
    scheduledAt: null,
  });
  $ui.set({
    leftSidebarOpen: true,
    rightPanelOpen: false,
    focusMode: false,
    previewMode: false,
  });
  $stats.set({
    wordCount: 0,
    charCount: 0,
    paragraphCount: 0,
    readingTimeMinutes: 0,
  });

  // 3. localStorage — remove outgoing user's draft
  if (previousUserId) {
    localStorage.removeItem(draftKey(previousUserId));
  }

  // 4. Always purge the legacy unnamespaced key
  localStorage.removeItem(LEGACY_DRAFT_KEY);
}

/**
 * On first editor mount, remove any legacy unnamespaced draft key
 * that may have been written by a previous session before Phase 5.
 * Also removes drafts belonging to any OTHER user found in localStorage.
 *
 * @param currentUserId - The active Clerk user ID.
 */
export function purgeOrphanDraftKeys(currentUserId: string): void {
  // Remove legacy key unconditionally
  localStorage.removeItem(LEGACY_DRAFT_KEY);

  // Scan for any carcblog:draft:{otherId} keys and remove them
  const prefix = 'carcblog:draft:';
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && key !== draftKey(currentUserId)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
