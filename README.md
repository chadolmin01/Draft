# Draft - AI 스타트업 플랫폼

> 간단한 아이디어 입력으로 완전한 사업계획 생성

## 📋 목차

- [빠른 시작](#빠른-시작)
- [파일 구조](#파일-구조)
- [기술 스택](#기술-스택)
- [환경 설정](#환경-설정)
- [API 사용법](#api-사용법)
- [컴포넌트 예시](#컴포넌트-예시)

---

## 🚀 빠른 시작

### 1. 프론트엔드 개발자

```bash
# 1. 타입 정의와 클라이언트 복사
cp types.ts client.ts ./src/lib/

# 2. 환경변수 설정
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# 3. 의존성 설치 (이미 설치되어 있으면 스킵)
npm install

# 4. 개발 서버 실행
npm run dev
```

**첫 페이지 만들기**

`app/page.tsx`:
```tsx
import { IdeaInputPage } from '@/components/IdeaInputPage';

export default function Home() {
  return <IdeaInputPage />;
}
```

### 2. 백엔드 개발자

```bash
# 1. api-spec.md 읽고 엔드포인트 구현
# 2. types.ts 기준으로 응답 형식 맞추기
# 3. Claude API 연동

# 환경변수
ANTHROPIC_API_KEY=your_key
DATABASE_URL=your_supabase_url
```

**예시: 아이디어 생성 엔드포인트**

`app/api/ideas/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { CreateIdeaRequest, CreateIdeaResponse } from '@/lib/types';

export async function POST(request: Request) {
  const body: CreateIdeaRequest = await request.json();

  // 1. 검증
  if (!body.idea || !['light', 'pro', 'heavy'].includes(body.tier)) {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: '잘못된 입력입니다.' } },
      { status: 400 }
    );
  }

  // 2. DB 저장
  const idea = await db.ideas.create({
    idea: body.idea,
    tier: body.tier,
    userId: body.userId,
    stage: 1,
  });

  // 3. 백그라운드 분석 시작 (Stage 2)
  analyzeIdeaInBackground(idea.id);

  // 4. 응답
  return NextResponse.json<CreateIdeaResponse>({
    id: idea.id,
    stage: 1,
    message: '아이디어가 등록되었습니다.',
    estimatedTime: 30,
  }, { status: 201 });
}
```

---

## 📁 파일 구조

```
C:\project\Startup\
├── types.ts           # 공유 타입 정의 (프론트/백 모두 사용)
├── api-spec.md        # 백엔드용 API 명세
├── client.ts          # 프론트엔드용 API 클라이언트
├── examples.tsx       # 실전 컴포넌트 예시
└── README.md          # 이 문서
```

### 각 파일의 역할

| 파일 | 대상 | 용도 |
|------|------|------|
| `types.ts` | 프론트/백엔드 | TypeScript 타입 정의 공유 |
| `api-spec.md` | 백엔드 | REST API 구현 명세 |
| `client.ts` | 프론트엔드 | API 클라이언트 래퍼 + React Hooks |
| `examples.tsx` | 프론트엔드 | 7가지 실전 예시 |
| `README.md` | 모두 | Quick Start 가이드 |

---

## 🛠 기술 스택

### 프론트엔드
- **Next.js 14** (App Router)
- **Tailwind CSS** (스타일링)
- **shadcn/ui** (컴포넌트)
- **TypeScript**

### 백엔드
- **Next.js API Routes**
- **Claude API** (Anthropic)
- **Supabase** or **Firebase** (DB/인증)
- **Vercel** (배포)

---

## ⚙️ 환경 설정

### 프론트엔드 환경변수

`.env.local`:
```bash
# API 베이스 URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 옵션: 인증 토큰 (필요시)
NEXT_PUBLIC_AUTH_TOKEN=your_token
```

### 백엔드 환경변수

`.env.local`:
```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# 데이터베이스
DATABASE_URL=postgresql://...
# 또는
FIREBASE_CONFIG={"apiKey": "..."}

# 앱 설정
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🔌 API 사용법

### 기본 사용법

```typescript
import { apiClient } from '@/lib/client';

// 아이디어 생성
const result = await apiClient.createIdea({
  idea: 'AI 기반 헬스케어 플랫폼',
  tier: 'pro'
});

// 아이디어 조회
const idea = await apiClient.getIdea(result.id);

// 리포트 생성
await apiClient.generateReport({ ideaId: result.id });
```

### React Hooks 사용

```tsx
import { useCreateIdea, useIdea } from '@/lib/client';

function MyComponent() {
  const { create, loading, error } = useCreateIdea();

  const handleSubmit = async () => {
    const result = await create({
      idea: 'My idea',
      tier: 'light'
    });
    // result.id로 다음 페이지 이동
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? '생성 중...' : '시작하기'}
    </button>
  );
}
```

---

## 🎨 컴포넌트 예시

### 1. 메인 입력 페이지 (구글 검색창 스타일)

```tsx
import { IdeaInputPage } from './examples';

// app/page.tsx
export default function Home() {
  return <IdeaInputPage />;
}
```

**화면 구성:**
- 중앙 정렬된 큰 입력창
- 티어 선택 버튼 (라이트/프로/헤비)
- 심플한 "시작하기" CTA

### 2. 아이디어 분석 페이지 (티어별 차등)

```tsx
import { IdeaAnalysisPage } from './examples';

// app/ideas/[id]/page.tsx
export default function AnalysisPage({ params }: { params: { id: string } }) {
  return <IdeaAnalysisPage ideaId={params.id} />;
}
```

**화면 구성:**
- 기본 분석: 타겟/문제/솔루션 (모든 티어)
- 상세 분석: 시장 규모, 경쟁사 (프로 이상)
- 라이트 티어: 블러 처리 + 업그레이드 유도

### 3. 노션 스타일 리포트

```tsx
import { ReportPage } from './examples';

// app/ideas/[id]/report/page.tsx
export default function Report({ params }: { params: { id: string } }) {
  return <ReportPage ideaId={params.id} />;
}
```

**화면 구성:**
- 상단 헤더 (제목 + PDF 다운로드)
- 왼쪽 사이드바 (목차)
- 메인 컨텐츠 (섹션별 정리)

### 4. 액션 카드 섹션

```tsx
import { ActionCardsSection } from './examples';

// 리포트 페이지 하단에 포함
<ActionCardsSection ideaId={ideaId} />
```

**화면 구성:**
- 4개 카드: 랜딩페이지, 사업계획서, PPT, MVP 가이드
- 티어별 잠금 상태 표시
- 원클릭 생성

---

## 🎯 사용자 여정 플로우

```
1. 메인 페이지 (/)
   ↓ 아이디어 입력 + 티어 선택

2. 분석 페이지 (/ideas/:id)
   ↓ 자동 분석 (Stage 2)

3. 리포트 페이지 (/ideas/:id/report)
   ↓ 리포트 생성 버튼 클릭

4. 완성된 리포트 + 액션 카드
   ↓ 원하는 액션 실행

5. 액션 결과 페이지 (/ideas/:id/actions/:actionId)
```

---

## 🔒 티어별 기능

| 기능 | 라이트 | 프로 | 헤비 |
|------|--------|------|------|
| 기본 분석 | ✅ | ✅ | ✅ |
| 시장 규모 | ❌ | ✅ | ✅ |
| 경쟁사 분석 | ❌ | ✅ | ✅ |
| 피드백 수정 | ❌ | ✅ | ✅ |
| 리포트 생성 | ✅ (기본) | ✅ (상세) | ✅ (완전) |
| 랜딩페이지 | ✅ (구조만) | ✅ | ✅ (HTML) |
| 사업계획서 | ❌ | ✅ | ✅ |
| PPT | ❌ | ✅ | ✅ |
| MVP 가이드 | ❌ | ❌ | ✅ |
| 바이브코딩 | ❌ | ❌ | ✅ |

**UI 구현:**
```tsx
import { TierGatedFeature } from './examples';

<TierGatedFeature tier={userTier} requiredTier="pro">
  <DetailedAnalysis />
</TierGatedFeature>
```

---

## 🧪 테스트 시나리오

### 정상 플로우

```typescript
// 1. 아이디어 생성 (라이트)
const idea = await apiClient.createIdea({
  idea: 'AI 헬스케어',
  tier: 'light'
});

// 2. 분석 조회 (폴링)
const result = await apiClient.getIdea(idea.id);
// result.analysis에 기본 분석만 있음

// 3. 리포트 생성
await apiClient.generateReport({ ideaId: idea.id });

// 4. 액션 실행
await apiClient.executeAction({
  ideaId: idea.id,
  actionType: 'landing-page'
});
```

### 에러 처리

```typescript
try {
  // 라이트 티어로 피드백 시도
  await apiClient.submitFeedback({
    ideaId: 'xxx',
    feedback: '타겟 변경'
  });
} catch (error) {
  if (error.isTierLocked()) {
    // 업그레이드 유도 모달 표시
    showUpgradeModal();
  }
}
```

---

## 📊 데이터 플로우

```
사용자 입력
  ↓
Frontend: IdeaInputPage
  ↓
API Client: createIdea()
  ↓
Backend: POST /api/ideas
  ↓
Database: 아이디어 저장
  ↓
Background: Claude API 분석 (Stage 2)
  ↓
Database: 분석 결과 저장
  ↓
Frontend: 폴링으로 업데이트 감지
  ↓
UI: 분석 결과 표시
```

---

## 🎨 디자인 시스템 (다음 단계)

프로젝트 초기화 후 작업 예정:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo-600
        secondary: '#818CF8', // Indigo-400
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

## 🚧 다음 작업

### 완료된 작업 (2026-01-31) ✅
- [x] Next.js 프로젝트 초기화
- [x] Tailwind + shadcn/ui 설정
- [x] Awwwards 수준 디자인 시스템
- [x] 1단계: 메인 입력 페이지
- [x] 2단계: 분석 페이지 (시장 분석, 심화 분석)
- [x] 3단계: 리포트 페이지 (차트, 템플릿, 공유)
- [x] 4단계: 액션 카드 섹션 (UI)
- [x] 로딩/에러 상태 처리 (Rate Limit 포함)
- [x] 반응형 레이아웃
- [x] Gemini API 프롬프트 작성 (Stage 1-4)
- [x] API 엔드포인트 구현 (Stage 1-3)
- [x] 티어별 권한 검증

### 남은 작업 TODO
- [ ] Light 티어 구현 (stage1-light.md)
- [ ] Heavy 티어 구현 (stage1-heavy.md)
- [ ] 데이터베이스 연동 (Supabase)
- [ ] 사용자 인증 (NextAuth.js)
- [ ] PDF 다운로드 기능
- [ ] 피드백 API 구현
- [ ] 액션 실행 API 구현
- [ ] Rate limiting 고도화
- [ ] 에러 로깅 (Sentry)

---

## 📞 통합 테스트

프론트/백엔드 함께:

1. **Postman 컬렉션 만들기**
   - 모든 엔드포인트 테스트
   - 에러 시나리오 검증

2. **E2E 테스트**
   - 전체 사용자 여정 시뮬레이션
   - 티어별 기능 제한 테스트

3. **성능 테스트**
   - Claude API 응답 시간
   - 동시 요청 처리

---

## 🙋 FAQ

**Q: 익명 사용자도 가능한가요?**
A: 네, `userId` 옵션입니다. 나중에 로그인 추가 가능.

**Q: API 폴링 간격은?**
A: `useIdea` 훅의 `pollInterval` 옵션으로 조정 (기본 3초).

**Q: 리포트는 수정 가능한가요?**
A: 아니요, 읽기 전용입니다. 큰 변경은 아이디어를 새로 생성.

**Q: 에러 발생 시 재시도는?**
A: 클라이언트에서 수동으로 재시도. 자동 재시도는 추후 추가.

---

## 📚 참고 자료

- [Next.js 14 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Claude API](https://docs.anthropic.com)
- [Supabase](https://supabase.com/docs)

---

**준비 완료!** 🎉

이제 백엔드 Claude에게 `api-spec.md`를 전달하고,
프론트엔드는 `examples.tsx`를 참고하여 개발 시작하면 됩니다.
