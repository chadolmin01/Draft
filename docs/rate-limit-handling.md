# Rate Limit 에러 핸들링 완료

## 🎯 문제 상황

Gemini API 무료 티어 제한:
- **하루 20개 요청**으로 제한
- 초과 시 `429 Too Many Requests` 에러
- 에러 메시지가 사용자 친화적이지 않음

## ✅ 해결 방안

### 1. **API 에러 핸들러** (`lib/api-error-handler.ts`)

#### 기능
- ✅ Gemini API 에러 파싱
- ✅ Rate Limit 자동 감지
- ✅ `retryAfter` 시간 추출
- ✅ 사용자 친화적 메시지 변환
- ✅ 클라이언트 사이드 Rate Limit 추적

#### 예시
```typescript
const apiError = parseGeminiError(error);
// {
//   code: 'RATE_LIMIT_EXCEEDED',
//   message: 'API 호출 한도를 초과했습니다',
//   retryAfter: 34,
//   details: '무료 티어는 하루 20개 요청으로 제한됩니다...',
//   isRetryable: true
// }
```

### 2. **Rate Limit Notice 컴포넌트** (`components/rate-limit-notice.tsx`)

#### UI 기능
- ⏳ **카운트다운 타이머**: 재시도까지 남은 시간 표시
- 📊 **프로그레스 바**: 시각적 진행 상황
- 🔄 **자동 재시도**: 시간 경과 후 버튼 활성화
- 💡 **해결 방법 안내**: 명확한 가이드 제공

#### Before (사용자 불친절)
```
[GoogleGenerativeAI Error]: Error fetching from https://...
429 Too Many Requests... please retry in 34.089799108s...
```

#### After (사용자 친화적)
```
┌─────────────────────────────────┐
│ ⏳ API 호출 한도 초과           │
│                                 │
│ 무료 티어는 하루 20개 요청으로  │
│ 제한됩니다.                     │
│                                 │
│ 자동 재시도까지                 │
│ [████████████░░░░] 34초        │
│                                 │
│ 💡 해결 방법:                   │
│ • 잠시 후 다시 시도             │
│ • 내일 다시 방문 (24시간 후)    │
│ • 유료 플랜 업그레이드          │
└─────────────────────────────────┘
```

### 3. **Gemini API 래퍼 개선** (`lib/gemini.ts`)

#### 추가 기능
- ✅ 요청 전 Rate Limit 체크
- ✅ 에러 파싱 및 향상된 에러 객체 반환
- ✅ 성공 시 요청 기록

```typescript
// 요청 전 체크
if (!rateLimitTracker.canMakeRequest()) {
  throw new Error('Rate limit exceeded...');
}

// 에러 향상
catch (error) {
  const apiError = parseGeminiError(error);
  (enhancedError as any).apiError = apiError;
  throw enhancedError;
}
```

### 4. **심화 분석 UI 개선**

#### DeepAnalysisCard 컴포넌트
- ✅ Rate Limit 에러 특별 감지
- ✅ RateLimitNotice 컴포넌트 표시
- ✅ 일반 에러와 구분하여 표시

```typescript
// Rate Limit 에러 감지
const isRateLimitError = error?.startsWith('RATE_LIMIT:');

// 특별 UI 표시
{isRateLimitError ? (
  <RateLimitNotice 
    retryAfter={retryAfter}
    onRetry={onGenerate}
  />
) : (
  <p className="text-destructive">{error}</p>
)}
```

---

## 🎨 사용자 경험

### 시나리오 1: Rate Limit 도달

```
1. 사용자가 심화 분석 버튼 클릭
2. API 호출 → 429 에러 발생
3. ⏳ Rate Limit Notice 표시
   - "자동 재시도까지 34초"
   - 프로그레스 바 애니메이션
4. 카운트다운 진행 (34 → 33 → 32...)
5. 0초 도달 → "🔄 다시 시도" 버튼 활성화
6. (선택) 자동 재시도 또는 수동 클릭
```

### 시나리오 2: 내일 다시 방문

```
1. Rate Limit 초과 안내 표시
2. "내일 다시 방문 (24시간 후 초기화)" 안내
3. 사용자가 다음날 재방문
4. Rate Limit 리셋 → 정상 사용 가능
```

---

## 📊 Rate Limit 추적

### 클라이언트 사이드
```typescript
class RateLimitTracker {
  private requests: number[] = [];
  private maxRequests = 20;
  private windowMs = 24 * 60 * 60 * 1000;
  
  canMakeRequest(): boolean
  getRemainingRequests(): number
  getResetTime(): Date
}
```

### 사용 예시
```typescript
// 요청 전 확인
if (rateLimitTracker.canMakeRequest()) {
  await callGemini(prompt);
}

// 남은 요청 수
const remaining = rateLimitTracker.getRemainingRequests();
// "오늘 5개 요청 남음"

// 리셋 시간
const resetTime = rateLimitTracker.getResetTime();
// "2026-01-31 오전 3:00에 리셋"
```

---

## 🧪 테스트 방법

### 1. Rate Limit 시뮬레이션

**개발자 도구 콘솔에서**:
```javascript
// 20개 요청 기록 추가
for (let i = 0; i < 20; i++) {
  localStorage.setItem(`rate_limit_${i}`, Date.now().toString());
}

// 다음 요청 시도 → Rate Limit 에러
```

### 2. 실제 테스트

```
1. 아이디어 여러 개 생성 (5-10개)
2. 각각 Stage 1, 2 분석 실행
3. 심화 분석 3개씩 실행
4. 20개 요청 도달 → Rate Limit 에러 확인 ✅
5. RateLimitNotice 컴포넌트 표시 확인 ✅
6. 카운트다운 동작 확인 ✅
```

### 3. UI 확인

```
1. 심화 분석 버튼 클릭
2. Rate Limit 에러 발생
3. 노란색 안내 박스 표시 ✅
4. ⏳ 아이콘 + "API 호출 한도 초과" ✅
5. 프로그레스 바 애니메이션 ✅
6. 카운트다운 (34초 → 0초) ✅
7. "🔄 다시 시도" 버튼 활성화 ✅
```

---

## 🚀 배포 시 고려사항

### 환경 변수
```env
# .env.local (개발)
GOOGLE_API_KEY=your_free_tier_key

# .env.production (배포)
GOOGLE_API_KEY=your_paid_tier_key  # 무제한 사용
```

### 유료 플랜
- **Standard**: 360 requests/min
- **Premium**: 1,000 requests/min
- 배포 시 유료 플랜 전환 권장

---

## 📈 향후 개선 아이디어

### 1. 서버 사이드 캐싱
```typescript
// Redis/Memcached로 중복 요청 방지
const cached = await redis.get(`analysis_${ideaId}_${group}`);
if (cached) return cached;
```

### 2. 요청 큐 시스템
```typescript
// 요청을 큐에 넣고 순차 처리
const queue = new Queue('gemini-requests', {
  limiter: { max: 20, duration: 86400000 }
});
```

### 3. 사용량 대시보드
```typescript
// Storage Monitor에 표시
const usage = rateLimitTracker.getRemainingRequests();
// "오늘 15/20 요청 사용 (5개 남음)"
```

### 4. 프리미엄 기능
```typescript
// 유료 사용자는 Rate Limit 우회
if (user.tier === 'premium') {
  // 다른 API 키 사용
}
```

---

## ✅ 적용 완료 파일

| 파일 | 변경 사항 |
|------|----------|
| `lib/api-error-handler.ts` | 신규 - 에러 파싱 및 Rate Limit 추적 |
| `lib/gemini.ts` | Rate Limit 체크 및 에러 향상 |
| `components/rate-limit-notice.tsx` | 신규 - Rate Limit UI 컴포넌트 |
| `components/idea-analysis-page.tsx` | Rate Limit 에러 특별 처리 |

---

## 🎉 결과

### Before
```
❌ 긴 에러 메시지
❌ 재시도 방법 불명확
❌ 사용자 혼란
```

### After
```
✅ 친절한 안내 메시지
✅ 자동 카운트다운
✅ 명확한 해결 방법
✅ 부드러운 사용자 경험
```

---

## 🧪 즉시 확인

브라우저 새로고침 후:
1. 심화 분석 여러 개 생성
2. 20개 요청 도달 시 개선된 UI 확인
3. Rate Limit Notice 컴포넌트 동작 확인

**API 할당량 초과가 더 이상 나쁜 경험이 아닙니다!** 🎉
