# Claude.ai Projects 테스트 환경 셋업 가이드

## 1. 프로젝트 생성

1. [Claude.ai](https://claude.ai) 접속 (Pro 계정 필요)
2. 좌측 사이드바에서 "Projects" 클릭
3. "Create Project" 버튼
4. 프로젝트 이름: **"스타트업 플랫폼 프롬프트 테스트"**

---

## 2. 지식 베이스 문서 업로드

다음 문서들을 프로젝트에 추가하세요:

### 필수 문서
- `knowledge-base/startup-evaluation-criteria.md` - 스타트업 평가 기준
- `knowledge-base/business-plan-template.md` - 사업계획서 표준 양식
- `knowledge-base/successful-startup-examples.md` - 성공 사례 (Few-shot용)

### 프롬프트 템플릿
- `prompts/stage1-idea-breakdown.md`
- `prompts/stage2-market-analysis.md`
- `prompts/stage3-integrated-report.md`
- `prompts/stage4-landing-page.md`

**업로드 방법:**
- 파일을 드래그 앤 드롭
- 또는 "Add content" → "Upload files"

---

## 3. Custom Instructions 설정

프로젝트 설정에서 "Custom Instructions" 입력:

```
당신은 스타트업 사업계획 전문가입니다.

역할:
- 초보 창업자의 아이디어를 명확히 구조화
- 객관적 시장 분석 및 경쟁사 파악
- 실행 가능한 사업계획서 작성

원칙:
- 과장 금지, 낙관적 편향 지양
- 정량적 데이터 우선
- 실제 투자 심사/공모전 기준 적용

출력 형식:
- 요청받은 경우 JSON 형식으로 출력
- 구조화된 마크다운 사용
```

---

## 4. 테스트 시나리오

### Stage 1 테스트
프로젝트 채팅에 다음 입력:

```
[Stage 1: 아이디어 해체 분석]

다음 프롬프트 템플릿을 참고하여 아이디어를 분석해주세요:
(여기에 stage1-idea-breakdown.md 내용 붙여넣기)

테스트 아이디어:
"요즘 사람들 너무 바빠서 운동 못 하잖아요. 집에서 쉽게 할 수 있는 15분 피트니스 앱 만들고 싶어요."
```

### Stage 2 테스트
Stage 1 결과를 받은 후:

```
[Stage 2: 시장 분석]

Stage 1 결과를 기반으로 시장 분석을 진행해주세요:
(여기에 stage2-market-analysis.md 내용 붙여넣기)

Stage 1 결과:
{이전 결과 복사}
```

### Stage 3 테스트
```
[Stage 3: 통합 리포트]

Stage 1, 2 결과를 통합하여 완전한 사업계획서를 작성해주세요:
(여기에 stage3-integrated-report.md 내용 붙여넣기)
```

---

## 5. 검증 체크리스트

각 단계 결과를 받은 후 확인:

### Stage 1
- [ ] target이 구체적인가? (인구통계 + 상황)
- [ ] problem이 실존하는가?
- [ ] solution이 문제를 직접 해결하는가?
- [ ] confidence_score가 적절한가?

### Stage 2
- [ ] 시장 규모가 정량적인가?
- [ ] 경쟁사가 실제로 존재하는가?
- [ ] 차별점이 명확한가?
- [ ] risks가 현실적인가?

### Stage 3
- [ ] 모든 섹션이 포함되었는가?
- [ ] 마크다운 형식이 올바른가?
- [ ] 투자자/공모전 제출 가능한 수준인가?

---

## 6. 프롬프트 튜닝 팁

테스트하면서 발견한 문제점을 메모:

**문제 예시:**
- "타겟이 너무 추상적으로 나옴" → 프롬프트에 "구체적 페르소나 예시 필수" 추가
- "시장 규모가 부정확" → Few-shot 예시 추가
- "JSON 형식이 깨짐" → "JSON only. No additional text." 강조

**튜닝 방법:**
1. 문제 발견
2. 프롬프트 템플릿 파일 수정
3. 다시 테스트
4. 반복

---

## 7. 샘플 아이디어 모음

다양한 케이스로 테스트하세요:

### 명확한 아이디어
- "바쁜 직장인을 위한 15분 홈트레이닝 앱"
- "AI 프롬프트 자동화 도구"
- "1인 가구 맞춤 식재료 배송 서비스"

### 모호한 아이디어
- "친환경 비즈니스 하고 싶어요"
- "AI 활용한 뭔가 만들고 싶어요"
- "요즘 핫한 분야로 창업하고 싶어요"

### 복잡한 아이디어
- "ChatGPT 매번 쓰는 게 귀찮아서, 업무 자동화 + 템플릿 + 팀 협업 기능 다 있는 플랫폼"
- "중소기업 대상 AI 컨설팅 + SaaS + 교육 패키지"

---

## 다음 단계

수동 테스트로 프롬프트가 어느 정도 검증되면:
1. 튜닝된 프롬프트를 파일에 반영
2. Gemini 무료 API로 자동화 테스트
3. 실제 웹 애플리케이션 개발
