/**
 * POST /api/stage1
 * 아이디어 해체 분석
 */

import { NextRequest, NextResponse } from 'next/server';
import { callClaude, parseJsonResponse } from '@/lib/anthropic';
import { buildStage1Prompt } from '@/lib/prompts';
import type { Stage1Input, Stage1Output, ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: Stage1Input = await request.json();

    // Validation
    if (!body.idea || body.idea.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '아이디어는 10자 이상이어야 합니다.',
          },
        } as ApiResponse<Stage1Output>,
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildStage1Prompt(body.idea, body.tier);

    // Call Claude API
    const response = await callClaude(prompt, 4000);

    // Parse JSON
    const result = parseJsonResponse<Stage1Output>(response);

    // Return success
    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        tier: body.tier,
      },
    } as ApiResponse<Stage1Output>);
  } catch (error: any) {
    console.error('Stage 1 error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '서버 오류가 발생했습니다.',
        },
      } as ApiResponse<Stage1Output>,
      { status: 500 }
    );
  }
}
