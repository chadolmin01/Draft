/**
 * 리포트 템플릿 정의
 * 다양한 목적에 맞는 사전 정의된 리포트 구성
 */

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: string[];
  style: 'professional' | 'detailed' | 'comprehensive' | 'concise';
  emphasis: string[];
  targetAudience: string;
  estimatedPages: string;
  recommendedTier: 'light' | 'pro' | 'heavy';
}

export const reportTemplates: Record<string, ReportTemplate> = {
  'investor-pitch': {
    id: 'investor-pitch',
    name: '투자자용 피칭 자료',
    description: '투자 유치를 위한 핵심 정보 중심의 간결한 리포트',
    icon: '💼',
    sections: ['overview', 'market', 'monetization', 'financials'],
    style: 'professional',
    emphasis: ['revenue', 'growth', 'roi', 'market-size'],
    targetAudience: '벤처캐피탈, 엔젤투자자',
    estimatedPages: '8-12 페이지',
    recommendedTier: 'pro',
  },

  'technical-spec': {
    id: 'technical-spec',
    name: '기술 명세서',
    description: '개발팀을 위한 상세한 기술 문서',
    icon: '⚙️',
    sections: ['overview', 'development', 'structure', 'timeline'],
    style: 'detailed',
    emphasis: ['techStack', 'architecture', 'roadmap', 'mvp-features'],
    targetAudience: '개발팀, CTO, 기술 파트너',
    estimatedPages: '15-20 페이지',
    recommendedTier: 'heavy',
  },

  'business-plan': {
    id: 'business-plan',
    name: '완전한 사업계획서',
    description: '모든 섹션을 포함한 종합 사업계획서',
    icon: '📊',
    sections: [
      'overview',
      'market',
      'competitors',
      'monetization',
      'structure',
      'development',
      'financials',
      'risks',
      'timeline',
    ],
    style: 'comprehensive',
    emphasis: ['all'],
    targetAudience: '정부 지원사업, 은행 대출, 전략적 파트너',
    estimatedPages: '30-40 페이지',
    recommendedTier: 'heavy',
  },

  'market-entry': {
    id: 'market-entry',
    name: '시장 진입 전략서',
    description: '시장 분석과 경쟁 전략에 집중',
    icon: '🎯',
    sections: ['overview', 'market', 'competitors', 'monetization', 'risks'],
    style: 'professional',
    emphasis: ['market-analysis', 'competitive-advantage', 'positioning'],
    targetAudience: '경영진, 전략 기획팀',
    estimatedPages: '12-15 페이지',
    recommendedTier: 'pro',
  },

  'mvp-launch': {
    id: 'mvp-launch',
    name: 'MVP 출시 계획서',
    description: 'MVP 개발과 초기 출시에 필요한 정보',
    icon: '🚀',
    sections: ['overview', 'market', 'development', 'structure', 'timeline'],
    style: 'detailed',
    emphasis: ['mvp-features', 'development-timeline', 'initial-market'],
    targetAudience: '스타트업 팀, 제품 매니저',
    estimatedPages: '10-15 페이지',
    recommendedTier: 'pro',
  },

  'executive-summary': {
    id: 'executive-summary',
    name: '경영진 요약본',
    description: '핵심 내용만 담은 간결한 요약 리포트',
    icon: '📄',
    sections: ['overview', 'market', 'monetization'],
    style: 'concise',
    emphasis: ['key-metrics', 'high-level-strategy'],
    targetAudience: 'CEO, 경영진, 이사회',
    estimatedPages: '5-8 페이지',
    recommendedTier: 'light',
  },

  'risk-assessment': {
    id: 'risk-assessment',
    name: '위험 평가 보고서',
    description: '리스크 분석과 대응 전략 중심',
    icon: '⚠️',
    sections: ['overview', 'market', 'competitors', 'risks', 'financials'],
    style: 'professional',
    emphasis: ['risk-factors', 'mitigation-strategies', 'contingency-plans'],
    targetAudience: '리스크 관리팀, 투자 위원회',
    estimatedPages: '10-12 페이지',
    recommendedTier: 'pro',
  },

  'partnership-proposal': {
    id: 'partnership-proposal',
    name: '파트너십 제안서',
    description: '전략적 파트너십을 위한 제안 자료',
    icon: '🤝',
    sections: ['overview', 'market', 'competitors', 'structure', 'monetization'],
    style: 'professional',
    emphasis: ['synergy', 'market-opportunity', 'partnership-benefits'],
    targetAudience: '잠재 파트너사, B2B 클라이언트',
    estimatedPages: '12-15 페이지',
    recommendedTier: 'pro',
  },
};

// 템플릿 ID 배열 (정렬된 순서)
export const templateOrder = [
  'investor-pitch',
  'business-plan',
  'mvp-launch',
  'market-entry',
  'technical-spec',
  'executive-summary',
  'risk-assessment',
  'partnership-proposal',
];

// 티어별 사용 가능한 템플릿 필터링
export function getTemplatesForTier(tier: 'light' | 'pro' | 'heavy'): ReportTemplate[] {
  const tierHierarchy = { light: 1, pro: 2, heavy: 3 };
  const userTierLevel = tierHierarchy[tier];

  return templateOrder
    .map(id => reportTemplates[id])
    .filter(template => tierHierarchy[template.recommendedTier] <= userTierLevel);
}

// 섹션 ID를 사람이 읽을 수 있는 이름으로 변환
export const sectionLabels: Record<string, string> = {
  overview: '사업 개요',
  market: '시장 분석',
  competitors: '경쟁사 분석',
  monetization: '수익화 모델',
  structure: '사업 구조',
  development: '개발 가이드',
  financials: '재무 계획',
  risks: '위험 분석',
  timeline: '프로젝트 타임라인',
};
