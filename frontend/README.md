# AI 스타트업 플랫폼 - 프론트엔드

간단한 아이디어 입력만으로 완전한 사업계획이 자동으로 생성되는 플랫폼

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버: http://localhost:3000

## 📁 프로젝트 구조

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 메인 입력 페이지 (/)
│   ├── ideas/[id]/
│   │   ├── page.tsx              # 아이디어 분석 (/ideas/:id)
│   │   ├── report/page.tsx       # 리포트 (/ideas/:id/report)
│   │   └── actions/page.tsx      # 액션 카드 (/ideas/:id/actions)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── loading.tsx               # 글로벌 로딩
│   ├── error.tsx                 # 글로벌 에러
│   └── not-found.tsx             # 404 페이지
│
├── components/
│   ├── idea-input-page.tsx       # 메인 입력 페이지 컴포넌트
│   ├── idea-analysis-page.tsx    # 분석 페이지 컴포넌트
│   ├── report-page.tsx           # 리포트 페이지 컴포넌트
│   ├── actions-page.tsx          # 액션 페이지 컴포넌트
│   ├── common/                   # 공통 컴포넌트
│   │   ├── loading.tsx
│   │   ├── error-display.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── index.ts
│   └── ui/                       # shadcn/ui 컴포넌트
│
├── lib/
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── client.ts                 # API 클라이언트 + React Hooks
│   ├── mock-data.ts              # 목업 데이터
│   ├── utils.ts                  # shadcn/ui 유틸
│   └── utils-common.ts           # 공통 유틸리티
│
└── .env.local                    # 환경 변수
```

## 🎯 주요 기능

### 1단계: 아이디어 입력
- 구글 검색창 스타일의 심플한 UI
- 티어 선택 (LIGHT / PRO / HEAVY)
- 실시간 입력 검증

### 2단계: 아이디어 분석
- 타겟 고객, 문제점, 솔루션 분석
- 티어별 차등 기능
  - LIGHT: 기본 분석만
  - PRO: 시장 규모 + 경쟁사 분석 + 피드백 기능
  - HEAVY: 모든 기능

### 3단계: 비즈니스 리포트
- 노션 스타일 레이아웃
- 6개 섹션:
  1. 사업 개요
  2. 시장 분석
  3. 경쟁사 분석
  4. 수익화 모델
  5. 사업 구조
  6. 개발 가이드
- PDF 다운로드 (백엔드 연동 후)

### 4단계: 실행 액션
- 4가지 액션 카드:
  1. 홍보 웹사이트 만들기
  2. 사업계획서 작성하기
  3. 피칭 PPT 제작하기
  4. MVP 개발 설계하기
- 티어별 잠금 기능

## 🧪 테스트 (목업 데이터)

백엔드 완성 전까지 목업 데이터로 테스트 가능:

```
LIGHT 티어:
- /ideas/demo-light
- /ideas/demo-light/report
- /ideas/demo-light/actions

PRO 티어:
- /ideas/demo-pro
- /ideas/demo-pro/report
- /ideas/demo-pro/actions

HEAVY 티어:
- /ideas/demo-heavy
- /ideas/demo-heavy/report
- /ideas/demo-heavy/actions
```

## 🔌 백엔드 연동

### 환경 변수 설정

`.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API 클라이언트 사용

```typescript
import { apiClient } from '@/lib/client';

// 아이디어 생성
const result = await apiClient.createIdea({
  idea: 'AI 헬스케어 플랫폼',
  tier: 'pro'
});

// 아이디어 조회
const idea = await apiClient.getIdea(result.id);

// 리포트 생성
await apiClient.generateReport({ ideaId: result.id });
```

### React Hooks 사용

```typescript
import { useCreateIdea, useIdea } from '@/lib/client';

function MyComponent() {
  const { create, loading, error } = useCreateIdea();
  const { data } = useIdea(ideaId, { poll: true });

  // ...
}
```

## 🎨 공통 컴포넌트

### 로딩

```typescript
import { Loading, Spinner, InlineLoading } from '@/components/common';

<Loading message="로딩 중..." />
<Spinner size="lg" />
<InlineLoading message="처리 중..." />
```

### 에러

```typescript
import { ErrorDisplay, InlineError } from '@/components/common';

<ErrorDisplay
  message="오류가 발생했습니다"
  onRetry={() => retry()}
/>
<InlineError message="입력값이 올바르지 않습니다" />
```

### 카드

```typescript
import { Card, InfoCard, StatCard } from '@/components/common';

<InfoCard
  icon="🎯"
  title="타겟 고객"
  content="30-40대 만성질환자"
/>

<StatCard
  label="TAM"
  value="250조원"
  color="indigo"
/>
```

### 배지

```typescript
import { TierBadge, StageBadge, StatusBadge } from '@/components/common';

<TierBadge tier="pro" />
<StageBadge stage={2} />
<StatusBadge status="available" />
```

## 🛠 유틸리티 함수

```typescript
import {
  canUseTierFeature,
  formatDate,
  formatCurrency,
  getIdeaUrl,
  copyToClipboard,
} from '@/lib/utils-common';

// 티어 기능 체크
if (canUseTierFeature(userTier, 'pro')) {
  // PRO 기능 사용
}

// 날짜 포맷
const formatted = formatDate(idea.createdAt);

// URL 생성
const url = getIdeaUrl(ideaId);
```

## 📝 TODO (백엔드 연동 시)

각 파일에서 `// TODO: API 연동` 주석을 찾아 수정:

1. `components/idea-input-page.tsx` - createIdea 호출
2. `components/idea-analysis-page.tsx` - getIdea, submitFeedback 호출
3. `components/report-page.tsx` - getReport 호출
4. `components/actions-page.tsx` - executeAction 호출

## 🚢 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

환경변수 설정:
- `NEXT_PUBLIC_API_URL`: 백엔드 API URL

## 📚 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Hooks
- **API Client**: Fetch API

## 🤝 백엔드 연동 가이드

백엔드 팀에게 전달된 문서:
- `types.ts` - 공유 타입 정의
- `api-spec.md` - REST API 명세
- `README.md` - API 사용 가이드
