/**
 * POST /api/ideas/[id]/deep-analysis
 * Stage 2 심화 분석: 시장 심화 / 전략 / 외부 환경
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadDeepPrompt } from '@/lib/prompts';
import { generateMockDeepAnalysis } from '@/lib/mock-data';
import { updateAnalysis, isDbEnabled } from '@/lib/db';
import type {
  DeepAnalysisGroup,
  DeepAnalysisRequest,
  DeepAnalysisResponse,
  MarketDeepAnalysis,
  StrategyAnalysis,
  ExternalAnalysis,
  Tier,
} from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { group, mainAnalysisSummary, tier } = body as DeepAnalysisRequest & { tier?: Tier };

    // 검증: 그룹 타입 체크
    const validGroups: DeepAnalysisGroup[] = ['market-deep', 'strategy', 'external'];
    if (!group || !validGroups.includes(group)) {
      return NextResponse.json<DeepAnalysisResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `유효하지 않은 분석 그룹입니다. 사용 가능: ${validGroups.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // 검증: 메인 분석 요약 체크
    if (!mainAnalysisSummary) {
      return NextResponse.json<DeepAnalysisResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '메인 분석 요약 데이터가 필요합니다.',
          },
        },
        { status: 400 }
      );
    }

    // Light 티어는 심화 분석 사용 불가
    if (tier === 'light') {
      return NextResponse.json<DeepAnalysisResponse>(
        {
          success: false,
          error: {
            code: 'TIER_FEATURE_LOCKED',
            message: '심화 분석은 Pro 이상 티어에서 사용 가능합니다.',
          },
        },
        { status: 403 }
      );
    }

    // Mock 모드 체크
    if (request.headers.get('x-mock-mode') === 'true') {
      const mockData = generateMockDeepAnalysis(group);
      if (isDbEnabled()) {
        if (group === 'market-deep') {
          await updateAnalysis(id, { stage2_deep_market: mockData as MarketDeepAnalysis });
        } else if (group === 'strategy') {
          await updateAnalysis(id, { stage2_deep_strategy: mockData as StrategyAnalysis });
        } else {
          await updateAnalysis(id, { stage2_deep_external: mockData as ExternalAnalysis });
        }
      }
      return NextResponse.json<DeepAnalysisResponse>({
        success: true,
        data: mockData,
      });
    }

    // 심화 프롬프트 로드
    let prompt: string;
    try {
      prompt = loadDeepPrompt(group, mainAnalysisSummary);
    } catch (error) {
      return NextResponse.json<DeepAnalysisResponse>(
        {
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: `심화 분석 프롬프트를 찾을 수 없습니다: stage2-deep-${group}.md`,
          },
        },
        { status: 500 }
      );
    }

    // Gemini API 호출
    const response = await callGemini(prompt, true);

    // 그룹별 타입에 맞게 파싱
    let data: MarketDeepAnalysis | StrategyAnalysis | ExternalAnalysis;

    switch (group) {
      case 'market-deep':
        data = parseJsonResponse<MarketDeepAnalysis>(response);
        break;
      case 'strategy':
        data = parseJsonResponse<StrategyAnalysis>(response);
        break;
      case 'external':
        data = parseJsonResponse<ExternalAnalysis>(response);
        break;
    }

    // DB 저장
    if (isDbEnabled()) {
      if (group === 'market-deep') {
        await updateAnalysis(id, { stage2_deep_market: data as MarketDeepAnalysis });
      } else if (group === 'strategy') {
        await updateAnalysis(id, { stage2_deep_strategy: data as StrategyAnalysis });
      } else {
        await updateAnalysis(id, { stage2_deep_external: data as ExternalAnalysis });
      }
    }

    return NextResponse.json<DeepAnalysisResponse>({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error in deep analysis:', error);

    return NextResponse.json<DeepAnalysisResponse>(
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
