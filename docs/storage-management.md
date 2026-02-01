# localStorage 캐시 관리 가이드

## 📦 현재 상황

### localStorage 사용 현황

프로젝트에서 localStorage를 다음과 같이 사용하고 있습니다:

```
idea_${id}                      → Stage 1 분석 결과
idea_${id}_stage2               → Stage 2 메인 분석
idea_${id}_deep_market-deep     → 시장 심화 분석
idea_${id}_deep_strategy        → 전략 분석
idea_${id}_deep_external        → 외부 환경 분석
idea_${id}_report               → Stage 3 리포트
```

**문제점**:
- ❌ 만료 시간 없음 (영구 저장)
- ❌ 자동 정리 메커니즘 없음
- ❌ 용량 제한 확인 없음 (브라우저 기본: ~5-10MB)
- ❌ 오래된 데이터 누적

---

## ✅ 해결 방안

### 1. Storage 유틸리티 추가

새로운 파일을 생성했습니다: **`frontend/lib/storage.ts`**

#### 주요 기능:

##### ⏰ 만료 시간 관리
```typescript
// 7일 후 자동 삭제
setStorageItem('idea_123', data, 7 * 24 * 60 * 60 * 1000);

// 가져올 때 자동으로 만료 확인
const data = getStorageItem('idea_123'); // 만료되면 null 반환
```

##### 🗑️ 자동 정리
```typescript
// 만료된 항목 자동 삭제
cleanupOldItems(); // 반환: 삭제된 개수

// 최근 N개만 유지
keepRecentIdeas(10); // 최근 10개만 유지, 나머지 삭제
```

##### 📊 용량 모니터링
```typescript
const { used, total, percentage } = getStorageSize();
// { used: 2.5, total: 5, percentage: 50 }

// 80% 이상 사용 시 자동 정리
if (percentage > 80) {
  keepRecentIdeas(5);
}
```

##### 🧹 아이디어별 삭제
```typescript
// 특정 아이디어의 모든 데이터 삭제
removeIdeaData('idea_123');
// → idea_123, idea_123_stage2, idea_123_deep_*, idea_123_report 모두 삭제
```

---

### 2. Storage Monitor 컴포넌트

개발 환경에서만 표시되는 모니터링 도구: **`frontend/components/storage-monitor.tsx`**

#### 기능:
- 💾 실시간 용량 확인
- 📋 저장된 아이디어 목록
- 🗑️ 개별/일괄 삭제
- 🔄 새로고침

#### 사용법:
Layout에 추가하면 우측 하단에 플로팅 버튼이 생성됩니다.

---

## 🔧 통합 방법

### 1. Layout에 Storage Monitor 추가

**`frontend/app/layout.tsx`** 수정:

```typescript
import { StorageMonitor } from '@/components/storage-monitor';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <StorageMonitor />
      </body>
    </html>
  );
}
```

### 2. 기존 코드 마이그레이션

기존의 `localStorage.setItem`/`getItem`을 새로운 유틸리티로 변경:

#### Before:
```typescript
localStorage.setItem(`idea_${id}`, JSON.stringify(data));
const data = JSON.parse(localStorage.getItem(`idea_${id}`) || '{}');
```

#### After:
```typescript
import { setStorageItem, getStorageItem } from '@/lib/storage';

setStorageItem(`idea_${id}`, data);
const data = getStorageItem(`idea_${id}`);
```

### 3. 앱 초기화 시 자동 정리

**`frontend/app/layout.tsx`** 또는 **`frontend/app/page.tsx`**:

```typescript
'use client';

import { useEffect } from 'react';
import { initStorageCleanup } from '@/lib/storage';

export default function Layout({ children }) {
  useEffect(() => {
    // 앱 시작 시 자동 정리
    initStorageCleanup();
  }, []);

  return <>{children}</>;
}
```

이렇게 하면:
- ✅ 만료된 항목 자동 삭제
- ✅ 80% 이상 사용 시 오래된 아이디어 삭제 (최근 5개만 유지)

---

## 🌐 배포 환경에서의 동작

### 로컬 vs 배포 차이점

| 항목 | 로컬 개발 | 배포 (Vercel/Netlify) |
|------|----------|----------------------|
| localStorage | ✅ 브라우저 로컬 | ✅ 브라우저 로컬 (동일) |
| 데이터 지속성 | 브라우저 종료 시에도 유지 | 브라우저 종료 시에도 유지 |
| 사용자별 격리 | ❌ 같은 브라우저 공유 | ✅ 사용자별 독립 |
| 서버 부하 | 없음 (클라이언트 저장) | 없음 (클라이언트 저장) |

### 중요 사항

**localStorage는 브라우저에 저장됩니다**:
- ✅ 서버에는 저장되지 않음
- ✅ 각 사용자의 브라우저에 독립적으로 저장
- ✅ 배포 환경에서도 동일하게 동작
- ⚠️ 브라우저 캐시 삭제 시 데이터 손실
- ⚠️ 시크릿/사생활 보호 모드에서는 제한적

### 배포 환경 테스트

배포 후 확인 사항:
1. 개발자 도구 → Application → Local Storage
2. Storage Monitor (개발 환경에서만 보임)
3. 여러 아이디어 생성 후 용량 확인

---

## 📊 권장 설정

### 만료 시간

```typescript
// Stage별 만료 시간 차등 적용
const TTL = {
  stage1: 7 * 24 * 60 * 60 * 1000,   // 7일
  stage2: 14 * 24 * 60 * 60 * 1000,  // 14일
  stage3: 30 * 24 * 60 * 60 * 1000,  // 30일 (리포트는 길게)
};

setStorageItem(`idea_${id}`, data, TTL.stage1);
setStorageItem(`idea_${id}_report`, report, TTL.stage3);
```

### 자동 정리 트리거

```typescript
// 1. 앱 시작 시
initStorageCleanup();

// 2. 새 아이디어 생성 시
const handleCreateIdea = async () => {
  // 용량 확인 후 정리
  const { percentage } = getStorageSize();
  if (percentage > 70) {
    cleanupOldItems();
  }
  
  // 아이디어 생성 로직...
};

// 3. 주기적으로 (선택사항)
useEffect(() => {
  const interval = setInterval(() => {
    cleanupOldItems();
  }, 60 * 60 * 1000); // 1시간마다
  
  return () => clearInterval(interval);
}, []);
```

---

## 🚨 문제 해결

### 1. QuotaExceededError

**증상**: "localStorage가 가득 참" 에러

**해결**:
```typescript
// storage.ts에 이미 구현됨
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    cleanupOldItems(); // 자동 정리
    // 재시도
  }
}
```

### 2. 데이터 손실 방지

**방법 1**: 서버 백업 (추천)
```typescript
// 중요 데이터는 서버에도 저장
await fetch('/api/ideas', {
  method: 'POST',
  body: JSON.stringify({ idea, analysis }),
});
```

**방법 2**: Export/Import 기능
```typescript
// 데이터 내보내기
const exportData = () => {
  const ideas = getAllIdeas();
  const data = ideas.map(idea => ({
    id: idea.id,
    ...getStorageItem(idea.id),
  }));
  
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // 다운로드 트리거...
};
```

### 3. 개인정보 보호

**주의**: localStorage는 암호화되지 않음

**해결**:
- 민감한 정보는 서버에만 저장
- 또는 암호화 후 저장

```typescript
// 간단한 암호화 (실제로는 더 강력한 방법 사용)
import CryptoJS from 'crypto-js';

const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
localStorage.setItem(key, encrypted);
```

---

## 📈 성능 고려사항

### localStorage 성능

- ✅ **읽기**: 매우 빠름 (동기)
- ✅ **쓰기**: 빠름 (동기)
- ⚠️ **용량**: 5-10MB 제한
- ⚠️ **블로킹**: UI 스레드 차단 가능 (대용량 데이터)

### 개선 방안

```typescript
// 1. 압축
import pako from 'pako';

const compressed = pako.deflate(JSON.stringify(data), { to: 'string' });
localStorage.setItem(key, compressed);

// 2. 청크 단위 저장 (대용량)
const CHUNK_SIZE = 1024 * 100; // 100KB
for (let i = 0; i < data.length; i += CHUNK_SIZE) {
  localStorage.setItem(`${key}_${i}`, data.slice(i, i + CHUNK_SIZE));
}

// 3. IndexedDB 대안 (>10MB)
// localStorage 대신 IndexedDB 사용 고려
```

---

## ✅ 체크리스트

### 즉시 적용 (권장)
- [ ] `frontend/lib/storage.ts` 생성됨
- [ ] `frontend/components/storage-monitor.tsx` 생성됨
- [ ] Layout에 `<StorageMonitor />` 추가
- [ ] 앱 초기화에 `initStorageCleanup()` 추가

### 점진적 마이그레이션 (선택)
- [ ] `idea-analysis-page.tsx`의 localStorage → storage 유틸리티
- [ ] `report/page.tsx`의 localStorage → storage 유틸리티
- [ ] 기타 컴포넌트 마이그레이션

### 배포 전 확인
- [ ] 브라우저에서 Storage Monitor 테스트
- [ ] 여러 아이디어 생성 후 용량 확인
- [ ] 만료 시간 동작 확인 (7일 후)
- [ ] 자동 정리 트리거 확인

---

## 🎯 결론

### 현재 문제
- ❌ localStorage 무제한 누적
- ❌ 만료 관리 없음
- ❌ 용량 초과 위험

### 해결책
- ✅ 만료 시간 관리 (7-30일)
- ✅ 자동 정리 메커니즘
- ✅ 용량 모니터링
- ✅ 개발자 도구 제공

### 배포 환경
- ✅ 로컬과 동일하게 동작
- ✅ 사용자별 독립적
- ✅ 서버 부하 없음

---

**다음 단계**:
1. Storage Monitor를 Layout에 추가하여 실시간 확인
2. 브라우저에서 테스트하여 용량 추이 관찰
3. 필요 시 기존 코드를 storage 유틸리티로 마이그레이션

**문의사항**:
- Storage Monitor가 보이지 않으면 개발 모드인지 확인
- 용량이 빠르게 증가하면 TTL 값 조정 검토
