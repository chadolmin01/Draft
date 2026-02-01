# AI 스타트업 플랫폼 - 웹 구현

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.example을 복사
cp .env.example .env.local

# .env.local 파일 편집
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

---

## 📂 프로젝트 구조

```
web-implementation/
├── app/
│   ├── page.tsx                # 메인 페이지
│   └── api/
│       └── stage1/
│           └── route.ts        # Stage 1 API
├── lib/
│   ├── anthropic.ts            # Claude API 래퍼
│   └── prompts.ts              # 프롬프트 로더
├── types/
│   └── api.ts                  # TypeScript 타입 (api-contract에서 복사)
└── .env.local                  # 환경 변수
```

---

## 🧪 테스트

### API 직접 테스트

```bash
curl -X POST http://localhost:3000/api/stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "대학교 커피 찌꺼기로 굿즈를 만드는 사업",
    "tier": "pro"
  }'
```

---

## 📝 다음 단계

### 현재 구현됨 ✅
- [x] Stage 1 API
- [x] 간단한 UI (입력 → 결과)
- [x] Pro 티어 수익 분석

### 구현 예정 🚧
- [ ] Stage 2 API (시장 분석)
- [ ] Stage 3 API (통합 리포트)
- [ ] 데이터베이스 연동 (결과 저장)
- [ ] 사용자 인증
- [ ] Rate limiting (티어별 한도)
- [ ] PDF 다운로드

---

## 🚢 배포

### Vercel (무료, 추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add ANTHROPIC_API_KEY
```

---

## 💡 개발 팁

### 프롬프트 수정

프롬프트는 `../prompts/` 디렉토리에 있습니다.
- `stage1-pro-only.md` 수정
- 서버 재시작 (자동 반영)

### 타입 정의

`../api-contract/types.ts`를 `types/api.ts`로 복사해서 사용

### 로컬 테스트

Claude API 비용이 걱정되면:
1. Mock 데이터로 테스트
2. `lib/anthropic.ts`에서 `if (process.env.NODE_ENV === 'development')` 추가

---

## 🐛 문제 해결

### API 키 오류
```
Error: Missing API key
```
→ `.env.local` 파일에 `ANTHROPIC_API_KEY` 설정 확인

### JSON 파싱 오류
```
Unexpected token < in JSON
```
→ Claude 응답이 JSON이 아닌 경우. `parseJsonResponse` 함수 확인

### CORS 오류
→ Next.js API routes는 CORS 문제 없음

---

## 📞 문의

문제 발생 시:
1. 개발 서버 로그 확인
2. 브라우저 콘솔 확인
3. Claude API 호출 성공 여부 확인
