# API Contract - Frontend Guide

프론트엔드 개발자를 위한 API 연동 가이드

---

## 📦 Quick Start

### 1. 타입 정의 임포트

```bash
# 프로젝트에 복사
cp api-contract/types.ts src/types/api.ts
cp api-contract/client.ts src/lib/api-client.ts
```

### 2. API 클라이언트 설정

```typescript
// src/lib/api.ts
import { api } from './api-client';

// 인증 토큰 설정 (로그인 후)
api.setToken(userToken);

export { api };
```

### 3. React 컴포넌트에서 사용

```typescript
import { useStage1 } from '@/lib/api-client';

function MyComponent() {
  const { analyze, loading, error, data } = useStage1();

  const handleSubmit = async (idea: string) => {
    await analyze({ idea, tier: 'pro' });
  };

  return (
    <div>
      {loading && <p>분석 중...</p>}
      {error && <p>오류: {error.message}</p>}
      {data && <p>타겟: {data.target}</p>}
    </div>
  );
}
```

---

## 📚 파일 구조

```
api-contract/
├── types.ts              # TypeScript 타입 정의 ⭐
├── client.ts             # API 클라이언트 + React Hooks ⭐
├── examples.tsx          # 사용 예시 코드
├── api-spec.md           # REST API 명세서
└── README.md             # 이 문서
```

**프론트엔드에서 필수로 가져가야 할 파일:**
- `types.ts`
- `client.ts`

---

## 🔌 API 엔드포인트 요약

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/stage1/analyze` | POST | 아이디어 해체 분석 |
| `/api/stage2/analyze` | POST | 시장 및 경쟁 분석 |
| `/api/stage3/generate` | POST | 통합 리포트 생성 |
| `/api/stage4/generate` | POST | 실행 액션 생성 |
| `/api/pipeline/full` | POST | 전체 파이프라인 실행 |
| `/api/pipeline/full-stream` | POST | 스트리밍 파이프라인 (SSE) |
| `/api/user/rate-limit` | GET | 사용량 조회 |

---

## 💡 주요 사용 패턴

### Pattern 1: 단계별 실행

사용자가 각 단계를 확인하면서 진행

```typescript
// 1. 아이디어 분석
const stage1 = await api.analyzeIdea({ idea, tier });

// 2. 시장 분석
const stage2 = await api.analyzeMarket({
  stage1Result: stage1.data,
  tier
});

// 3. 리포트 생성
const stage3 = await api.generateReport({
  stage1Result: stage1.data,
  stage2Result: stage2.data,
  tier
});
```

### Pattern 2: 원클릭 전체 실행

사용자가 한 번에 전체 결과를 받고 싶을 때

```typescript
const result = await api.runFullPipeline({
  idea: "사용자 아이디어",
  tier: "pro",
  includeActions: false
});

// result.data.stage1, stage2, stage3 모두 포함
```

### Pattern 3: 실시간 진행 상황 (Streaming)

긴 작업 시간 동안 사용자에게 진행률 표시

```typescript
const result = await api.runFullPipelineStream(
  { idea, tier: 'pro' },
  (event) => {
    if (event.type === 'progress') {
      setProgress(event.progress);
      setMessage(event.message);
    }
  }
);
```

---

## 🎨 UI/UX 권장사항

### 로딩 상태

```typescript
{loading && (
  <div className="loading-overlay">
    <Spinner />
    <p>아이디어를 분석하고 있습니다...</p>
    {progress && <ProgressBar value={progress.progress} />}
  </div>
)}
```

### 에러 처리

```typescript
{error && (
  <Alert variant="error">
    <p>{error.message}</p>
    {error.code === 'RATE_LIMIT' && (
      <Button onClick={() => navigate('/pricing')}>
        플랜 업그레이드
      </Button>
    )}
  </Alert>
)}
```

### 티어별 기능 제한 표시

```typescript
{tier === 'light' && (
  <div className="feature-locked">
    <LockIcon />
    <p>프로 플랜에서 사용 가능</p>
    <Button variant="primary">업그레이드</Button>
  </div>
)}
```

---

## 🔐 인증 처리

### JWT Token 저장 및 사용

```typescript
// 로그인 시
const { token } = await login(email, password);
localStorage.setItem('auth_token', token);
api.setToken(token);

// 앱 초기화 시
const token = localStorage.getItem('auth_token');
if (token) {
  api.setToken(token);
}

// 로그아웃 시
localStorage.removeItem('auth_token');
api.setToken(null);
```

### 401 Unauthorized 처리

```typescript
// client.ts에 추가
private async request<T>(...) {
  try {
    const response = await fetch(...);
    if (response.status === 401) {
      // 토큰 만료
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  }
}
```

---

## 📊 Rate Limit 처리

### 사용량 표시

```typescript
const RateLimitIndicator = () => {
  const { data } = useRateLimit();

  if (!data) return null;

  const percentage = (data.used / data.limit) * 100;

  return (
    <div>
      <p>{data.used} / {data.limit} 사용</p>
      <ProgressBar value={percentage} />
      {percentage > 80 && (
        <Warning>곧 한도에 도달합니다!</Warning>
      )}
    </div>
  );
};
```

### 한도 초과 시 처리

```typescript
try {
  await api.analyzeIdea({ idea, tier });
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    const resetDate = new Date(error.details.reset_at);
    alert(`한도 초과. ${resetDate.toLocaleDateString()}에 리셋됩니다.`);
  }
}
```

---

## 🧪 테스트

### Mock API 클라이언트

```typescript
// __mocks__/api-client.ts
export const api = {
  analyzeIdea: jest.fn().mockResolvedValue({
    success: true,
    data: {
      target: "테스트 타겟",
      problem: "테스트 문제",
      solution: "테스트 솔루션",
      confidence_score: 0.85,
      original_idea: "테스트 아이디어"
    }
  })
};
```

### 컴포넌트 테스트

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { api } from '@/lib/api-client';

jest.mock('@/lib/api-client');

test('Stage1Form submits idea', async () => {
  render(<Stage1Form />);

  fireEvent.change(screen.getByPlaceholderText('아이디어'), {
    target: { value: '테스트 아이디어' }
  });

  fireEvent.click(screen.getByText('분석'));

  await waitFor(() => {
    expect(api.analyzeIdea).toHaveBeenCalledWith({
      idea: '테스트 아이디어',
      tier: 'pro'
    });
  });
});
```

---

## 🚀 성능 최적화

### 1. 결과 캐싱

```typescript
import useSWR from 'swr';

const fetcher = (key: string) => api.analyzeIdea(JSON.parse(key));

function useIdea(idea: string, tier: Tier) {
  const key = JSON.stringify({ idea, tier });
  const { data, error } = useSWR(key, fetcher);

  return {
    data: data?.data,
    error,
    loading: !data && !error
  };
}
```

### 2. Debounce 입력

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedAnalyze = useDebouncedCallback(
  (idea: string) => {
    analyze({ idea, tier });
  },
  1000 // 1초 대기
);

<input onChange={(e) => debouncedAnalyze(e.target.value)} />
```

### 3. Optimistic Update

```typescript
const handleSubmit = async (idea: string) => {
  // 즉시 UI 업데이트
  setOptimisticData({
    target: "분석 중...",
    problem: "...",
    solution: "..."
  });

  try {
    const result = await analyze({ idea, tier });
    setActualData(result);
  } catch {
    // 실패 시 optimistic 데이터 제거
    setOptimisticData(null);
  }
};
```

---

## 🐛 디버깅

### API 요청 로깅

```typescript
// client.ts에 추가
private async request<T>(...) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]', endpoint, options);
  }

  const response = await fetch(...);

  if (process.env.NODE_ENV === 'development') {
    console.log('[API Response]', await response.clone().json());
  }
}
```

### Network Inspector

브라우저 DevTools → Network 탭에서:
- Status: 200 (성공) / 4xx (클라이언트 오류) / 5xx (서버 오류)
- Response: JSON 형식 확인
- Timing: 응답 시간 확인 (30-60초 예상)

---

## 📱 반응형 고려사항

### 모바일에서 긴 작업

```typescript
// 화면 꺼짐 방지 (선택적)
const wakeLock = await navigator.wakeLock?.request('screen');

try {
  await api.runFullPipeline({ idea, tier });
} finally {
  wakeLock?.release();
}
```

### 오프라인 처리

```typescript
if (!navigator.onLine) {
  alert('인터넷 연결을 확인하세요.');
  return;
}

await api.analyzeIdea({ idea, tier });
```

---

## 🔗 백엔드 협업 체크리스트

프론트엔드 개발 시작 전 백엔드와 확인:

- [ ] Base URL 확정 (staging/production)
- [ ] 인증 방식 (JWT) 및 토큰 형식
- [ ] CORS 설정 완료
- [ ] Rate Limit 정책 (티어별 한도)
- [ ] 에러 코드 및 메시지 일치
- [ ] Streaming 지원 여부 (SSE)
- [ ] TypeScript 타입 정의 동기화

---

## 📞 문의

백엔드 팀과 협의 필요 시:
- API 명세서: `api-spec.md` 참고
- 타입 정의: `types.ts` 공유
- 예시 코드: `examples.tsx` 참고

---

**Happy Coding! 🚀**
