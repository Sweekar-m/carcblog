/**
 * BlockNoteEditor — Rich text editor core for the Publishing Studio.
 * Lazy-loaded via React.lazy(). Converts BlockNote document → Portable Text on change.
 * Manages: slash commands, markdown shortcuts, keyboard shortcuts, outline extraction.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  $blockNoteDocument,
  $content,
  $draftStatus,
  $outline,
  $stats,
  computeStats,
} from './editorStore';
import type { OutlineItem, PortableTextContent, PortableTextSpan } from '@/types/editor';

// ─── Portable Text conversion ─────────────────────────────────────────────────

function inlineContentToSpans(content: unknown[]): PortableTextSpan[] {
  return content.map((item: unknown) => {
    const node = item as Record<string, unknown>;
    if (node.type === 'text') {
      const styles = (node.styles as Record<string, boolean> | undefined) ?? {};
      const marks: string[] = [];
      if (styles.bold) marks.push('strong');
      if (styles.italic) marks.push('em');
      if (styles.underline) marks.push('underline');
      if (styles.strike) marks.push('strike-through');
      if (styles.code) marks.push('code');
      return {
        _type: 'span' as const,
        _key: (node.id as string | undefined) ?? Math.random().toString(36).slice(2),
        text: (node.text as string) ?? '',
        marks,
      };
    }
    if (node.type === 'link') {
      const linkContent = (node.content as unknown[]) ?? [];
      const text = linkContent
        .map((c) => ((c as Record<string, unknown>).text as string) ?? '')
        .join('');
      return {
        _type: 'span' as const,
        _key: Math.random().toString(36).slice(2),
        text,
        marks: [],
      };
    }
    return { _type: 'span' as const, _key: Math.random().toString(36).slice(2), text: '', marks: [] };
  });
}

function blockNoteDocumentToPortableText(doc: unknown[]): PortableTextContent {
  const blocks: PortableTextContent = [];

  for (const rawBlock of doc) {
    const block = rawBlock as Record<string, unknown>;
    const blockContent = Array.isArray(block.content) ? block.content : [];
    const blockId = (block.id as string | undefined) ?? Math.random().toString(36).slice(2);

    if (block.type === 'image') {
      const props = (block.props as Record<string, unknown> | undefined) ?? {};
      blocks.push({
        _type: 'imageBlock',
        _key: blockId,
        url: (props.url as string) ?? '',
        alt: (props.name as string) ?? '',
        caption: (props.caption as string) ?? '',
      } as any);
      continue;
    }

    let style: PortableTextContent[number]['style'] = 'normal';

    switch (block.type) {
      case 'paragraph':
        style = 'normal';
        break;
      case 'heading': {
        const props = (block.props as Record<string, unknown> | undefined) ?? {};
        const level = Math.min(Number(props.level) || 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
        style = `h${level}` as PortableTextContent[number]['style'];
        break;
      }
      case 'quote':
      case 'blockquote':
        style = 'blockquote';
        break;
      case 'bulletListItem':
        style = 'bullet';
        break;
      case 'numberedListItem':
        style = 'number';
        break;
      case 'checkListItem':
        style = 'bullet';
        break;
      default:
        style = 'normal';
    }

    const children = inlineContentToSpans(blockContent);
    const hasText = children.some((c) => c.text.trim().length > 0);

    if (hasText) {
      blocks.push({
        _type: 'block',
        _key: blockId,
        style,
        children,
        markDefs: [],
      });
    }
  }

  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      _key: 'empty',
      style: 'normal',
      children: [{ _type: 'span', _key: 'empty-span', text: '', marks: [] }],
      markDefs: [],
    });
  }

  return blocks;
}

// ─── Outline extraction ───────────────────────────────────────────────────────

function extractOutline(doc: unknown[]): OutlineItem[] {
  const outline: OutlineItem[] = [];
  for (const rawBlock of doc) {
    const block = rawBlock as Record<string, unknown>;
    if (block.type !== 'heading') continue;
    const props = (block.props as Record<string, unknown> | undefined) ?? {};
    const level = (Math.min(Number(props.level) || 1, 6) as 1 | 2 | 3 | 4 | 5 | 6);
    const content = Array.isArray(block.content) ? block.content : [];
    const text = content
      .map((c) => ((c as Record<string, unknown>).text as string) ?? '')
      .join('');
    if (text.trim()) {
      outline.push({
        id: (block.id as string | undefined) ?? Math.random().toString(36).slice(2),
        text: text.trim(),
        level,
      });
    }
  }
  return outline;
}

// ─── Plain text extraction (for stats) ───────────────────────────────────────

function extractPlainText(doc: unknown[]): string {
  return doc
    .map((rawBlock) => {
      const block = rawBlock as Record<string, unknown>;
      const content = Array.isArray(block.content) ? block.content : [];
      return content
        .map((c) => ((c as Record<string, unknown>).text as string) ?? '')
        .join('');
    })
    .join('\n');
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BlockNoteEditorProps {
  /** Called with Portable Text content on every change — for form submission */
  onContentChange?: (content: PortableTextContent) => void;
}

// Custom file uploader targeting the /api/upload proxy
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { error?: string };
    throw new Error(errorData.error || 'Failed to upload image.');
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

// ─── Portable Text to Markdown conversion ──────────────────────────────────

export function portableTextToMarkdown(body: any): string {
  if (!body) return '';
  if (typeof body === 'string') return body;

  if (Array.isArray(body)) {
    const lines: string[] = [];
    for (const rawBlock of body) {
      if (!rawBlock) continue;

      if (rawBlock._type === 'imageBlock' || rawBlock._type === 'image') {
        const url =
          rawBlock.url ||
          rawBlock.src ||
          rawBlock.props?.url ||
          (typeof rawBlock.asset === 'string' ? rawBlock.asset : rawBlock.asset?.url);
        if (url) {
          const alt = rawBlock.alt || rawBlock.caption || 'Image';
          lines.push(`![${alt}](${url})`);
        }
        continue;
      }

      if (rawBlock._type === 'block' || !rawBlock._type) {
        let text = '';
        if (Array.isArray(rawBlock.children)) {
          text = rawBlock.children.map((c: any) => c.text || '').join('');
        } else if (typeof rawBlock.children === 'string') {
          text = rawBlock.children;
        }

        const style = rawBlock.style || 'normal';
        if (style === 'h1') lines.push(`# ${text}`);
        else if (style === 'h2') lines.push(`## ${text}`);
        else if (style === 'h3') lines.push(`### ${text}`);
        else if (style === 'blockquote') lines.push(`> ${text}`);
        else if (style === 'bullet') lines.push(`- ${text}`);
        else if (style === 'number') lines.push(`1. ${text}`);
        else if (text.trim()) lines.push(text);
      }
    }
    return lines.join('\n\n');
  }

  return '';
}

export function BlockNoteEditor({ onContentChange }: BlockNoteEditorProps) {
  // Memoize options including uploadFile so the editor never re-initializes
  const editorOptions = useMemo(() => ({
    uploadFile,
  }), []);

  const editor = useCreateBlockNote(editorOptions);

  // Load initial article body into BlockNote editor when ready or when editor:load-article-body triggers
  const initialLoadedRef = useRef<boolean>(false);

  const loadBodyBlocks = useCallback(async (bodyData: any) => {
    if (!editor || !bodyData) return;
    try {
      const markdown = portableTextToMarkdown(bodyData);
      if (markdown && markdown.trim()) {
        const blocks = await editor.tryParseMarkdownToBlocks(markdown);
        if (blocks && blocks.length > 0) {
          editor.replaceBlocks(editor.document, blocks);
          initialLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error('Failed to replace blocks in BlockNote:', err);
    }
  }, [editor]);

  useEffect(() => {
    if (initialLoadedRef.current || !editor) return;
    const storeContent = $content.get();
    if (storeContent && ((Array.isArray(storeContent) && storeContent.length > 0) || typeof storeContent === 'string')) {
      loadBodyBlocks(storeContent);
    }
  }, [editor, loadBodyBlocks]);

  useEffect(() => {
    const handleLoadEvent = (e: CustomEvent<{ body: any }>) => {
      if (e.detail?.body) {
        loadBodyBlocks(e.detail.body);
      }
    };
    window.addEventListener('editor:load-article-body', handleLoadEvent as EventListener);
    return () => window.removeEventListener('editor:load-article-body', handleLoadEvent as EventListener);
  }, [loadBodyBlocks]);

  const handleChange = useCallback(() => {
    const doc = editor.document as unknown[];

    // 1. Save raw document to store (for draft snapshots)
    $blockNoteDocument.set(doc);

    // 2. Convert to Portable Text
    const portableText = blockNoteDocumentToPortableText(doc);
    $content.set(portableText);

    // 3. Extract outline from headings
    $outline.set(extractOutline(doc));

    // 4. Compute writing stats from plain text
    const plainText = extractPlainText(doc);
    const stats = computeStats(plainText);
    $stats.set(stats);

    // 5. Mark as dirty for auto-save
    $draftStatus.set('dirty');

    // 6. Notify parent (for hidden form input)
    onContentChange?.(portableText);
  }, [editor, onContentChange]);

  // Programmatic image insertion event listener (for Pexels modal)
  useEffect(() => {
    const handleInsertImage = (e: CustomEvent<{ url: string; alt: string; credit?: string }>) => {
      const { url, alt, credit } = e.detail;
      const lastBlock = editor.document[editor.document.length - 1];
      
      // Insert image block
      editor.insertBlocks(
        [
          {
            type: 'image',
            props: {
              url,
              name: alt,
              caption: credit || '',
            },
          },
        ],
        lastBlock,
        'after'
      );
    };

    window.addEventListener('editor:insert-image', handleInsertImage as EventListener);

    // AI Writer: Insert Outline / Story
    const handleInsertOutline = async (e: CustomEvent<{ text: string }>) => {
      const outlineText = e.detail?.text;
      if (!outlineText || !editor) return;

      try {
        const blocksToInsert = await editor.tryParseMarkdownToBlocks(outlineText);
        if (blocksToInsert && blocksToInsert.length > 0) {
          const doc = editor.document;
          if (doc && doc.length > 0) {
            const lastBlock = doc[doc.length - 1];
            editor.insertBlocks(blocksToInsert, lastBlock, 'after');
            // If initial block was an empty default block, clean it up
            if (doc.length === 1 && (!doc[0].content || (Array.isArray(doc[0].content) && doc[0].content.length === 0))) {
              try { editor.removeBlocks([doc[0]]); } catch (err) {}
            }
          } else {
            try { editor.replaceBlocks(doc, blocksToInsert); } catch (err) {}
          }
        }
      } catch (parseErr) {
        console.error('Failed to parse Markdown with BlockNote, applying line fallback:', parseErr);
        const lines = outlineText.split('\n').map((l) => l.trim()).filter(Boolean);
        const fallbackBlocks: any[] = [];
        for (const line of lines) {
          if (line.startsWith('# ')) {
            fallbackBlocks.push({ type: 'heading', props: { level: 1 }, content: line.slice(2).trim() });
          } else if (line.startsWith('## ')) {
            fallbackBlocks.push({ type: 'heading', props: { level: 2 }, content: line.slice(3).trim() });
          } else if (line.startsWith('### ')) {
            fallbackBlocks.push({ type: 'heading', props: { level: 3 }, content: line.slice(4).trim() });
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            fallbackBlocks.push({ type: 'bulletListItem', content: line.slice(2).trim() });
          } else {
            fallbackBlocks.push({ type: 'paragraph', content: line });
          }
        }
        if (fallbackBlocks.length > 0) {
          const doc = editor.document;
          const lastBlock = doc && doc.length > 0 ? doc[doc.length - 1] : undefined;
          if (lastBlock) {
            editor.insertBlocks(fallbackBlocks, lastBlock, 'after');
          }
        }
      }
    };

    // AI Writer: Append / Continue Text
    const handleAppendText = async (e: CustomEvent<{ text: string }>) => {
      const text = e.detail?.text;
      if (!text || !editor) return;

      try {
        const blocksToInsert = await editor.tryParseMarkdownToBlocks(text);
        if (blocksToInsert && blocksToInsert.length > 0) {
          const doc = editor.document;
          const lastBlock = doc && doc.length > 0 ? doc[doc.length - 1] : undefined;
          if (lastBlock) {
            editor.insertBlocks(blocksToInsert, lastBlock, 'after');
          } else {
            try { editor.replaceBlocks(doc, blocksToInsert); } catch (err) {}
          }
        }
      } catch (parseErr) {
        const paragraphs = text.split('\n\n').map((p) => p.trim()).filter(Boolean);
        const blocksToInsert = paragraphs.map((p) => ({ type: 'paragraph', content: p }));
        if (blocksToInsert.length > 0) {
          const doc = editor.document;
          const lastBlock = doc && doc.length > 0 ? doc[doc.length - 1] : undefined;
          if (lastBlock) {
            editor.insertBlocks(blocksToInsert, lastBlock, 'after');
          }
        }
      }
    };

    // AI Writer: Replace Selection (Improve Selection)
    const handleReplaceSelection = (e: CustomEvent<{ text: string }>) => {
      const text = e.detail?.text;
      if (!text || !editor) return;

      const activeBlock = editor.getTextCursorPosition()?.block;
      const paragraphs = text.split('\n\n').map((p) => p.trim()).filter(Boolean);
      const blocksToInsert = paragraphs.map((p) => ({ type: 'paragraph', content: p }));

      if (activeBlock && blocksToInsert.length > 0) {
        editor.insertBlocks(blocksToInsert, activeBlock, 'after');
        editor.removeBlocks([activeBlock]);
      } else if (blocksToInsert.length > 0) {
        const lastBlock = editor.document[editor.document.length - 1];
        editor.insertBlocks(blocksToInsert, lastBlock, 'after');
      }
    };

    window.addEventListener('editor:ai-insert-outline', handleInsertOutline as EventListener);
    window.addEventListener('editor:ai-append-text', handleAppendText as EventListener);
    window.addEventListener('editor:ai-replace-selection', handleReplaceSelection as EventListener);

    return () => {
      window.removeEventListener('editor:insert-image', handleInsertImage as EventListener);
      window.removeEventListener('editor:ai-insert-outline', handleInsertOutline as EventListener);
      window.removeEventListener('editor:ai-append-text', handleAppendText as EventListener);
      window.removeEventListener('editor:ai-replace-selection', handleReplaceSelection as EventListener);
    };
  }, [editor]);

  // Keyboard shortcut: Cmd+S → explicit save trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Dispatch a custom event that the shell listens to for save
        window.dispatchEvent(new CustomEvent('editor:save-requested'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="blocknote-wrapper w-full"
      style={{
        // Make BlockNote feel like writing on paper — no container borders
        '--bn-font-family': 'var(--font-sans)',
        '--bn-font-size': '17px',
      } as React.CSSProperties}
    >
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={true}
        theme="light"
        // BlockNote renders its own floating toolbar and slash menu
        // These are enabled by default in BlockNote 0.52
      />

      {/* BlockNote theme overrides — scoped to this component */}
      <style>{`
        .blocknote-wrapper .bn-container {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .blocknote-wrapper .bn-editor {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-family: var(--font-sans) !important;
          font-size: 17px !important;
          line-height: 1.8 !important;
          color: var(--color-body) !important;
          min-height: 400px;
          caret-color: var(--color-ink);
        }
        .blocknote-wrapper .bn-editor [data-node-type="blockContainer"] {
          margin-bottom: 0.8em !important;
        }
        .blocknote-wrapper .bn-editor h1,
        .blocknote-wrapper .bn-editor h2,
        .blocknote-wrapper .bn-editor h3 {
          font-family: var(--font-serif) !important;
          font-weight: 300 !important;
          color: var(--color-ink) !important;
        }
        .blocknote-wrapper .bn-editor h1 { font-size: 2.25rem !important; }
        .blocknote-wrapper .bn-editor h2 { font-size: 1.75rem !important; }
        .blocknote-wrapper .bn-editor h3 { font-size: 1.375rem !important; }
        .blocknote-wrapper .bn-editor blockquote {
          border-left: 3px solid var(--color-hairline-strong);
          padding-left: 1rem;
          color: var(--color-muted);
          font-style: italic;
        }
        .blocknote-wrapper .bn-editor code {
          font-family: var(--font-mono) !important;
          font-size: 0.875em !important;
          background: var(--color-surface-strong);
          border-radius: 3px;
          padding: 0.1em 0.3em;
        }
        /* Hide BlockNote's default container padding */
        .blocknote-wrapper .bn-editor > .bn-block-outer:first-child {
          padding-top: 0;
        }
        /* Placeholder text */
        .blocknote-wrapper .bn-editor [data-placeholder]::before {
          color: var(--color-muted-soft) !important;
          font-style: normal !important;
        }
        /* BlockNote floating toolbars, formatting menus & slash command popups */
        .bn-side-menu,
        .bn-formatting-toolbar,
        .bn-slash-menu,
        .bn-drag-handle,
        .bn-toolbar,
        .bn-menu-dropdown {
          z-index: 100 !important;
        }
      `}</style>
    </div>
  );
}
