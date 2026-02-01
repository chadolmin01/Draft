/**
 * 프롬프트 템플릿 로더
 */

import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), '..', 'prompts');

export function loadPrompt(filename: string): string {
  const filePath = path.join(PROMPTS_DIR, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Stage 1 프롬프트 생성
 */
export function buildStage1Prompt(idea: string, tier: 'light' | 'pro' | 'heavy'): string {
  // Pro 전용 프롬프트 사용
  const template = loadPrompt('stage1-pro-only.md');

  // {USER_IDEA} 치환
  return template.replace('{USER_IDEA}', idea);
}

/**
 * Stage 2 프롬프트 생성
 */
export function buildStage2Prompt(
  stage1Result: any,
  tier: 'light' | 'pro' | 'heavy'
): string {
  const template = loadPrompt('stage2-market-analysis.md');

  // Stage 1 결과를 JSON 문자열로 변환하여 삽입
  return template.replace(
    '{STAGE1_OUTPUT}',
    JSON.stringify(stage1Result, null, 2)
  ).replace('{TIER}', tier);
}

/**
 * Stage 3 프롬프트 생성
 */
export function buildStage3Prompt(
  stage1Result: any,
  stage2Result: any,
  tier: 'light' | 'pro' | 'heavy'
): string {
  const template = loadPrompt('stage3-integrated-report.md');

  return template
    .replace('{STAGE1_OUTPUT}', JSON.stringify(stage1Result, null, 2))
    .replace('{STAGE2_OUTPUT}', JSON.stringify(stage2Result, null, 2))
    .replace('{TIER}', tier);
}
