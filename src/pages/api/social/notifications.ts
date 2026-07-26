import type { APIRoute } from 'astro';
import { requireAuth } from '@/lib/requireAuth';
import { getUserNotifications, markNotificationsAsRead } from '@/lib/social';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return new Response(JSON.stringify({ notifications: [], unreadCount: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const notifications = await getUserNotifications(userId);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    return new Response(JSON.stringify({ notifications, unreadCount }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch notifications' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  const userId = await requireAuth(locals);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { notificationIds } = body;
    await markNotificationsAsRead(userId, notificationIds);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to mark notifications read' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
