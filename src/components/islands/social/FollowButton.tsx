import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $followsMap, setFollowState } from '@/lib/socialStore';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetId: string;
  initialFollowing?: boolean;
  initialCount?: number;
  showCount?: boolean;
  className?: string;
  variant?: 'primary' | 'outline' | 'subtle';
}

export default function FollowButton({
  targetId,
  initialFollowing = false,
  initialCount = 0,
  showCount = false,
  className = '',
  variant = 'outline',
}: FollowButtonProps) {
  const followsMap = useStore($followsMap);
  const isFollowing = followsMap[targetId] ?? initialFollowing;

  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Sync initial prop if store doesn't have it
    if (followsMap[targetId] === undefined) {
      setFollowState(targetId, initialFollowing);
    }
  }, [targetId, initialFollowing]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    // Optimistic UI toggle
    const nextState = !isFollowing;
    const nextCount = nextState ? count + 1 : Math.max(0, count - 1);
    setFollowState(targetId, nextState);
    setCount(nextCount);
    setLoading(true);

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      });

      if (res.status === 401) {
        // Revert on unauthenticated
        setFollowState(targetId, isFollowing);
        setCount(count);
        window.location.href = `/auth/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      const data = await res.json();
      if (res.ok && typeof data.isFollowing === 'boolean') {
        setFollowState(targetId, data.isFollowing);
        if (typeof data.followerCount === 'number') {
          setCount(data.followerCount);
        }
      } else {
        // Revert on error
        setFollowState(targetId, isFollowing);
        setCount(count);
      }
    } catch {
      setFollowState(targetId, isFollowing);
      setCount(count);
    } finally {
      setLoading(false);
    }
  };

  const getStyles = (): React.CSSProperties => {
    if (isFollowing) {
      return {
        background: 'var(--color-surface-strong)',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-hairline-strong)',
      };
    }
    if (variant === 'primary') {
      return {
        background: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        border: 'none',
      };
    }
    return {
      background: 'transparent',
      color: 'var(--color-ink)',
      border: '1px solid var(--color-hairline-strong)',
    };
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`btn-follow ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: '32px',
        padding: '0 14px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-semibold)',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 150ms ease',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        ...getStyles(),
      }}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={13} />
      ) : isFollowing ? (
        <>
          <UserCheck size={13} style={{ color: 'var(--color-success)' }} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={13} />
          <span>Follow</span>
        </>
      )}

      {showCount && <span style={{ opacity: 0.85, fontSize: '11px', marginLeft: '2px' }}>({count})</span>}
    </button>
  );
}
