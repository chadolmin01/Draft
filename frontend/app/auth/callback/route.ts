import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const origin = request.headers.get('origin') ?? new URL(request.url).origin;

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${origin}/login?error=auth_config`);
    }

    // 리다이렉트 응답에 쿠키를 직접 설정 (세션이 유지되도록)
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // OAuth 콜백 후 profile 생성 (트리거 대신 앱 레벨에서 처리)
      const admin = createAdminClient();
      if (admin) {
        await admin.from('profiles').upsert(
          { id: data.user.id, tier: 'light' },
          { onConflict: 'id' }
        );
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
