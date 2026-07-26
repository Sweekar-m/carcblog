import { supabase } from './supabase';
import { sanityClient } from './sanity';
import type {
  Follow,
  Like,
  Bookmark,
  Comment,
  Notification,
  ReadingHistory,
  Profile,
} from '@/types/supabase';
import type { SanityArticle } from '@/types/sanity';

// ─── 1. LIKES ─────────────────────────────────────────────────────────────

export async function getLikeStatus(userId: string | null, articleId: string) {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId);

  let isLiked = false;
  if (userId) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
    isLiked = !!data;
  }

  return { likeCount: count || 0, isLiked };
}

export async function toggleLike(userId: string, articleId: string, articleAuthorClerkId?: string | null) {
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id);
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('article_id', articleId);
    return { isLiked: false, likeCount: count || 0 };
  } else {
    // Like
    await supabase.from('likes').insert({ user_id: userId, article_id: articleId });
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('article_id', articleId);

    // Notify author if like is from another user
    if (articleAuthorClerkId && articleAuthorClerkId !== userId) {
      await createNotification({
        user_id: articleAuthorClerkId,
        actor_id: userId,
        type: 'like',
        article_id: articleId,
      });
    }

    return { isLiked: true, likeCount: count || 0 };
  }
}

// ─── 2. BOOKMARKS ─────────────────────────────────────────────────────────

export async function getBookmarkStatus(userId: string | null, articleId: string) {
  if (!userId) return { isBookmarked: false };
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();
  return { isBookmarked: !!data };
}

export async function toggleBookmark(userId: string, articleId: string) {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return { isBookmarked: false };
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, article_id: articleId });
    return { isBookmarked: true };
  }
}

// ─── 3. FOLLOWS ───────────────────────────────────────────────────────────

export async function getFollowStatus(followerId: string | null, followingId: string) {
  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', followingId);

  let isFollowing = false;
  if (followerId && followerId !== followingId) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    isFollowing = !!data;
  }

  return { followerCount: count || 0, isFollowing };
}

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', followingId);
    return { isFollowing: false, followerCount: count || 0 };
  } else {
    await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', followingId);

    // Create notification
    await createNotification({
      user_id: followingId,
      actor_id: followerId,
      type: 'follow',
    });

    return { isFollowing: true, followerCount: count || 0 };
  }
}

// ─── 4. COMMENTS & THREADED REPLIES ───────────────────────────────────────

export async function getArticleComments(articleId: string): Promise<Comment[]> {
  const { data: rawComments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error || !rawComments) return [];

  // Hydrate user profiles for all comment authors
  const userIds = Array.from(new Set(rawComments.map(c => c.user_id)));
  let profileMap: Record<string, Partial<Profile>> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role')
      .in('id', userIds);

    if (profiles) {
      profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  // Attach profile objects to comments
  const hydratedComments: Comment[] = rawComments.map(c => ({
    ...c,
    profile: profileMap[c.user_id] || { username: c.user_id.slice(0, 8), full_name: 'User' },
    replies: [],
  }));

  // Build tree: top-level comments with nested replies
  const commentMap: Record<string, Comment> = {};
  const topLevel: Comment[] = [];

  hydratedComments.forEach(c => {
    commentMap[c.id] = c;
  });

  hydratedComments.forEach(c => {
    if (c.parent_id && commentMap[c.parent_id]) {
      commentMap[c.parent_id].replies!.push(c);
    } else {
      topLevel.push(c);
    }
  });

  return topLevel;
}

export async function postComment(
  userId: string,
  articleId: string,
  content: string,
  parentId?: string | null,
  articleAuthorId?: string | null
) {
  const cleanContent = content.trim();
  if (!cleanContent) throw new Error("Comment content cannot be empty.");

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      parent_id: parentId || null,
      content: cleanContent,
    })
    .select('*')
    .single();

  if (error || !comment) throw error;

  // Handle Notifications
  if (parentId) {
    // Notify parent comment author
    const { data: parentComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', parentId)
      .single();

    if (parentComment && parentComment.user_id !== userId) {
      await createNotification({
        user_id: parentComment.user_id,
        actor_id: userId,
        type: 'comment_reply',
        article_id: articleId,
        comment_id: comment.id,
      });
    }
  } else if (articleAuthorId && articleAuthorId !== userId) {
    // Notify article author of new top-level comment
    await createNotification({
      user_id: articleAuthorId,
      actor_id: userId,
      type: 'comment_reply',
      article_id: articleId,
      comment_id: comment.id,
    });
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role')
    .eq('id', userId)
    .single();

  return {
    ...comment,
    profile: profile || { username: userId.slice(0, 8), full_name: 'User' },
    replies: [],
  };
}

export async function deleteComment(userId: string, commentId: string) {
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (!comment) throw new Error("Comment not found.");
  if (comment.user_id !== userId) throw new Error("Unauthorized to delete this comment.");

  // Soft delete to preserve thread continuity if replies exist
  const { data: updated } = await supabase
    .from('comments')
    .update({ content: '[Comment deleted by user]', is_deleted: true })
    .eq('id', commentId)
    .select('*')
    .single();

  return updated;
}

// ─── 5. NOTIFICATIONS ─────────────────────────────────────────────────────

export async function createNotification(data: {
  user_id: string;
  actor_id: string;
  type: 'follow' | 'like' | 'comment_reply';
  article_id?: string | null;
  comment_id?: string | null;
}) {
  if (data.user_id === data.actor_id) return; // Prevent self-notifications
  await supabase.from('notifications').insert(data);
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !notifications) return [];

  // Hydrate actor profiles
  const actorIds = Array.from(new Set(notifications.map(n => n.actor_id)));
  let profileMap: Record<string, Partial<Profile>> = {};
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    }
  }

  return notifications.map(n => ({
    ...n,
    actor: profileMap[n.actor_id] || { username: n.actor_id.slice(0, 8), full_name: 'User' },
  }));
}

export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  if (notificationIds && notificationIds.length > 0) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .in('id', notificationIds);
  } else {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }
  return { success: true };
}

// ─── 6. READING HISTORY ───────────────────────────────────────────────────

export async function recordReadingHistory(userId: string, articleId: string) {
  await supabase
    .from('reading_history')
    .upsert(
      {
        user_id: userId,
        article_id: articleId,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,article_id' }
    );
}

// ─── 7. DASHBOARD HYDRATION HELPERS ──────────────────────────────────────

export async function getUserSavedArticles(userId: string): Promise<SanityArticle[]> {
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('article_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!bookmarks || bookmarks.length === 0) return [];
  const articleIds = bookmarks.map(b => b.article_id);

  const sanityArticles = await sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && _id in $articleIds] {
      _id, title, slug, publishedAt, excerpt, status,
      "coverImage": coalesce(coverImage.asset->url, coverImage),
      author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) }
    }`,
    { articleIds }
  );

  return sanityArticles;
}

export async function getUserLikedArticles(userId: string): Promise<SanityArticle[]> {
  const { data: likes } = await supabase
    .from('likes')
    .select('article_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!likes || likes.length === 0) return [];
  const articleIds = likes.map(l => l.article_id);

  const sanityArticles = await sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && _id in $articleIds] {
      _id, title, slug, publishedAt, excerpt, status,
      "coverImage": coalesce(coverImage.asset->url, coverImage),
      author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) }
    }`,
    { articleIds }
  );

  return sanityArticles;
}

export async function getUserReadingHistory(userId: string): Promise<SanityArticle[]> {
  const { data: history } = await supabase
    .from('reading_history')
    .select('article_id, last_read_at')
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false })
    .limit(50);

  if (!history || history.length === 0) return [];
  const articleIds = history.map(h => h.article_id);

  const sanityArticles = await sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && _id in $articleIds] {
      _id, title, slug, publishedAt, excerpt, status,
      "coverImage": coalesce(coverImage.asset->url, coverImage),
      author->{ _id, clerkUserId, name, "image": coalesce(image.asset->url, image) }
    }`,
    { articleIds }
  );

  return sanityArticles;
}

export async function getUserFollowedWriters(userId: string): Promise<Profile[]> {
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (!follows || follows.length === 0) return [];
  const followingIds = follows.map(f => f.following_id);

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', followingIds);

  return (profiles || []) as Profile[];
}
