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
import { SlidersHorizontal, X, BarChart3, ListTree, Settings, Upload } from 'lucide-react';
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
  /**
   * Optional initial article data when editing an existing article by ID.
   */
  initialArticle?: any;
}

export function ArticleEditorShell({ clerkUserId, initialArticle }: ArticleEditorShellProps) {
  const ui = useStore($ui);
  const draftStatus = useStore($draftStatus);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recoverySnapshot, setRecoverySnapshot] = useState<DraftSnapshot | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [pexelsOpen, setPexelsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobileToolsTab, setMobileToolsTab] = useState<'stats' | 'outline' | 'publish'>('stats');

  // ── Populate initial article if editing an existing article ────────────
  useEffect(() => {
    if (initialArticle) {
      if (initialArticle._id) $metadata.setKey('articleId', initialArticle._id);
      if (initialArticle.title) $title.set(initialArticle.title);
      if (initialArticle.excerpt) $subtitle.set(initialArticle.excerpt);
      if (initialArticle.status) $metadata.setKey('publishStatus', initialArticle.status);
      $metadata.setKey('slug', initialArticle.slug?.current || generateSlug(initialArticle.title || ''));
      if (initialArticle.coverImage) {
        const coverUrl = typeof initialArticle.coverImage === 'string'
          ? initialArticle.coverImage
          : initialArticle.coverImage?.url || initialArticle.coverImage?.asset?.url || initialArticle.coverImage?.src || '';
        $metadata.setKey('coverImageUrl', coverUrl);
      }
      if (initialArticle.body) {
        $content.set(initialArticle.body);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('editor:load-article-body', { detail: { body: initialArticle.body } }));
        }, 150);
      }
      document.title = `Edit "${initialArticle.title || 'Article'}" — Carcblog`;
    }
  }, [initialArticle]);

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
        else if (mobileToolsOpen) setMobileToolsOpen(false);
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
        height: '100vh',
        background: 'var(--color-canvas)',
        overflow: 'hidden',
        position: 'relative', // establish stacking context for orbs
      }}
    >
      {/* ── Atmospheric gradient orbs — design.md signature decoration ── */}
      <style>{`
        @keyframes editor-orb-drift-1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(5%, 3%) scale(1.07); }
          66%  { transform: translate(-3%, 6%) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes editor-orb-drift-2 {
          0%   { transform: translate(0, 0) scale(1); }
          40%  { transform: translate(-6%, -4%) scale(1.05); }
          80%  { transform: translate(4%, -2%) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes editor-orb-drift-3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(3%, -5%) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .editor-atm-orb { animation: none !important; }
        }
      `}</style>

      {/* Orb 1 — mint, top-left, large */}
      <div
        className="editor-atm-orb"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-10%',
          left: '-8%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'var(--color-gradient-mint)', /* #a7e5d3 */
          filter: 'blur(100px)',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'editor-orb-drift-1 22s ease-in-out infinite',
        }}
      />
      {/* Orb 2 — peach, top-right */}
      <div
        className="editor-atm-orb"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-5%',
          right: '-5%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'var(--color-gradient-peach)', /* #f4c5a8 */
          filter: 'blur(90px)',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'editor-orb-drift-2 18s ease-in-out infinite',
          animationDelay: '-6s',
        }}
      />
      {/* Orb 3 — lavender, center-left */}
      <div
        className="editor-atm-orb"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '35%',
          left: '5%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'var(--color-gradient-lavender)', /* #c8b8e0 */
          filter: 'blur(110px)',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'editor-orb-drift-3 26s ease-in-out infinite',
          animationDelay: '-12s',
        }}
      />
      {/* Orb 4 — sky, bottom-right */}
      <div
        className="editor-atm-orb"
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-8%',
          right: '10%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'var(--color-gradient-sky)', /* #a8c8e8 */
          filter: 'blur(120px)',
          opacity: 0.28,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'editor-orb-drift-1 24s ease-in-out infinite',
          animationDelay: '-9s',
        }}
      />
      {/* Orb 5 — rose, bottom-left */}
      <div
        className="editor-atm-orb"
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '5%',
          left: '20%',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'var(--color-gradient-rose)', /* #e8b8c4 */
          filter: 'blur(90px)',
          opacity: 0.22,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'editor-orb-drift-2 20s ease-in-out infinite',
          animationDelay: '-3s',
        }}
      />

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
          position: 'relative',
          zIndex: 1,
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
            backgroundColor: 'rgba(255, 255, 255, 0.88)', /* semi-transparent so orbs bleed through */
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="w-full px-4 sm:px-6 md:px-8"
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: 'var(--space-xl)',
              paddingBottom: 'var(--space-xxl)',
              maxWidth: '740px',
              minHeight: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Cover Image Banner */}
            {useStore($metadata).coverImageUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px', boxShadow: 'var(--shadow-subtle)' }}>
                <img src={useStore($metadata).coverImageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setPexelsOpen(true)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.75)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Change Cover</button>
                  <button onClick={() => $metadata.setKey('coverImageUrl', '')} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Remove Cover</button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <button onClick={() => setPexelsOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px dashed var(--color-hairline-strong)', background: 'transparent', color: 'var(--color-steel)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  + Add Cover Image (Unsplash / Pexels)
                </button>
              </div>
            )}

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

      {/* Floating Action Button ("Tools") on Mobile screens (<768px) */}
      <button
        id="editor-mobile-tools-fab"
        type="button"
        onClick={() => setMobileToolsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '48px',
          padding: '0 20px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          border: 'none',
          boxShadow: 'var(--shadow-modal)',
          cursor: 'pointer',
        }}
        className="md:hidden"
        aria-label="Open editor tools"
      >
        <SlidersHorizontal size={16} />
        <span>Tools</span>
      </button>

      {/* Mobile Tools Bottom Sheet Overlay (<768px) */}
      {mobileToolsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
          className="md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop click */}
          <div
            style={{ position: 'absolute', inset: 0 }}
            onClick={() => setMobileToolsOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxHeight: '85vh',
              backgroundColor: 'var(--color-canvas)',
              borderTop: '1px solid var(--color-hairline)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-hairline)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
                Editor Studio Tools
              </span>
              <button
                onClick={() => setMobileToolsOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-steel)',
                  cursor: 'pointer',
                }}
                aria-label="Close tools sheet"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-surface-soft)', padding: '6px' }}>
              <button
                onClick={() => setMobileToolsTab('stats')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '40px',
                  borderRadius: '8px',
                  border: mobileToolsTab === 'stats' ? '1px solid var(--color-hairline)' : 'none',
                  background: mobileToolsTab === 'stats' ? 'var(--color-canvas)' : 'transparent',
                  color: mobileToolsTab === 'stats' ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <BarChart3 size={14} />
                <span>Stats</span>
              </button>
              <button
                onClick={() => setMobileToolsTab('outline')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '40px',
                  borderRadius: '8px',
                  border: mobileToolsTab === 'outline' ? '1px solid var(--color-hairline)' : 'none',
                  background: mobileToolsTab === 'outline' ? 'var(--color-canvas)' : 'transparent',
                  color: mobileToolsTab === 'outline' ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ListTree size={14} />
                <span>Outline ({useStore($outline).length})</span>
              </button>
              <button
                onClick={() => setMobileToolsTab('publish')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '40px',
                  borderRadius: '8px',
                  border: mobileToolsTab === 'publish' ? '1px solid var(--color-hairline)' : 'none',
                  background: mobileToolsTab === 'publish' ? 'var(--color-canvas)' : 'transparent',
                  color: mobileToolsTab === 'publish' ? 'var(--color-ink)' : 'var(--color-steel)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Settings size={14} />
                <span>Publish</span>
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ padding: '20px', overflowY: 'auto', minHeight: '220px' }}>
              {mobileToolsTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-stone)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Words</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>{useStore($stats).wordCount.toLocaleString()}</span>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-stone)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Characters</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>{useStore($stats).charCount.toLocaleString()}</span>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-stone)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Paragraphs</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>{useStore($stats).paragraphCount}</span>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-stone)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Read Time</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>{useStore($stats).readingTimeMinutes} min</span>
                    </div>
                  </div>
                </div>
              )}

              {mobileToolsTab === 'outline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {useStore($outline).length > 0 ? (
                    useStore($outline).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMobileToolsOpen(false);
                          const el = document.querySelector(`[data-id="${item.id}"]`);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--color-steel)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '44px',
                        }}
                      >
                        {item.level === 2 ? '↳ ' : item.level >= 3 ? '  └ ' : ''}{item.text}
                      </button>
                    ))
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-stone)', italic: 'true' }}>Add headings in the editor to populate your outline.</p>
                  )}
                </div>
              )}

              {mobileToolsTab === 'publish' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-steel)' }}>Configure article category, tags, custom slug, or publish your draft directly.</p>
                  <button
                    onClick={() => {
                      setMobileToolsOpen(false);
                      handlePublishClick();
                    }}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Upload size={16} />
                    <span>Open Article Settings & Publish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}