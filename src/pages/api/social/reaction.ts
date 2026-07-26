import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { recordActivity } from '@/lib/profile';
import { createNotification } from '@/lib/social';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = await getCurrentUser(context.locals);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { articleId, reactionType, articleAuthorId, articleTitle } = await context.request.json();
    if (!articleId || !reactionType) {
      return new Response(JSON.stringify({ error: 'Missing articleId or reactionType' }), { status: 400 });
    }

    // Check existing reaction
    const { data: existing } = await supabase
      .from('article_reactions')
      .select('id, reaction_type')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .eq('reaction_type', reactionType)
      .maybeSingle();

    if (existing) {
      // Toggle off
      await supabase.from('article_reactions').delete().eq('id', existing.id);
    } else {
      // Add reaction
      await supabase.from('article_reactions').insert({
        user_id: user.id,
        article_id: articleId,
        reaction_type: reactionType
      });

      // Also record in legacy likes for backward compatibility
      await supabase.from('likes').upsert({ user_id: user.id, article_id: articleId }, { onConflict: 'user_id,article_id' });

      // Notify author
      if (articleAuthorId && articleAuthorId !== user.id) {
        await createNotification({
          user_id: articleAuthorId,
          actor_id: user.id,
          type: 'like',
          article_id: articleId
        });
      }

      // Record activity feed
      await recordActivity(user.id, 'article_liked', articleTitle || 'an article', `/article/${articleId}`);
    }

    // Fetch updated breakdown
    const { data: allReactions } = await supabase
      .from('article_reactions')
      .select('reaction_type')
      .eq('article_id', articleId);

    const counts: Record<string, number> = {
      like: 0, celebrate: 0, insightful: 0, love: 0, rocket: 0, fire: 0
    };
    (allReactions || []).forEach(r => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
    });

    return new Response(JSON.stringify({ success: true, counts, isReacted: !existing }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Reaction failed' }), { status: 500 });
  }
};
