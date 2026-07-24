/**
 * TitleInput — Large, borderless, auto-growing article title.
 * Per design.md: display-xl (48px, weight 300, EB Garamond) is the closest display token.
 * Per AGENTS.md §5.2: font-serif is reserved for article H1/headlines — correct here.
 * Auto-focuses on mount; Tab moves to subtitle; Enter prevented.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $title, $draftStatus, syncSlugFromTitle } from './editorStore';

const PLACEHOLDER = 'Untitled article…';

export function TitleInput() {
  const titleValue = useStore($title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Grow the textarea to fit its content without a scrollbar */
  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => { autoGrow(); }, [autoGrow, titleValue]);

  // Autofocus on mount so writers can start typing immediately
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Strip newlines — the title is always a single line
      const sanitized = e.target.value.replace(/\n/g, '');
      $title.set(sanitized);
      $draftStatus.set('dirty');
      syncSlugFromTitle(sanitized);
      autoGrow();

      // Mark the browser tab with ● to indicate unsaved state
      document.title = sanitized
        ? `● ${sanitized} — Carcblog`
        : '● Untitled — Carcblog';
    },
    [autoGrow]
  );

  /** Tab moves focus to subtitle; Enter is prevented (title is single-line) */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      document.getElementById('editor-subtitle-input')?.focus();
    }
  }, []);

  return (
    <>
      {/* Scoped placeholder style — browser default placeholder gray overrides inline color */}
      <style>{`
        #editor-title-input::placeholder {
          color: var(--color-muted-soft);  /* #a8a29e — design.md disabled/placeholder token */
          opacity: 1;
        }
      `}</style>
      <textarea
        id="editor-title-input"
        ref={textareaRef}
        value={titleValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onInput={autoGrow}
        placeholder={PLACEHOLDER}
        rows={1}
        aria-label="Article title"
        aria-required="true"
        spellCheck
        autoComplete="off"
        autoCorrect="on"
        autoCapitalize="sentences"
        style={{
          // DM Sans 600, 44px, ls -0.02em per MiniMax design.md
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-semibold)',
          fontSize: 'clamp(32px, 5vw, 44px)',
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
          color: 'var(--color-ink-strong)',
          caretColor: 'var(--color-ink)',
          // Invisible input — pure writing surface
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          width: '100%',
          padding: '0',
          margin: '0',
          overflow: 'hidden',
        }}
      />
    </>
  );
}
