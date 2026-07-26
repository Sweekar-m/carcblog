import { map, atom } from 'nanostores';

// Cross-island state maps
export const $likesMap = map<Record<string, boolean>>({});
export const $likeCounts = map<Record<string, number>>({});
export const $bookmarksMap = map<Record<string, boolean>>({});
export const $followsMap = map<Record<string, boolean>>({});
export const $unreadNotificationsCount = atom<number>(0);

export function setLikeState(articleId: string, isLiked: boolean, count?: number) {
  $likesMap.setKey(articleId, isLiked);
  if (typeof count === 'number') {
    $likeCounts.setKey(articleId, count);
  }
}

export function setBookmarkState(articleId: string, isBookmarked: boolean) {
  $bookmarksMap.setKey(articleId, isBookmarked);
}

export function setFollowState(targetId: string, isFollowing: boolean) {
  $followsMap.setKey(targetId, isFollowing);
}
