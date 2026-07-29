/**
 * EditorToolbar — Sticky top bar for the Publishing Studio.
 * Per design.md: button-tertiary-text for secondary actions, button-primary (ink pill) for Publish.
 * Per AGENTS.md: icons from lucide-react only.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  ArrowLeft,
  Focus,
  Eye,
  Settings2,
  Upload,
  Loader2,
  Save,
  SlidersHorizontal,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import {
  $draftStatus,
  $saveStatusLabel,
  $title,
  $ui,
  toggleFocusMode,
  togglePreviewMode,
  toggleRightPanel,
} from './editorStore';
import type { DraftStatus } from '@/types/editor';
import { AIWriterMenu } from './AIWriterMenu';

// ─── Auto-save status badge ───────────────────────────────────────────────────

function AutoSaveStatus() {
  const status = useStore($draftStatus) as DraftStatus;
  const label = useStore($saveStatusLabel);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') setVisible(true);
    if (status === 'saved') {
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  if (!visible || !label) return null;

  return (
    <span
      className="flex items-center gap-xxs"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        lineHeight: 'var(--lh-caption)',
        color: status === 'error' ? 'var(--color-error)' : 'var(--color-muted)',
      }}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {status === 'saving' && (
        <Loader2
          size={12}
          className="animate-spin"
          aria-hidden="true"
          strokeWidth={1.5}
        />
      )}
      {label}
    </span>
  );
}

// ─── Toolbar secondary button (button-tertiary-text pattern from design.md) ───

interface TertiaryButtonProps {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
  id: string;
}

function TertiaryButton({ onClick, label, active = false, children, id }: TertiaryButtonProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xxs)',
        height: '32px',
        padding: '0 var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-medium)',
        lineHeight: '1',
        background: active ? 'var(--color-surface-strong)' : 'transparent',
        color: active ? 'var(--color-body-strong)' : 'var(--color-muted)',
        transition: `color var(--duration-150) var(--ease-out), background var(--duration-150) var(--ease-out)`,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-strong)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

// ─── Icon button (for back arrow — no label text) ────────────────────────────

interface IconButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  id: string;
}

function IconButton({ onClick, label, children, id }: IconButtonProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        color: 'var(--color-muted)',
        transition: `color var(--duration-150) var(--ease-out), background var(--duration-150) var(--ease-out)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-body-strong)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-strong)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ─── Vertical divider ─────────────────────────────────────────────────────────

function ToolbarDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '1px',
        height: '16px',
        background: 'var(--color-hairline)',
        flexShrink: 0,
        margin: '0 var(--space-xxs)',
      }}
    />
  );
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  /** Called when the Publish button is clicked — opens the right panel */
  onPublishClick: () => void;
  /** Called when the mobile More Tools button is clicked */
  onOpenTools?: () => void;
}

export function EditorToolbar({ onPublishClick, onOpenTools }: EditorToolbarProps) {
  const title = useStore($title);
  const ui = useStore($ui);
  const [scrolled, setScrolled] = useState(false);

  // Show truncated title in breadcrumb once scrolled past the title input
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = useCallback(() => {
    const unsaved = document.title.startsWith('●');
    if (unsaved) {
      const confirmed = window.confirm('You have unsaved changes. Leave the editor?');
      if (!confirmed) return;
    }
    window.location.href = '/dashboard/articles';
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-sm)',
        paddingLeft: 'var(--space-base)',
        paddingRight: 'var(--space-base)',
        borderBottom: `1px solid var(--color-hairline)`,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: `box-shadow var(--duration-200) var(--ease-out)`,
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* Left: back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', minWidth: 0, flex: '0 0 auto' }}>
        <IconButton id="editor-back-btn" onClick={handleBack} label="Back to articles">
          <ArrowLeft size={16} strokeWidth={1.75} />
        </IconButton>

        <nav
          aria-label="Editor breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xxs)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-caption)',
            color: 'var(--color-muted)',
          }}
        >
          <a
            href="/dashboard"
            style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-body-strong)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
          >
            Dashboard
          </a>
          <span aria-hidden="true">/</span>
          <a
            href="/dashboard/articles"
            style={{ color: 'var(--color-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-body-strong)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
          >
            Articles
          </a>
          {scrolled && title && (
            <>
              <span aria-hidden="true">/</span>
              <span
                style={{
                  color: 'var(--color-body-strong)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                }}
                title={title}
              >
                {title}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Center: auto-save status */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AutoSaveStatus />
      </div>

      {/* Right: tertiary actions + primary publish */}
      <div className="editor-toolbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto' }}>
        {/* Desktop actions (≥768px) */}
        <div className="hidden md:inline-flex items-center gap-xxs">
          <TertiaryButton
            id="editor-focus-mode-btn"
            onClick={toggleFocusMode}
            label={ui.focusMode ? 'Exit focus mode (F)' : 'Focus mode (F)'}
            active={ui.focusMode}
          >
            <Focus size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Focus</span>
          </TertiaryButton>

          <TertiaryButton
            id="editor-preview-btn"
            onClick={togglePreviewMode}
            label={ui.previewMode ? 'Exit preview' : 'Preview article'}
            active={ui.previewMode}
          >
            <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Preview</span>
          </TertiaryButton>

          <ToolbarDivider />

          <AIWriterMenu />

          <TertiaryButton
            id="editor-media-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('editor:open-media-search'))}
            label="Search and insert images"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>Media</span>
          </TertiaryButton>

          <TertiaryButton
            id="editor-save-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('editor:save-requested'))}
            label="Save draft (Ctrl+S / Cmd+S)"
            active={status === 'saving'}
          >
            <Save size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Save</span>
          </TertiaryButton>

          <TertiaryButton
            id="editor-settings-btn"
            onClick={toggleRightPanel}
            label="Article settings"
            active={ui.rightPanelOpen}
          >
            <Settings2 size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Settings</span>
          </TertiaryButton>
        </div>

        {/* Mobile quick actions (<768px): AI Assistant & Media Search */}
        <button
          id="editor-mobile-ai-btn"
          type="button"
          className="inline-flex md:hidden items-center justify-center"
          onClick={() => window.dispatchEvent(new CustomEvent('editor:open-ai-chat'))}
          aria-label="AI Writing Assistant"
          title="AI Story Assistant"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            background: 'rgba(124, 58, 237, 0.08)',
            color: '#7C3AED',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={16} strokeWidth={2} />
        </button>

        <button
          id="editor-mobile-media-btn"
          type="button"
          className="inline-flex md:hidden items-center justify-center"
          onClick={() => window.dispatchEvent(new CustomEvent('editor:open-media-search'))}
          aria-label="Search media images"
          title="Media Search"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-hairline)',
            background: 'var(--color-surface)',
            color: 'var(--color-ink)',
            cursor: 'pointer',
          }}
        >
          <ImageIcon size={16} strokeWidth={1.75} />
        </button>

        {/* Primary Publish button (always visible) */}
        <button
          id="editor-publish-btn"
          type="button"
          onClick={onPublishClick}
          aria-label="Publish article"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-xxs)',
            height: '36px',
            padding: '0 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 'var(--fw-medium)',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            transition: `background var(--duration-200) var(--ease-out)`,
          }}
        >
          <Upload size={13} strokeWidth={2} aria-hidden="true" />
          <span>Publish</span>
        </button>

        {/* Mobile "More Tools" Button (<768px) */}
        <button
          id="editor-mobile-more-tools-btn"
          type="button"
          className="inline-flex md:hidden items-center justify-center"
          onClick={onOpenTools}
          aria-label="More editor tools"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-hairline)',
            background: 'var(--color-surface)',
            color: 'var(--color-ink)',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}
