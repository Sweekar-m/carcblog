/**
 * ArticleEditorShell — Master React island for the Publishing Studio.
 * Orchestrates: layout, sidebars, lazy-loaded BlockNote, auto-save,
 * beforeunload guard, draft recovery, and keyboard shortcuts.
 * All state lives in Nano Stores — this component coordinates but never holds state.
 * Per design.md & AGENTS.md: icons from lucide-react. All values from CSS tokens.
 */
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useStore } from '@nanostores/react';
import {
  $blockNoteDocument,
  $clerkUserId,
  $content,
  $draftStatus,
  $lastSavedAt,
  $metadata,
  $outline,
  $stats,
  $subtitle,
  $title,
  $ui,
  clearEditorState,
  draftKey,
  generateSlug,
  purgeOrphanDraftKeys,
  LEGACY_DRAFT_KEY,
  toggleFocusMode,
  togglePreviewMode,
  toggleRightPanel,
} from './editor/editorStore';
import { EditorErrorBoundary } from './editor/ErrorBoundary';
import { BlockNoteLoadingSkeleton } from './editor/LoadingSkeleton';
import { EditorToolbar } from './editor/EditorToolbar';
import { LeftSidebar } from './editor/LeftSidebar';
import { RightPanel } from './editor/RightPanel';
import { TitleInput } from './editor/TitleInput';
import { SubtitleInput } from './editor/SubtitleInput';
import { DraftRecoveryBanner } from './editor/DraftRecoveryBanner';
import { PreviewPanel } from './editor/PreviewPanel';
import { KeyboardShortcutsModal } from './editor/KeyboardShortcutsModal';
import { PexelsModal } from './editor/PexelsModal';
import type { DraftSnapshot } from '@/types/editor';

// ─── Lazy load BlockNote (largest chunk) ─────────────────────────────────────

const BlockNoteEditor = lazy(() =>
  import('./editor/BlockNoteEditor').then((m) => ({ default: m.BlockNoteEditor }))
);

// ─── Draft persistence key ───────────────────────────────────────────────────
// The key is always namespaced: carcblog:draft:{clerkUserId}
// LEGACY_DRAFT_KEY is imported from editorStore and purged on mount.

const AUTOSAVE_DEBOUNCE_MS = 2000;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArticleEditorShellProps {
  /**
   * The Clerk user ID of the authenticated writer.
   * Passed from the Astro page via SSR — never from client-side code.
   * Used to namespace localStorage draft keys and detect account switches.
   */
  clerkUserId: string;
}

export function ArticleEditorShell({ clerkUserId }: ArticleEditorShellProps) {
  const ui = useStore($ui);
  const draftStatus = useStore($draftStatus);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recoverySnapshot, setRecoverySnapshot] = useState<DraftSnapshot | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [pexelsOpen, setPexelsOpen] = useState(false);

  // ── Set $clerkUserId and purge orphan drafts on mount ───────────────────
  useEffect(() => {
    // Set the active user ID in the store — this is the single source of truth.
    $clerkUserId.set(clerkUserId);
    // Remove any draft keys belonging to other users and the legacy key.
    purgeOrphanDraftKeys(clerkUserId);
  }, [clerkUserId]);

  // ── Draft recovery on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(clerkUserId));
      if (!raw) return;
      const snapshot = JSON.parse(raw) as DraftSnapshot;
      const age = Date.now() - snapshot.savedAt;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (age < sevenDays && snapshot.title) {
        setRecoverySnapshot(snapshot);
      }
    } catch {
      localStorage.removeItem(draftKey(clerkUserId));
    }
  }, [clerkUserId]);

  const handleRestoreDraft = useCallback(() => {
    if (!recoverySnapshot) return;
    $title.set(recoverySnapshot.title);
    $subtitle.set(recoverySnapshot.subtitle);
    if (recoverySnapshot.metadata) {
      Object.entries(recoverySnapshot.metadata).forEach(([key, value]) => {
        $metadata.setKey(key as keyof typeof recoverySnapshot.metadata, value);
      });
    }
    setRecoverySnapshot(null);
  }, [recoverySnapshot]);

  const handleDismissDraft = useCallback(() => {
    localStorage.removeItem(draftKey(clerkUserId));
    setRecoverySnapshot(null);
  }, [clerkUserId]);

  // ── Auto-save to namespaced localStorage key ──────────────────────────────
  useEffect(() => {
    if (draftStatus !== 'dirty') return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      try {
        $draftStatus.set('saving');
        const snapshot: DraftSnapshot = {
          version: 1,
          savedAt: Date.now(),
          title: $title.get(),
          subtitle: $subtitle.get(),
          blockNoteDocument: $blockNoteDocument.get(),
          metadata: $metadata.get(),
        };
        localStorage.setItem(draftKey(clerkUserId), JSON.stringify(snapshot));
        $lastSavedAt.set(Date.now());
        $draftStatus.set('saved');

        const currentTitle = $title.get();
        document.title = currentTitle
          ? `${currentTitle} — Carcblog`
          : 'New Article — Carcblog';
      } catch {
        $draftStatus.set('error');
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [draftStatus, clerkUserId]);

  // ── Save on Cmd+S ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleSaveRequest = () => {
      $draftStatus.set('dirty');
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      try {
        $draftStatus.set('saving');
        const snapshot: DraftSnapshot = {
          version: 1,
          savedAt: Date.now(),
          title: $title.get(),
          subtitle: $subtitle.get(),
          blockNoteDocument: $blockNoteDocument.get(),
          metadata: $metadata.get(),
        };
        localStorage.setItem(draftKey(clerkUserId), JSON.stringify(snapshot));
        $lastSavedAt.set(Date.now());
        $draftStatus.set('saved');
      } catch {
        $draftStatus.set('error');
      }
    };
    window.addEventListener('editor:save-requested', handleSaveRequest);
    return () => window.removeEventListener('editor:save-requested', handleSaveRequest);
  }, [clerkUserId]);

  // ── beforeunload guard ────────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ($draftStatus.get() === 'dirty') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Leave anyway?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      // F = Focus mode toggle
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !isInput) {
        toggleFocusMode();
      }

      // ? = Keyboard Shortcuts modal toggle
      if (e.key === '?' && !isInput) {
        setShortcutsOpen((prev) => !prev);
      }

      // Cmd+P / Ctrl+P = Preview mode toggle
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePreviewMode();
      }

      // Escape = Close overlays and panels
      if (e.key === 'Escape') {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (pexelsOpen) setPexelsOpen(false);
        else if (ui.focusMode) toggleFocusMode();
        else if (ui.rightPanelOpen) toggleRightPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui.focusMode, ui.rightPanelOpen, shortcutsOpen, pexelsOpen]);

  // ── Open media search listener ───────────────────────────────────────────
  useEffect(() => {
    const handleOpenMedia = () => setPexelsOpen(true);
    window.addEventListener('editor:open-media-search', handleOpenMedia);
    return () => window.removeEventListener('editor:open-media-search', handleOpenMedia);
  }, []);

  // ── Insert image from Pexels handler ─────────────────────────────────────
  const handleSelectPexelsImage = useCallback((url: string, alt: string, credit: string) => {
    window.dispatchEvent(
      new CustomEvent('editor:insert-image', {
        detail: { url, alt, credit },
      })
    );
  }, []);
  // ── Clear all state when clerkUserId changes (account switch) ───────────────
  const prevClerkUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    const previousUserId = prevClerkUserIdRef.current;
    prevClerkUserIdRef.current = clerkUserId;

    // Skip the very first mount — no previous user to clear
    if (previousUserId === null) return;

    // User switched — abort pending autosave and clear all state
    if (previousUserId !== clerkUserId) {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
      clearEditorState(previousUserId);
      setRecoverySnapshot(null);
    }
  }, [clerkUserId]);


  // ── Auto-generate slug on title set if empty ─────────────────────────────
  useEffect(() => {
    const unsubscribe = $title.subscribe((title) => {
      if (!$metadata.get().slug && title) {
        $metadata.setKey('slug', generateSlug(title));
      }
    });
    return unsubscribe;
  }, []);

  const handlePublishClick = useCallback(() => {
    if (!ui.rightPanelOpen) toggleRightPanel();
  }, [ui.rightPanelOpen]);

  return (
    <div
      id="publishing-studio"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Exact viewport height
        background: 'var(--color-canvas)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <EditorErrorBoundary label="toolbar">
        <EditorToolbar onPublishClick={handlePublishClick} />
      </EditorErrorBoundary>

      {/* Draft recovery banner */}
      {recoverySnapshot && (
        <DraftRecoveryBanner
          snapshot={recoverySnapshot}
          onRestore={handleRestoreDraft}
          onDismiss={handleDismissDraft}
        />
      )}

      {/* Three-column body */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left sidebar */}
        <EditorErrorBoundary label="sidebar">
          <LeftSidebar />
        </EditorErrorBoundary>

        {/* Center — main writing area */}
        <main
          id="editor-main-content"
          role="main"
          aria-label="Article editor"
          style={{
            flex: ui.previewMode ? '0 0 50%' : 1,
            overflowY: 'auto',
            minWidth: 0,
            transition: 'flex var(--duration-200) var(--ease-out)',
            backgroundColor: 'var(--color-surface-card)', // Clean, paper-white sheet background
          }}
        >
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: 'var(--space-xxl)',
              paddingBottom: 'var(--space-xxl)',
              paddingLeft: 'var(--space-xl)', // Generous left padding to prevent edge compaction
              paddingRight: 'var(--space-xl)', // Generous right padding
              maxWidth: '740px',
              minHeight: '100%',
            }}
          >
            {/* Title */}
            <EditorErrorBoundary label="title">
              <TitleInput />
            </EditorErrorBoundary>

            {/* Subtitle */}
            <div style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <EditorErrorBoundary label="subtitle">
                <SubtitleInput />
              </EditorErrorBoundary>
            </div>

            {/* Divider between metadata and content */}
            <div
              style={{
                height: '1px',
                background: 'var(--color-hairline)',
                marginBottom: 'var(--space-xl)',
              }}
              aria-hidden="true"
            />

            {/* BlockNote rich text editor — lazy loaded */}
            <EditorErrorBoundary label="editor">
              <Suspense fallback={<BlockNoteLoadingSkeleton />}>
                <BlockNoteEditor
                  onContentChange={(content) => {
                    $content.set(content);
                  }}
                />
              </Suspense>
            </EditorErrorBoundary>

            {/* Bottom padding so content isn't obscured */}
            <div style={{ height: '30vh' }} aria-hidden="true" />
          </div>
        </main>

        {/* Right panel (Preview Panel) when split screen is active */}
        {ui.previewMode && (
          <EditorErrorBoundary label="preview panel">
            <PreviewPanel />
          </EditorErrorBoundary>
        )}

        {/* Right panel (Settings Panel) — slide in from right */}
        {ui.rightPanelOpen && !ui.previewMode && (
          <EditorErrorBoundary label="settings panel">
            <RightPanel onClose={toggleRightPanel} />
          </EditorErrorBoundary>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}

      {/* Pexels Image Search Modal */}
      {pexelsOpen && (
        <PexelsModal
          onClose={() => setPexelsOpen(false)}
          onSelect={handleSelectPexelsImage}
        />
      )}
    </div>
  );
}