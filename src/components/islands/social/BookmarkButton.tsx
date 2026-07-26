import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $bookmarksMap, setBookmarkState } from '@/lib/socialStore';
import { Bookmark as BookmarkIcon } from 'lucide-react';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function BookmarkButton({
  articleId,
  initialBookmarked = false,
  className = '',
  showLabel = false,
}: BookmarkButtonProps) {
  const bookmarksMap = useStore($bookmarksMap);
  const isBookmarked = bookmarksMap[articleId] ?? initialBookmarked;

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (bookmarksMap[articleId] === undefined) {
      setBookmarkState(articleId, initialBookmarked);
      fetch(`/api/social/bookmark?articleId=${encodeURIComponent(articleId)}`)
        .then(res => res.json())
        .then(data => {
          if (typeof data.isBookmarked === 'boolean') {
            setBookmarkState(articleId, data.isBookmarked);
          }
        })
        .catch(() => {});
    }
  }, [articleId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const nextState = !isBookmarked;
    setBookmarkState(articleId, nextState);
    setLoading(true);

    try {
      const res = await fetch('/api/social/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (res.status === 401) {
        setBookmarkState(articleId, isBookmarked);
        window.location.href = `/auth/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      const data = await res.json();
      if (res.ok && typeof data.isBookmarked === 'boolean') {
        setBookmarkState(articleId, data.isBookmarked);
      } else {
        setBookmarkState(articleId, isBookmarked);
      }
    } catch {
      setBookmarkState(articleId, isBookmarked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
      aria-pressed={isBookmarked}
      className={`btn-bookmark ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '32px',
        padding: showLabel ? '0 12px' : '0 8px',
        borderRadius: 'var(--radius-pill)',
        border: isBookmarked ? '1px solid var(--color-ink)' : '1px solid var(--color-hairline-strong)',
        background: isBookmarked ? 'var(--color-ink)' : 'transparent',
        color: isBookmarked ? 'var(--color-on-primary)' : 'var(--color-ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-medium)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <BookmarkIcon
        size={14}
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
      />
      {showLabel && <span>{isBookmarked ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
