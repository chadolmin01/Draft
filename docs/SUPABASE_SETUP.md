# Supabase DB + Auth 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 후 로그인
2. **New Project** 클릭
3. 프로젝트 이름, 비밀번호, 리전 설정 후 생성

## 2. 환경 변수 설정

`frontend/.env.local`에 추가:

```env
# Supabase (DB + Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- **URL, Anon Key**: Supabase Dashboard → Settings → API
- **Service Role Key**: 같은 페이지에서 Service role (secret) 복사
  - ⚠️ 절대 클라이언트에 노출 금지

## 3. DB 스키마 적용

Supabase Dashboard → **SQL Editor**에서 실행:

```sql
-- supabase/migrations/20260201000000_initial_schema.sql 내용 복사 후 실행
```

또는 Supabase CLI 사용:

```bash
npx supabase init
npx supabase db push
```

## 4. Auth 설정 (이메일/비밀번호)

Supabase Dashboard → **Authentication** → **Providers**:

- **Email** 활성화
- **Confirm email** 필요 시 활성화 (개발 시 비활성화 권장)

## 5. 동작 확인

1. `npm run dev` 실행
2. 홈페이지에서 **로그인** 버튼 클릭
3. 회원가입 후 로그인
4. 아이디어 입력 → DB에 저장됨
5. 새로고침/다른 기기에서도 데이터 유지

## 6. 폴백 동작

Supabase 미설정 시:

- DB 저장/조회 비활성화
- localStorage 사용 (기존 동작 유지)
- 인증 UI 표시되나 동작 안 함

## 7. RLS (Row Level Security)

- 로그인 사용자: 자신의 `user_id` 데이터만 접근
- 익명 사용자: `user_id IS NULL` 데이터만 접근
- API는 `service_role`로 RLS 우회 (서버 전용)
