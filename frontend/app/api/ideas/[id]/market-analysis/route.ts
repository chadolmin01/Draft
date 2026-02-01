/**
 * POST /api/ideas/[id]/market-analysis
 * Stage 2: 시장 분석
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';
import { generateMockStage2Analysis } from '@/lib/mock-data';
import { updateAnalysis, isDbEnabled } from '@/lib/db';
import type { Stage2MarketAnalysis, Stage2Response, Tier } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage1Output, tier } = body as {
      stage1Output: { target: string; problem: string; solution: string };
      tier: Tier;
    };

    // 검증
    if (!stage1Output || !stage1Output.target || !stage1Output.problem || !stage1Output.solution) {
      return NextResponse.json<Stage2Response>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stage 1 분석 결과가 필요합니다.',
          },
        },
        { status: 400 }
      );
    }

    // Light 티어는 Stage 2 사용 불가
    if (tier === 'light') {
      return NextResponse.json<Stage2Response>(
        {
          success: false,
          error: {
            code: 'TIER_FEATURE_LOCKED',
            message: '시장 분석은 Pro 이상 티어에서 사용 가능합니다.',
          },
        },
        { status: 403 }
      );
    }

    // Mock 모드 체크
    if (request.headers.get('x-mock-mode') === 'true') {
      const mockData = generateMockStage2Analysis();
      if (isDbEnabled()) {
        await updateAnalysis(id, { stage2_data: mockData });
      }
      return NextResponse.json<Stage2Response>({
        success: true,
        data: mockData,
      });
    }

    // 프롬프트 로드
    const promptTemplate = loadPrompt(2, tier);

    // Stage 1 결과를 JSON으로 변환하여 프롬프트에 삽입
    const stage1Json = JSON.stringify({
      target: stage1Output.target,
      problem: stage1Output.problem,
      solution: stage1Output.solution,
    }, null, 2);

    // 플레이스홀더 치환
    let prompt = promptTemplate
      .replace('{STAGE1_OUTPUT}', stage1Json)
      .replace('{TIER}', tier)
      .replace('{WEB_SEARCH_RESULTS}', ''); // 웹 검색 결과는 현재 미지원

    // Gemini API 호출
    const response = await callGemini(prompt, true);
    const marketAnalysis = parseJsonResponse<Stage2MarketAnalysis>(response);

    // DB 저장
    if (isDbEnabled()) {
      await updateAnalysis(id, { stage2_data: marketAnalysis });
    }

    return NextResponse.json<Stage2Response>({
      success: true,
      data: marketAnalysis,
    });

  } catch (error) {
    console.error('Error in Stage 2 market analysis:', error);

    return NextResponse.json<Stage2Response>(
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
