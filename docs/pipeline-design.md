# AI 스타트업 플랫폼 - 프롬프트 파이프라인 설계

## 전체 아키텍처

```
사용자 아이디어 입력
    ↓
[Stage 1] 아이디어 해체 분석
    ↓
[Stage 2] 시장 및 경쟁 분석 (티어별 차등)
    ↓
[Stage 3] 통합 리포트 생성
    ↓
[Stage 4] 실행 액션 생성
```

## Stage 1: 아이디어 해체 분석

### 목적
사용자의 뭉개진 아이디어를 명확한 구조로 해체

### 입력
- `raw_idea`: 사용자가 입력한 원본 아이디어 (string)
- `tier`: 라이트/프로/헤비 (enum)

### 출력 스키마
```json
{
  "target": "타겟 고객층 명확화",
  "problem": "해결하려는 문제점",
  "solution": "제안하는 솔루션",
  "confidence_score": 0.85
}
```

### 프롬프트 전략
- Few-shot learning: 실제 성공한 스타트업 사례 3개 제시
- 구조화된 질문 기반 추출
- 애매한 아이디어 → 명확한 구조로 강제 변환

### 티어별 차이
- **라이트**: 기본 해체만, 수정 불가
- **프로/헤비**: 동일 (2단계에서 차이)

---

## Stage 2: 시장 및 경쟁 분석

### 목적
객관적 데이터 기반 시장성 검증 (차별화 핵심)

### 입력
- Stage 1 출력 결과
- `tier`: 라이트/프로/헤비

### 출력 스키마
```json
{
  "market_analysis": {
    "market_size": "시장 규모 추정",
    "growth_rate": "연평균 성장률",
    "target_segment": "목표 세그먼트 규모"
  },
  "competitors": [
    {
      "name": "경쟁사명",
      "strength": "강점",
      "weakness": "약점",
      "differentiation": "우리와의 차별점"
    }
  ],
  "feasibility_score": 0.75
}
```

### 프롬프트 전략
- 실제 시장 데이터 참조 가능하도록 웹 검색 결과 주입 (선택적)
- 스타트업 공모전 평가 기준 반영
- 낙관적 편향 방지: "객관적 위험 요소도 명시"

### 티어별 차이
- **라이트**: 이 단계 스킵 (블러 처리로 티징만)
- **프로**: 시장분석 + 경쟁사 3개 + 피드백 수정 가능
- **헤비**: 시장분석 + 경쟁사 10개 + 심화 분석

---

## Stage 3: 통합 리포트 생성

### 목적
노션 스타일 읽기 전용 사업계획서 생성

### 입력
- Stage 1, 2 출력 결과 통합

### 출력 구조
```json
{
  "title": "사업계획서 제목",
  "sections": [
    {
      "id": "business-overview",
      "title": "사업 개요",
      "content": "..."
    },
    {
      "id": "market-analysis",
      "title": "시장 분석",
      "content": "..."
    },
    {
      "id": "competitor-analysis",
      "title": "경쟁사 분석",
      "content": "..."
    },
    {
      "id": "revenue-model",
      "title": "수익화 모델",
      "subsections": [
        {"id": "revenue-structure", "title": "매출 구조", "content": "..."},
        {"id": "pricing-strategy", "title": "가격 전략", "content": "..."},
        {"id": "revenue-forecast", "title": "수익 예측", "content": "..."}
      ]
    },
    {
      "id": "business-structure",
      "title": "사업 구조",
      "subsections": [
        {"id": "team", "title": "팀 구성", "content": "..."},
        {"id": "operation", "title": "운영 방식", "content": "..."}
      ]
    },
    {
      "id": "development-guide",
      "title": "개발 가이드",
      "subsections": [
        {"id": "tech-stack", "title": "기술 스택", "content": "..."},
        {"id": "mvp-roadmap", "title": "MVP 로드맵", "content": "..."}
      ]
    }
  ]
}
```

### 프롬프트 전략
- 각 섹션마다 별도 프롬프트 호출 (품질 vs 비용 트레이드오프)
- 또는 단일 프롬프트로 전체 생성 후 검증 단계 추가
- 마크다운 형식으로 생성 → 렌더링은 프론트엔드

### 수정 불가 이유
시장 데이터는 팩트 기반이므로 사용자 임의 수정 방지 → 신뢰도 확보

---

## Stage 4: 실행 액션 생성

### 목적
다음 스텝 가이드 제공 (성취감 + 방향성)

### 입력
- Stage 3 리포트 전체

### 출력 (각 액션별 별도 생성)

#### 4-1. 홍보 웹사이트 (랜딩페이지)
```json
{
  "sections": [
    {"type": "hero", "headline": "...", "subheadline": "..."},
    {"type": "problem", "content": "..."},
    {"type": "solution", "content": "..."},
    {"type": "cta", "button_text": "..."}
  ],
  "html_template": "<!DOCTYPE html>..."
}
```

#### 4-2. 사업계획서 (투자자용)
```json
{
  "format": "formal",
  "sections": [...],
  "pdf_ready": true
}
```

#### 4-3. 피칭 PPT
```json
{
  "slides": [
    {"number": 1, "title": "Problem", "content": "...", "notes": "..."},
    {"number": 2, "title": "Solution", "content": "..."},
    ...
  ]
}
```

#### 4-4. MVP 개발 설계
```json
{
  "features": [
    {"priority": 1, "name": "...", "description": "..."},
    ...
  ],
  "tech_stack": {
    "frontend": "...",
    "backend": "...",
    "database": "..."
  },
  "checklist": [
    {"phase": "Week 1", "tasks": ["...", "..."]},
    ...
  ]
}
```

### 프롬프트 전략
- 실제 쓸 수준은 아니어도 "방향성"은 제시
- 템플릿 형태로 제공 → 사용자가 커스터마이징 가능하도록

---

## 티어별 토큰 소비 추정

### 라이트
- Stage 1만: ~1,000 tokens
- Stage 3 간소화: ~3,000 tokens
- **총 ~4,000 tokens**

### 프로
- Stage 1: ~1,000 tokens
- Stage 2: ~5,000 tokens
- Stage 3: ~8,000 tokens
- **총 ~14,000 tokens**

### 헤비
- Stage 1: ~1,000 tokens
- Stage 2 심화: ~10,000 tokens
- Stage 3: ~8,000 tokens
- Stage 4 전체: ~6,000 tokens
- **총 ~25,000 tokens**

---

## 품질 보장 전략

1. **구조화된 출력**: 모든 단계 JSON Schema 강제
2. **Few-shot 예시**: 각 프롬프트에 3개 이상 성공 사례 포함
3. **검증 레이어**: 출력 결과 형식 검증 후 재시도
4. **평가 기준 주입**: 스타트업 공모전 평가표, 사업계획서 필수 항목 체크리스트

---

## 다음 단계

1. 각 Stage별 프롬프트 템플릿 작성
2. JSON Schema 정의
3. Python/TypeScript로 파이프라인 구현
4. 샘플 아이디어로 테스트
