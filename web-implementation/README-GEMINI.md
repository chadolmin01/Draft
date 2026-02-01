# AI 스타트업 플랫폼 - 웹 구현 (Gemini 무료 버전)

## 🎉 완전 무료!

Google Gemini API 사용으로 **개발 비용 0원**

---

## 🚀 빠른 시작

### 1. Google AI API 키 발급 (무료)

1. https://ai.google.dev/ 접속
2. "Get API key in Google AI Studio" 클릭
3. Google 계정 로그인
4. "Create API key" 버튼 클릭
5. API 키 복사

**무료 한도:**
- 분당 15 요청
- 일일 1,500 요청
- 개발/테스트에 충분! ✅

---

### 2. 프로젝트 설정

```bash
cd C:/project/Startup

# Next.js 프로젝트 생성
npx create-next-app@latest web --typescript --tailwind --app

cd web

# Gemini SDK 설치
npm install @google/generative-ai

# 환경 변수 설정
cp .env.local.example .env.local
```

**.env.local 편집:**
```
GOOGLE_API_KEY=여기에-발급받은-API-키-붙여넣기
```

---

### 3. 파일 복사

```bash
# Gemini API 래퍼
cp ../web-implementation/lib/gemini.ts lib/

# API Route (Gemini 버전)
cp ../web-implementation/app/api/stage1/route-gemini.ts app/api/stage1/route.ts

# 프롬프트 로더
cp ../web-implementation/lib/prompts.ts lib/

# 메인 페이지
cp ../web-implementation/app/page.tsx app/

# 타입 정의
mkdir types
cp ../api-contract/types.ts types/api.ts
```

---

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 열기

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

## 📊 Gemini vs Claude 비교

| 항목 | Gemini (무료) | Claude (유료) |
|------|--------------|--------------|
| **비용** | **무료** ✅ | $0.12/회 |
| **품질** | 8/10 | 10/10 |
| **속도** | 빠름 | 빠름 |
| **한도** | 분당 15 요청 | 무제한 (비용만) |
| **JSON 모드** | ✅ 지원 | ✅ 지원 |

**결론:**
- 개발/테스트: **Gemini 완벽** ✅
- 프로덕션: Claude로 전환 고려

---

## 🔄 나중에 Claude로 전환하기

### 1. API 키만 교체

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_API_KEY=...  (주석 처리)

# lib/gemini.ts → lib/anthropic.ts 사용
# route.ts에서 import만 변경
```

### 2. 하이브리드 (티어별)

```typescript
// Light: Gemini (무료)
// Pro: Claude (유료, 고품질)
// Heavy: Claude Opus (최고 품질)

if (tier === 'light') {
  return await callGemini(prompt);
} else {
  return await callClaude(prompt);
}
```

---

## 💡 프롬프트 최적화 (Gemini용)

### Gemini 특성
- System message 없음 → 모든 지시사항을 user message에 포함
- JSON mode 지원 (`responseMimeType: "application/json"`)
- 한국어 잘 이해함
- Few-shot 예시 효과적

### 프롬프트 구조

```typescript
const prompt = `
당신은 스타트업 전략 컨설턴트입니다.

다음 아이디어를 분석하세요:
${idea}

출력 형식 (JSON):
{
  "target": "...",
  "problem": "...",
  "solution": "...",
  "confidence_score": 0.85
}
`;
```

---

## 🐛 문제 해결

### API 키 오류
```
Error: API key not valid
```
→ https://ai.google.dev/ 에서 키 재발급

### Rate Limit 오류
```
429 Too Many Requests
```
→ 분당 15 요청 초과. 1분 기다리거나 캐싱 추가

### JSON 파싱 오류
```
Unexpected token
```
→ Gemini 응답이 JSON 아님. `useJsonMode: true` 확인

---

## 📈 무료 한도 관리

### 현재 사용량 확인

```typescript
// 사용량 로깅
console.log(`[Gemini] Request at ${new Date().toISOString()}`);

// 간단한 rate limiter
const requests = [];
requests.push(Date.now());

// 최근 1분간 요청 수
const recent = requests.filter(t => Date.now() - t < 60000);
if (recent.length >= 15) {
  throw new Error('Rate limit: 분당 15 요청 초과');
}
```

### 캐싱으로 요청 줄이기

```typescript
// 같은 아이디어는 캐시에서
const cacheKey = `stage1:${idea}:${tier}`;
const cached = cache.get(cacheKey);
if (cached) return cached;

const result = await callGemini(prompt);
cache.set(cacheKey, result, 3600); // 1시간 캐싱
```

---

## 🎯 다음 단계

### ✅ 완료
- Gemini API 연동
- Stage 1 구현
- 무료 개발 환경

### 🚧 구현 예정
- Stage 2, 3 API
- 데이터베이스 캐싱
- Rate limiting
- 나중에 Claude로 전환 옵션

---

## 💸 비용 비교 (100명 사용자 기준)

| 단계 | Gemini | Claude |
|------|--------|--------|
| 개발 (100회 테스트) | **무료** | $12 |
| MVP (100명) | **무료** | $12/월 |
| 성장 (1,000명) | **무료** | $120/월 |

**Gemini로 시작 → 수익 나면 Claude 전환** ✅

---

## 📞 문의

문제 발생 시:
1. Google AI Studio 콘솔 확인
2. 개발 서버 로그 확인
3. API 키 유효성 확인

---

**개발 시작하세요! 비용 걱정 0원! 🎉**
