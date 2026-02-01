/**
 * API Contract: TypeScript 타입 정의
 * 프론트엔드 ↔ 백엔드 공유
 */

// ============================================================================
// Common Types
// ============================================================================

export type Tier = 'light' | 'pro' | 'heavy';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    tier: Tier;
  };
}

// ============================================================================
// Stage 1: 아이디어 해체 분석
// ============================================================================

export interface Stage1Input {
  idea: string;           // 사용자가 입력한 원본 아이디어
  tier: Tier;             // 라이트/프로/헤비
  userId?: string;        // 선택적 사용자 ID
}

export interface Stage1Output {
  target: string;         // 타겟 고객층
  problem: string;        // 해결할 문제
  solution: string;       // 제안 솔루션
  confidence_score: number; // 0.0 ~ 1.0
  original_idea: string;  // 원본 아이디어 (참고용)
}

// ============================================================================
// Stage 2: 시장 및 경쟁 분석
// ============================================================================

export interface Stage2Input {
  stage1Result: Stage1Output;
  tier: Tier;
}

export interface MarketAnalysis {
  market_size: string;      // 시장 규모
  growth_rate: string;      // 성장률
  target_segment: string;   // 타겟 세그먼트
  market_trends?: string[]; // 시장 트렌드
}

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
  differentiation: string;
  url?: string;
}

export interface Stage2Output {
  market_analysis: MarketAnalysis;
  competitors: Competitor[];
  feasibility_score: number;
  risks?: string[];
}

// ============================================================================
// Stage 3: 통합 리포트
// ============================================================================

export interface Stage3Input {
  stage1Result: Stage1Output;
  stage2Result: Stage2Output;
  tier: Tier;
}

export interface ReportSubsection {
  id: string;
  title: string;
  content: string; // 마크다운 형식
}

export interface ReportSection {
  id: 'business-overview' | 'market-analysis' | 'competitor-analysis' |
      'revenue-model' | 'business-structure' | 'development-guide';
  title: string;
  content?: string;
  subsections?: ReportSubsection[];
}

export interface Stage3Output {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  metadata: {
    generated_at: string;
    tier: Tier;
    version: string;
  };
}

// ============================================================================
// Stage 4: 실행 액션
// ============================================================================

export interface Stage4Input {
  stage3Result: Stage3Output;
  actionType: 'landing-page' | 'business-plan' | 'pitch-deck' | 'mvp-blueprint';
}

// Landing Page
export interface LandingPageSection {
  type: 'hero' | 'problem' | 'solution' | 'features' | 'pricing' | 'cta';
  headline?: string;
  subheadline?: string;
  content?: string;
  button_text?: string;
}

export interface LandingPageOutput {
  sections: LandingPageSection[];
  html_template: string;
  design_notes?: string;
}

// Business Plan Document
export interface BusinessPlanOutput {
  format: 'formal' | 'pitch' | 'government';
  sections: Array<{
    title: string;
    content: string;
  }>;
  pdf_ready: boolean;
}

// Pitch Deck
export interface PitchSlide {
  number: number;
  title: string;
  content: string;
  visual_suggestion?: string;
  speaker_notes?: string;
}

export interface PitchDeckOutput {
  slides: PitchSlide[];
}

// MVP Blueprint
export interface MvpFeature {
  priority: 1 | 2 | 3;
  name: string;
  description: string;
  estimated_complexity?: 'low' | 'medium' | 'high';
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  infrastructure?: string;
  reasoning?: string;
}

export interface RoadmapPhase {
  phase: string;
  tasks: string[];
}

export interface MvpBlueprintOutput {
  features: MvpFeature[];
  tech_stack: TechStack;
  roadmap: RoadmapPhase[];
}

export type Stage4Output =
  | LandingPageOutput
  | BusinessPlanOutput
  | PitchDeckOutput
  | MvpBlueprintOutput;

// ============================================================================
// Full Pipeline (한 번에 전체 실행)
// ============================================================================

export interface FullPipelineInput {
  idea: string;
  tier: Tier;
  userId?: string;
  includeActions?: boolean; // Stage 4 포함 여부
}

export interface FullPipelineOutput {
  stage1: Stage1Output;
  stage2?: Stage2Output;  // tier=light면 null
  stage3: Stage3Output;
  stage4?: Stage4Output[];
}

// ============================================================================
// Streaming Support (선택적)
// ============================================================================

export interface StreamEvent {
  type: 'progress' | 'stage_complete' | 'error' | 'done';
  stage?: 1 | 2 | 3 | 4;
  data?: any;
  message?: string;
  progress?: number; // 0-100
}

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  AI_API_ERROR = 'AI_API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIER_LIMIT = 'TIER_LIMIT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitInfo {
  tier: Tier;
  limit: number;      // 월간 생성 가능 횟수
  used: number;       // 이번 달 사용 횟수
  reset_at: string;   // 리셋 시간
}
