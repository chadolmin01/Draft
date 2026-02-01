/**
 * GET /api/ideas/[id]
 * 아이디어 조회 (DB 또는 localStorage 폴백)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIdea, isDbEnabled } from '@/lib/db';
import type { GetIdeaResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // DB에서 조회 (Supabase 설정된 경우)
    if (isDbEnabled()) {
      const dbResult = await getIdea(id);
      if (dbResult) {
        const { idea, analysis, stage2, stage2Deep, report } = dbResult;
        const response: GetIdeaResponse = {
          idea: {
            id: idea.id,
            idea: idea.idea,
            tier: idea.tier as 'light' | 'pro' | 'heavy',
            createdAt: idea.created_at,
            stage: idea.stage as 1 | 2 | 3 | 4,
          },
          analysis: analysis ? { ...analysis, canEdit: idea.tier !== 'light' } : undefined,
          currentStage: idea.stage as 1 | 2 | 3 | 4,
        };

        // Stage 2, 심화 분석, 리포트는 클라이언트에서 localStorage 대신 API 응답 사용
        return NextResponse.json({
          success: true,
          data: response,
          // 추가 데이터 (클라이언트에서 사용)
          stage2: stage2 || null,
          stage2Deep: stage2Deep || null,
          report: report || null,
        });
      }
    }

    // DB에 없음: 404 (클라이언트에서 localStorage 폴백)
    return NextResponse.json(
      { success: false, error: { code: 'IDEA_NOT_FOUND', message: '아이디어를 찾을 수 없습니다.' } },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching idea:', error);
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
