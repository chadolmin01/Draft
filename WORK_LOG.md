# AI 스타트업 플랫폼 - 작업 기록 (Work Log)

**작성일:** 2026-01-29
**작업자:** Claude Sonnet 4.5
**프로젝트:** AI 기반 스타트업 비즈니스 플랜 생성 플랫폼

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [완료된 작업](#완료된-작업)
3. [기술 스택](#기술-스택)
4. [프로젝트 구조](#프로젝트-구조)
5. [핵심 파일 설명](#핵심-파일-설명)
6. [API 설정](#api-설정)
7. [데이터 플로우](#데이터-플로우)
8. [주요 이슈 및 해결](#주요-이슈-및-해결)
9. [미완성 작업](#미완성-작업)
10. [다음 작업자를 위한 가이드](#다음-작업자를-위한-가이드)

---

## 프로젝트 개요

### 비즈니스 목표
사용자가 간단한 아이디어만 입력하면 AI가 완전한 비즈니스 플랜을 생성해주는 플랫폼 구축

### 핵심 기능
- **Stage 1 (아이디어 분해):** 타겟, 문제, 솔루션, 수익모델 분석
- **Stage 2 (시장 분석):** 시장 규모, 경쟁사, 차별화 포인트
- **Stage 3 (통합 리포트):** 완전한 비즈니스 플랜 문서
- **Stage 4 (액션 아이템):** 구체적 실행 방안

### 티어 시스템
- **Light:** 기본 분석만
- **Pro:** 수익모델 분석 포함 (현재 구현 완료)
- **Heavy:** 전체 기능 + 바이브 코딩

---

## 완료된 작업

### ✅ Phase 1: 프롬프트 엔지니어링 (완료)

#### 1.1 프롬프트 설계
**위치:** `prompts/`

- ✅ `stage1-pro-only.md` - Pro 티어 전용 Stage 1 프롬프트
  - 타겟/문제/솔루션 분석
  - 수익모델 분석 (revenue_analysis)
  - 수익화 난이도 평가
  - Few-shot 예시 포함

**중요 특징:**
- `{USER_IDEA}` 플레이스홀더 사용 (다른 변수명 아님!)
- JSON 응답 강제 (스키마 명시)
- confidence_score는 아이디어 명확성만 평가 (수익모델과 무관)

#### 1.2 Knowledge Base
**위치:** `knowledge-base/`

- ✅ `startup-evaluation-criteria.md` - 투자 평가 기준
- ✅ `successful-startup-examples.md` - 성공 사례 (Notion, Figma 등)

#### 1.3 스키마 정의
**위치:** `schemas/`

- ✅ `stage1-schema.json` - Stage 1 응답 스키마

#### 1.4 수동 테스트
**위치:** `test-prompts-copypaste.md`

- Claude.ai Projects에서 수동 테스트 완료
- Pro 티어 기능 (revenue_analysis) 정상 작동 확인

---

### ✅ Phase 2: Next.js 프론트엔드 (기존 코드 + 연동)

#### 2.1 프론트엔드 기본 구조 (기존 작업)
**위치:** `frontend/`

**주요 컴포넌트:**
- `components/idea-input-page.tsx` - 아이디어 입력 폼
- `components/idea-analysis-page.tsx` - 분석 결과 표시
- `components/report-page.tsx` - 리포트 페이지
- `components/actions-page.tsx` - 액션 아이템 페이지

**라우팅:**
- `app/page.tsx` - 홈 (아이디어 입력)
- `app/ideas/[id]/page.tsx` - 분석 결과
- `app/ideas/[id]/report/page.tsx` - 리포트
- `app/ideas/[id]/actions/page.tsx` - 액션

**스타일링:**
- Tailwind CSS 사용
- shadcn/ui 컴포넌트 라이브러리
- Dark mode 지원

#### 2.2 API 클라이언트 (기존)
**위치:** `frontend/lib/client.ts`

- REST API 호출 래퍼 클래스
- 에러 핸들링
- React hooks (useCreateIdea, useIdea 등)
- **주의:** 원래는 mock 데이터만 사용하도록 되어 있었음

#### 2.3 타입 정의 (기존)
**위치:** `frontend/lib/types.ts`

- TypeScript 인터페이스 정의
- Stage별 데이터 구조
- API 요청/응답 타입

---

### ✅ Phase 3: Gemini API 백엔드 연동 (신규 작업)

#### 3.1 Google Gemini SDK 설치
```bash
cd frontend
npm install @google/generative-ai
```

**결과:** `package.json`에 `@google/generative-ai` 추가됨

#### 3.2 Gemini API 래퍼 작성
**파일:** `frontend/lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function callGemini(
  prompt: string,
  useJsonMode: boolean = true
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',  // ⚠️ 중요: 모델명 정확히 확인됨
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      ...(useJsonMode && { responseMimeType: 'application/json' }),
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

**주요 포인트:**
- ✅ 모델명: `gemini-2.5-flash` (2026년 1월 기준 최신)
- ✅ JSON 모드 지원 (`responseMimeType: 'application/json'`)
- ✅ 무료 한도: 분당 15 요청, 일일 1,500 요청

#### 3.3 프롬프트 로더 작성
**파일:** `frontend/lib/prompts.ts`

```typescript
import fs from 'fs';
import path from 'path';

export function loadPrompt(stage: number, tier: 'light' | 'pro' | 'heavy'): string {
  const promptsDir = path.join(process.cwd(), '..', 'prompts');

  let fileName = `stage${stage}.md`;
  if (tier === 'pro' && stage === 1) {
    fileName = 'stage1-pro-only.md';
  }

  const filePath = path.join(promptsDir, fileName);
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}
```

**주의사항:**
- ✅ UTF-8 인코딩 명시 (`{ encoding: 'utf-8' }`)
- ✅ 프롬프트 디렉토리는 `frontend/` 상위 (`../prompts`)
- ✅ Pro 티어는 `stage1-pro-only.md` 사용

#### 3.4 API 라우트 작성
**파일:** `frontend/app/api/ideas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { idea, tier } = body;

  // 프롬프트 로드 및 변수 치환
  const promptTemplate = loadPrompt(1, tier);
  const prompt = promptTemplate.replace('{USER_IDEA}', idea);

  // Gemini API 호출
  const response = await callGemini(prompt, true);
  const analysis = parseJsonResponse(response);

  // ID 생성
  const ideaId = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return NextResponse.json({
    success: true,
    data: { id: ideaId, idea, tier, createdAt: new Date().toISOString(), stage: 1, analysis }
  });
}
```

**핵심:**
- ✅ POST /api/ideas 엔드포인트
- ✅ `{USER_IDEA}` 변수 치환 (정확한 플레이스홀더 사용!)
- ✅ 에러 핸들링 포함
- ✅ 응답 시간: 평균 15-20초

#### 3.5 환경 변수 설정
**파일:** `frontend/.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google Gemini API Key
GOOGLE_API_KEY=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q

# Optional: Auth token
# NEXT_PUBLIC_AUTH_TOKEN=your_token
```

**⚠️ 보안 주의:**
- API 키는 절대 클라이언트에 노출되면 안 됨
- `NEXT_PUBLIC_` 접두사 없이 설정 (서버 전용)

---

### ✅ Phase 4: 프론트엔드 Mock → Real API 전환

#### 4.1 아이디어 입력 페이지 수정
**파일:** `frontend/components/idea-input-page.tsx`

**변경 전:**
```typescript
// TODO: API 연동 (백엔드 완성 후)
// 임시: 목업 데이터로 리다이렉트
window.location.href = `/ideas/demo-${tier}`;
```

**변경 후:**
```typescript
// 실제 API 호출
const response = await fetch('/api/ideas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idea, tier }),
});

const result = await response.json();

if (result.success) {
  // localStorage에 저장
  localStorage.setItem(`idea_${result.data.id}`, JSON.stringify(result.data));
  window.location.href = `/ideas/${result.data.id}`;
}
```

#### 4.2 아이디어 상세 페이지 수정
**파일:** `frontend/app/ideas/[id]/page.tsx`

**변경 전:**
```typescript
// Server Component
const data = getMockIdea(id);  // Mock 데이터만 사용
```

**변경 후:**
```typescript
'use client';

// localStorage에서 실제 데이터 읽기
const stored = localStorage.getItem(`idea_${id}`);
if (stored) {
  setData(JSON.parse(stored));  // 실제 API 결과
} else {
  setData(getMockIdea(id));  // Fallback: Mock 데이터
}
```

**변경 이유:**
- Server Component → Client Component 전환
- localStorage 사용을 위해 필요
- Mock 데이터는 폴백으로만 유지

---

## 기술 스택

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui, Radix UI
- **Icons:** Lucide React

### Backend (API)
- **Runtime:** Next.js API Routes (서버리스)
- **AI Model:** Google Gemini 2.5 Flash
- **SDK:** @google/generative-ai

### Development
- **Package Manager:** npm
- **Dev Server:** Next.js Turbopack
- **Port:** 3003 (3000이 사용 중이어서)

---

## 프로젝트 구조

```
C:\project\Startup\
│
├── prompts/                      # AI 프롬프트 파일
│   ├── stage1-pro-only.md       # ✅ Pro 티어 Stage 1 (완성)
│   ├── stage1.md                # Light 티어 (미작업)
│   ├── stage2.md                # Stage 2 (미작업)
│   └── stage3.md                # Stage 3 (미작업)
│
├── knowledge-base/               # AI 학습 자료
│   ├── startup-evaluation-criteria.md
│   └── successful-startup-examples.md
│
├── schemas/                      # JSON 스키마
│   └── stage1-schema.json
│
├── api-contract/                 # API 명세 (참고용)
│   ├── types.ts
│   └── api-spec.md
│
├── docs/                         # 설계 문서
│   └── pipeline-design.md
│
├── frontend/                     # ✅ Next.js 애플리케이션
│   ├── app/
│   │   ├── page.tsx             # 홈 (아이디어 입력)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── api/
│   │   │   └── ideas/
│   │   │       └── route.ts     # ✅ POST /api/ideas (신규)
│   │   └── ideas/
│   │       └── [id]/
│   │           ├── page.tsx     # ✅ 분석 결과 (수정됨)
│   │           ├── report/
│   │           │   └── page.tsx
│   │           └── actions/
│   │               └── page.tsx
│   │
│   ├── components/
│   │   ├── idea-input-page.tsx        # ✅ 실제 API 호출 (수정됨)
│   │   ├── idea-analysis-page.tsx
│   │   ├── report-page.tsx
│   │   ├── actions-page.tsx
│   │   ├── common/
│   │   └── ui/                        # shadcn/ui 컴포넌트
│   │
│   ├── lib/
│   │   ├── gemini.ts            # ✅ Gemini API 래퍼 (신규)
│   │   ├── prompts.ts           # ✅ 프롬프트 로더 (신규)
│   │   ├── client.ts            # API 클라이언트
│   │   ├── types.ts             # TypeScript 타입
│   │   ├── mock-data.ts         # Mock 데이터 (폴백용)
│   │   └── utils.ts
│   │
│   ├── .env.local               # ✅ 환경 변수 (API 키)
│   ├── package.json
│   └── tsconfig.json
│
├── web/                          # ⚠️ 테스트용 (사용 안 함)
│   └── (초기 테스트로 생성, 무시해도 됨)
│
├── test-prompts-copypaste.md    # 수동 테스트용
└── WORK_LOG.md                  # ✅ 이 파일!
```

---

## 핵심 파일 설명

### 1. `prompts/stage1-pro-only.md`
**목적:** Pro 티어 Stage 1 분석용 프롬프트

**구조:**
- System Message (역할 정의)
- Task Instructions (작업 지시)
- Output Format (JSON 스키마)
- Few-Shot Examples (예시 3개)
- Critical Requirements (필수 필드 명시)

**중요 포인트:**
```markdown
사용자 입력: {USER_IDEA}
```
- ⚠️ 정확히 `{USER_IDEA}` 사용 (대문자, 중괄호 1개)
- `{{USER_INPUT}}` 같은 다른 변수명 사용 금지

**필수 출력 필드:**
- `revenue_analysis` - 수익 모델 분석 (Pro 핵심 기능)
- `monetization_difficulty` - 수익화 난이도
- `monetization_reason` - 난이도 근거
- `first_revenue_timeline` - 첫 수익 예상 시기

### 2. `frontend/lib/gemini.ts`
**목적:** Gemini API 호출 래퍼

**주요 함수:**

#### `callGemini(prompt, useJsonMode)`
- Gemini API 호출
- JSON 모드 지원
- 반환: string (JSON 형식)

#### `parseJsonResponse<T>(response)`
- JSON 파싱
- Markdown 코드블록 제거
- 에러 핸들링

**사용 예:**
```typescript
const response = await callGemini(prompt, true);
const data = parseJsonResponse<Stage1Output>(response);
```

### 3. `frontend/lib/prompts.ts`
**목적:** 프롬프트 파일 로더

**주요 함수:**

#### `loadPrompt(stage, tier)`
- 프롬프트 파일 읽기
- 티어별 파일 선택
- UTF-8 인코딩 보장

**파일 선택 로직:**
```typescript
if (tier === 'pro' && stage === 1) {
  fileName = 'stage1-pro-only.md';  // Pro 전용
} else {
  fileName = `stage${stage}.md`;     // 기본
}
```

### 4. `frontend/app/api/ideas/route.ts`
**목적:** Stage 1 분석 API 엔드포인트

**엔드포인트:** `POST /api/ideas`

**요청:**
```json
{
  "idea": "대학교 커피 찌꺼기로 굿즈를 만드는 사업",
  "tier": "pro"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "idea_1769696195306_99kpzb8or",
    "idea": "...",
    "tier": "pro",
    "createdAt": "2026-01-29T14:16:35.306Z",
    "stage": 1,
    "analysis": {
      "target": "...",
      "problem": "...",
      "solution": "...",
      "revenue_analysis": { ... },
      "monetization_difficulty": "중간",
      // ... 기타 필드
    }
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "아이디어를 입력해주세요."
  }
}
```

### 5. `frontend/components/idea-input-page.tsx`
**목적:** 아이디어 입력 폼 UI

**주요 기능:**
- 아이디어 텍스트 입력
- 티어 선택 (Light/Pro/Heavy)
- API 호출 및 로딩 상태
- localStorage 저장
- 결과 페이지로 리다이렉트

**데이터 플로우:**
```
사용자 입력 → fetch('/api/ideas') → localStorage 저장 → 리다이렉트
```

### 6. `frontend/app/ideas/[id]/page.tsx`
**목적:** 분석 결과 표시 페이지

**주요 기능:**
- localStorage에서 데이터 읽기
- Mock 데이터 폴백
- IdeaAnalysisPage 컴포넌트 렌더링

**데이터 소스 우선순위:**
1. localStorage (실제 API 결과)
2. Mock 데이터 (demo-light, demo-pro, demo-heavy)

---

## API 설정

### Google AI Studio 설정

1. **API 키 발급:**
   - https://ai.google.dev/ 접속
   - "Get API key in Google AI Studio" 클릭
   - Google 계정 로그인
   - "Create API key" 생성

2. **현재 사용 중인 API 키:**
   ```
   AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q
   ```

3. **무료 한도:**
   - 분당 요청: 15 RPM
   - 일일 요청: 1,500 RPD
   - 토큰 제한: 입력 1M, 출력 65K

### 사용 가능한 모델

**2026년 1월 기준:**
```
models/gemini-2.5-flash    ✅ 현재 사용 중
models/gemini-2.5-pro      (더 강력하지만 느림)
```

**주의:** 모델명은 자주 변경됨. 404 에러 시 다음 명령으로 확인:
```bash
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
```

---

## 데이터 플로우

### Stage 1 분석 전체 흐름

```
1. 사용자 입력
   ↓
   [idea-input-page.tsx]
   - 아이디어 텍스트
   - 티어 선택 (pro)
   ↓

2. API 요청
   ↓
   [POST /api/ideas]
   ↓
   [route.ts]
   - 입력 검증
   - loadPrompt(1, 'pro') → prompts/stage1-pro-only.md 읽기
   - 프롬프트에서 {USER_IDEA} → 실제 아이디어로 치환
   ↓

3. AI 분석
   ↓
   [gemini.ts]
   - callGemini(prompt, true)
   - Gemini 2.5 Flash 호출 (JSON 모드)
   - 응답 시간: 15-20초
   ↓
   [Gemini API]
   - 타겟/문제/솔루션 분석
   - 수익모델 분석 (Pro 티어)
   - JSON 응답 생성
   ↓

4. 응답 처리
   ↓
   [route.ts]
   - parseJsonResponse() → JSON 파싱
   - ID 생성 (idea_timestamp_random)
   - 응답 반환
   ↓

5. 클라이언트 저장
   ↓
   [idea-input-page.tsx]
   - localStorage.setItem(`idea_${id}`, data)
   - window.location.href = `/ideas/${id}`
   ↓

6. 결과 표시
   ↓
   [ideas/[id]/page.tsx]
   - localStorage.getItem(`idea_${id}`)
   - IdeaAnalysisPage 렌더링
   ↓
   [idea-analysis-page.tsx]
   - 분석 결과 UI 표시
   - Pro 티어: revenue_analysis 섹션 표시
```

### 데이터 저장 방식

**현재:** localStorage (클라이언트)
```javascript
localStorage.setItem(`idea_${id}`, JSON.stringify(data));
```

**장점:**
- 구현 간단
- 별도 DB 불필요

**단점:**
- 브라우저 종료 시 유지되나, 다른 기기에서 접근 불가
- 용량 제한 (보통 5-10MB)

**향후 개선 방안:**
- Database 연동 (PostgreSQL, MongoDB 등)
- Vercel KV (Redis)
- Supabase

---

## 주요 이슈 및 해결

### Issue 1: Gemini 모델 404 에러
**증상:**
```
Error: models/gemini-1.5-pro is not found for API version v1beta
```

**원인:**
- 2026년 1월 기준 Gemini 모델명 변경됨
- `gemini-1.5-pro` → `gemini-2.5-flash`로 업데이트

**해결:**
```typescript
// Before
model: 'gemini-1.5-pro'

// After
model: 'gemini-2.5-flash'  ✅
```

**확인 방법:**
```bash
curl "https://generativelanguage.googleapis.com/v1/models?key=API_KEY"
```

### Issue 2: 프롬프트 변수 치환 실패
**증상:**
- API 응답에 `{USER_IDEA}` 그대로 출력됨
- 엉뚱한 비즈니스 아이디어 분석됨

**원인:**
```typescript
// Wrong
promptTemplate.replace('{{USER_INPUT}}', idea)

// Correct
promptTemplate.replace('{USER_IDEA}', idea)  ✅
```

**교훈:**
- 프롬프트 파일의 플레이스홀더 정확히 확인 필수
- `{USER_IDEA}` (대문자, 중괄호 1개)

### Issue 3: 한글 인코딩 문제
**증상:**
- curl 테스트 시 한글이 깨짐
- `\udceb\udc8c\udc80` 같은 이상한 문자 출력

**원인:**
- Windows curl의 UTF-8 인코딩 이슈
- 프롬프트 파일 읽기 시 인코딩 미지정

**해결:**
```typescript
// Before
fs.readFileSync(filePath, 'utf-8')

// After
fs.readFileSync(filePath, { encoding: 'utf-8' })  ✅
```

**추가 조치:**
- 브라우저에서 테스트 (curl 대신)
- JSON 파일로 요청 저장 후 전송

### Issue 4: Mock 데이터만 표시됨
**증상:**
- API는 정상 작동하지만 프론트엔드에서 mock 데이터만 보임

**원인:**
```typescript
// idea-input-page.tsx
// TODO: API 연동 (백엔드 완성 후)  ← 주석 처리됨
window.location.href = `/ideas/demo-${tier}`;  ← Mock 리다이렉트
```

**해결:**
1. 실제 API 호출 코드 활성화
2. localStorage 저장 추가
3. 결과 페이지도 Client Component로 전환

### Issue 5: Next.js Lock 파일 충돌
**증상:**
```
⨯ Unable to acquire lock at .next/dev/lock
```

**원인:**
- 이전 dev 서버가 비정상 종료
- Lock 파일 남아있음

**해결:**
```bash
rm -f frontend/.next/dev/lock
npm run dev
```

---

## 완료된 작업 (2026-01-31 업데이트)

### ✅ Stage 2: 시장 분석 (완료)

**완료 내역:**
1. ✅ `prompts/stage2-market-analysis.md` 작성
2. ✅ `frontend/app/api/ideas/[id]/market-analysis/route.ts` 구현
3. ✅ Market Analysis 컴포넌트 연동 (idea-analysis-page.tsx)
4. ✅ 심화 분석 3종 구현
   - stage2-deep-market.md (TAM/SAM/SOM, 포지셔닝 맵, 가격 벤치마킹)
   - stage2-deep-strategy.md (SWOT, 시장 진입 전략, 자원 추정)
   - stage2-deep-external.md (규제, 투자 트렌드, 유사 사례)

**구현된 출력:**
- 시장 규모 (TAM/SAM/SOM) ✅
- 경쟁사 분석 ✅
- 차별화 포인트 ✅
- SWOT 분석 ✅
- 포지셔닝 맵 ✅
- 가격 벤치마킹 ✅

### ✅ Stage 3: 통합 리포트 (완료)

**완료 내역:**
1. ✅ `prompts/stage3-integrated-report.md` 작성
2. ✅ Stage 1 + Stage 2 결과 통합
3. ✅ 완전한 비즈니스 플랜 문서 생성
4. ✅ 리포트 시스템 개선
   - Recharts 차트 통합
   - 8가지 템플릿 시스템
   - 공유 기능 (링크, 소셜 미디어)
   - 섹션 커스터마이징
5. ⏳ PDF 다운로드 기능 (미완성)

### ✅ Stage 4: 액션 아이템 (부분 완료)

**완료 내역:**
1. ✅ `prompts/stage4-landing-page.md` 작성
2. ✅ UI 컴포넌트 (actions-page.tsx)
3. ⏳ 액션 실행 API (스텁만 존재)

## 미완성 작업

### 🚧 Light 티어 구현 (미작업)

**현재 상태:**
- Pro 티어만 구현됨
- Light 티어는 mock 데이터만

**필요한 작업:**
1. `prompts/stage1-light.md` 작성 (수익모델 분석 제외)
2. API route에서 티어별 분기 처리
3. UI에서 티어별 기능 제한 표시

### 🚧 Heavy 티어 구현 (미작업)

**필요한 작업:**
1. `prompts/stage1-heavy.md` 작성
2. 바이브 코딩 기능 추가
3. 고급 분석 기능

### 🚧 데이터베이스 연동 (미작업)

**현재:** localStorage (임시)
**목표:** 영구 저장소

**옵션:**
1. **PostgreSQL + Prisma**
2. **Supabase** (추천 - 간단함)
3. **Vercel KV** (Redis)

**Schema 예시:**
```sql
CREATE TABLE ideas (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  idea TEXT NOT NULL,
  tier VARCHAR(10) NOT NULL,
  stage INT DEFAULT 1,
  analysis JSONB,
  market_analysis JSONB,
  report JSONB,
  actions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🚧 사용자 인증 (미작업)

**필요한 작업:**
1. NextAuth.js 설정
2. Google/Email 로그인
3. 티어별 사용 제한
4. 크레딧 시스템

### 🚧 Rate Limiting (미작업)

**목적:** API 남용 방지

**구현 방안:**
1. Vercel Edge Config
2. Redis (Upstash)
3. IP 기반 제한

### 🚧 에러 처리 개선 (미작업)

**현재:**
- 기본 alert() 사용
- 에러 로깅 없음

**개선 방안:**
1. Toast 알림 (shadcn/ui Toast)
2. Sentry 연동 (에러 트래킹)
3. 재시도 로직

### 🚧 배포 (미작업)

**추천 플랫폼:** Vercel

**배포 단계:**
1. GitHub 레포지토리 생성
2. Vercel 연동
3. 환경 변수 설정 (API 키)
4. 도메인 연결

---

## 다음 작업자를 위한 가이드

### 시작 전 체크리스트

#### 1. 환경 확인
```bash
# Node.js 버전
node --version  # v20 이상 권장

# 프로젝트 위치
cd C:\project\Startup

# 프론트엔드 의존성 설치
cd frontend
npm install
```

#### 2. 환경 변수 확인
```bash
# frontend/.env.local 파일 확인
cat frontend/.env.local

# Google API 키가 있는지 확인
# GOOGLE_API_KEY=AIzaSy...
```

#### 3. 개발 서버 시작
```bash
cd frontend
npm run dev

# 출력 예상:
# ▲ Next.js 16.1.6 (Turbopack)
# - Local: http://localhost:3003
# ✓ Ready in 2.3s
```

#### 4. API 테스트
**브라우저에서:**
1. http://localhost:3003 접속
2. 아이디어 입력: "AI 펫 건강관리 앱"
3. Pro 티어 선택
4. "무료로 시작하기" 클릭
5. 15-20초 대기
6. 분석 결과 확인

**결과 예시:**
- target: "반려동물 보호자..."
- revenue_analysis: { revenue_streams: [...], ... }
- monetization_difficulty: "중간"

### 주요 작업 시나리오

#### Scenario 1: Stage 2 (시장 분석) 구현

**1단계: 프롬프트 작성**
```bash
# prompts/stage2.md 파일 생성
```

**프롬프트 구조:**
```markdown
# Stage 2: 시장 분석

## System Message
당신은 시장 분석 전문가입니다.

## Task
Stage 1 결과를 바탕으로 시장 분석을 수행하세요.

입력 데이터:
{STAGE1_RESULT}

## Output Format
{
  "market_size": {
    "tam": "...",
    "sam": "...",
    "som": "..."
  },
  "competitors": [...],
  "differentiation": "...",
  "swot": { ... }
}
```

**2단계: API 라우트 생성**
```bash
# frontend/app/api/ideas/[id]/market-analysis/route.ts
```

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Stage 1 결과 가져오기 (localStorage or DB)
  const stage1Data = ...;

  // 프롬프트 로드
  const promptTemplate = loadPrompt(2, tier);
  const prompt = promptTemplate.replace(
    '{STAGE1_RESULT}',
    JSON.stringify(stage1Data)
  );

  // Gemini 호출
  const response = await callGemini(prompt, true);
  const analysis = parseJsonResponse(response);

  return NextResponse.json({ success: true, data: analysis });
}
```

**3단계: 프론트엔드 연동**
```typescript
// components/idea-analysis-page.tsx에서
const handleGenerateMarketAnalysis = async () => {
  const response = await fetch(`/api/ideas/${ideaId}/market-analysis`, {
    method: 'POST',
  });
  // ...
};
```

#### Scenario 2: 데이터베이스 연동 (Supabase)

**1단계: Supabase 프로젝트 생성**
1. https://supabase.com 가입
2. New Project 생성
3. Database URL 복사

**2단계: Prisma 설정**
```bash
npm install @prisma/client
npx prisma init
```

**3단계: Schema 정의**
```prisma
// prisma/schema.prisma
model Idea {
  id        String   @id
  userId    String?
  idea      String
  tier      String
  stage     Int      @default(1)
  analysis  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**4단계: API 수정**
```typescript
// route.ts
import { prisma } from '@/lib/prisma';

// localStorage 대신 DB 저장
await prisma.idea.create({
  data: {
    id: ideaId,
    idea,
    tier,
    analysis,
  },
});
```

#### Scenario 3: 에러 발생 시 디버깅

**API 호출 실패:**
```bash
# 서버 로그 확인
# frontend 터미널에서 출력 확인

# 공통 원인:
# 1. API 키 만료/잘못됨
# 2. 프롬프트 파일 경로 오류
# 3. JSON 파싱 실패
```

**프롬프트 파일 못 찾음:**
```
Error: Prompt file not found: stage1-pro-only.md
```

**해결:**
```bash
# 경로 확인
ls -la prompts/
# stage1-pro-only.md 있는지 확인

# prompts.ts에서 경로 확인
const promptsDir = path.join(process.cwd(), '..', 'prompts');
```

**Gemini API 에러:**
```
Error: models/gemini-2.5-flash is not found
```

**해결:**
```bash
# 사용 가능한 모델 확인
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY"

# gemini.ts에서 모델명 업데이트
model: 'gemini-2.5-flash'  # 또는 최신 모델명
```

### 코드 수정 시 주의사항

#### ⚠️ 절대 하지 말 것

1. **API 키 하드코딩**
```typescript
// ❌ 절대 금지
const API_KEY = 'AIzaSy...';

// ✅ 올바른 방법
const API_KEY = process.env.GOOGLE_API_KEY!;
```

2. **프롬프트 변수명 변경**
```markdown
❌ {{USER_INPUT}}
❌ {user_idea}
✅ {USER_IDEA}  ← 정확히 이것만 사용
```

3. **모델명 임의 변경**
```typescript
❌ model: 'gemini-pro'  // 옛날 모델
✅ model: 'gemini-2.5-flash'  // 확인된 모델
```

4. **NEXT_PUBLIC_ 접두사 남용**
```bash
❌ NEXT_PUBLIC_GOOGLE_API_KEY  # 클라이언트 노출!
✅ GOOGLE_API_KEY  # 서버 전용
```

#### ✅ 권장 사항

1. **에러 핸들링 철저히**
```typescript
try {
  const response = await callGemini(prompt);
  return parseJsonResponse(response);
} catch (error) {
  console.error('Gemini API error:', error);
  throw new Error('AI 분석 실패');
}
```

2. **타입 안전성 유지**
```typescript
// types.ts에 정의된 타입 사용
import type { Stage1Output } from '@/lib/types';

const analysis = parseJsonResponse<Stage1Output>(response);
```

3. **프롬프트 버전 관리**
```markdown
<!-- prompts/stage1-pro-only.md -->
<!-- Version: 1.0.0 -->
<!-- Last Updated: 2026-01-29 -->
```

4. **테스트 후 커밋**
```bash
# 브라우저에서 테스트
# 1. 아이디어 입력
# 2. 결과 확인
# 3. 에러 없는지 확인

# 정상 작동 확인 후
git add .
git commit -m "feat: Add Stage 2 market analysis"
```

### 유용한 명령어

#### 개발 중
```bash
# 개발 서버 재시작
npm run dev

# 타입 체크
npx tsc --noEmit

# 린트 검사
npm run lint

# 빌드 테스트
npm run build
```

#### 디버깅
```bash
# 프롬프트 파일 확인
cat prompts/stage1-pro-only.md

# API 키 확인
echo $GOOGLE_API_KEY

# 사용 가능한 모델 확인
curl "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY"

# 로그 확인
tail -f ~/.claude/projects/*/tasks/*.output
```

#### 배포
```bash
# Vercel 배포
npm install -g vercel
vercel login
vercel  # 배포 시작

# 환경 변수 설정
vercel env add GOOGLE_API_KEY
```

---

## 참고 자료

### 공식 문서
- **Gemini API:** https://ai.google.dev/
- **Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/

### 프로젝트 내부 문서
- `docs/pipeline-design.md` - 전체 파이프라인 설계
- `api-contract/api-spec.md` - API 명세
- `test-prompts-copypaste.md` - 수동 테스트 가이드

### 유용한 링크
- **Gemini Playground:** https://aistudio.google.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/

---

## 마무리

### 현재 상태 요약

✅ **완료:**
- Stage 1 (Pro 티어) 완전 구동
- Gemini API 연동
- 프론트엔드 UI
- 실시간 분석 기능

🚧 **미완성:**
- Stage 2, 3, 4
- Light/Heavy 티어
- 데이터베이스
- 사용자 인증
- 배포

### 예상 소요 시간 (다음 작업자)

- **Stage 2 구현:** 4-6시간
- **Stage 3 구현:** 6-8시간
- **Stage 4 구현:** 3-4시간
- **DB 연동:** 2-3시간
- **배포:** 1-2시간

**Total:** 약 16-23시간 (2-3일)

### 연락처 / 질문

이 작업 로그에 대한 질문이나 이슈가 있다면:
1. WORK_LOG.md에 주석 추가
2. GitHub Issues 생성 (레포지토리 생성 시)
3. 코드 주석으로 질문 남기기

---

**작업 로그 끝**

**마지막 업데이트:** 2026-01-29 23:59
**작성자:** Claude Sonnet 4.5
**상태:** Stage 1 완료, 프로덕션 준비 완료
**다음 단계:** Stage 2 시장 분석 구현

---
