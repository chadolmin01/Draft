/**
 * Google Gemini API 래퍼
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseGeminiError, rateLimitTracker } from './api-error-handler';

const apiKey = process.env.GOOGLE_API_KEY?.trim();
if (!apiKey || apiKey === 'your_google_api_key') {
  console.warn(
    '[Gemini] GOOGLE_API_KEY가 설정되지 않았습니다. ' +
    'frontend/.env.local에 Google AI Studio에서 발급한 API 키를 설정하세요. ' +
    'https://aistudio.google.com/app/apikey'
  );
}

const genAI = new GoogleGenerativeAI(apiKey || '');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function callGeminiOnce(prompt: string, useJsonMode: boolean): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      ...(useJsonMode && { responseMimeType: 'application/json' }),
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function callGemini(
  prompt: string,
  useJsonMode: boolean = true
): Promise<string> {
  // Rate limit 체크 (클라이언트 사이드)
  if (typeof window !== 'undefined' && !rateLimitTracker.canMakeRequest()) {
    const resetTime = rateLimitTracker.getResetTime();
    throw new Error(
      `Rate limit exceeded. Please retry after ${resetTime.toLocaleString('ko-KR')}`
    );
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await callGeminiOnce(prompt, useJsonMode);
      if (typeof window !== 'undefined') {
        rateLimitTracker.addRequest();
      }
      return text;
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const isNetworkError = msg.includes('fetch') || msg.includes('network') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT');

      if (isNetworkError && attempt < MAX_RETRIES) {
        console.warn(`[Gemini] 네트워크 오류, ${RETRY_DELAY_MS / 1000}초 후 재시도 (${attempt}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        break;
      }
    }
  }

  const error = lastError;
  console.error('[Gemini] 원본 에러:', error instanceof Error ? error.message : error);
  const apiError = parseGeminiError(error);
  const enhancedError = new Error(apiError.message);
  (enhancedError as any).apiError = apiError;
  throw enhancedError;
}

/**
 * JSON 응답 파싱
 */
export function parseJsonResponse<T>(response: string): T {
  let jsonText = response.trim();

  // Gemini는 JSON mode에서 바로 JSON 반환하지만
  // 혹시 markdown 코드블록이 있으면 제거
  if (jsonText.includes('```json')) {
    const start = jsonText.indexOf('```json') + 7;
    const end = jsonText.indexOf('```', start);
    jsonText = jsonText.substring(start, end).trim();
  } else if (jsonText.includes('```')) {
    const start = jsonText.indexOf('```') + 3;
    const end = jsonText.indexOf('```', start);
    jsonText = jsonText.substring(start, end).trim();
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Raw response:', jsonText);
    throw new Error('Failed to parse JSON response');
  }
}
