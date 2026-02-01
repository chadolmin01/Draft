#!/bin/bash

# AI 스타트업 플랫폼 - Gemini 버전 셋업 스크립트

echo "🚀 AI 스타트업 플랫폼 셋업 시작 (Gemini 무료 버전)"
echo ""

# 1. Next.js 프로젝트 생성
echo "📦 Step 1: Next.js 프로젝트 생성..."
cd "C:/project/Startup"
npx create-next-app@latest web --typescript --tailwind --app --yes

cd web

# 2. Gemini SDK 설치
echo "📦 Step 2: Gemini SDK 설치..."
npm install @google/generative-ai

# 3. 디렉토리 생성
echo "📁 Step 3: 디렉토리 생성..."
mkdir -p lib app/api/stage1 types

# 4. 파일 복사
echo "📄 Step 4: 파일 복사..."

# Gemini API 래퍼
cp ../web-implementation/lib/gemini.ts lib/

# API Route
cp ../web-implementation/app/api/stage1/route-gemini.ts app/api/stage1/route.ts

# 프롬프트 로더
cp ../web-implementation/lib/prompts.ts lib/

# 메인 페이지
cp ../web-implementation/app/page.tsx app/

# 타입 정의
cp ../api-contract/types.ts types/api.ts

# 환경 변수
cp ../web-implementation/.env.local.example .env.local

echo ""
echo "✅ 셋업 완료!"
echo ""
echo "📝 다음 단계:"
echo "1. .env.local 파일 편집"
echo "   - Google AI API 키 입력: https://ai.google.dev/"
echo "2. npm run dev 실행"
echo "3. http://localhost:3000 접속"
echo ""
echo "💡 Google AI API 키 발급:"
echo "   https://ai.google.dev/ → Get API key → Create API key"
echo ""
