# Mock 데이터 리포트 생성 디버깅 가이드

## 현재 상황

"리포트 생성 실패: Stage 1 분석 결과가 필요합니다" 오류가 Mock 모드에서 발생하는 경우

## 확인 단계

### 1. Mock 모드가 활성화되어 있는지 확인

**브라우저 콘솔에서 실행:**
```javascript
localStorage.getItem('MOCK_MODE')
// 결과가 'true'여야 함
```

**Storage Monitor 확인:**
- 우측 하단 💾 아이콘 클릭
- "🟢 Mock 모드 ON" 으로 표시되어야 함

---

### 2. localStorage 데이터 확인

**브라우저 콘솔에서 실행:**
```javascript
// 현재 아이디어 ID 확인 (URL에서)
const ideaId = window.location.pathname.split('/')[2];
console.log('Idea ID:', ideaId);

// Stage 1 데이터 확인
const stage1 = JSON.parse(localStorage.getItem(`idea_${ideaId}`) || '{}');
console.log('Stage 1 Data:', stage1);
console.log('Has analysis?', !!stage1.analysis);
console.log('Analysis:', stage1.analysis);

// Stage 2 데이터 확인
const stage2 = JSON.parse(localStorage.getItem(`idea_${ideaId}_stage2`) || 'null');
console.log('Stage 2 Data:', stage2);

// 리포트 데이터 확인
const report = JSON.parse(localStorage.getItem(`idea_${ideaId}_report`) || 'null');
console.log('Report Data:', report);
```

---

### 3. Network 탭에서 API 요청 확인

1. F12 → Network 탭
2. "상세 리포트 생성하기" 버튼 클릭
3. `/api/ideas/[id]/report` POST 요청 확인

**Request Headers 확인:**
```
x-mock-mode: true
```

**Request Payload 확인:**
```json
{
  "stage1": {
    "target": "...",
    "problem": "...",
    "solution": "..."
  },
  "stage2Main": { ... },
  "stage2Deep": { ... },
  "tier": "pro"
}
```

**Response 확인:**
- 성공: `{ "success": true, "data": { ... } }`
- 실패: `{ "success": false, "error": { "code": "...", "message": "..." } }`

---

## 문제별 해결 방법

### A. Mock 모드가 OFF인 경우

**문제:** Gemini API를 호출하려고 하는데 데이터가 없음

**해결:**
1. Storage Monitor (💾) 열기
2. "⚪ Mock 모드 OFF" → "🟢 Mock 모드 ON" 클릭
3. 페이지 새로고침
4. 다시 시도

---

### B. localStorage에 Stage 1 데이터가 없는 경우

**문제:** `stage1Data`가 빈 객체 `{}`

**해결:**
1. 홈으로 가기 (`/`)
2. Mock 모드 ON 확인
3. 새 아이디어 입력
4. Stage 1 분석 완료 확인
5. "상세 리포트 생성하기" 클릭

---

### C. Stage 1 데이터는 있지만 `analysis` 필드가 없는 경우

**문제:** `stage1Data.analysis`가 `undefined`

**원인:** 데이터 구조가 잘못됨

**해결:**
```javascript
// 콘솔에서 실행하여 데이터 구조 확인
const ideaId = 'your_idea_id';
const stage1 = JSON.parse(localStorage.getItem(`idea_${ideaId}`));
console.log('데이터 구조:', stage1);

// 예상 구조:
// {
//   id: "mock_xxx",
//   idea: "AI 기반...",
//   tier: "pro",
//   analysis: {      <- 이게 있어야 함
//     target: "...",
//     problem: "...",
//     solution: "..."
//   },
//   createdAt: "...",
//   stage: 1
// }
```

**수동 수정 (임시):**
```javascript
const ideaId = 'your_idea_id';
const stage1 = {
  id: ideaId,
  idea: 'AI 기반 서비스',
  tier: 'pro',
  analysis: {
    target: '20-40대 디지털 네이티브',
    problem: '현재 시장의 문제점',
    solution: '혁신적인 솔루션',
    canEdit: true
  },
  createdAt: new Date().toISOString(),
  stage: 1
};
localStorage.setItem(`idea_${ideaId}`, JSON.stringify(stage1));
```

---

### D. Mock 헤더가 전송되지 않는 경우

**문제:** API가 Gemini를 호출하려고 함

**해결:**
1. 브라우저 캐시 삭제
2. 페이지 새로고침 (Ctrl + Shift + R)
3. Mock 모드 다시 활성화

---

## 완전 초기화 방법

모든 것을 다시 시작:

```javascript
// 1. localStorage 완전 삭제
localStorage.clear();

// 2. Mock 모드 활성화
localStorage.setItem('MOCK_MODE', 'true');

// 3. 페이지 새로고침
location.reload();

// 4. 홈에서 새 아이디어 입력
```

---

## Mock 데이터로 전체 플로우 테스트

### 정상 플로우

```
1. Mock 모드 ON (💾 → 🟢)
2. 홈 → 아이디어 입력 (예: "AI 기반 헬스케어")
3. 티어 선택: PRO
4. "무료로 시작하기"
   → 즉시 응답 (< 1초)
   → Stage 1 분석 페이지로 이동
   
5. "시장 분석 시작하기"
   → 즉시 응답 (< 1초)
   → Stage 2 결과 표시
   
6. 심화 분석 3개 각각 클릭
   → 각각 즉시 응답 (< 1초)
   
7. "상세 리포트 생성하기"
   → 즉시 응답 (< 1초)
   → 리포트 페이지로 이동
   
8. 리포트 표시 확인 ✅
```

---

## 추가 디버깅 도구

### localStorage 전체 내용 확인

```javascript
// 모든 키 출력
Object.keys(localStorage).forEach(key => {
  console.log(key, ':', localStorage.getItem(key).substring(0, 100));
});

// idea 관련 키만 필터
Object.keys(localStorage)
  .filter(k => k.startsWith('idea_'))
  .forEach(key => {
    console.log(key, ':', JSON.parse(localStorage.getItem(key)));
  });
```

### API 응답 테스트 (Mock 모드)

```javascript
// 직접 API 호출 테스트
const ideaId = 'test_123';
const testData = {
  stage1: {
    target: '테스트 타겟',
    problem: '테스트 문제',
    solution: '테스트 솔루션'
  },
  stage2Main: null,
  stage2Deep: { marketDeep: null, strategy: null, external: null },
  tier: 'pro'
};

fetch(`/api/ideas/${ideaId}/report`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mock-mode': 'true'
  },
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

---

## 문제가 계속되면

1. 브라우저 콘솔 스크린샷
2. localStorage 내용 복사
3. Network 탭의 실패한 요청 스크린샷
4. 위 정보와 함께 문의

---

**작성일:** 2026-01-30
**업데이트:** 최신
