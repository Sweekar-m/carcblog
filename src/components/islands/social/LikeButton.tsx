import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $likesMap, $likeCounts, setLikeState } from '@/lib/socialStore';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  articleId: string;
  authorId?: string | null;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
}

export default function LikeButton({
  articleId,
  authorId,
  initialLiked = false,
  initialCount = 0,
  className = '',
}: LikeButtonProps) {
  const likesMap = useStore($likesMap);
  const likeCounts = useStore($likeCounts);

  const isLiked = likesMap[articleId] ?? initialLiked;
  const count = likeCounts[articleId] ?? initialCount;

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initial fetch if not set in store
    if (likesMap[articleId] === undefined) {
      setLikeState(articleId, initialLiked, initialCount);
      fetch(`/api/social/like?articleId=${encodeURIComponent(articleId)}`)
        .then(res => res.json())
        .then(data => {
          if (typeof data.isLiked === 'boolean') {
            setLikeState(articleId, data.isLiked, data.likeCount);
          }
        })
        .catch(() => {});
    }
  }, [articleId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    // Optimistic UI toggle
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1);
    setLikeState(articleId, nextLiked, nextCount);
    setLoading(true);

    try {
      const res = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, authorId }),
      });

      if (res.status === 401) {
        setLikeState(articleId, isLiked, count);
        window.location.href = `/auth/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      const data = await res.json();
      if (res.ok && typeof data.isLiked === 'boolean') {
        setLikeState(articleId, data.isLiked, data.likeCount);
      } else {
        setLikeState(articleId, isLiked, count);
      }
    } catch {
      setLikeState(articleId, isLiked, count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isLiked ? 'Unlike article' : 'Like article'}
      aria-pressed={isLiked}
      className={`btn-like ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '32px',
        padding: '0 12px',
        borderRadius: 'var(--radius-pill)',
        border: isLiked ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid var(--color-hairline-strong)',
        background: isLiked ? 'rgba(254, 226, 226, 0.5)' : 'transparent',
        color: isLiked ? '#DC2626' : 'var(--color-ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-medium)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <Heart
        size={14}
        fill={isLiked ? '#DC2626' : 'none'}
        stroke={isLiked ? '#DC2626' : 'currentColor'}
        style={{ transition: 'transform 150ms ease' }}
      />
      <span>{count}</span>
    </button>
  );
}
