# Vercel 배포 가이드

## 1. GitHub 저장소 생성 및 푸시

### 1) GitHub에서 저장소 생성

1. [GitHub](https://github.com) 로그인
2. **New repository** 클릭
3. 저장소 이름: `draft-startup` (또는 원하는 이름)
4. **Public** 선택
5. **Create repository** 클릭 (README, .gitignore 추가하지 않음)

### 2) 로컬에서 원격 연결 및 푸시

```powershell
cd c:\project\Startup

# 원격 저장소 추가 (YOUR_USERNAME을 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/draft-startup.git

# main 브랜치로 변경 (선택)
git branch -M main

# 푸시
git push -u origin main
```

---

## 2. Vercel 배포

### 1) Vercel 연결

1. [vercel.com](https://vercel.com) 접속 → **Sign Up** (GitHub 계정으로 로그인)
2. **Add New** → **Project**
3. **Import** → GitHub 저장소 `draft-startup` 선택
4. **Import** 클릭

### 2) 프로젝트 설정

| 설정 | 값 |
|------|-----|
| **Framework Preset** | Next.js (자동 감지) |
| **Root Directory** | `frontend` ⚠️ **반드시 설정** |
| **Build Command** | `npm run build` (기본값) |
| **Output Directory** | `.next` (기본값) |

### 3) 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_API_KEY` | (Google AI Studio API 키) | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jblqkuiiulkydjsghipo.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase anon 키) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase service_role 키) | Production, Preview |

> ⚠️ `frontend/.env.local`의 값을 복사해서 입력하세요. **절대** `.env.local` 파일을 Git에 푸시하지 마세요.

### 4) Deploy

**Deploy** 클릭 → 빌드 완료 후 `https://your-project.vercel.app` URL 확인

---

## 3. 배포 후 OAuth 설정 업데이트

배포 URL이 확정되면 다음을 업데이트하세요.

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. OAuth 2.0 클라이언트 ID → **편집**
3. **Authorized redirect URIs**에 추가:
   - `https://your-project.vercel.app/auth/callback`

### Supabase

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://your-project.vercel.app`로 변경
4. **Redirect URLs**에 `https://your-project.vercel.app/**` 추가

### GitHub OAuth

- GitHub OAuth App의 **Authorization callback URL**은 Supabase URL 그대로 유지
- Supabase가 OAuth 콜백을 처리하므로 변경 불필요

---

## 4. Git 사용자 정보 수정 (선택)

커밋 작성자 정보를 본인 것으로 변경하려면:

```powershell
git config user.email "your@email.com"
git config user.name "Your Name"
```

이후 커밋은 새 정보로 기록됩니다. 기존 커밋 수정은 `git commit --amend` 사용.

---

## 5. 트러블슈팅

| 문제 | 해결 |
|------|------|
| 빌드 실패: "Cannot find module" | Root Directory가 `frontend`인지 확인 |
| API 500 에러 | Vercel 환경 변수 확인 (GOOGLE_API_KEY 등) |
| OAuth 리다이렉트 오류 | Google/Supabase 콜백 URL에 배포 URL 추가 |
| 프롬프트 파일 없음 | `prompts/`가 `frontend/` 상위에 있어야 함. Root가 `frontend`면 `../prompts` 경로로 접근 가능 |
