import React, { useState, useEffect } from 'react';
import type { Notification } from '@/types/supabase';
import { Bell, Heart, UserPlus, MessageSquare, Check, ExternalLink } from 'lucide-react';

interface NotificationBellProps {
  initialUnreadCount?: number;
}

export default function NotificationBell({ initialUnreadCount = 0 }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/social/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Simple 20s polling interval
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/social/notifications', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      // Ignore
    }
  };

  const getNotificationMessage = (n: Notification) => {
    const actorName = n.actor?.full_name || n.actor?.username || 'Someone';
    switch (n.type) {
      case 'follow':
        return `${actorName} started following you.`;
      case 'like':
        return `${actorName} liked your article.`;
      case 'comment_reply':
        return `${actorName} responded to your post/comment.`;
      default:
        return `${actorName} interacted with your content.`;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={14} style={{ color: '#0ea5e9' }} />;
      case 'like':
        return <Heart size={14} fill="#DC2626" stroke="#DC2626" />;
      case 'comment_reply':
        return <MessageSquare size={14} style={{ color: '#8b5cf6' }} />;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) {
            handleMarkAllRead();
          }
        }}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-ink)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '340px',
              maxHeight: '420px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 95,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Dropdown Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-surface)',
              }}
            >
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-strong)', margin: 0 }}>
                Notifications
              </h4>
              {notifications.some(n => !n.is_read) && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-steel)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <a
                    key={n.id}
                    href={n.article_id ? `/article/${n.article_id}` : '/dashboard/notifications'}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-hairline-soft)',
                      background: n.is_read ? 'transparent' : 'rgba(14, 165, 233, 0.04)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 150ms ease',
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {getNotificationIcon(n.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)', margin: '0 0 2px 0', lineHeight: 1.35 }}>
                        {getNotificationMessage(n)}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '12px' }}>
                  No notifications yet.
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <a
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px',
                textAlign: 'center',
                borderTop: '1px solid var(--color-hairline)',
                background: 'var(--color-surface)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-steel)',
                textDecoration: 'none',
              }}
            >
              View all notifications →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
