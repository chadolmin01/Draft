# API Contract 명세서

프론트엔드 ↔ 백엔드 API 계약

**Base URL**: `https://api.startup-platform.com/v1`

**인증**: Bearer Token (JWT)

**공통 헤더**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📋 목차

1. [Stage 1: 아이디어 해체 분석](#stage-1)
2. [Stage 2: 시장 및 경쟁 분석](#stage-2)
3. [Stage 3: 통합 리포트 생성](#stage-3)
4. [Stage 4: 실행 액션 생성](#stage-4)
5. [Full Pipeline (한 번에 실행)](#full-pipeline)
6. [Rate Limit 조회](#rate-limit)
7. [에러 처리](#error-handling)

---

## <a name="stage-1"></a>Stage 1: 아이디어 해체 분석

### `POST /api/stage1/analyze`

사용자의 원본 아이디어를 구조화된 형태로 해체

**Request Body**:
```typescript
{
  "idea": string,     // 필수: 사용자 아이디어 (10-500자)
  "tier": Tier,       // 필수: "light" | "pro" | "heavy"
  "userId": string    // 선택: 사용자 ID
}
```

**Request Example**:
```json
{
  "idea": "요즘 사람들 너무 바빠서 운동 못 하잖아요. 집에서 쉽게 할 수 있는 15분 피트니스 앱 만들고 싶어요.",
  "tier": "pro"
}
```

**Response 200 OK**:
```typescript
{
  "success": true,
  "data": {
    "target": "하루 30분 이상 운동 시간 확보가 어려운 25-40대 직장인",
    "problem": "헬스장 등록 후 시간 부족으로 3개월 내 80%가 중도 포기...",
    "solution": "15분 이하 홈트레이닝 루틴 + AI 코칭...",
    "confidence_score": 0.85,
    "original_idea": "요즘 사람들 너무 바빠서..."
  },
  "metadata": {
    "timestamp": "2024-01-29T12:34:56Z",
    "requestId": "req_abc123",
    "tier": "pro"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "아이디어는 10자 이상 500자 이하여야 합니다.",
    "details": {
      "field": "idea",
      "length": 5
    }
  }
}
```

**Response 429 Too Many Requests**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "월간 생성 한도를 초과했습니다.",
    "details": {
      "limit": 5,
      "used": 5,
      "reset_at": "2024-02-01T00:00:00Z"
    }
  }
}
```

---

## <a name="stage-2"></a>Stage 2: 시장 및 경쟁 분석

### `POST /api/stage2/analyze`

Stage 1 결과를 기반으로 시장 및 경쟁사 분석

**Request Body**:
```typescript
{
  "stage1Result": Stage1Output,
  "tier": Tier
}
```

**Request Example**:
```json
{
  "stage1Result": {
    "target": "25-40대 직장인",
    "problem": "시간 부족으로 운동 중단",
    "solution": "15분 홈트레이닝 + AI",
    "confidence_score": 0.85,
    "original_idea": "..."
  },
  "tier": "pro"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "market_analysis": {
      "market_size": "글로벌 디지털 피트니스 시장 $60B (2023)",
      "growth_rate": "연평균 33% 성장",
      "target_segment": "국내 약 300만명 추정",
      "market_trends": [
        "헬스장 회원권 해지율 증가",
        "1인 가구 증가로 홈트 수요 확대"
      ]
    },
    "competitors": [
      {
        "name": "Nike Training Club",
        "strength": "브랜드 파워, 무료 제공",
        "weakness": "개인화 부족",
        "differentiation": "한국 직장인 생활 패턴 최적화",
        "url": "https://www.nike.com/ntc-app"
      }
    ],
    "feasibility_score": 0.75,
    "risks": [
      "경쟁사 다수 존재",
      "무료 앱 대비 유료 전환 허들"
    ]
  },
  "metadata": {
    "timestamp": "2024-01-29T12:35:30Z",
    "requestId": "req_def456",
    "tier": "pro"
  }
}
```

**Note**: `tier: "light"`인 경우 이 엔드포인트는 403 Forbidden 반환 (티어 제한)

---

## <a name="stage-3"></a>Stage 3: 통합 리포트 생성

### `POST /api/stage3/generate`

Stage 1, 2 결과를 통합하여 완전한 사업계획서 생성

**Request Body**:
```typescript
{
  "stage1Result": Stage1Output,
  "stage2Result": Stage2Output,  // tier=light면 null 가능
  "tier": Tier
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "title": "15분 홈트레이닝 AI 코칭 앱 사업계획서",
    "subtitle": "바쁜 직장인을 위한 초단기 운동 솔루션",
    "sections": [
      {
        "id": "business-overview",
        "title": "사업 개요",
        "content": "## 핵심 가치 제안\n바쁜 직장인도 하루 15분으로..."
      },
      {
        "id": "revenue-model",
        "title": "수익화 모델",
        "subsections": [
          {
            "id": "revenue-structure",
            "title": "매출 구조",
            "content": "- 주 수익원: 구독료\n- 부가: 프리미엄 콘텐츠"
          },
          {
            "id": "pricing-strategy",
            "title": "가격 전략",
            "content": "- 라이트: ₩4,900/월\n- 프로: ₩9,900/월"
          }
        ]
      }
    ],
    "metadata": {
      "generated_at": "2024-01-29T12:36:00Z",
      "tier": "pro",
      "version": "1.0"
    }
  }
}
```

---

## <a name="stage-4"></a>Stage 4: 실행 액션 생성

### `POST /api/stage4/generate`

리포트 기반으로 실행 가능한 액션 아이템 생성

**Request Body**:
```typescript
{
  "stage3Result": Stage3Output,
  "actionType": "landing-page" | "business-plan" | "pitch-deck" | "mvp-blueprint"
}
```

**Response 200 OK (Landing Page)**:
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "type": "hero",
        "headline": "바쁜 당신을 위한 15분 홈트레이닝",
        "subheadline": "헬스장 등록 없이, 출퇴근 시간에도.",
        "button_text": "무료로 시작하기"
      }
    ],
    "html_template": "<!DOCTYPE html>...",
    "design_notes": "보라-핑크 그라데이션 사용"
  }
}
```

---

## <a name="full-pipeline"></a>Full Pipeline (한 번에 실행)

### `POST /api/pipeline/full`

아이디어 입력 → Stage 1 → 2 → 3 → 4 전체 파이프라인 실행

**Request Body**:
```typescript
{
  "idea": string,
  "tier": Tier,
  "userId": string,
  "includeActions": boolean  // Stage 4 포함 여부
}
```

**Request Example**:
```json
{
  "idea": "바쁜 직장인 위한 15분 홈트레이닝 앱",
  "tier": "pro",
  "includeActions": false
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "stage1": { /* Stage1Output */ },
    "stage2": { /* Stage2Output */ },
    "stage3": { /* Stage3Output */ },
    "stage4": null  // includeActions=false
  },
  "metadata": {
    "timestamp": "2024-01-29T12:40:00Z",
    "requestId": "req_pipeline_123",
    "tier": "pro",
    "processing_time_ms": 45000
  }
}
```

**Note**: 전체 파이프라인은 30-60초 소요될 수 있음

---

## Streaming 지원 (선택적)

### `POST /api/pipeline/full-stream`

Server-Sent Events (SSE)로 실시간 진행 상황 전달

**Request Body**: 동일

**Response**: `text/event-stream`

```
event: progress
data: {"stage": 1, "progress": 0, "message": "아이디어 분석 시작..."}

event: stage_complete
data: {"stage": 1, "data": { /* Stage1Output */ }}

event: progress
data: {"stage": 2, "progress": 50, "message": "시장 분석 중..."}

event: stage_complete
data: {"stage": 2, "data": { /* Stage2Output */ }}

event: done
data: {"stage": 3, "data": { /* FullPipelineOutput */ }}
```

**프론트엔드 예시 (EventSource)**:
```typescript
const eventSource = new EventSource('/api/pipeline/full-stream', {
  headers: { Authorization: `Bearer ${token}` }
});

eventSource.addEventListener('progress', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Stage ${data.stage}: ${data.progress}%`);
});

eventSource.addEventListener('stage_complete', (e) => {
  const data = JSON.parse(e.data);
  console.log('Stage complete:', data);
});

eventSource.addEventListener('done', (e) => {
  const result = JSON.parse(e.data);
  eventSource.close();
});
```

---

## <a name="rate-limit"></a>Rate Limit 조회

### `GET /api/user/rate-limit`

현재 사용자의 사용량 및 한도 조회

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "tier": "pro",
    "limit": 50,
    "used": 12,
    "reset_at": "2024-02-01T00:00:00Z"
  }
}
```

---

## <a name="error-handling"></a>에러 처리

### 공통 에러 응답 형식

```typescript
{
  "success": false,
  "error": {
    "code": ErrorCode,
    "message": string,
    "details": any
  }
}
```

### 에러 코드 목록

| Code | HTTP Status | 설명 |
|------|-------------|------|
| `INVALID_INPUT` | 400 | 입력값 검증 실패 |
| `VALIDATION_ERROR` | 400 | 데이터 형식 오류 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `TIER_LIMIT` | 403 | 티어 제한 (light는 Stage 2 접근 불가) |
| `RATE_LIMIT` | 429 | 사용량 한도 초과 |
| `AI_API_ERROR` | 500 | AI API 호출 실패 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

### 에러 처리 예시 (프론트엔드)

```typescript
try {
  const response = await fetch('/api/stage1/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ idea, tier })
  });

  const result = await response.json();

  if (!result.success) {
    switch (result.error.code) {
      case 'RATE_LIMIT':
        alert(`한도 초과. ${result.error.details.reset_at}에 리셋됩니다.`);
        break;
      case 'TIER_LIMIT':
        alert('프로 티어로 업그레이드하세요.');
        break;
      default:
        alert(result.error.message);
    }
  } else {
    // 성공 처리
    const data = result.data;
  }
} catch (err) {
  console.error('Network error:', err);
}
```

---

## 티어별 제한사항

| Feature | Light | Pro | Heavy |
|---------|-------|-----|-------|
| Stage 1 | ✅ | ✅ | ✅ |
| Stage 2 | ❌ (블러) | ✅ | ✅ |
| Stage 3 | 간소화 | 전체 | 전체 |
| Stage 4 | ❌ | 일부 | 전체 |
| 월간 생성 | 5회 | 50회 | 무제한 |
| 수정 기능 | ❌ | ✅ | ✅ |
| 우선 처리 | ❌ | ❌ | ✅ |

---

## 개발 환경

**Staging**: `https://api-staging.startup-platform.com/v1`

**Production**: `https://api.startup-platform.com/v1`

**API 버전**: `v1`

---

## 다음 단계

1. 프론트엔드: `types.ts` 임포트하여 타입 안정성 확보
2. 백엔드: 이 스펙 기준으로 엔드포인트 구현
3. 통합 테스트: Postman/Insomnia 컬렉션 작성
4. 문서화: Swagger/OpenAPI 스펙 생성 (선택)
