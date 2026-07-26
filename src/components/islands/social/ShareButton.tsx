import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, url, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = url || window.location.href;

    // Use Web Share API if available on mobile / supported browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to copy link if user cancels or browser fails
      }
    }

    // Copy to clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Link: ' + shareUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share article"
      aria-label="Share article"
      className={`btn-share ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '32px',
        padding: '0 12px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-hairline-strong)',
        background: 'transparent',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-medium)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {copied ? (
        <>
          <Check size={14} style={{ color: 'var(--color-success)' }} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
