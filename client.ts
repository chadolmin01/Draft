/**
 * API 클라이언트
 * 프론트엔드에서 사용
 */

import type {
  CreateIdeaRequest,
  CreateIdeaResponse,
  GetIdeaResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  GenerateActionRequest,
  GenerateActionResponse,
  ActionCard,
  ErrorResponse,
} from './types';

// ============================================
// 설정
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 인증 토큰 설정 (옵션)
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * 공통 fetch 래퍼
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          (data as ErrorResponse).error.code,
          (data as ErrorResponse).error.message,
          response.status,
          (data as ErrorResponse).error.details
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // 네트워크 에러 등
      throw new ApiError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  // ============================================
  // API 메서드
  // ============================================

  /**
   * 아이디어 생성 (Stage 1)
   */
  async createIdea(request: CreateIdeaRequest): Promise<CreateIdeaResponse> {
    return this.request<CreateIdeaResponse>('/ideas', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 아이디어 조회
   */
  async getIdea(ideaId: string): Promise<GetIdeaResponse> {
    return this.request<GetIdeaResponse>(`/ideas/${ideaId}`);
  }

  /**
   * 아이디어 분석 피드백 제출 (프로 이상)
   */
  async submitFeedback(
    request: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    return this.request<SubmitFeedbackResponse>(
      `/ideas/${request.ideaId}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * 리포트 생성 트리거 (Stage 3)
   */
  async generateReport(
    request: GenerateReportRequest
  ): Promise<GenerateReportResponse> {
    return this.request<GenerateReportResponse>(
      `/ideas/${request.ideaId}/generate-report`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * 리포트 조회 (폴링용)
   */
  async getReport(ideaId: string): Promise<GetIdeaResponse> {
    return this.request<GetIdeaResponse>(`/ideas/${ideaId}/report`);
  }

  /**
   * 액션 카드 목록 조회
   */
  async getActions(ideaId: string): Promise<ActionCard[]> {
    return this.request<ActionCard[]>(`/ideas/${ideaId}/actions`);
  }

  /**
   * 액션 실행
   */
  async executeAction(
    request: GenerateActionRequest
  ): Promise<GenerateActionResponse> {
    return this.request<GenerateActionResponse>(
      `/ideas/${request.ideaId}/actions`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}

// ============================================
// 커스텀 에러 클래스
// ============================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * 티어 제한 에러인지 확인
   */
  isTierLocked(): boolean {
    return this.code === 'TIER_FEATURE_LOCKED';
  }

  /**
   * Rate limit 에러인지 확인
   */
  isRateLimited(): boolean {
    return this.code === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * 크레딧 부족 에러인지 확인
   */
  isInsufficientCredits(): boolean {
    return this.code === 'INSUFFICIENT_CREDITS';
  }
}

// ============================================
// 싱글톤 인스턴스
// ============================================

export const apiClient = new ApiClient();

// ============================================
// React Hook 예시 (선택사항)
// ============================================

/**
 * 아이디어 생성 훅
 *
 * @example
 * ```tsx
 * const { create, loading, error } = useCreateIdea();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await create({
 *       idea: "AI 헬스케어 플랫폼",
 *       tier: "pro"
 *     });
 *     router.push(`/ideas/${result.id}`);
 *   } catch (err) {
 *     // 에러 처리
 *   }
 * };
 * ```
 */
export function useCreateIdea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = async (request: CreateIdeaRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.createIdea(request);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

/**
 * 아이디어 조회 훅 (폴링 포함)
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useIdea(ideaId, {
 *   poll: true,
 *   pollInterval: 2000
 * });
 * ```
 */
export function useIdea(
  ideaId: string,
  options?: {
    poll?: boolean;
    pollInterval?: number;
  }
) {
  const [data, setData] = useState<GetIdeaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchIdea = async () => {
      try {
        const result = await apiClient.getIdea(ideaId);
        setData(result);
        setError(null);

        // Stage 완료되면 폴링 중지
        if (options?.poll && result.currentStage < 4) {
          // 계속 폴링
        } else if (intervalId) {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();

    if (options?.poll) {
      intervalId = setInterval(fetchIdea, options.pollInterval || 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ideaId, options?.poll, options?.pollInterval]);

  return { data, loading, error };
}

/**
 * 리포트 생성 훅
 *
 * @example
 * ```tsx
 * const { generate, loading, progress } = useGenerateReport(ideaId);
 *
 * const handleGenerate = async () => {
 *   await generate();
 *   // 생성 완료 후 자동으로 data 업데이트
 * };
 * ```
 */
export function useGenerateReport(ideaId: string) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await apiClient.generateReport({ ideaId });

      // 폴링으로 진행 상황 체크
      const pollInterval = setInterval(async () => {
        try {
          const idea = await apiClient.getIdea(ideaId);

          if (idea.report) {
            setProgress(100);
            clearInterval(pollInterval);
            setLoading(false);
          } else {
            // 진행률 시뮬레이션 (실제로는 백엔드에서 제공)
            setProgress((prev) => Math.min(prev + 10, 90));
          }
        } catch (err) {
          setError(err as ApiError);
          clearInterval(pollInterval);
          setLoading(false);
        }
      }, 2000);

      return result;
    } catch (err) {
      setError(err as ApiError);
      setLoading(false);
      throw err;
    }
  };

  return { generate, loading, progress, error };
}

// ============================================
// 유틸리티
// ============================================

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function getErrorMessage(error: ApiError): string {
  const messages: Record<string, string> = {
    INVALID_TIER: '잘못된 티어입니다.',
    RATE_LIMIT_EXCEEDED: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    INSUFFICIENT_CREDITS: '크레딧이 부족합니다. 충전 후 이용해주세요.',
    TIER_FEATURE_LOCKED: '이 기능은 상위 티어에서 사용 가능합니다.',
    IDEA_NOT_FOUND: '아이디어를 찾을 수 없습니다.',
    STAGE_NOT_READY: '이전 단계를 먼저 완료해주세요.',
    GENERATION_FAILED: '생성에 실패했습니다. 다시 시도해주세요.',
    INVALID_INPUT: '입력 내용을 확인해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  };

  return messages[error.code] || error.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 티어별 기능 사용 가능 여부 체크
 */
export function canUseTierFeature(
  userTier: 'light' | 'pro' | 'heavy',
  requiredTier: 'light' | 'pro' | 'heavy'
): boolean {
  const tierLevels = { light: 1, pro: 2, heavy: 3 };
  return tierLevels[userTier] >= tierLevels[requiredTier];
}

// React hooks를 사용하기 위한 import
import { useState, useEffect } from 'react';
