@echo off
chcp 65001 >nul
echo 🚀 AI 스타트업 플랫폼 셋업 시작 (Gemini 무료 버전)
echo.

cd C:\project\Startup

echo 📦 Step 1: Next.js 프로젝트 생성...
call npx create-next-app@latest web --typescript --tailwind --app --yes

cd web

echo 📦 Step 2: Gemini SDK 설치...
call npm install @google/generative-ai

echo 📁 Step 3: 디렉토리 생성...
mkdir lib app\api\stage1 types 2>nul

echo 📄 Step 4: 파일 복사...

copy ..\web-implementation\lib\gemini.ts lib\
copy ..\web-implementation\app\api\stage1\route-gemini.ts app\api\stage1\route.ts
copy ..\web-implementation\lib\prompts.ts lib\
copy ..\web-implementation\app\page.tsx app\
copy ..\api-contract\types.ts types\api.ts
copy ..\web-implementation\.env.local.example .env.local

echo.
echo ✅ 셋업 완료!
echo.
echo 📝 다음 단계:
echo 1. .env.local 파일 편집
echo    - Google AI API 키 입력: https://ai.google.dev/
echo 2. npm run dev 실행
echo 3. http://localhost:3000 접속
echo.
echo 💡 Google AI API 키 발급:
echo    https://ai.google.dev/ → Get API key → Create API key
echo.

pause
