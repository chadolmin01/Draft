# v4 프롬프트 빠른 테스트 (Claude.ai Projects)

## 📋 준비사항

1. Claude.ai Projects 프로젝트 생성 (이미 했으면 재사용)
2. 지식 베이스 업로드 (한 번만):
   - `knowledge-base/startup-evaluation-criteria.md`
   - `knowledge-base/successful-startup-examples.md`

---

## 🧪 테스트 1: Pro 티어

**Claude.ai Projects 채팅창에 복붙:**

```
당신은 20년 경력의 스타트업 전략 컨설턴트입니다. 초보 창업자가 제시한 뭉개진 아이디어를 명확한 구조로 해체하는 전문가입니다.

**티어별 분석 깊이:**
- **Light**: 기본 구조화 (타겟/문제/솔루션)
- **Pro/Heavy**: 기본 + 수익모델 분석 + 비즈니스 실현 가능성

업로드된 지식 베이스(startup-evaluation-criteria.md, successful-startup-examples.md)를 참고하여 아이디어를 분석하세요.

**중요:**
- confidence_score는 타겟/문제/솔루션 3가지만 평가 (수익모델은 제외)
- Pro 티어는 수익모델 분석 포함
- JSON 형식으로 출력

---

**Input:**
idea: "대학교 커피 찌꺼기로 굿즈를 만드는 사업"
tier: "pro"

**Output 형식:**
```json
{
  "target": "...",
  "problem": "...",
  "problem_quantified": {
    "pain_intensity": "낮음/중간/높음/매우높음",
    "willingness_to_pay": "..."
  },
  "solution": "...",
  "target_market_size": "...",
  "confidence_score": 0.0-1.0,
  "confidence_reason": "...",
  "original_idea": "...",

  "revenue_analysis": {
    "revenue_streams": ["..."],
    "cost_structure": ["..."],
    "pricing_strategy": "..."
  },
  "business_viability": {
    "strengths": ["..."],
    "weaknesses": ["..."]
  },
  "monetization_difficulty": "낮음/중간/높음",
  "monetization_reason": "...",
  "first_revenue_timeline": "..."
}
```

JSON만 출력하세요.
```

---

## 🧪 테스트 2: Light vs Pro 비교

**Light 티어:**
```
idea: "대학교 커피 찌꺼기로 굿즈를 만드는 사업"
tier: "light"

Output에 다음 필드 포함:
- _pro_features_preview: { "revenue_analysis": "🔒 프로 플랜에서 확인", ... }
- revenue_analysis 필드는 제외
```

**Pro 티어:**
```
idea: "대학교 커피 찌꺼기로 굿즈를 만드는 사업"
tier: "pro"

Output에 다음 필드 포함:
- revenue_analysis: { ... }
- business_viability: { ... }
- monetization_difficulty: "..."
```

**확인사항:**
- [ ] Light와 Pro의 confidence_score가 동일한가? (수익모델은 점수에 영향 없어야 함)
- [ ] Light는 `_pro_features_preview` 있는가?
- [ ] Pro는 `revenue_analysis` 상세한가?

---

## 🎯 예상 결과

### Light 티어
```json
{
  "target": "환경 의식 있는 20-30대 대학생",
  "problem": "...",
  "solution": "...",
  "confidence_score": 0.75,

  "_pro_features_preview": {
    "revenue_analysis": "🔒 프로 플랜에서 확인",
    "business_viability": "🔒 프로 플랜에서 확인"
  }
}
```

### Pro 티어
```json
{
  "target": "환경 의식 있는 대학생 + 대학 기념품샵 (B2B2C)",
  "problem": "...",
  "confidence_score": 0.75,  // Light와 동일!

  "revenue_analysis": {
    "revenue_streams": ["생협 판매", "온라인몰", "ESG 납품"],
    "pricing_strategy": "텀블러 18,000원..."
  },
  "monetization_difficulty": "중간",
  "monetization_reason": "생협 입점 설득 필요..."
}
```

---

## 🐛 문제 발생 시

### 문제 1: JSON 형식이 깨짐
**해결:** 프롬프트 마지막에 강조
```
CRITICAL: Output ONLY valid JSON. No markdown, no explanation.
```

### 문제 2: revenue_analysis가 Light에도 나옴
**해결:** tier 파라미터 명확히
```
tier: "light"  (NOT "Light" or "LIGHT")
```

### 문제 3: confidence_score가 티어별로 다름
**해결:** 프롬프트에 재강조
```
confidence_score는 타겟/문제/솔루션만 평가. 수익모델은 절대 평가 안 함!
```

---

## 📝 결과 저장

테스트 후 결과를 파일로 저장:
```
tests/outputs/v4-light-coffee.json
tests/outputs/v4-pro-coffee.json
```

---

Happy Testing! 🚀
