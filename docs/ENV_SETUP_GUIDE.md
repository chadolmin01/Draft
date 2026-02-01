# 환경 변수 설정 가이드

## 개요

이 프로젝트는 `frontend/.env.local` 파일을 사용합니다.  
`.env.local`은 Git에 포함되지 않으므로 직접 생성해야 합니다.

---

## 1. 파일 생성

```bash
cd frontend
cp .env.example .env.local
```

또는 `frontend/.env.local` 파일을 직접 생성합니다.

---

## 2. 필수 환경 변수

### Google Gemini API (AI 분석용)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `GOOGLE_API_KEY` | Google AI Studio API 키 | `AIzaSy...` |

**발급 방법:**
1. [Google AI Studio](https://aistudio.google.com/) 접속
2. **Get API Key** 클릭
3. 생성된 키 복사

**무료 한도:** 분당 15회, 일일 1,500회

---

## 3. Supabase (DB + Auth) - 선택

Supabase를 설정하면 DB 저장 및 로그인 기능이 활성화됩니다.  
미설정 시 localStorage만 사용합니다.

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (공개) 키 | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role (비밀) 키 | `eyJhbGc...` |

**발급 방법:**
1. [supabase.com](https://supabase.com) → 프로젝트 생성
2. **Settings** → **API** 이동
3. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **service_role** 키 → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **보안:** `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 마세요.  
`NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에 전달됩니다.

---

## 4. Mock 모드 (개발용)

API 호출 없이 목업 데이터로 테스트할 때 사용합니다.

| 설정 위치 | 값 | 설명 |
|-----------|-----|------|
| 브라우저 localStorage | `MOCK_MODE` = `true` | Mock 모드 활성화 |

**사용법:**
1. 개발자 도구 (F12) → Application → Local Storage
2. 키: `MOCK_MODE`, 값: `true` 추가
3. 아이디어 제출 시 Gemini 대신 목업 데이터 반환

---

## 5. 전체 예시

### 최소 설정 (Gemini만)

```env
GOOGLE_API_KEY=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q
```

### 전체 설정 (Gemini + Supabase)

```env
# Google Gemini API (필수)
GOOGLE_API_KEY=AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q

# Supabase (DB + Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. 확인 방법

### 환경 변수 로드 확인

```bash
cd frontend
npm run dev
```

- `GOOGLE_API_KEY` 없음 → API 호출 시 "API key" 관련 오류
- Supabase 변수 없음 → DB/인증 비활성화, localStorage 사용

### Supabase 연결 확인

1. 로그인 버튼 클릭
2. 회원가입 시도
3. Supabase 미설정 시 "Auth not configured" 또는 동작 안 함

---

## 7. 참고

- `.env.local`은 `frontend/` 디렉터리에 있어야 합니다
- Next.js는 빌드 시점에 `NEXT_PUBLIC_` 변수를 번들에 포함합니다
- 서버 전용 변수(`GOOGLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)는 클라이언트에 노출되지 않습니다
