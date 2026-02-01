import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ideas/[id]/report/custom
 * 사용자가 선택한 섹션만으로 커스텀 리포트 생성
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { sections, tier } = await request.json();

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: 'sections 배열이 필요합니다' },
        { status: 400 }
      );
    }

    // localStorage에서 아이디어 데이터 가져오기 (클라이언트 측에서 전달받아야 함)
    // 실제로는 클라이언트가 필요한 데이터를 함께 전송해야 합니다
    const { id: ideaId } = await params;

    // 여기서는 기본 리포트 생성 로직을 재사용하되, 선택된 섹션만 포함하도록 프롬프트 수정
    // 실제 구현에서는 gemini.ts의 generateBusinessReport를 수정하거나
    // 새로운 함수를 만들어 선택된 섹션만 생성하도록 해야 합니다

    return NextResponse.json({
      success: true,
      message: '커스텀 리포트 생성 API는 현재 개발 중입니다',
      selectedSections: sections,
    });
  } catch (error: any) {
    console.error('커스텀 리포트 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '커스텀 리포트 생성 실패' },
      { status: 500 }
    );
  }
}
