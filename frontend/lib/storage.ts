/**
 * localStorage 관리 유틸리티
 * 캐시 정리 및 만료 처리
 */

// localStorage 키 접두사
const PREFIX = 'startup_';

// 데이터 만료 시간 (기본: 7일)
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface StorageItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * localStorage에 데이터 저장 (만료 시간 포함)
 */
export function setStorageItem<T>(key: string, value: T, ttl: number = DEFAULT_TTL): void {
  try {
    const item: StorageItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error('localStorage setItem error:', error);
    // localStorage가 가득 찬 경우 오래된 항목 삭제
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      cleanupOldItems();
      // 재시도
      try {
        const item: StorageItem<T> = {
          data: value,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(PREFIX + key, JSON.stringify(item));
      } catch (retryError) {
        console.error('localStorage setItem retry failed:', retryError);
      }
    }
  }
}

/**
 * localStorage에서 데이터 가져오기 (만료 확인)
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const itemStr = localStorage.getItem(PREFIX + key);
    if (!itemStr) return null;

    const item: StorageItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    // 만료 확인
    if (now - item.timestamp > item.ttl) {
      // 만료된 데이터 삭제
      localStorage.removeItem(PREFIX + key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('localStorage getItem error:', error);
    return null;
  }
}

/**
 * localStorage에서 데이터 삭제
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error('localStorage removeItem error:', error);
  }
}

/**
 * 특정 아이디어 관련 모든 데이터 삭제
 */
export function removeIdeaData(ideaId: string): void {
  const keys = [
    `idea_${ideaId}`,
    `idea_${ideaId}_stage2`,
    `idea_${ideaId}_deep_market-deep`,
    `idea_${ideaId}_deep_strategy`,
    `idea_${ideaId}_deep_external`,
    `idea_${ideaId}_report`,
  ];

  keys.forEach((key) => removeStorageItem(key));
}

/**
 * 만료된 항목 자동 정리
 */
export function cleanupOldItems(): number {
  let cleanedCount = 0;
  const now = Date.now();

  try {
    // PREFIX로 시작하는 모든 키 검색
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));

    keys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return;

        const item: StorageItem<any> = JSON.parse(itemStr);
        
        // 만료 확인
        if (now - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      } catch (error) {
        // 파싱 실패한 항목은 삭제
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
  } catch (error) {
    console.error('cleanupOldItems error:', error);
  }

  return cleanedCount;
}

/**
 * localStorage 사용량 확인 (MB 단위)
 */
export function getStorageSize(): { used: number; total: number; percentage: number } {
  let used = 0;
  const total = 5; // Most browsers allow ~5-10MB for localStorage

  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('getStorageSize error:', error);
  }

  const usedMB = used / (1024 * 1024);
  const percentage = (usedMB / total) * 100;

  return {
    used: parseFloat(usedMB.toFixed(2)),
    total,
    percentage: parseFloat(percentage.toFixed(2)),
  };
}

/**
 * 모든 아이디어 목록 가져오기
 */
export function getAllIdeas(): Array<{ id: string; timestamp: number }> {
  const ideas: Array<{ id: string; timestamp: number }> = [];

  try {
    const keys = Object.keys(localStorage).filter(
      (key) => key.startsWith(PREFIX + 'idea_') && !key.includes('_stage2') && !key.includes('_deep') && !key.includes('_report')
    );

    keys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return;

        const item: StorageItem<any> = JSON.parse(itemStr);
        const ideaId = key.replace(PREFIX + 'idea_', '');
        
        ideas.push({
          id: ideaId,
          timestamp: item.timestamp,
        });
      } catch (error) {
        console.error('getAllIdeas parse error:', error);
      }
    });

    // 최신순 정렬
    ideas.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('getAllIdeas error:', error);
  }

  return ideas;
}

/**
 * 오래된 아이디어 자동 삭제 (최근 N개만 유지)
 */
export function keepRecentIdeas(keepCount: number = 10): number {
  const ideas = getAllIdeas();
  let deletedCount = 0;

  if (ideas.length > keepCount) {
    const toDelete = ideas.slice(keepCount);
    toDelete.forEach((idea) => {
      removeIdeaData(idea.id);
      deletedCount++;
    });
  }

  return deletedCount;
}

/**
 * 앱 초기화 시 자동 정리 실행
 */
export function initStorageCleanup(): void {
  if (typeof window === 'undefined') return;

  // 만료된 항목 정리
  const expired = cleanupOldItems();
  if (expired > 0) {
    console.log(`Cleaned up ${expired} expired items`);
  }

  // 저장 공간 확인
  const size = getStorageSize();
  console.log(`localStorage usage: ${size.used}MB / ${size.total}MB (${size.percentage}%)`);

  // 80% 이상 사용 시 오래된 아이디어 정리
  if (size.percentage > 80) {
    const deleted = keepRecentIdeas(5); // 최근 5개만 유지
    console.log(`Storage > 80%, deleted ${deleted} old ideas`);
  }
}

// 레거시 localStorage 키 마이그레이션
export function migrateOldKeys(): void {
  try {
    const oldKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('idea_') && !key.startsWith(PREFIX)
    );

    oldKeys.forEach((oldKey) => {
      try {
        const value = localStorage.getItem(oldKey);
        if (value) {
          // 새로운 형식으로 저장
          const data = JSON.parse(value);
          const newKey = oldKey; // 키는 그대로, StorageItem 형식으로 감싸기
          
          const item: StorageItem<any> = {
            data,
            timestamp: Date.now(),
            ttl: DEFAULT_TTL,
          };
          
          localStorage.setItem(PREFIX + newKey, JSON.stringify(item));
          // 기존 키 삭제는 하지 않음 (호환성 유지)
        }
      } catch (error) {
        console.error('Migration error for key:', oldKey, error);
      }
    });
  } catch (error) {
    console.error('migrateOldKeys error:', error);
  }
}
