/**
 * API Client for Frontend
 * 프론트엔드에서 바로 사용 가능한 API 클라이언트
 */

import type {
  ApiResponse,
  Stage1Input,
  Stage1Output,
  Stage2Input,
  Stage2Output,
  Stage3Input,
  Stage3Output,
  Stage4Input,
  Stage4Output,
  FullPipelineInput,
  FullPipelineOutput,
  RateLimitInfo,
  StreamEvent,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.startup-platform.com/v1';

// ============================================================================
// API Client Class
// ============================================================================

export class StartupPlatformApi {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 인증 토큰 설정
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
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error.code, data.error.message, data.error.details);
    }

    return data;
  }

  // ==========================================================================
  // Stage 1: 아이디어 해체 분석
  // ==========================================================================

  async analyzeIdea(input: Stage1Input): Promise<ApiResponse<Stage1Output>> {
    return this.request<Stage1Output>('/api/stage1/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==========================================================================
  // Stage 2: 시장 분석
  // ==========================================================================

  async analyzeMarket(input: Stage2Input): Promise<ApiResponse<Stage2Output>> {
    return this.request<Stage2Output>('/api/stage2/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==========================================================================
  // Stage 3: 통합 리포트
  // ==========================================================================

  async generateReport(input: Stage3Input): Promise<ApiResponse<Stage3Output>> {
    return this.request<Stage3Output>('/api/stage3/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==========================================================================
  // Stage 4: 실행 액션
  // ==========================================================================

  async generateAction(input: Stage4Input): Promise<ApiResponse<Stage4Output>> {
    return this.request<Stage4Output>('/api/stage4/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==========================================================================
  // Full Pipeline
  // ==========================================================================

  async runFullPipeline(input: FullPipelineInput): Promise<ApiResponse<FullPipelineOutput>> {
    return this.request<FullPipelineOutput>('/api/pipeline/full', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Streaming 지원 (SSE)
   */
  async runFullPipelineStream(
    input: FullPipelineInput,
    onProgress: (event: StreamEvent) => void
  ): Promise<FullPipelineOutput> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${this.baseUrl}/api/pipeline/full-stream?` + new URLSearchParams({
          idea: input.idea,
          tier: input.tier,
          includeActions: String(input.includeActions || false),
        }),
        {
          // @ts-ignore - EventSource with headers (polyfill 필요할 수 있음)
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data) as StreamEvent;
        onProgress(data);
      });

      eventSource.addEventListener('stage_complete', (e) => {
        const data = JSON.parse(e.data) as StreamEvent;
        onProgress(data);
      });

      eventSource.addEventListener('done', (e) => {
        const data = JSON.parse(e.data);
        eventSource.close();
        resolve(data.data);
      });

      eventSource.addEventListener('error', (e) => {
        eventSource.close();
        reject(new Error('Stream error'));
      });
    });
  }

  // ==========================================================================
  // Rate Limit
  // ==========================================================================

  async getRateLimit(): Promise<ApiResponse<RateLimitInfo>> {
    return this.request<RateLimitInfo>('/api/user/rate-limit', {
      method: 'GET',
    });
  }
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const api = new StartupPlatformApi();

// ============================================================================
// React Hooks (Next.js/React 환경)
// ============================================================================

import { useState, useCallback } from 'react';

/**
 * Stage 1 Hook
 */
export function useStage1() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Stage1Output | null>(null);

  const analyze = useCallback(async (input: Stage1Input) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.analyzeIdea(input);
      setData(response.data!);
      return response.data!;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, data };
}

/**
 * Full Pipeline Hook
 */
export function useFullPipeline() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<FullPipelineOutput | null>(null);
  const [progress, setProgress] = useState<StreamEvent | null>(null);

  const run = useCallback(async (input: FullPipelineInput, stream = false) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      if (stream) {
        const result = await api.runFullPipelineStream(input, (event) => {
          setProgress(event);
        });
        setData(result);
        return result;
      } else {
        const response = await api.runFullPipeline(input);
        setData(response.data!);
        return response.data!;
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, data, progress };
}

/**
 * Rate Limit Hook
 */
export function useRateLimit() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RateLimitInfo | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getRateLimit();
      setData(response.data!);
      return response.data!;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetch, loading, data };
}
