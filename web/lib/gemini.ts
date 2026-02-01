/**
 * Google Gemini API 래퍼
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function callGemini(
  prompt: string,
  useJsonMode: boolean = true
): Promise<string> {
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
