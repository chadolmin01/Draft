# 프롬프트 파일 오류 수정

## 문제

```
오류가 발생했습니다: Prompt file not found: stage1.md
POST http://localhost:3000/api/ideas 500 (Internal Server Error)
```

## 원인

`lib/prompts.ts`의 `loadPrompt` 함수가 존재하지 않는 `stage1.md` 파일을 찾으려고 했습니다.

**실제 존재하는 파일:**
- `stage1-idea-breakdown.md` (Light 티어용)
- `stage1-pro-only.md` (Pro/Heavy 티어용)

## 수정 내용

### 이전 로직
```typescript
let fileName = `stage${stage}.md`;  // stage1.md (존재하지 않음)

if (stage === 1 && tier === 'pro') {
  fileName = 'stage1-pro-only.md';
}
```

### 수정 후 로직
```typescript
if (stage === 1) {
  if (tier === 'pro' || tier === 'heavy') {
    fileName = 'stage1-pro-only.md';
  } else {
    fileName = 'stage1-idea-breakdown.md';  // Light 티어
  }
}
```

## 테스트 방법

### 1. 개발 서버 재시작

서버가 실행 중이면 터미널에서 Ctrl+C로 중지 후:

```bash
cd frontend
npm run dev
```

### 2. Mock 모드로 테스트

1. 브라우저에서 http://localhost:3000
2. Storage Monitor (💾) → Mock 모드 ON
3. 아이디어 입력 (예: "AI 기반 헬스케어")
4. 티어 선택: LIGHT, PRO, HEAVY 각각 테스트
5. "무료로 시작하기" 클릭
6. 정상 응답 확인 (< 1초)

### 3. 각 티어별 테스트

**LIGHT 티어:**
- 프롬프트: `stage1-idea-breakdown.md`
- 기본 분석만 제공

**PRO 티어:**
- 프롬프트: `stage1-pro-only.md`
- 수익 분석 포함

**HEAVY 티어:**
- 프롬프트: `stage1-pro-only.md`
- 수익 분석 + 추가 기능

## 프롬프트 파일 구조

```
prompts/
├── stage1-idea-breakdown.md        <- Light 티어
├── stage1-pro-only.md              <- Pro/Heavy 티어
├── stage1-idea-breakdown-v2.md     (미사용)
├── stage1-idea-breakdown-v3.md     (미사용)
├── stage1-idea-breakdown-v4.md     (미사용)
├── stage2-market-analysis.md       <- Stage 2
├── stage2-deep-market.md           <- Stage 2 Deep
├── stage2-deep-strategy.md         <- Stage 2 Deep
├── stage2-deep-external.md         <- Stage 2 Deep
├── stage3-integrated-report.md     <- Stage 3
└── stage4-landing-page.md          <- Stage 4
```

## 추가 개선 사항

프롬프트 버전 관리를 위해 다음과 같은 구조를 권장합니다:

```typescript
// 향후 개선안
const PROMPT_CONFIG = {
  stage1: {
    light: 'stage1-idea-breakdown.md',
    pro: 'stage1-pro-only.md',
    heavy: 'stage1-pro-only.md',
  },
  stage2: 'stage2-market-analysis.md',
  stage3: 'stage3-integrated-report.md',
  stage4: 'stage4-landing-page.md',
};
```

## 오류가 계속되면

1. **서버 재시작 확인**
   ```bash
   # 터미널에서 확인
   lsof -i :3000  # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   ```

2. **캐시 삭제**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

3. **프롬프트 파일 존재 확인**
   ```bash
   ls -la ../prompts/stage1*.md
   ```

4. **경로 확인**
   - Frontend가 `c:\project\Startup\frontend`에 있는지
   - Prompts가 `c:\project\Startup\prompts`에 있는지

---

**수정 완료 시간:** 2026-01-30
**영향받는 파일:** `frontend/lib/prompts.ts`
