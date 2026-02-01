/**
 * POST /api/ideas
 * 아이디어 생성 (Stage 1)
 * DB 연동 시 Supabase에 저장, 미설정 시 메모리 응답만
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';
import { generateMockStage1Analysis } from '@/lib/mock-data';
import { createIdea, isDbEnabled } from '@/lib/db';
import type { CreateIdeaRequest, IdeaAnalysis } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateIdeaRequest = await request.json();
    const { idea, tier, userId } = body;

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
    console.error('Error creating idea:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
