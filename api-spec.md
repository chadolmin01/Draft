# API 명세서

> 백엔드 구현용 REST API 스펙

## 기본 정보

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **인증**: Bearer Token (Optional, 익명 사용 가능)

---

## 엔드포인트 목록

### 1. 아이디어 생성 (Stage 1 시작)

```http
POST /api/ideas
```

**Request**
```typescript
{
  "idea": "AI 기반 헬스케어 플랫폼",
  "tier": "pro",
  "userId": "optional-user-id"
}
```

**Response** (201 Created)
```typescript
{
  "id": "idea_abc123",
  "stage": 1,
  "message": "아이디어가 등록되었습니다. 분석을 시작합니다.",
  "estimatedTime": 30
}
```

**에러**
- `400`: Invalid tier
- `429`: Rate limit exceeded

**구현 요구사항**
- 아이디어 텍스트 저장
- 티어별 토큰 차감
- Stage 1 → 2 자동 진행 (백그라운드 분석 시작)

---

### 2. 아이디어 조회

```http
GET /api/ideas/:id
```

**Response** (200 OK)
```typescript
{
  "idea": {
    "id": "idea_abc123",
    "idea": "AI 기반 헬스케어 플랫폼",
    "tier": "pro",
    "createdAt": "2024-01-29T12:00:00Z",
    "stage": 2,
    "userId": null
  },
  "analysis": {
    "target": "30-40대 만성질환자",
    "problem": "병원 방문 어려움, 건강 데이터 분산",
    "solution": "AI 기반 건강 모니터링 & 원격 상담",
    "marketSize": {
      "tam": "10조원",
      "sam": "1조원",
      "som": "500억원",
      "source": "글로벌 헬스테크 시장 보고서 2024"
    },
    "competitors": [
      {
        "name": "네이버 헬스케어",
        "description": "AI 건강검진 서비스",
        "strengths": ["브랜드 인지도", "대규모 유저"],
        "weaknesses": ["개인화 부족", "B2C 중심"]
      }
    ],
    "differentiation": "의료진과 연동된 실시간 케어",
    "canEdit": true
  },
  "currentStage": 2
}
```

**에러**
- `404`: Idea not found

---

### 3. 아이디어 분석 피드백 제출 (프로 이상)

```http
POST /api/ideas/:id/feedback
```

**Request**
```typescript
{
  "ideaId": "idea_abc123",
  "feedback": "타겟을 20-30대로 변경하고 싶어요",
  "field": "target"
}
```

**Response** (200 OK)
```typescript
{
  "updatedAnalysis": {
    "target": "20-30대 직장인",
    "problem": "...",
    // ... 업데이트된 분석 결과
    "canEdit": true
  },
  "message": "분석이 업데이트되었습니다."
}
```

**에러**
- `403`: Tier feature locked (라이트 티어는 수정 불가)
- `404`: Idea not found

**구현 요구사항**
- 티어 검증 (라이트는 403 반환)
- Claude API 호출로 분석 재생성
- 기존 분석 컨텍스트 유지하면서 피드백 반영

---

### 4. 리포트 생성 (Stage 3 트리거)

```http
POST /api/ideas/:id/generate-report
```

**Request**
```typescript
{
  "ideaId": "idea_abc123"
}
```

**Response** (202 Accepted)
```typescript
{
  "reportId": "report_xyz789",
  "status": "generating",
  "estimatedTime": 60
}
```

**폴링용**: `GET /api/ideas/:id/report`

**Response** (200 OK - 완료 시)
```typescript
{
  "id": "report_xyz789",
  "ideaId": "idea_abc123",
  "generatedAt": "2024-01-29T12:05:00Z",
  "tier": "pro",
  "sections": {
    "overview": {
      "title": "AI 헬스케어 플랫폼",
      "tagline": "당신의 주치의, 이제 주머니 속에",
      "description": "...",
      "vision": "...",
      "mission": "..."
    },
    "market": { /* ... */ },
    "competitors": { /* ... */ },
    "monetization": { /* ... */ },
    "structure": { /* ... */ },
    "development": { /* ... */ }
  }
}
```

**에러**
- `400`: Stage not ready (Stage 2 완료 필요)
- `404`: Idea not found
- `500`: Generation failed

**구현 요구사항**
- Stage 2 완료 여부 확인
- 비동기 리포트 생성 (큐 시스템 권장)
- 티어별 차등 제공 (라이트: 기본 정보만, 프로: 상세 분석)

---

### 5. 액션 카드 목록 조회

```http
GET /api/ideas/:id/actions
```

**Response** (200 OK)
```typescript
[
  {
    "id": "action_1",
    "type": "landing-page",
    "title": "홍보 웹사이트 만들기",
    "description": "투자자/고객용 랜딩페이지 구조와 메시지",
    "estimatedTime": "10분",
    "tier": "light",
    "status": "available"
  },
  {
    "id": "action_2",
    "type": "business-plan",
    "title": "사업계획서 작성하기",
    "description": "투자 유치용 정식 사업계획서",
    "estimatedTime": "15분",
    "tier": "pro",
    "status": "locked"
  },
  {
    "id": "action_3",
    "type": "pitch-deck",
    "title": "피칭 PPT 제작하기",
    "description": "10슬라이드 투자 스토리",
    "estimatedTime": "20분",
    "tier": "pro",
    "status": "available"
  },
  {
    "id": "action_4",
    "type": "mvp-guide",
    "title": "데모 MVP 개발 설계하기",
    "description": "기능 우선순위 & 개발 체크리스트",
    "estimatedTime": "30분",
    "tier": "heavy",
    "status": "locked"
  }
]
```

---

### 6. 액션 실행

```http
POST /api/ideas/:id/actions
```

**Request**
```typescript
{
  "ideaId": "idea_abc123",
  "actionType": "landing-page"
}
```

**Response** (200 OK)
```typescript
{
  "actionId": "action_result_123",
  "status": "completed",
  "result": {
    "id": "action_result_123",
    "actionType": "landing-page",
    "generatedAt": "2024-01-29T12:10:00Z",
    "content": {
      "structure": {
        "hero": {
          "headline": "당신의 건강, AI가 지킵니다",
          "subheadline": "24시간 건강 모니터링과 실시간 상담",
          "cta": "무료로 시작하기"
        },
        "problem": { /* ... */ },
        "solution": { /* ... */ },
        "pricing": { /* ... */ },
        "cta": { /* ... */ }
      },
      "htmlTemplate": "<html>...</html>" // 헤비 티어만
    }
  }
}
```

**에러**
- `403`: Tier feature locked
- `404`: Idea not found
- `500`: Generation failed

**구현 요구사항**
- 티어별 잠금 검증
- Claude API로 각 액션 타입별 콘텐츠 생성
- 헤비 티어: 실제 사용 가능한 HTML/코드 제공

---

## 에러 응답 포맷

모든 에러는 다음 형식:

```typescript
{
  "error": {
    "code": "TIER_FEATURE_LOCKED",
    "message": "이 기능은 프로 티어 이상에서 사용 가능합니다.",
    "details": {
      "requiredTier": "pro",
      "currentTier": "light"
    }
  }
}
```

### 에러 코드

| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `INVALID_TIER` | 잘못된 티어 | 400 |
| `RATE_LIMIT_EXCEEDED` | API 호출 한도 초과 | 429 |
| `INSUFFICIENT_CREDITS` | 토큰 부족 | 402 |
| `TIER_FEATURE_LOCKED` | 티어 제한 | 403 |
| `IDEA_NOT_FOUND` | 아이디어 없음 | 404 |
| `STAGE_NOT_READY` | 단계 미완료 | 400 |
| `GENERATION_FAILED` | AI 생성 실패 | 500 |
| `INVALID_INPUT` | 잘못된 입력 | 400 |

---

## 구현 우선순위

### Phase 1 (MVP)
1. `POST /api/ideas` - 아이디어 생성
2. `GET /api/ideas/:id` - 조회 (Stage 2 분석 포함)
3. `POST /api/ideas/:id/generate-report` - 리포트 생성
4. `GET /api/ideas/:id/report` - 리포트 조회

### Phase 2
5. `POST /api/ideas/:id/feedback` - 피드백 (프로 티어)
6. `GET /api/ideas/:id/actions` - 액션 목록
7. `POST /api/ideas/:id/actions` - 액션 실행

---

## 프롬프트 시스템 연동

각 단계별 Claude API 프롬프트 예시:

### Stage 2: 아이디어 분석
```
사용자 아이디어: "{idea}"
티어: {tier}

다음 형식으로 분석해줘:
1. 타겟 고객
2. 해결하려는 문제
3. 솔루션

{tier === 'pro' || tier === 'heavy' ? `
추가로:
- 시장 규모 (TAM/SAM/SOM)
- 경쟁사 분석 (3개)
- 차별화 포인트
` : ''}
```

### Stage 3: 리포트 생성
```
아이디어: "{idea}"
분석 결과: {analysis}

완전한 사업계획서를 작성해줘:
- 사업 개요
- 시장 분석
- 경쟁사 분석
- 수익화 모델
- 사업 구조
- 개발 가이드

JSON 형식으로 반환.
```

---

## 테스트 시나리오

### 정상 플로우
1. 아이디어 생성 (light) → 기본 분석만
2. 아이디어 생성 (pro) → 상세 분석 + 수정 가능
3. 피드백 제출 → 분석 업데이트
4. 리포트 생성 → 완전한 사업계획서
5. 액션 실행 → 랜딩페이지 생성

### 에러 시나리오
1. 라이트 티어로 피드백 시도 → 403
2. Stage 2 미완료 상태에서 리포트 생성 → 400
3. 프로 티어로 헤비 전용 액션 시도 → 403
4. Rate limit 테스트 → 429

---

## 백엔드 체크리스트

- [ ] Supabase/Firebase 스키마 설계
- [ ] Claude API 키 환경변수 설정
- [ ] 티어별 토큰 차감 로직
- [ ] Rate limiting (분당 요청 수 제한)
- [ ] 비동기 작업 큐 (리포트 생성)
- [ ] 에러 핸들링 & 로깅
- [ ] CORS 설정
- [ ] 프롬프트 엔지니어링 (각 단계별)
