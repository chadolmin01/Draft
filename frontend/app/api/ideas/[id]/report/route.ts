/**
 * POST /api/ideas/[id]/report
 * Stage 3: 통합 리포트 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini, parseJsonResponse } from '@/lib/gemini';
import { loadPrompt } from '@/lib/prompts';
import { generateMockReport } from '@/lib/mock-data';
import { updateAnalysis, isDbEnabled } from '@/lib/db';
import type { 
  BusinessReport, 
  Stage3Response, 
  Tier,
  Stage2MarketAnalysis,
  MarketDeepAnalysis,
  StrategyAnalysis,
  ExternalAnalysis
} from '@/lib/types';

interface RequestBody {
  stage1: {
    target: string;
    problem: string;
    solution: string;
    revenue_analysis?: any;
  };
  stage2Main: Stage2MarketAnalysis | null;
  stage2Deep: {
    marketDeep: MarketDeepAnalysis | null;
    strategy: StrategyAnalysis | null;
    external: ExternalAnalysis | null;
  };
  tier: Tier;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as RequestBody;
    const { stage1, stage2Main, stage2Deep, tier } = body;

    // 검증
    if (!stage1) {
      return NextResponse.json<Stage3Response>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Stage 1 분석 데이터가 전달되지 않았습니다.',
          },
        },
        { status: 400 }
      );
    }

    if (!stage1.target || !stage1.problem || !stage1.solution) {
      const missing = [];
      if (!stage1.target) missing.push('타겟 고객');
      if (!stage1.problem) missing.push('문제 정의');
      if (!stage1.solution) missing.push('솔루션');
      
      return NextResponse.json<Stage3Response>(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Stage 1 분석 결과가 불완전합니다. 누락된 항목: ${missing.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Mock 모드 체크
    if (request.headers.get('x-mock-mode') === 'true') {
      const mockReport = generateMockReport();
      mockReport.id = `report_${id}_${Date.now()}`;
      mockReport.ideaId = id;
      mockReport.generatedAt = new Date().toISOString();
      mockReport.tier = tier;
      if (isDbEnabled()) {
        await updateAnalysis(id, { report_data: mockReport });
      }
      return NextResponse.json<Stage3Response>({
        success: true,
        data: mockReport,
      });
    }

    // 데이터 통합
    const integratedData = {
      stage1,
      stage2: {
        main: stage2Main,
        deep: stage2Deep,
      },
      tier,
    };

    // 프롬프트 로드
    const promptTemplate = loadPrompt(3, tier);

    // 변수 치환
    const prompt = promptTemplate
      .replace('{STAGE1_OUTPUT}', JSON.stringify(stage1, null, 2))
      .replace('{STAGE2_OUTPUT}', JSON.stringify({ main: stage2Main, deep: stage2Deep }, null, 2))
      .replace('{TIER}', tier);

    // Gemini API 호출
    const response = await callGemini(prompt, true);
    const report = parseJsonResponse<BusinessReport>(response);

    // 메타데이터 추가 (이미 있을 수 있으므로 확인)
    if (!report.id) {
      report.id = `report_${id}_${Date.now()}`;
    }
    if (!report.ideaId) {
      report.ideaId = id;
    }
    if (!report.generatedAt) {
      report.generatedAt = new Date().toISOString();
    }
    if (!report.tier) {
      report.tier = tier;
    }

    // DB 저장
    if (isDbEnabled()) {
      await updateAnalysis(id, { report_data: report });
    }

    return NextResponse.json<Stage3Response>({
      success: true,
      data: report,
    });

  } catch (error) {
    console.error('Error in Stage 3 report generation:', error);

    return NextResponse.json<Stage3Response>(
      {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
