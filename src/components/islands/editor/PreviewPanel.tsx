/**
 * PreviewPanel — Real-time magazine-style reader preview for the Publishing Studio.
 * Renders Portable Text (from store) into a clean, styled layout.
 * Per design.md: EB Garamond for display headlines, Inter for body text.
 */
import React from 'react';
import { useStore } from '@nanostores/react';
import { $title, $subtitle, $content, $metadata } from './editorStore';
import type { PortableTextBlock, PortableTextSpan } from '@/types/editor';

// ─── Inline span renderer ───────────────────────────────────────────────────

function RenderSpan({ span }: { span: PortableTextSpan }) {
  let element = <>{span.text}</>;

  if (span.marks.includes('strong')) {
    element = <strong>{element}</strong>;
  }
  if (span.marks.includes('em')) {
    element = <em>{element}</em>;
  }
  if (span.marks.includes('underline')) {
    element = <span style={{ textDecoration: 'underline' }}>{element}</span>;
  }
  if (span.marks.includes('strike-through')) {
    element = <span style={{ textDecoration: 'line-through' }}>{element}</span>;
  }
  if (span.marks.includes('code')) {
    element = (
      <code
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875em',
          background: 'var(--color-surface-strong)',
          padding: '0.1em 0.3em',
          borderRadius: 'var(--radius-xs)',
        }}
      >
        {element}
      </code>
    );
  }

  return element;
}

// ─── Portable Text Block renderer ──────────────────────────────────────────

function RenderBlock({ block }: { block: PortableTextBlock }) {
  if ((block as any)._type === 'imageBlock') {
    const imgBlock = block as any;
    return (
      <figure style={{ margin: 'var(--space-lg) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
        <img
          src={imgBlock.url}
          alt={imgBlock.alt || 'Inline image'}
          style={{
            width: '100%',
            maxHeight: '450px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-hairline)',
          }}
          loading="lazy"
        />
        {imgBlock.caption && (
          <figcaption style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-muted)', textAlign: 'center', marginTop: 'var(--space-xxs)' }}>
            {imgBlock.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const children = (block.children || []).map((span) => (
    <RenderSpan key={span._key} span={span} />
  ));

  switch (block.style) {
    case 'h1':
      return (
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-display-lg)',
            fontWeight: 'var(--fw-light)',
            color: 'var(--color-ink)',
            marginTop: 'var(--space-xl)',
            marginBottom: 'var(--space-sm)',
            lineHeight: 'var(--lh-display-lg)',
          }}
        >
          {children}
        </h1>
      );
    case 'h2':
      return (
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-display-md)',
            fontWeight: 'var(--fw-light)',
            color: 'var(--color-ink)',
            marginTop: 'var(--space-lg)',
            marginBottom: 'var(--space-xs)',
            lineHeight: 'var(--lh-display-md)',
          }}
        >
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-display-sm)',
            fontWeight: 'var(--fw-light)',
            color: 'var(--color-ink)',
            marginTop: 'var(--space-md)',
            marginBottom: 'var(--space-xs)',
            lineHeight: 'var(--lh-display-sm)',
          }}
        >
          {children}
        </h3>
      );
    case 'blockquote':
      return (
        <blockquote
          style={{
            borderLeft: '3px solid var(--color-hairline-strong)',
            paddingLeft: 'var(--space-base)',
            color: 'var(--color-muted)',
            fontStyle: 'italic',
            margin: 'var(--space-md) 0',
          }}
        >
          {children}
        </blockquote>
      );
    case 'bullet':
      return (
        <li
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body-md)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-body)',
            marginBottom: 'var(--space-xxs)',
            listStyleType: 'disc',
          }}
        >
          {children}
        </li>
      );
    case 'number':
      return (
        <li
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body-md)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-body)',
            marginBottom: 'var(--space-xxs)',
            listStyleType: 'decimal',
          }}
        >
          {children}
        </li>
      );
    default:
      return (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body-md)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-body)',
            marginBottom: 'var(--space-base)',
          }}
        >
          {children}
        </p>
      );
  }
}

// ─── Main Preview Panel ──────────────────────────────────────────────────────

export function PreviewPanel() {
  const title = useStore($title);
  const subtitle = useStore($subtitle);
  const content = useStore($content);
  const metadata = useStore($metadata);

  // Group consecutive list items into <ul> or <ol> elements
  const renderBlocks = () => {
    const rendered: React.ReactNode[] = [];
    let currentList: { type: 'bullet' | 'number'; items: React.ReactNode[] } | null = null;

    let idx = 0;
    for (const block of content) {
      if (block.style === 'bullet' || block.style === 'number') {
        const listType = block.style;
        if (currentList && currentList.type === listType) {
          currentList.items.push(<RenderBlock key={block._key} block={block} />);
        } else {
          if (currentList) {
            rendered.push(
              currentList.type === 'bullet' ? (
                <ul key={`list-${idx}`} style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ul>
              ) : (
                <ol key={`list-${idx}`} style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ol>
              )
            );
          }
          currentList = {
            type: listType,
            items: [<RenderBlock key={block._key} block={block} />],
          };
        }
      } else {
        if (currentList) {
          rendered.push(
            currentList.type === 'bullet' ? (
              <ul key={`list-end-${idx}`} style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ul>
            ) : (
              <ol key={`list-end-${idx}`} style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ol>
            )
          );
          currentList = null;
        }
        rendered.push(<RenderBlock key={block._key} block={block} />);
      }
      idx++;
    }

    if (currentList) {
      rendered.push(
        currentList.type === 'bullet' ? (
          <ul key="list-final" style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ul>
        ) : (
          <ol key="list-final" style={{ paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-base)' }}>{currentList.items}</ol>
        )
      );
    }

    return rendered;
  };

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--color-surface-card)',
        borderLeft: '1px solid var(--color-hairline)',
        padding: 'var(--space-xxl) var(--space-xl)',
      }}
    >
      <div style={{ maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* Cover Image */}
        {metadata.coverImageUrl && (
          <div style={{ marginBottom: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img
              src={metadata.coverImageUrl}
              alt={metadata.coverImageAlt || 'Cover image'}
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 'var(--radius-md)',
              }}
            />
            {(metadata.coverImageAlt || metadata.coverImageCredit) && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-muted)', marginTop: 'var(--space-xxs)', textAlign: 'center' }}>
                {metadata.coverImageAlt} {metadata.coverImageCredit && `• ${metadata.coverImageCredit}`}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-display-xl)',
            fontWeight: 'var(--fw-light)',
            color: 'var(--color-ink)',
            lineHeight: 'var(--lh-display-xl)',
            letterSpacing: 'var(--ls-display-xl)',
            marginBottom: 'var(--space-sm)',
            marginTop: 0,
          }}
        >
          {title || 'Untitled Article'}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-title-md)',
              color: 'var(--color-muted)',
              lineHeight: 'var(--lh-title-md)',
              marginBottom: 'var(--space-xl)',
              marginTop: 0,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--color-hairline)',
            marginBottom: 'var(--space-xl)',
          }}
        />

        {/* Content Body */}
        <article>{renderBlocks()}</article>
      </div>
    </div>
  );
}
