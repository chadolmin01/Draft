# 빠른 시작 가이드 (Quick Start)

다른 AI가 이 프로젝트를 5분 안에 이해하고 이어서 작업할 수 있도록!

---

## ⚡ 1분 요약

**뭘 만들고 있나요?**
아이디어만 입력하면 AI가 완전한 비즈니스 플랜을 만들어주는 플랫폼

**현재 완성도:** (2026-01-31 업데이트)
- ✅ Stage 1 (아이디어 분해) - Pro 티어 100% 작동
- ✅ Stage 2 (시장 분석 + 심화 분석) - Pro 티어 100% 작동
- ✅ Stage 3 (통합 리포트 + 차트 + 템플릿 + 공유) - Pro 티어 100% 작동
- ⏳ Stage 4 (액션 아이템) - UI만 완성, API 미연동
- ❌ Light, Heavy 티어 - 미작업

**기술 스택:**
- Frontend: Next.js 16 + TypeScript + Tailwind
- AI: Google Gemini 2.5 Flash (무료)
- Storage: localStorage (임시)

---

## 🚀 즉시 실행

```bash
# 1. 프로젝트 위치
cd C:\project\Startup\frontend

# 2. 의존성 설치 (처음만)
npm install

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저 열기
# http://localhost:3003
```

**전체 플로우 테스트:**
1. 아이디어 입력: "AI 펫 건강관리 앱"
2. Pro 티어 선택
3. 제출 → Stage 1 분석 (15초)
4. "시장 분석 시작하기" 클릭 → Stage 2 메인 분석 (15초)
5. 심화 분석 3종 생성 (각 10-15초)
   - 시장 심화 분석 (TAM/SAM/SOM, 포지셔닝)
   - 전략 & 실행 (SWOT, 진입 전략)
   - 외부 환경 (규제, 투자)
6. "상세 리포트 생성하기" 클릭 → Stage 3 통합 리포트 (20-30초)
7. 리포트 페이지에서 차트 확인, 템플릿 선택, 공유 가능!

---

## 📂 핵심 파일 (Top 5)

| 파일 | 역할 | 중요도 |
|------|------|--------|
| `prompts/stage1-pro-only.md` | AI 프롬프트 (가장 중요!) | ⭐⭐⭐⭐⭐ |
| `frontend/app/api/ideas/route.ts` | API 엔드포인트 | ⭐⭐⭐⭐⭐ |
| `frontend/lib/gemini.ts` | Gemini API 래퍼 | ⭐⭐⭐⭐ |
| `frontend/components/idea-input-page.tsx` | 입력 폼 | ⭐⭐⭐⭐ |
| `frontend/.env.local` | API 키 설정 | ⭐⭐⭐⭐⭐ |

---

## 🔧 설정 확인

### API 키 확인
```bash
cat frontend/.env.local
```

**있어야 할 내용:**
```
GOOGLE_API_KEY=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q
```

### 프롬프트 파일 확인
```bash
ls -la prompts/
```

**있어야 할 파일:**
```
stage1-pro-only.md        ✅ (완성)
stage2-market-analysis.md ✅ (완성)
stage2-deep-market.md     ✅ (완성)
stage2-deep-strategy.md   ✅ (완성)
stage2-deep-external.md   ✅ (완성)
stage3-integrated-report.md ✅ (완성)
stage4-landing-page.md    ✅ (완성)
stage1-light.md           ❌ (미작업)
stage1-heavy.md           ❌ (미작업)
```

---

## 🐛 문제 해결

### "API 호출 실패"
```bash
# API 키 확인
cat frontend/.env.local | grep GOOGLE_API_KEY

# 없으면 추가
echo 'GOOGLE_API_KEY=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q' >> frontend/.env.local

# 서버 재시작
npm run dev
```

### "Prompt file not found"
```bash
# 프롬프트 파일 경로 확인
ls prompts/stage1-pro-only.md

# 없으면 WORK_LOG.md 참조
```

### "models/gemini-xxx not found"
```bash
# 사용 가능한 모델 확인
curl "https://generativelanguage.googleapis.com/v1/models?key=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q"

# frontend/lib/gemini.ts에서 모델명 업데이트
# 현재: gemini-2.5-flash
```

### "한글이 깨져요"
- curl 테스트 말고 브라우저에서 테스트하세요!
- curl은 Windows에서 UTF-8 인코딩 문제가 있음

---

## 📝 다음 할 일 (우선순위)

### 1순위: 데이터베이스 연동
**예상 시간:** 2-3시간

**이유:** localStorage는 임시방편
**추천:** Supabase (무료 + 간단)

**참고:** WORK_LOG.md > "Scenario 2: 데이터베이스 연동"

### 3순위: Light 티어 구현
**예상 시간:** 2-3시간

**해야 할 일:**
1. `prompts/stage1-light.md` 작성 (수익모델 분석 빼고)
2. API route 티어별 분기
3. UI 티어별 기능 표시

### 4순위: 배포
**예상 시간:** 1-2시간

**플랫폼:** Vercel (추천)

```bash
npm install -g vercel
vercel login
vercel
```

---

## 💡 핵심 개념

### 데이터 플로우
```
사용자 입력
  ↓
POST /api/ideas
  ↓
prompts/stage1-pro-only.md 읽기
  ↓
{USER_IDEA} → 실제 아이디어로 치환
  ↓
Gemini API 호출 (15초)
  ↓
JSON 응답 파싱
  ↓
localStorage 저장
  ↓
결과 페이지 표시
```

### 티어 시스템
- **Light:** 기본 분석 (타겟/문제/솔루션)
- **Pro:** + 수익모델 분석 ✅ (현재 완성)
- **Heavy:** + 바이브코딩 + 고급 분석

### 프롬프트 변수
```markdown
⚠️ 정확히 이것만 사용:
{USER_IDEA}

❌ 사용 금지:
{{USER_INPUT}}
{user_idea}
[USER_IDEA]
```

---

## 🔐 중요 정보

### API 키
```
AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q
```

**무료 한도:**
- 분당: 15 요청
- 일일: 1,500 요청

### Gemini 모델
```
gemini-2.5-flash  ← 현재 사용 중 (2026-01-29 기준)
```

**변경될 수 있음!** 404 에러 시 확인 필요

---

## 📚 상세 문서

전체 작업 내역과 상세 가이드:
```bash
cat WORK_LOG.md  # 20,000단어 상세 문서
```

**포함 내용:**
- 완전한 작업 히스토리
- 모든 파일 설명
- 코드 예시
- 디버깅 가이드
- 다음 작업 시나리오

---

## ✅ 체크리스트

**작업 시작 전:**
- [ ] `npm install` 완료
- [ ] `.env.local` 확인
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 테스트 성공

**코드 수정 후:**
- [ ] 브라우저에서 테스트
- [ ] 에러 없는지 확인
- [ ] console.log 제거
- [ ] WORK_LOG.md 업데이트 (선택)

**커밋 전:**
- [ ] `npx tsc --noEmit` (타입 체크)
- [ ] `npm run lint` (린트)
- [ ] 테스트 재확인

---

**질문이 있다면:**
1. WORK_LOG.md 먼저 확인
2. 코드 주석 확인
3. 에러 메시지 구글링

**행운을 빕니다! 🚀**
