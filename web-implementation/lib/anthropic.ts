/**
 * Anthropic Claude API 래퍼
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function callClaude(
  prompt: string,
  maxTokens: number = 4000
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  return textContent.text;
}

/**
 * JSON 응답 파싱 (```json ``` 제거)
 */
export function parseJsonResponse<T>(response: string): T {
  let jsonText = response.trim();

  // Remove markdown code blocks if present
  if (jsonText.includes('```json')) {
    const start = jsonText.indexOf('```json') + 7;
    const end = jsonText.indexOf('```', start);
    jsonText = jsonText.substring(start, end).trim();
  } else if (jsonText.includes('```')) {
    const start = jsonText.indexOf('```') + 3;
    const end = jsonText.indexOf('```', start);
    jsonText = jsonText.substring(start, end).trim();
  }

  return JSON.parse(jsonText);
}
