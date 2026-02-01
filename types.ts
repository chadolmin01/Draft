/**
 * 공유 타입 정의
 * 프론트엔드/백엔드 모두 사용
 */

// ============================================
// 기본 타입
// ============================================

export type Tier = 'light' | 'pro' | 'heavy';

export type Stage = 1 | 2 | 3 | 4;

export type ActionType = 'landing-page' | 'business-plan' | 'pitch-deck' | 'mvp-guide';

// ============================================
// Stage 1: 아이디어 입력
// ============================================

export interface IdeaInput {
  id: string;
  idea: string;
  tier: Tier;
  createdAt: string;
  stage: Stage;
  userId?: string; // 익명 가능
}

// ============================================
// Stage 2: 아이디어 해체분석
// ============================================

export interface IdeaAnalysis {
  // 기본 분석 (모든 티어)
  target: string; // 타겟 고객
  problem: string; // 해결하려는 문제
  solution: string; // 솔루션

  // 프로 이상만 제공
  marketSize?: {
    tam: string; // Total Addressable Market
    sam: string; // Serviceable Addressable Market
    som: string; // Serviceable Obtainable Market
    source: string; // 데이터 출처
  };

  competitors?: {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }[];

  differentiation?: string; // 차별화 포인트

  // 프로 이상: 피드백 가능 여부
  canEdit: boolean;
}

// ============================================
// Stage 3: 통합 리포트
// ============================================

export interface BusinessReport {
  // 메타데이터
  id: string;
  ideaId: string;
  generatedAt: string;
  tier: Tier;

  // 리포트 섹션
  sections: {
    overview: BusinessOverview;
    market: MarketAnalysis;
    competitors: CompetitorAnalysis;
    monetization: MonetizationModel;
    structure: BusinessStructure;
    development: DevelopmentGuide;
  };
}

export interface BusinessOverview {
  title: string;
  tagline: string;
  description: string;
  vision: string;
  mission: string;
}

export interface MarketAnalysis {
  size: {
    tam: string;
    sam: string;
    som: string;
  };
  trends: string[];
  opportunities: string[];
  threats: string[];
  targetSegments: {
    name: string;
    description: string;
    painPoints: string[];
  }[];
}

export interface CompetitorAnalysis {
  direct: Competitor[];
  indirect: Competitor[];
  competitiveAdvantages: string[];
}

export interface Competitor {
  name: string;
  description: string;
  marketShare?: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;
}

export interface MonetizationModel {
  revenueStreams: {
    name: string;
    description: string;
    estimatedRevenue: string;
  }[];
  pricingStrategy: {
    model: string; // 'freemium' | 'subscription' | 'pay-per-use' | ...
    tiers: {
      name: string;
      price: string;
      features: string[];
    }[];
  };
  revenueProjection: {
    year: number;
    revenue: string;
    assumptions: string[];
  }[];
}

export interface BusinessStructure {
  team: {
    role: string;
    responsibilities: string[];
    skills: string[];
  }[];
  operations: {
    workflow: string;
    tools: string[];
    processes: string[];
  };
  milestones: {
    phase: string;
    duration: string;
    goals: string[];
  }[];
}

export interface DevelopmentGuide {
  techStack: {
    category: string; // 'frontend' | 'backend' | 'database' | ...
    technologies: string[];
    reasoning: string;
  }[];
  mvpFeatures: {
    priority: 'must-have' | 'should-have' | 'nice-to-have';
    feature: string;
    description: string;
    estimatedEffort: string;
  }[];
  roadmap: {
    phase: string;
    timeline: string;
    deliverables: string[];
  }[];
  risks: {
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }[];
}

// ============================================
// Stage 4: 실행 액션
// ============================================

export interface ActionCard {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  estimatedTime: string;
  tier: Tier; // 어떤 티어부터 사용 가능한지
  status: 'available' | 'locked' | 'generating' | 'completed';
}

export interface ActionResult {
  id: string;
  actionType: ActionType;
  generatedAt: string;
  content: LandingPageContent | BusinessPlanDoc | PitchDeckContent | MVPGuideContent;
}

export interface LandingPageContent {
  structure: {
    hero: {
      headline: string;
      subheadline: string;
      cta: string;
    };
    problem: {
      title: string;
      description: string;
    };
    solution: {
      title: string;
      features: {
        title: string;
        description: string;
        icon?: string;
      }[];
    };
    pricing: {
      tiers: {
        name: string;
        price: string;
        features: string[];
        cta: string;
      }[];
    };
    cta: {
      title: string;
      description: string;
      buttonText: string;
    };
  };
  htmlTemplate?: string; // 실제 HTML 코드 (헤비 티어)
}

export interface BusinessPlanDoc {
  format: 'markdown' | 'pdf';
  sections: {
    executiveSummary: string;
    companyDescription: string;
    marketAnalysis: string;
    organizationManagement: string;
    serviceProductLine: string;
    marketingSales: string;
    fundingRequirements: string;
    financialProjections: string;
  };
  downloadUrl?: string;
}

export interface PitchDeckContent {
  slides: {
    slideNumber: number;
    type: 'title' | 'problem' | 'solution' | 'market' | 'product' | 'business-model' | 'competition' | 'team' | 'financials' | 'ask';
    title: string;
    content: string[];
    notes: string; // 발표 노트
  }[];
  downloadUrl?: string; // PPT/PDF 다운로드
}

export interface MVPGuideContent {
  prioritizedFeatures: {
    feature: string;
    priority: 'p0' | 'p1' | 'p2';
    description: string;
    acceptanceCriteria: string[];
  }[];
  techStack: {
    layer: string;
    recommendations: string[];
    reasoning: string;
  }[];
  implementationChecklist: {
    phase: string;
    tasks: {
      task: string;
      completed: boolean;
      dependencies?: string[];
    }[];
  }[];
  vibeCodingGuide?: { // 헤비 티어 전용
    prompts: string[];
    fileStructure: string;
    codeExamples: {
      file: string;
      code: string;
    }[];
  };
}

// ============================================
// API 요청/응답
// ============================================

export interface CreateIdeaRequest {
  idea: string;
  tier: Tier;
  userId?: string;
}

export interface CreateIdeaResponse {
  id: string;
  stage: 1;
  message: string;
  estimatedTime: number; // 예상 소요 시간 (초)
}

export interface GetIdeaResponse {
  idea: IdeaInput;
  analysis?: IdeaAnalysis;
  report?: BusinessReport;
  actions?: ActionCard[];
  currentStage: Stage;
}

export interface SubmitFeedbackRequest {
  ideaId: string;
  feedback: string;
  field?: 'target' | 'problem' | 'solution'; // 어느 부분에 대한 피드백인지
}

export interface SubmitFeedbackResponse {
  updatedAnalysis: IdeaAnalysis;
  message: string;
}

export interface GenerateReportRequest {
  ideaId: string;
}

export interface GenerateReportResponse {
  reportId: string;
  status: 'generating' | 'completed';
  estimatedTime?: number;
}

export interface GenerateActionRequest {
  ideaId: string;
  actionType: ActionType;
}

export interface GenerateActionResponse {
  actionId: string;
  status: 'generating' | 'completed';
  result?: ActionResult;
}

// ============================================
// 에러 응답
// ============================================

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiError =
  | 'INVALID_TIER'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_CREDITS'
  | 'TIER_FEATURE_LOCKED'
  | 'IDEA_NOT_FOUND'
  | 'STAGE_NOT_READY'
  | 'GENERATION_FAILED'
  | 'INVALID_INPUT';
