/**
 * Next.js Middleware - Supabase 세션 갱신
 * Vercel Edge에서 Supabase SSR 이슈로 임시 비활성화 (500 방지)
 * 인증은 클라이언트에서 정상 동작
 */

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
