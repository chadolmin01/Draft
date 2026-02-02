/**
 * GET /api/profile
 * 로그인 사용자의 profile 조회. 없으면 생성 후 반환 (기존 유저 대응)
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Tier } from '@/lib/types';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: false, error: 'Auth not configured' }, { status: 503 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    // 기존 유저(profile 없음)면 service_role로 생성
    if (!profile) {
      const admin = createAdminClient();
      if (admin) {
        await admin.from('profiles').upsert(
          { id: user.id, tier: 'light' },
          { onConflict: 'id' }
        );
        const { data: created } = await admin.from('profiles').select('tier').eq('id', user.id).single();
        profile = created;
      }
    }

    const tier = (profile?.tier ?? 'light') as Tier;
    return NextResponse.json({ success: true, data: { tier } });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
