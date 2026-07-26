import React, { useState, useEffect } from 'react';
import type { Comment } from '@/types/supabase';
import { MessageSquare, CornerDownRight, Send, Trash2, Loader2 } from 'lucide-react';

interface CommentThreadProps {
  articleId: string;
  articleAuthorId?: string | null;
  currentUserId?: string | null;
}

export default function CommentThread({
  articleId,
  articleAuthorId,
  currentUserId,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/social/comments?articleId=${encodeURIComponent(articleId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      // Ignore network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handlePostComment = async (parentId?: string | null) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim() || submitting) return;

    if (!currentUserId) {
      window.location.href = `/auth/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: text,
          parentId: parentId || null,
          authorId: articleAuthorId,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyText('');
          setReplyParentId(null);
        } else {
          setNewCommentText('');
        }
        await fetchComments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post comment');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const res = await fetch(`/api/social/comments?commentId=${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const renderCommentItem = (comment: Comment, isReply = false) => {
    const authorName = comment.profile?.full_name || comment.profile?.username || 'Writer';
    const authorAvatar = comment.profile?.avatar_url;
    const isOwner = currentUserId && comment.user_id === currentUserId;

    return (
      <div
        key={comment.id}
        style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 0',
          borderBottom: '1px solid var(--color-hairline-soft)',
          marginLeft: isReply ? '32px' : 0,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: isReply ? '28px' : '36px',
            height: isReply ? '28px' : '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-strong)',
            border: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: isReply ? '11px' : '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink-strong)' }}>
                {authorName}
              </span>
              {articleAuthorId && comment.user_id === articleAuthorId && (
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 'var(--radius-pill)', background: 'var(--color-surface-strong)', color: 'var(--color-steel)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Author
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {isOwner && !comment.is_deleted && (
              <button
                type="button"
                onClick={() => handleDeleteComment(comment.id)}
                title="Delete comment"
                style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: '2px' }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-body-sm)',
              color: comment.is_deleted ? 'var(--color-muted)' : 'var(--color-body)',
              fontStyle: comment.is_deleted ? 'italic' : 'normal',
              lineHeight: 1.5,
              margin: '0 0 8px 0',
              whiteSpace: 'pre-line',
            }}
          >
            {comment.content}
          </p>

          {/* Reply Button */}
          {!comment.is_deleted && currentUserId && (
            <button
              type="button"
              onClick={() => setReplyParentId(replyParentId === comment.id ? null : comment.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-steel)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <CornerDownRight size={12} />
              <span>{replyParentId === comment.id ? 'Cancel' : 'Reply'}</span>
            </button>
          )}

          {/* Reply Form */}
          {replyParentId === comment.id && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${authorName}...`}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-hairline-strong)',
                  background: 'var(--color-canvas)',
                  fontSize: '13px',
                  outline: 'none',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handlePostComment(comment.id);
                }}
              />
              <button
                type="button"
                onClick={() => handlePostComment(comment.id)}
                disabled={submitting || !replyText.trim()}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  opacity: submitting || !replyText.trim() ? 0.5 : 1,
                }}
              >
                Reply
              </button>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {comment.replies.map(reply => renderCommentItem(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalCommentCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  return (
    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--color-hairline)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <MessageSquare size={18} style={{ color: 'var(--color-ink)' }} />
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-card-title)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-ink-strong)', margin: 0 }}>
          Responses ({totalCommentCount})
        </h3>
      </div>

      {/* Main Comment Form */}
      <div style={{ marginBottom: '32px', background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-hairline)' }}>
        {currentUserId ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              handlePostComment(null);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <textarea
              rows={3}
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts on this story?"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-hairline-strong)',
                background: 'var(--color-canvas)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--fs-body-sm)',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--fs-button-md)',
                  fontWeight: 'var(--fw-semibold)',
                  border: 'none',
                  cursor: submitting || !newCommentText.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !newCommentText.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Respond</span>
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-steel)', margin: '0 0 12px' }}>
              Join the conversation. Sign in to post your response.
            </p>
            <a
              href={`/auth/sign-in?redirect_url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
              className="btn-outline"
              style={{ fontSize: '13px', padding: '6px 18px', display: 'inline-flex' }}
            >
              Sign In to Respond
            </a>
          </div>
        )}
      </div>

      {/* Comment List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-muted)', padding: '24px 0' }}>
          <Loader2 size={16} className="animate-spin" />
          <span>Loading responses...</span>
        </div>
      ) : comments.length > 0 ? (
        <div>{comments.map(c => renderCommentItem(c))}</div>
      ) : (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--color-muted)', fontStyle: 'italic' }}>
          No responses yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
