/**
 * /api/ideas
 * GET: 로그인 사용자의 아이디어 목록 조회 (user_id 기준)
 * POST: 아이디어 생성 (Stage 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';
import { generateMockStage1Analysis } from '@/lib/mock-data';
import { createIdea, isDbEnabled } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CreateIdeaRequest, IdeaAnalysis } from '@/lib/types';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true, data: [] });
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
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('ideas')
      .select('id, idea, tier, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/ideas error:', error);
      return NextResponse.json({ success: true, data: [] });
    }

    const items = (data || []).map((row) => ({
      id: row.id,
      idea: row.idea,
      tier: row.tier,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('GET /api/ideas error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateIdeaRequest = await request.json();
    let { idea, tier, userId } = body;

    // userId가 있으면 profile.tier 사용 (계정 티어 우선)
    if (userId) {
      const admin = createAdminClient();
      if (admin) {
        const { data: profile } = await admin.from('profiles').select('tier').eq('id', userId).single();
        if (profile?.tier && ['light', 'pro', 'heavy'].includes(profile.tier)) {
          tier = profile.tier;
        }
      }
    }

    // 검증
    if (!idea || idea.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '아이디어를 입력해주세요.',
          },
        },
        { status: 400 }
      );
    }

    if (!['light', 'pro', 'heavy'].includes(tier)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TIER',
            message: '잘못된 티어입니다.',
          },
        },
        { status: 400 }
      );
    }

    // Mock 모드 체크 (실제 API와 동일한 data 구조로 반환)
    if (request.headers.get('x-mock-mode') === 'true') {
      const mockResult = generateMockStage1Analysis(idea, tier);
      const mockId = mockResult.idea.id;
      // Mock 모드에서도 DB 저장 시도 (설정된 경우)
      if (isDbEnabled()) {
        const dbResult = await createIdea({
          idea,
          tier,
          userId: userId || null,
          analysis: mockResult.analysis,
        });
        if (dbResult) {
          return NextResponse.json({
            success: true,
            data: {
              id: dbResult.id,
              idea: mockResult.idea.idea,
              tier: mockResult.idea.tier,
              createdAt: dbResult.idea.created_at,
              stage: 1,
              analysis: mockResult.analysis,
            },
          });
        }
      }
      return NextResponse.json({
        success: true,
        data: {
          id: mockId,
          idea: mockResult.idea.idea,
          tier: mockResult.idea.tier,
          createdAt: mockResult.idea.createdAt,
          stage: mockResult.idea.stage,
          analysis: mockResult.analysis,
        },
      });
    }

    // API 키 확인
    const apiKey = process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey || apiKey === 'your_google_api_key') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'API 키가 설정되지 않았습니다. frontend/.env.local에 GOOGLE_API_KEY를 설정하세요.',
          },
        },
        { status: 503 }
      );
    }

    // 프롬프트 로드
    const promptTemplate = loadPrompt(1, tier);
    const prompt = promptTemplate.replace('{USER_IDEA}', idea);

    // Gemini API 호출
    const response = await callGemini(prompt, true);
    const analysis = parseJsonResponse<IdeaAnalysis>(response);

    // DB 저장 (Supabase 설정된 경우)
    if (isDbEnabled()) {
      const dbResult = await createIdea({
        idea,
        tier,
        userId: userId || null,
        analysis,
      });
      if (dbResult) {
        return NextResponse.json({
          success: true,
          data: {
            id: dbResult.id,
            idea,
            tier,
            createdAt: dbResult.idea.created_at,
            stage: 1,
            analysis,
          },
        });
      }
    }

    // DB 미설정: 기존 방식 (localStorage용 ID)
    const ideaId = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      data: {
        id: ideaId,
        idea,
        tier,
        createdAt: new Date().toISOString(),
        stage: 1,
        analysis,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('[POST /api/ideas] Error:', err.message);
    if (err.stack) console.error(err.stack);

    // 사용자 친화적 메시지로 변환
    let code = 'INTERNAL_ERROR';
    let message = err.message;
    if (message.includes('API key') || message.includes('API 키')) {
      code = 'INVALID_API_KEY';
      message = 'API 키가 유효하지 않습니다. Google AI Studio에서 새 키를 발급해 .env.local에 설정하세요.';
    } else if (message.includes('429') || message.includes('quota') || message.includes('한도')) {
      code = 'RATE_LIMIT_EXCEEDED';
      message = 'API 호출 한도를 초과했습니다. 잠시 후 또는 내일 다시 시도해주세요.';
    } else if (message.includes('network') || message.includes('fetch')) {
      code = 'NETWORK_ERROR';
      message = 'Gemini API에 연결할 수 없습니다. 인터넷 연결과 방화벽을 확인하세요.';
    } else if (message.includes('JSON') || message.includes('parse')) {
      code = 'PARSE_ERROR';
      message = 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }

    return NextResponse.json(
      {
        success: false,
        error: { code, message },
      },
      { status: 500 }
    );
  }
}
