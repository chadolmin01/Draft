# Claude CLI 핸드오프 프롬프트

다른 Claude CLI 인스턴스에 프로젝트를 인계할 때 아래 내용을 복사해 붙여넣으세요. 토큰 절약을 위해 핵심 정보만 압축했습니다.

---

## 프로젝트 개요

**AI 스타트업 플랫폼** - 사용자 아이디어를 입력받아 AI(Gemini)로 사업계획을 생성하는 Next.js 앱.

- **메인 앱**: `frontend/` (Next.js 16, React 19)
- **데이터 저장**: localStorage (DB 미연동)
- **AI**: Google Gemini API (lib/gemini.ts)

---

## 디렉토리 구조 (핵심만)

```
Startup/
├── frontend/                 # 메인 Next.js 앱
│   ├── app/
│   │   ├── page.tsx          # 홈: PageLoader → IdeaInputPage
│   │   ├── layout.tsx        # ClientLayoutWrapper 래핑
│   │   ├── globals.css       # Tailwind + Awwwards 디자인 시스템
│   │   ├── api/ideas/        # POST /api/ideas (Stage 1)
│   │   ├── api/ideas/[id]/   # market-analysis, deep-analysis, report, report/custom
│   │   └── ideas/[id]/       # page, report/page, actions/page
│   ├── components/
│   │   ├── idea-input-page.tsx    # 아이디어 입력 폼
│   │   ├── idea-analysis-page.tsx # 분석 결과 표시
│   │   ├── report-page.tsx        # 통합 리포트
│   │   ├── hero-section.tsx       # 풀스크린 Hero
│   │   ├── page-loader.tsx       # 로드 애니메이션
│   │   ├── custom-cursor.tsx     # 커스텀 커서 (데스크톱)
│   │   ├── smooth-scroll.tsx      # Lenis 스무스 스크롤
│   │   ├── client-layout-wrapper.tsx # SmoothScroll, CustomCursor, Toast
│   │   ├── 3d/                   # canvas-wrapper, floating-shapes, idea-visualization
│   │   ├── layout/               # asymmetric-grid, split-view, horizontal-scroll
│   │   └── ui/                   # button, input, card, magnetic-button, tilt-card
│   └── lib/
│       ├── gemini.ts         # callGemini, parseJsonResponse
│       ├── prompts.ts        # loadPrompt(stage, tier), loadDeepPrompt
│       ├── types.ts          # Tier, IdeaAnalysis, BusinessReport 등
│       ├── mock-data.ts      # generateMockStage1Analysis, getMockIdea
│       ├── gsap-config.ts    # GSAP ScrollTrigger 설정
│       ├── animation-presets.ts
│       └── storage.ts
├── prompts/                  # AI 프롬프트 (frontend 상위)
│   ├── stage1-pro-only.md
│   ├── stage1-idea-breakdown.md
│   ├── stage2-market-analysis.md
│   ├── stage2-deep-*.md
│   └── stage3-integrated-report.md
├── knowledge-base/
└── ARCHITECTURE.txt
```

---

## Path Alias

- `@/*` → `frontend/*` (tsconfig paths)

---

## 주요 Import 패턴

```ts
// 컴포넌트
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroSection } from '@/components/hero-section';
import type { Tier, IdeaAnalysis } from '@/lib/types';
import { isMockMode } from '@/lib/mock-mode';
import '@/lib/gsap-config';

// API 라우트
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';
import type { Tier, IdeaAnalysis } from '@/lib/types';

// 프롬프트 경로: process.cwd() 기준 ../prompts (frontend 실행 시 Startup/prompts)
```

---

## 구현된 기능 요약

### 1. 파이프라인 (Stage 1~3)
- **Stage 1**: 아이디어 입력 → Gemini 분석 → localStorage 저장 → `/ideas/[id]`
- **Stage 2**: 시장 분석, 심화 분석 (market-deep, strategy, external)
- **Stage 3**: 통합 리포트 생성, PDF/공유

### 2. Awwwards 수준 디자인 (완료)
- 커스텀 커서, Lenis 스무스 스크롤
- 풀스크린 Hero, 페이지 로더 (카운터 + 커튼)
- GSAP ScrollTrigger, Framer Motion
- 3D (R3F, drei, postprocessing): floating-shapes, idea-visualization
- 레이아웃: asymmetric-grid, split-view, horizontal-scroll
- UI: magnetic-button, tilt-card, ripple, morphing variants
- globals.css: text-display, text-gradient-animated, section-padding

### 3. API 엔드포인트
- `POST /api/ideas` - Stage 1 (idea, tier)
- `POST /api/ideas/[id]/market-analysis` - Stage 2
- `POST /api/ideas/[id]/deep-analysis` - 심화 분석
- `POST /api/ideas/[id]/report` - Stage 3 리포트
- `POST /api/ideas/[id]/report/custom` - 커스텀 섹션 (스텁)

### 4. Mock 모드
- `x-mock-mode: true` 헤더로 Mock 데이터 반환
- `lib/mock-mode.ts`: `isMockMode()` - URL 파라미터 또는 localStorage

### 5. 환경 변수
- `GOOGLE_API_KEY` (서버 전용, .env.local)
- `NEXT_PUBLIC_API_URL` (선택)

---

## 주의사항

1. **Next.js 16**: 동적 라우트 `params`는 `Promise<{ id: string }>` (await 필요)
2. **프롬프트 경로**: `lib/prompts.ts`는 `path.join(process.cwd(), '..', 'prompts')` 사용
3. **모바일**: CustomCursor, SmoothScroll는 768px 미만에서 비활성화
4. **접근성**: `prefers-reduced-motion` 지원 (globals.css)
5. **타입**: `Tier`, `Stage`는 `lib/types.ts`에서 import

---

## 다음 작업 참고

- ARCHITECTURE.txt: 데이터 플로우, API 응답 예시
- IMPLEMENTATION_SUMMARY.md (frontend): 리포트 차트, 템플릿, 공유 UI
- QUICK_START.md: 실행 방법

---

**위 내용을 새 Claude CLI 세션에 붙여넣고, 구체적인 작업 지시를 추가하세요.**
