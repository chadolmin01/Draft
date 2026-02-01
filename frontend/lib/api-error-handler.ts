/**
 * API 에러 핸들러
 * Gemini API Rate Limit 등 다양한 에러 처리
 */

export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number; // 초 단위
  details?: string;
  isRetryable: boolean;
}

/**
 * Gemini API 에러 파싱
 */
export function parseGeminiError(error: any): ApiError {
  // 429 Rate Limit Error
  if (error.message?.includes('429') || error.message?.includes('quota')) {
    const retryMatch = error.message.match(/retry in (\d+\.?\d*)s/i);
    const retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;

    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'API 호출 한도를 초과했습니다',
      retryAfter,
      details: `무료 티어는 하루 20개 요청으로 제한됩니다. ${retryAfter}초 후 다시 시도하거나, 내일 다시 시도해주세요.`,
      isRetryable: true,
    };
  }

  // 401 Authentication Error
  if (error.message?.includes('401') || error.message?.includes('API key')) {
    return {
      code: 'INVALID_API_KEY',
      message: 'API 키가 유효하지 않습니다',
      details: 'GOOGLE_API_KEY를 확인해주세요.',
      isRetryable: false,
    };
  }

  // 500 Server Error
  if (error.message?.includes('500') || error.message?.includes('Internal')) {
    return {
      code: 'SERVER_ERROR',
      message: 'API 서버 오류',
      details: '잠시 후 다시 시도해주세요.',
      isRetryable: true,
      retryAfter: 5,
    };
  }

  // Network Error
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: '네트워크 오류',
      details: '인터넷 연결을 확인해주세요.',
      isRetryable: true,
      retryAfter: 5,
    };
  }

  // JSON Parse Error
  if (error.message?.includes('JSON') || error.message?.includes('parse')) {
    return {
      code: 'PARSE_ERROR',
      message: 'API 응답 파싱 실패',
      details: 'API 응답 형식이 올바르지 않습니다.',
      isRetryable: false,
    };
  }

  // Unknown Error
  return {
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류',
    details: error.message || '다시 시도해주세요.',
    isRetryable: false,
  };
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(apiError: ApiError): string {
  switch (apiError.code) {
    case 'RATE_LIMIT_EXCEEDED':
      if (apiError.retryAfter && apiError.retryAfter < 120) {
        return `${apiError.message}. ${apiError.retryAfter}초 후 자동으로 재시도됩니다...`;
      }
      return `${apiError.message}. 잠시 후 다시 시도하거나 내일 다시 방문해주세요.`;

    case 'INVALID_API_KEY':
      return '⚠️ API 키 설정이 필요합니다. 관리자에게 문의하세요.';

    case 'NETWORK_ERROR':
      return '🌐 네트워크 연결을 확인하고 다시 시도해주세요.';

    case 'SERVER_ERROR':
      return '🔧 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

    default:
      return `❌ ${apiError.message}. ${apiError.details || ''}`;
  }
}

/**
 * 자동 재시도 로직
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = parseGeminiError(error);

      // Retryable이 아니면 즉시 throw
      if (!apiError.isRetryable) {
        throw error;
      }

      // Rate limit의 경우 retryAfter 시간 사용
      const delay = apiError.retryAfter
        ? apiError.retryAfter * 1000
        : baseDelay * Math.pow(2, i);

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);

      // 마지막 시도가 아니면 대기
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Rate Limit 추적 (클라이언트 사이드)
 */
class RateLimitTracker {
  private requests: number[] = [];
  private readonly maxRequests = 20; // 무료 티어 제한
  private readonly windowMs = 24 * 60 * 60 * 1000; // 24시간

  addRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.cleanup();
  }

  cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter((time) => time > cutoff);
  }

  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }

  getRemainingRequests(): number {
    this.cleanup();
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): Date {
    if (this.requests.length === 0) {
      return new Date();
    }
    return new Date(this.requests[0] + this.windowMs);
  }
}

export const rateLimitTracker = new RateLimitTracker();
