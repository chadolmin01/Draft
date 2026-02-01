/**
 * 프롬프트 로더
 */

import fs from 'fs';
import path from 'path';

/**
 * 프롬프트 파일 읽기
 */
export function loadPrompt(stage: number, tier: 'light' | 'pro' | 'heavy'): string {
  const promptsDir = path.join(process.cwd(), '..', 'prompts');

  // Stage별, 티어별 프롬프트 파일 선택
  let fileName: string;
  
  if (stage === 1) {
    // Stage 1: 티어별 프롬프트
    if (tier === 'pro' || tier === 'heavy') {
      fileName = 'stage1-pro-only.md';
    } else {
      // Light 티어는 기본 breakdown 사용
      fileName = 'stage1-idea-breakdown.md';
    }
  } else if (stage === 2) {
    fileName = 'stage2-market-analysis.md';
  } else if (stage === 3) {
    fileName = 'stage3-integrated-report.md';
  } else if (stage === 4) {
    fileName = 'stage4-landing-page.md';
  } else {
    throw new Error(`Invalid stage number: ${stage}`);
  }

  const filePath = path.join(promptsDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${fileName} at ${filePath}`);
  }

  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

/**
 * Knowledge base 파일 읽기
 */
export function loadKnowledgeBase(fileName: string): string {
  const kbDir = path.join(process.cwd(), '..', 'knowledge-base');
  const filePath = path.join(kbDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Knowledge base file not found: ${fileName}`);
  }

  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

/**
 * 심화 분석 프롬프트 로더
 * @param group - 심화 분석 그룹 ('market-deep' | 'strategy' | 'external')
 * @param mainSummary - 메인 분석 요약 데이터
 */
export function loadDeepPrompt(
  group: 'market-deep' | 'strategy' | 'external',
  mainSummary: object
): string {
  const promptsDir = path.join(process.cwd(), '..', 'prompts');
  
  // group 이름을 파일명으로 매핑
  const fileNameMap: Record<string, string> = {
    'market-deep': 'stage2-deep-market.md',
    'strategy': 'stage2-deep-strategy.md',
    'external': 'stage2-deep-external.md',
  };
  
  const fileName = fileNameMap[group];
  if (!fileName) {
    throw new Error(`Unknown deep analysis group: ${group}`);
  }
  
  const filePath = path.join(promptsDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Deep analysis prompt file not found: ${fileName}`);
  }

  const template = fs.readFileSync(filePath, { encoding: 'utf-8' });

  // 메인 분석 요약을 프롬프트에 삽입
  return template.replace('{MAIN_SUMMARY}', JSON.stringify(mainSummary, null, 2));
}
