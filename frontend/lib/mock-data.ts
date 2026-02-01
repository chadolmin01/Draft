/**
 * 목업 데이터
 * 백엔드 완성 전 테스트용
 */

import type { IdeaInput, IdeaAnalysis, GetIdeaResponse, BusinessReport, ActionCard, Tier, Stage } from './types';

// 목업 아이디어 데이터
export const mockIdeas: Record<string, GetIdeaResponse> = {
  'demo-light': {
    idea: {
      id: 'demo-light',
      idea: 'AI 기반 헬스케어 플랫폼',
      tier: 'light',
      createdAt: new Date().toISOString(),
      stage: 2,
    },
    analysis: {
      target: '30-40대 만성질환자 및 건강 관심층',
      problem: '병원 방문 어려움, 건강 데이터 분산 관리, 전문가 상담 접근성 부족',
      solution: 'AI 기반 24시간 건강 모니터링과 실시간 원격 상담 플랫폼',
      canEdit: false, // 라이트 티어는 수정 불가
    },
    currentStage: 2,
  },
  'demo-pro': {
    idea: {
      id: 'demo-pro',
      idea: 'AI 기반 헬스케어 플랫폼',
      tier: 'pro',
      createdAt: new Date().toISOString(),
      stage: 2,
    },
    analysis: {
      target: '30-40대 만성질환자 및 건강 관심층',
      problem: '병원 방문 어려움, 건강 데이터 분산 관리, 전문가 상담 접근성 부족',
      solution: 'AI 기반 24시간 건강 모니터링과 실시간 원격 상담 플랫폼',
      summary: '만성질환자와 건강 관심층을 위한 AI 기반 원격 헬스케어 플랫폼. 의료진 연동과 개인화 케어로 차별화 가능.',
      one_liner: 'AI로 24시간 건강 모니터링 + 원격 상담',
      next_teaser: '시장 규모와 경쟁사 포지셔닝을 확인해보세요.',
      marketSize: {
        tam: '글로벌 디지털 헬스케어 시장 약 250조원 (2024)',
        sam: '국내 헬스케어 앱 시장 약 10조원',
        som: '목표 시장점유율 5% 기준 약 5,000억원',
        source: '한국보건산업진흥원, 글로벌 헬스케어 리포트 2024',
      },
      competitors: [
        {
          name: '네이버 헬스케어',
          description: 'AI 건강검진 및 건강관리 서비스',
          strengths: ['높은 브랜드 인지도', '대규모 사용자 기반', '네이버 생태계 연동'],
          weaknesses: ['개인화 부족', 'B2C 중심', '의료진 연계 미흡'],
        },
        {
          name: '카카오 헬스케어',
          description: '병원 예약 및 건강기록 관리',
          strengths: ['편리한 병원 예약', '카카오톡 연동', '간편한 UX'],
          weaknesses: ['AI 분석 기능 제한적', '실시간 모니터링 없음'],
        },
        {
          name: '닥터나우',
          description: '비대면 진료 플랫폼',
          strengths: ['빠른 의사 매칭', '실시간 상담', '처방전 발급'],
          weaknesses: ['지속적 건강관리 기능 부족', '높은 이용 비용'],
        },
      ],
      differentiation: '의료진과 연동된 실시간 AI 건강 모니터링 + 맞춤형 케어 플랜 제공',
      canEdit: true, // 프로 티어는 수정 가능
    },
    currentStage: 2,
  },
  'demo-heavy': {
    idea: {
      id: 'demo-heavy',
      idea: 'AI 기반 헬스케어 플랫폼',
      tier: 'heavy',
      createdAt: new Date().toISOString(),
      stage: 2,
    },
    analysis: {
      target: '30-40대 만성질환자 및 건강 관심층',
      problem: '병원 방문 어려움, 건강 데이터 분산 관리, 전문가 상담 접근성 부족',
      solution: 'AI 기반 24시간 건강 모니터링과 실시간 원격 상담 플랫폼',
      summary: '만성질환자와 건강 관심층을 위한 AI 기반 원격 헬스케어 플랫폼. 의료진 연동과 개인화 케어로 차별화 가능.',
      one_liner: 'AI로 24시간 건강 모니터링 + 원격 상담',
      next_teaser: '시장 규모와 경쟁사 포지셔닝을 확인해보세요.',
      marketSize: {
        tam: '글로벌 디지털 헬스케어 시장 약 250조원 (2024)',
        sam: '국내 헬스케어 앱 시장 약 10조원',
        som: '목표 시장점유율 5% 기준 약 5,000억원',
        source: '한국보건산업진흥원, 글로벌 헬스케어 리포트 2024',
      },
      competitors: [
        {
          name: '네이버 헬스케어',
          description: 'AI 건강검진 및 건강관리 서비스',
          strengths: ['높은 브랜드 인지도', '대규모 사용자 기반', '네이버 생태계 연동'],
          weaknesses: ['개인화 부족', 'B2C 중심', '의료진 연계 미흡'],
        },
        {
          name: '카카오 헬스케어',
          description: '병원 예약 및 건강기록 관리',
          strengths: ['편리한 병원 예약', '카카오톡 연동', '간편한 UX'],
          weaknesses: ['AI 분석 기능 제한적', '실시간 모니터링 없음'],
        },
        {
          name: '닥터나우',
          description: '비대면 진료 플랫폼',
          strengths: ['빠른 의사 매칭', '실시간 상담', '처방전 발급'],
          weaknesses: ['지속적 건강관리 기능 부족', '높은 이용 비용'],
        },
      ],
      differentiation: '의료진과 연동된 실시간 AI 건강 모니터링 + 맞춤형 케어 플랜 제공',
      canEdit: true,
    },
    currentStage: 2,
  },
};

// ID로 목업 데이터 가져오기
export function getMockIdea(id: string): GetIdeaResponse | null {
  return mockIdeas[id] || null;
}

// 모든 목업 ID 목록
export const mockIdeaIds = Object.keys(mockIdeas);

// 목업 리포트 데이터
export const mockReports: Record<string, BusinessReport> = {
  'demo-light': {
    id: 'report-light',
    ideaId: 'demo-light',
    generatedAt: new Date().toISOString(),
    tier: 'light',
    sections: {
      overview: {
        title: 'AI 헬스케어 플랫폼',
        tagline: '당신의 주치의, 이제 주머니 속에',
        description: '만성질환자와 건강 관심층을 위한 AI 기반 24시간 건강 모니터링 및 실시간 원격 상담 플랫폼입니다.',
        vision: '누구나 언제 어디서나 전문적인 건강 관리를 받을 수 있는 세상',
        mission: 'AI 기술로 의료 접근성을 높이고, 개인 맞춤형 건강 케어를 제공합니다.',
      },
      market: {
        size: {
          tam: '글로벌 디지털 헬스케어 시장 약 250조원',
          sam: '국내 헬스케어 앱 시장 약 10조원',
          som: '목표 시장점유율 5% 기준 약 5,000억원',
        },
        trends: [
          '비대면 의료 서비스 수요 급증',
          'AI 기반 건강 예측 기술 발전',
          '웨어러블 디바이스 보급 확대',
          '개인 건강 데이터 통합 관리 니즈 증가',
        ],
        opportunities: [
          '고령화 사회로 인한 만성질환 관리 수요 증가',
          '코로나19 이후 원격 의료에 대한 수용도 향상',
          '정부의 디지털 헬스케어 규제 완화',
        ],
        threats: [
          '의료법 규제 리스크',
          '개인정보보호 이슈',
          '대기업의 시장 진입',
        ],
        targetSegments: [
          {
            name: '30-40대 만성질환자',
            description: '당뇨, 고혈압 등 지속적인 관리가 필요한 환자',
            painPoints: [
              '정기적인 병원 방문 부담',
              '약물 복용 관리의 어려움',
              '건강 데이터 분산 관리',
            ],
          },
          {
            name: '건강 관심층',
            description: '예방적 건강 관리에 관심이 높은 직장인',
            painPoints: [
              '바쁜 일정으로 인한 건강 관리 소홀',
              '신뢰할 수 있는 건강 정보 부족',
              '맞춤형 건강 관리 서비스 부재',
            ],
          },
        ],
      },
      competitors: {
        direct: [
          {
            name: '네이버 헬스케어',
            description: 'AI 건강검진 및 건강관리 서비스',
            marketShare: '약 30%',
            strengths: ['높은 브랜드 인지도', '대규모 사용자 기반'],
            weaknesses: ['개인화 부족', '의료진 연계 미흡'],
          },
        ],
        indirect: [
          {
            name: '카카오 헬스케어',
            description: '병원 예약 및 건강기록 관리',
            strengths: ['편리한 병원 예약', '카카오톡 연동'],
            weaknesses: ['AI 분석 기능 제한적'],
          },
        ],
        competitiveAdvantages: [
          '의료진 협업 기반 실시간 모니터링',
          'AI 기반 개인 맞춤형 케어 플랜',
          '통합 건강 데이터 분석',
        ],
      },
      monetization: {
        revenueStreams: [
          {
            name: '구독 서비스',
            description: '월/연 단위 구독 모델',
            estimatedRevenue: '연 50억원 (1년차)',
          },
          {
            name: '기업 B2B',
            description: '기업 복지 프로그램 제공',
            estimatedRevenue: '연 30억원 (2년차)',
          },
        ],
        pricingStrategy: {
          model: 'freemium',
          tiers: [
            {
              name: '무료',
              price: '0원',
              features: ['기본 건강 기록', '간단한 AI 분석'],
            },
            {
              name: '프리미엄',
              price: '월 9,900원',
              features: ['실시간 모니터링', '의료진 상담', '맞춤형 케어 플랜'],
            },
          ],
        },
        revenueProjection: [
          {
            year: 1,
            revenue: '50억원',
            assumptions: ['사용자 5만명', '전환율 20%'],
          },
          {
            year: 2,
            revenue: '150억원',
            assumptions: ['사용자 15만명', 'B2B 진출'],
          },
          {
            year: 3,
            revenue: '400억원',
            assumptions: ['사용자 40만명', '기업 고객 50개사'],
          },
        ],
      },
      structure: {
        team: [
          {
            role: 'CEO/Product',
            responsibilities: ['전략 수립', '제품 기획', '투자 유치'],
            skills: ['사업 기획', '헬스케어 도메인 지식'],
          },
          {
            role: 'CTO',
            responsibilities: ['기술 개발', '아키텍처 설계', 'AI 모델 개발'],
            skills: ['AI/ML', '백엔드 개발', '데이터 엔지니어링'],
          },
          {
            role: '의료 자문',
            responsibilities: ['의료 자문', '서비스 검증', '의료진 네트워크'],
            skills: ['의료 전문성', '원격 의료 경험'],
          },
        ],
        operations: {
          workflow: '애자일 스프린트 (2주 단위)',
          tools: ['Slack', 'Notion', 'Jira', 'GitHub'],
          processes: [
            '주간 스탠드업 미팅',
            '2주 단위 스프린트 리뷰',
            '월간 OKR 점검',
          ],
        },
        milestones: [
          {
            phase: 'MVP 개발',
            duration: '3개월',
            goals: ['핵심 기능 개발', '파일럿 테스트'],
          },
          {
            phase: '베타 런칭',
            duration: '3개월',
            goals: ['초기 사용자 1,000명 확보', '피드백 반영'],
          },
          {
            phase: '정식 출시',
            duration: '6개월',
            goals: ['사용자 10,000명', '의료기관 파트너십'],
          },
        ],
      },
      development: {
        techStack: [
          {
            category: 'frontend',
            technologies: ['React Native', 'TypeScript'],
            reasoning: '크로스 플랫폼 개발 효율성',
          },
          {
            category: 'backend',
            technologies: ['Node.js', 'Express', 'PostgreSQL'],
            reasoning: '빠른 개발 속도, 확장성',
          },
          {
            category: 'ai',
            technologies: ['Python', 'TensorFlow', 'Claude API'],
            reasoning: 'AI 모델 개발 및 서비스 연동',
          },
        ],
        mvpFeatures: [
          {
            priority: 'must-have',
            feature: '건강 데이터 입력 및 조회',
            description: '혈압, 혈당 등 기본 건강 데이터 기록',
            estimatedEffort: '2주',
          },
          {
            priority: 'must-have',
            feature: 'AI 건강 분석',
            description: '입력 데이터 기반 건강 상태 분석',
            estimatedEffort: '4주',
          },
          {
            priority: 'should-have',
            feature: '의료진 채팅 상담',
            description: '실시간 의료진 상담 기능',
            estimatedEffort: '3주',
          },
        ],
        roadmap: [
          {
            phase: 'MVP (3개월)',
            timeline: '1-3개월',
            deliverables: [
              '기본 건강 데이터 관리',
              'AI 분석 기능',
              '간단한 리포트',
            ],
          },
          {
            phase: '베타 (3개월)',
            timeline: '4-6개월',
            deliverables: [
              '의료진 상담 기능',
              '웨어러블 연동',
              '푸시 알림',
            ],
          },
        ],
        risks: [
          {
            risk: '의료법 규제',
            impact: 'high',
            mitigation: '법률 자문 확보, 의료기관 파트너십',
          },
          {
            risk: 'AI 모델 정확도',
            impact: 'high',
            mitigation: '충분한 학습 데이터 확보, 의료진 검증',
          },
        ],
      },
    },
  },
};

// 리포트 조회
export function getMockReport(ideaId: string): BusinessReport | null {
  // 특정 ID의 리포트가 있으면 반환
  if (mockReports[ideaId]) {
    return mockReports[ideaId];
  }
  
  // 없으면 demo-light를 기본값으로 반환 (Mock 모드용)
  if (ideaId.startsWith('mock_') || ideaId.startsWith('demo-')) {
    return mockReports['demo-light'];
  }
  
  return null;
}

// 액션 카드 목업 데이터
export const mockActions: Record<string, ActionCard[]> = {
  'demo-light': [
    {
      id: 'action-1',
      type: 'landing-page',
      title: '홍보 웹사이트 만들기',
      description: '투자자/고객용 랜딩페이지 구조와 메시지',
      estimatedTime: '10분',
      tier: 'light',
      status: 'available',
    },
    {
      id: 'action-2',
      type: 'business-plan',
      title: '사업계획서 작성하기',
      description: '투자 유치용 정식 사업계획서',
      estimatedTime: '15분',
      tier: 'pro',
      status: 'locked',
    },
    {
      id: 'action-3',
      type: 'pitch-deck',
      title: '피칭 PPT 제작하기',
      description: '10슬라이드 투자 스토리',
      estimatedTime: '20분',
      tier: 'pro',
      status: 'locked',
    },
    {
      id: 'action-4',
      type: 'mvp-guide',
      title: 'MVP 개발 설계하기',
      description: '기능 우선순위 & 개발 체크리스트',
      estimatedTime: '30분',
      tier: 'heavy',
      status: 'locked',
    },
  ],
  'demo-pro': [
    {
      id: 'action-1',
      type: 'landing-page',
      title: '홍보 웹사이트 만들기',
      description: '투자자/고객용 랜딩페이지 구조와 메시지',
      estimatedTime: '10분',
      tier: 'light',
      status: 'available',
    },
    {
      id: 'action-2',
      type: 'business-plan',
      title: '사업계획서 작성하기',
      description: '투자 유치용 정식 사업계획서',
      estimatedTime: '15분',
      tier: 'pro',
      status: 'available',
    },
    {
      id: 'action-3',
      type: 'pitch-deck',
      title: '피칭 PPT 제작하기',
      description: '10슬라이드 투자 스토리',
      estimatedTime: '20분',
      tier: 'pro',
      status: 'available',
    },
    {
      id: 'action-4',
      type: 'mvp-guide',
      title: 'MVP 개발 설계하기',
      description: '기능 우선순위 & 개발 체크리스트',
      estimatedTime: '30분',
      tier: 'heavy',
      status: 'locked',
    },
  ],
  'demo-heavy': [
    {
      id: 'action-1',
      type: 'landing-page',
      title: '홍보 웹사이트 만들기',
      description: '투자자/고객용 랜딩페이지 구조 + HTML 템플릿',
      estimatedTime: '10분',
      tier: 'light',
      status: 'available',
    },
    {
      id: 'action-2',
      type: 'business-plan',
      title: '사업계획서 작성하기',
      description: '투자 유치용 정식 사업계획서',
      estimatedTime: '15분',
      tier: 'pro',
      status: 'available',
    },
    {
      id: 'action-3',
      type: 'pitch-deck',
      title: '피칭 PPT 제작하기',
      description: '10슬라이드 투자 스토리',
      estimatedTime: '20분',
      tier: 'pro',
      status: 'available',
    },
    {
      id: 'action-4',
      type: 'mvp-guide',
      title: 'MVP 개발 설계하기',
      description: '기능 우선순위 + 바이브코딩 가이드',
      estimatedTime: '30분',
      tier: 'heavy',
      status: 'available',
    },
  ],
};

// 액션 카드 조회
export function getMockActions(ideaId: string): ActionCard[] {
  return mockActions[ideaId] || [];
}

// ============================================
// Mock 데이터 생성기 (테스트용)
// ============================================

import type { 
  Stage2MarketAnalysis, 
  MarketDeepAnalysis, 
  StrategyAnalysis, 
  ExternalAnalysis,
  DeepAnalysisGroup 
} from './types';

// Stage 1 Mock 생성
export function generateMockStage1Analysis(idea: string, tier: Tier) {
  const baseAnalysis: IdeaAnalysis = {
    target: `${idea}에 관심있는 타겟 고객층`,
    problem: `현재 시장에서 해결되지 않은 주요 문제점`,
    solution: `${idea}를 통한 혁신적인 솔루션`,
    canEdit: tier !== 'light',
  };

  // Pro 티어 이상: 종합 총평, 한줄 핵심, 다음 단계 미리보기 + 수익 분석 추가
  if (tier === 'pro' || tier === 'heavy') {
    baseAnalysis.summary = `${idea}에 대한 타겟·문제·솔루션 분석이 완료되었습니다. 시장 검증과 수익화 경로를 확인해보세요.`;
    baseAnalysis.one_liner = `${idea}로 시장 기회 포착`;
    baseAnalysis.next_teaser = '시장 규모와 경쟁사 포지셔닝을 확인해보세요.';
    baseAnalysis.revenue_analysis = {
      revenue_streams: ['구독 서비스', 'B2B 계약', '프리미엄 기능'],
      cost_structure: ['개발 비용', '마케팅 비용', '운영 비용'],
      pricing_strategy: 'Freemium 모델: 기본 무료 + 프리미엄 구독',
    };
    baseAnalysis.business_viability = {
      strengths: ['혁신적인 접근', '명확한 타겟', '확장 가능성'],
      weaknesses: ['초기 투자 필요', '시장 검증 필요'],
    };
    baseAnalysis.monetization_difficulty = 'medium';
    baseAnalysis.monetization_reason = '기존 시장 참조 가능, 고객 지불 의향 확인 필요';
    baseAnalysis.first_revenue_timeline = '6-12개월 (MVP 출시 후)';
  }

  const ideaId = `mock_${Date.now()}`;
  return {
    idea: {
      id: ideaId,
      idea,
      tier,
      createdAt: new Date().toISOString(),
      stage: 1 as Stage,
    },
    analysis: baseAnalysis,
    currentStage: 1 as Stage,
  };
}

// Stage 2 Mock 생성
export function generateMockStage2Analysis(): Stage2MarketAnalysis {
  return {
    market_analysis: {
      market_size: '국내 시장 규모 약 5조원, 글로벌 50조원',
      growth_rate: '연평균 15% 성장 (2024-2028)',
      target_segment: '20-40대 디지털 네이티브, 얼리어답터',
      market_trends: [
        'AI 기반 자동화 수요 증가',
        '구독 경제 확산',
        '모바일 퍼스트 트렌드',
        '개인화 서비스 선호',
      ],
    },
    competitors: [
      {
        name: '경쟁사 A',
        strength: '높은 브랜드 인지도, 대규모 사용자 기반',
        weakness: '혁신 속도 느림, 높은 가격',
        differentiation: '더 저렴하고 사용자 친화적인 UX',
        url: 'https://competitor-a.com',
      },
      {
        name: '경쟁사 B',
        strength: '강력한 기술력, 빠른 업데이트',
        weakness: '복잡한 인터페이스, 고객 지원 부족',
        differentiation: '직관적인 UI와 우수한 고객 지원',
      },
      {
        name: '경쟁사 C',
        strength: '저렴한 가격, 다양한 기능',
        weakness: '품질 불안정, 신뢰도 낮음',
        differentiation: '안정적인 서비스와 보안',
      },
    ],
    feasibility_score: 0.78,
    risks: [
      '규제 변화 리스크',
      '대기업의 시장 진입',
      '기술 트렌드 변화',
      '초기 고객 확보 어려움',
    ],
  };
}

// Stage 2 Deep Mock 생성
export function generateMockDeepAnalysis(group: DeepAnalysisGroup): MarketDeepAnalysis | StrategyAnalysis | ExternalAnalysis {
  switch (group) {
    case 'market-deep':
      return {
        tam_sam_som: {
          tam: '글로벌 시장 총 규모: 50조원',
          sam: '진입 가능 시장: 10조원 (국내 + 동남아)',
          som: '현실적 목표 시장: 5,000억원 (초기 3년)',
          methodology: 'Top-down 방식: 글로벌 리서치 보고서 + 국내 통계 데이터',
        },
        positioning_map: {
          x_axis: '가격 (저렴 ← → 고가)',
          y_axis: '기능 복잡도 (단순 ← → 복잡)',
          competitors: [
            { name: '경쟁사 A', x: 7, y: 8 },
            { name: '경쟁사 B', x: 6, y: 9 },
            { name: '경쟁사 C', x: 3, y: 4 },
          ],
          our_position: { x: 5, y: 6 },
        },
        price_benchmark: [
          {
            competitor: '경쟁사 A',
            product: '프리미엄 플랜',
            price: '월 29,000원',
            features: ['무제한 사용', '우선 지원', '고급 분석'],
          },
          {
            competitor: '경쟁사 B',
            product: '스탠다드 플랜',
            price: '월 19,000원',
            features: ['기본 기능', '월 100회 제한', '이메일 지원'],
          },
          {
            competitor: '경쟁사 C',
            product: '베이직 플랜',
            price: '월 9,900원',
            features: ['제한적 기능', '광고 포함'],
          },
        ],
      } as MarketDeepAnalysis;

    case 'strategy':
      return {
        swot: {
          strengths: [
            '혁신적인 기술 접근',
            '경험 많은 팀',
            '명확한 타겟 시장',
            '차별화된 가치 제안',
          ],
          weaknesses: [
            '브랜드 인지도 부족',
            '초기 자본 제한',
            '시장 검증 미완료',
            '영업/마케팅 리소스 부족',
          ],
          opportunities: [
            '시장 성장 추세',
            '디지털 전환 가속화',
            '정부 지원 정책',
            '글로벌 확장 가능성',
          ],
          threats: [
            '대기업의 시장 진입',
            '규제 강화 가능성',
            '경쟁 심화',
            '경기 침체 리스크',
          ],
        },
        entry_strategy: {
          approach: 'Niche 시장 선점 후 확장',
          rationale: '초기에는 특정 고객군에 집중하여 PMF 달성, 이후 점진적 확장',
          steps: [
            '1단계: MVP 개발 및 얼리어답터 확보 (3개월)',
            '2단계: 피드백 반영 및 제품 개선 (3개월)',
            '3단계: 마케팅 강화 및 사용자 확대 (6개월)',
            '4단계: 신규 기능 추가 및 시장 확장 (12개월)',
          ],
        },
        resource_estimate: {
          initial_capital: '2억원 (Seed 라운드)',
          team_size: '핵심 팀 5명 (CEO, CTO, 개발 2, 디자인 1)',
          key_hires: [
            '풀스택 개발자 (시니어)',
            'UX/UI 디자이너',
            '마케팅 담당자 (6개월 후)',
          ],
          timeline: '12-18개월 (PMF 달성까지)',
        },
      } as StrategyAnalysis;

    case 'external':
      return {
        regulations: [
          {
            area: '개인정보보호',
            requirement: '개인정보보호법 준수, GDPR 대응',
            risk_level: 'high',
          },
          {
            area: '전자상거래',
            requirement: '전자상거래법, 소비자보호법 준수',
            risk_level: 'medium',
          },
          {
            area: '세금/회계',
            requirement: '부가세 신고, 법인세 납부',
            risk_level: 'low',
          },
        ],
        investment_trends: {
          total_funding: '관련 산업 연간 5,000억원 투자 (2024)',
          notable_deals: [
            '유사 스타트업 A: 50억원 시리즈A (2024.03)',
            '유사 스타트업 B: 100억원 시리즈B (2024.06)',
          ],
          investor_interest: '높음 - AI/SaaS 분야 투자 활발',
        },
        similar_cases: [
          {
            name: '성공 사례: 스타트업 X',
            outcome: '3년만에 매출 100억 달성, 시리즈C 투자 유치',
            lessons: '초기 PMF에 집중, 고객 피드백 적극 반영',
          },
          {
            name: '실패 사례: 스타트업 Y',
            outcome: '2년 후 서비스 종료',
            lessons: '시장 검증 없이 확장, 번아웃 관리 실패',
          },
        ],
      } as ExternalAnalysis;

    default:
      throw new Error(`Unknown deep analysis group: ${group}`);
  }
}

// Stage 3 Mock 생성
export function generateMockReport(): BusinessReport {
  // 항상 유효한 리포트 반환 (demo-light 사용)
  const report = mockReports['demo-light'];
  if (!report) {
    throw new Error('Mock report template not found: demo-light');
  }
  return report;
}
