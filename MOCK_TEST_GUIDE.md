# Mock 모드 테스트 가이드

이 가이드는 Mock 모드를 사용하여 전체 플로우를 테스트하는 방법을 설명합니다.

## 테스트 목적

- Gemini API 호출 없이 전체 플로우 확인
- 빠른 반복 테스트 가능
- Rate Limit 없이 무제한 테스트

## 테스트 전 준비

1. 개발 서버 실행:
   ```bash
   cd frontend
   npm run dev
   ```

2. 브라우저에서 http://localhost:3000 열기

## 테스트 시나리오 1: Mock 모드로 전체 플로우 테스트

### 1단계: Mock 모드 활성화

1. 개발 서버가 실행 중인지 확인
2. 브라우저 우측 하단의 💾 아이콘 클릭 (Storage Monitor)
3. "⚪ Mock 모드 OFF" 버튼 클릭
4. "🟢 Mock 모드 ON"으로 변경되었는지 확인
5. 알림 메시지: "Mock 모드: ON" 확인

### 2단계: Stage 1 - 아이디어 생성 테스트

1. 홈 페이지에서 아이디어 입력:
   - 예시: "AI 기반 반려동물 건강관리 앱"
2. 티어 선택: LIGHT / PRO / HEAVY 중 하나
3. "무료로 시작하기" 버튼 클릭
4. **즉시 응답 확인** (실제 API 호출 시 10-15초 소요)
5. 분석 페이지로 이동되었는지 확인
6. Stage 1 결과 확인:
   - 🎯 타겟 고객
   - ❗ 문제 정의
   - 💡 솔루션
   - (Pro/Heavy 티어) 💰 수익 모델 분석

### 3단계: Stage 2 - 시장 분석 테스트

1. "시장 분석 시작하기" 버튼 클릭
2. **즉시 응답 확인** (실제 API는 15초 소요)
3. 시장 분석 결과 확인:
   - 📊 시장 분석 (시장 규모, 성장률, 타겟 세그먼트)
   - 🏢 경쟁사 분석
   - ⚠️ 주요 위험 요소
   - 실현 가능성 점수

### 4단계: Stage 2 Deep - 심화 분석 테스트 (Pro/Heavy 티어)

각 심화 분석 버튼을 클릭하여 테스트:

#### 4-1. 시장 심화 분석 (📈)
1. "시장 심화 분석 생성하기" 버튼 클릭
2. **즉시 응답 확인** (실제 API는 10-15초)
3. 결과 확인:
   - TAM/SAM/SOM 시장 규모
   - 경쟁 포지셔닝 맵
   - 가격 벤치마킹 테이블

#### 4-2. 전략 & 실행 (🎯)
1. "전략 & 실행 생성하기" 버튼 클릭
2. **즉시 응답 확인**
3. 결과 확인:
   - SWOT 분석 (강점/약점/기회/위협)
   - 시장 진입 전략
   - 필요 자원 추정

#### 4-3. 외부 환경 (🌍)
1. "외부 환경 생성하기" 버튼 클릭
2. **즉시 응답 확인**
3. 결과 확인:
   - 규제 이슈 테이블
   - 투자 트렌드
   - 유사 사례 분석

### 5단계: Stage 3 - 통합 리포트 생성 테스트

1. 페이지 하단 "상세 리포트 생성하기 →" 버튼 클릭
2. **즉시 응답 확인** (실제 API는 20-30초)
3. 리포트 페이지로 이동 확인
4. 리포트 섹션 확인:
   - 개요 (Overview)
   - 시장 분석 (Market)
   - 경쟁사 (Competitors)
   - 수익화 (Monetization)
   - 조직 구조 (Structure)
   - 개발 계획 (Development)

### 6단계: Gemini API 호출 0회 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭 확인
3. `generativelanguage.googleapis.com`로 가는 요청이 없는지 확인
4. 모든 API 호출이 `/api/` 엔드포인트로만 이루어졌는지 확인

## 테스트 시나리오 2: Mock 모드 OFF로 실제 API 테스트

### 목적
Mock 모드와 실제 API 모드가 제대로 전환되는지 확인

### 절차

1. Storage Monitor (💾) 열기
2. "🟢 Mock 모드 ON" 버튼 클릭
3. "⚪ Mock 모드 OFF"로 변경 확인
4. 알림 메시지: "Mock 모드: OFF" 확인
5. 새로운 아이디어 입력
6. **실제 API 호출 확인** (10-15초 소요)
7. Gemini API 호출 확인 (Network 탭)

## 테스트 결과 기대값

### ✅ 성공 기준

- [ ] Mock 모드 ON/OFF 토글이 정상 작동
- [ ] Stage 1 분석이 즉시 응답 (< 1초)
- [ ] Stage 2 시장 분석이 즉시 응답
- [ ] Stage 2 Deep 3개 분석이 모두 즉시 응답
- [ ] Stage 3 리포트가 즉시 생성
- [ ] 모든 데이터가 localStorage에 저장됨
- [ ] Gemini API 호출 0회 (Network 탭 확인)
- [ ] Mock 모드 OFF 시 실제 API 호출 동작

### ❌ 실패 사례

- Mock 모드가 활성화되었는데도 API 호출이 느림 (10초 이상)
- `x-mock-mode` 헤더가 전송되지 않음
- API 엔드포인트에서 Mock 데이터를 반환하지 않음
- 실제 Gemini API가 호출됨

## 디버깅 팁

### Mock 모드가 작동하지 않을 때

1. localStorage 확인:
   ```javascript
   localStorage.getItem('MOCK_MODE') // 'true'여야 함
   ```

2. Network 탭에서 요청 헤더 확인:
   ```
   x-mock-mode: true
   ```

3. 브라우저 콘솔에서 Mock 모드 강제 활성화:
   ```javascript
   localStorage.setItem('MOCK_MODE', 'true');
   location.reload();
   ```

### API 응답 확인

1. Network 탭에서 API 응답 확인
2. Response에 Mock 데이터가 포함되어 있는지 확인
3. 응답 시간이 < 100ms인지 확인

## 추가 테스트 케이스

### 다양한 티어 테스트

1. LIGHT 티어:
   - Stage 1만 작동
   - Stage 2 접근 시 "Pro 이상 티어 필요" 메시지 확인

2. PRO 티어:
   - Stage 1, 2 작동
   - 심화 분석 3개 모두 작동

3. HEAVY 티어:
   - 모든 기능 작동
   - 바이브코딩 가이드 포함 확인

### localStorage 관리 테스트

1. Storage Monitor에서 저장된 아이디어 확인
2. 아이디어 삭제 기능 테스트
3. "최근 10개만 유지" 기능 테스트
4. "전체 삭제" 기능 테스트

## 마무리

테스트 완료 후:

1. Mock 모드 OFF로 전환 (실수로 실제 API 호출 방지)
2. localStorage 정리 (Storage Monitor → "전체 삭제")
3. 개발 서버 종료

---

**작성일**: 2026-01-30
**버전**: 1.0
**작성자**: AI Assistant
