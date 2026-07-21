/**
 * RightPanel — Publishing settings panel.
 * Wired directly to Sanity API publishing routes.
 * Per design.md: text-input pattern (height 44px, rounded 8px, border 1px, focus thickens to 2px ink).
 * Per AGENTS.md: Zod schemas, Lucide icons, no hardcoded values.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { X, Loader2, Plus } from 'lucide-react';
import { z } from 'zod';
import { $draftStatus, $metadata, $subtitle, $title, $content, $clerkUserId, draftKey, LEGACY_DRAFT_KEY } from './editorStore';


// ─── Slug schema for Zod validation ──────────────────────────────────────────

const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .max(80, 'Slug cannot exceed 80 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens.',
  });

interface RightPanelProps {
  onClose: () => void;
}

interface Category {
  _id: string;
  title: string;
  slug?: { current: string };
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function RightPanel({ onClose }: RightPanelProps) {
  const title = useStore($title);
  const subtitle = useStore($subtitle);
  const metadata = useStore($metadata);
  const content = useStore($content);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  // Categories & tag input state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = (await res.json()) as { categories: Category[] };
          if (active) setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    void fetchCategories();
    return () => { active = false; };
  }, []);

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      setErrorMessage('A title is required before publishing.');
      setSubmitState('error');
      return;
    }

    const slugValidation = slugSchema.safeParse(metadata.slug);
    if (!slugValidation.success) {
      setSlugError(slugValidation.error.errors[0]?.message ?? 'Invalid slug.');
      setErrorMessage('Please fix the validation errors before publishing.');
      setSubmitState('error');
      return;
    }

    if (metadata.publishStatus === 'scheduled' && !metadata.scheduledAt) {
      setErrorMessage('Please specify a schedule date and time.');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setErrorMessage('');
    setSlugError(null);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: metadata.slug.trim(),
          excerpt: subtitle.trim() || null,
          body: content,
          coverImage: metadata.coverImageUrl || null,
          status: metadata.publishStatus,
          categoryId: metadata.category || null,
          tags: metadata.tags || [],
          scheduledAt: metadata.publishStatus === 'scheduled' ? metadata.scheduledAt : null,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        article?: { slug?: { current?: string } };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to publish article.');
      }

      setSubmitState('success');
      $draftStatus.set('saved');

      // Clear local storage draft upon successful database write
      const currentUserId = $clerkUserId.get();
      if (currentUserId) {
        localStorage.removeItem(draftKey(currentUserId));
      }
      localStorage.removeItem(LEGACY_DRAFT_KEY);


      const rawSlug = result.article?.slug;
      const slug = typeof rawSlug === 'string' ? rawSlug : rawSlug?.current;
      setTimeout(() => {
        window.location.href = slug ? `/article/${slug}` : '/dashboard/articles';
      }, 1200);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
      setSubmitState('error');
    }
  }, [title, subtitle, metadata, content]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 80);
    $metadata.setKey('slug', raw);
    $draftStatus.set('dirty');

    if (raw) {
      const validation = slugSchema.safeParse(raw);
      if (!validation.success) {
        setSlugError(validation.error.errors[0]?.message ?? 'Invalid slug.');
      } else {
        setSlugError(null);
      }
    } else {
      setSlugError('Slug is required.');
    }
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    $metadata.setKey('publishStatus', e.target.value as 'draft' | 'published' | 'scheduled');
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    $metadata.setKey('category', e.target.value);
  }, []);

  const handleScheduledAtChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    $metadata.setKey('scheduledAt', e.target.value || null);
  }, []);

  // Tag helper functions
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !metadata.tags.includes(tag)) {
      $metadata.setKey('tags', [...metadata.tags, tag]);
      $draftStatus.set('dirty');
    }
    setTagInput('');
  }, [tagInput, metadata.tags]);

  const removeTag = useCallback((index: number) => {
    const nextTags = [...metadata.tags];
    nextTags.splice(index, 1);
    $metadata.setKey('tags', nextTags);
    $draftStatus.set('dirty');
  }, [metadata.tags]);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  return (
    <aside
      id="editor-right-panel"
      aria-label="Article settings"
      role="complementary"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '320px',
        flexShrink: 0,
        borderLeft: '1px solid var(--color-hairline)',
        backgroundColor: 'var(--color-surface-card)',
        overflowY: 'auto',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-sm) var(--space-base)',
          borderBottom: '1px solid var(--color-hairline)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-surface-card)',
          zIndex: 10,
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption-upper)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-caption-upper)', color: 'var(--color-body-strong)', textTransform: 'uppercase', margin: 0 }}>
          Article Settings
        </h2>
        <button
          id="editor-right-panel-close"
          type="button"
          onClick={onClose}
          aria-label="Close settings panel"
          style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer' }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Panel Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', padding: 'var(--space-lg)', flex: 1 }}>
        
        {/* Slug input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          <label htmlFor="right-panel-slug" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
            URL Slug <span style={{ color: 'var(--color-error)' }} aria-hidden="true">*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xxs)', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', border: `1px solid ${slugError ? 'var(--color-error)' : 'var(--color-hairline-strong)'}`, padding: '0 var(--space-base)', height: 'var(--h-input)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-muted-soft)', userSelect: 'none' }}>/</span>
            <input
              id="right-panel-slug"
              type="text"
              value={metadata.slug}
              onChange={handleSlugChange}
              placeholder="url-slug"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', height: '100%', padding: 0 }}
              maxLength={80}
            />
          </div>
          {slugError && <p role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-error)', margin: 0 }}>{slugError}</p>}
        </div>

        {/* Cover Image URL input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          <label htmlFor="right-panel-cover-image" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
            Cover Image URL
          </label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-strong)', padding: '0 var(--space-base)', height: 'var(--h-input)' }}>
            <input
              id="right-panel-cover-image"
              type="text"
              value={metadata.coverImageUrl || ''}
              onChange={(e) => {
                $metadata.setKey('coverImageUrl', e.target.value);
                $draftStatus.set('dirty');
              }}
              placeholder="https://images.pexels.com/..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', height: '100%', padding: 0 }}
            />
          </div>
        </div>

        {/* Category picker */}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          <label htmlFor="right-panel-category" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
            Category
          </label>
          <select
            id="right-panel-category"
            value={metadata.category}
            onChange={handleCategoryChange}
            style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-strong)', padding: '0 var(--space-base)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', backgroundColor: 'var(--color-surface-card)', height: 'var(--h-input)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.title}</option>
            ))}
          </select>
        </div>

        {/* Tags input with pills display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          <label htmlFor="right-panel-tags" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
            Tags
          </label>
          
          {/* Tag pills list */}
          {metadata.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xxs)', marginBottom: 'var(--space-xxs)' }}>
              {metadata.tags.map((tag, idx) => (
                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-surface-strong)', color: 'var(--color-body-strong)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-hairline)' }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(idx)} aria-label={`Remove tag ${tag}`} style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-muted)', padding: 0 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xxs)', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-strong)', padding: '0 var(--space-base)', height: 'var(--h-input)' }}>
            <input
              id="right-panel-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Type tag and press enter…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', height: '100%', padding: 0 }}
            />
            <button type="button" onClick={addTag} aria-label="Add tag" style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-muted)' }}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Status select input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
          <label htmlFor="right-panel-status" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
            Status
          </label>
          <select
            id="right-panel-status"
            value={metadata.publishStatus}
            onChange={handleStatusChange}
            style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-strong)', padding: '0 var(--space-base)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', backgroundColor: 'var(--color-surface-card)', height: 'var(--h-input)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Publish Immediately</option>
            <option value="scheduled">Schedule Publication</option>
          </select>
        </div>

        {/* Schedule DateTime selector (conditionally visible) */}
        {metadata.publishStatus === 'scheduled' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
            <label htmlFor="right-panel-schedule" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--fw-medium)', color: 'var(--color-body-strong)' }}>
              Schedule Date & Time
            </label>
            <input
              id="right-panel-schedule"
              type="datetime-local"
              value={metadata.scheduledAt || ''}
              onChange={handleScheduledAtChange}
              style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-strong)', padding: '0 var(--space-base)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-body-strong)', backgroundColor: 'var(--color-surface-card)', height: 'var(--h-input)', outline: 'none' }}
            />
          </div>
        )}

        {/* Submission messages */}
        {submitState === 'error' && (
          <div role="alert" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)', padding: 'var(--space-sm) var(--space-base)', backgroundColor: 'rgba(220, 38, 38, 0.06)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-error)', margin: 0 }}>{errorMessage}</p>
          </div>
        )}

        {submitState === 'success' && (
          <div role="status" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success)', padding: 'var(--space-sm) var(--space-base)', backgroundColor: 'rgba(22, 163, 74, 0.06)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--color-success)', margin: 0 }}>Published successfully! Redirecting…</p>
          </div>
        )}
      </div>

      {/* Publish Button */}
      <div style={{ padding: 'var(--space-sm) var(--space-base)', borderTop: '1px solid var(--color-hairline)', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface-card)' }}>
        <button
          id="right-panel-publish-btn"
          type="button"
          onClick={handlePublish}
          disabled={submitState === 'submitting' || submitState === 'success'}
          style={{ width: '100%', height: 'var(--h-btn)', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-btn)', fontWeight: 'var(--fw-medium)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xxs)', transition: 'background var(--duration-200) var(--ease-out)', opacity: submitState === 'submitting' || submitState === 'success' ? 0.6 : 1 }}
        >
          {submitState === 'submitting' ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Publishing…</span>
            </>
          ) : metadata.publishStatus === 'published' ? (
            'Publish Article'
          ) : metadata.publishStatus === 'scheduled' ? (
            'Schedule Publication'
          ) : (
            'Save as Draft'
          )}
        </button>
      </div>
    </aside>
  );
}
