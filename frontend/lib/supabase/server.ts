/**
 * Supabase 서버 클라이언트
 * API 라우트, 서버 컴포넌트에서 사용
 */

import { createServerClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}

/**
 * Request에서 쿠키를 읽어 세션 포함 클라이언트 생성
 * API 라우트에서 사용
 */
export function createClientFromRequest(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers.get('cookie')?.split(';').map(c => {
          const [name, ...rest] = c.trim().split('=');
          return { name, value: rest.join('=').trim() };
        }) ?? [];
      },
      setAll(cookiesToSet) {
        // API 라우트에서는 쿠키 설정 불가 - 미들웨어에서 처리
      },
    },
  });
}
