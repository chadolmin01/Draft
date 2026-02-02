/**
 * localStorage 기반 아이디어 목록 조회
 * 비로그인 사용자의 History 패널용
 */

export interface IdeaListItem {
  id: string;
  idea: string;
  tier: string;
  createdAt: string;
}

export function getAllIdeasFromStorage(): IdeaListItem[] {
  if (typeof window === 'undefined') return [];

  const items: IdeaListItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('idea_')) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const ideaData = parsed?.idea;
      if (!ideaData?.id) continue;

      items.push({
        id: ideaData.id,
        idea: ideaData.idea || '',
        tier: ideaData.tier || 'light',
        createdAt: ideaData.createdAt || '',
      });
    } catch {
      // 잘못된 JSON 무시
    }
  }

  // 최신순 정렬
  items.sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });

  return items;
}
