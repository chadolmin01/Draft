/**
 * DB 헬퍼 - Supabase 연동
 * Supabase 미설정 시 null 반환, localStorage 폴백
 */

import { createAdminClient } from './supabase/admin';
import type { IdeaAnalysis, Stage2MarketAnalysis, BusinessReport } from './types';
import type { MarketDeepAnalysis, StrategyAnalysis, ExternalAnalysis } from './types';

// DB 타입
export interface IdeaRow {
  id: string;
  user_id: string | null;
  idea: string;
  tier: string;
  stage: number;
  created_at: string;
}

export interface AnalysisRow {
  id: string;
  idea_id: string;
  stage1_data: IdeaAnalysis | null;
  stage2_data: Stage2MarketAnalysis | null;
  stage2_deep_market: MarketDeepAnalysis | null;
  stage2_deep_strategy: StrategyAnalysis | null;
  stage2_deep_external: ExternalAnalysis | null;
  report_data: BusinessReport | null;
  updated_at: string;
}

export function isDbEnabled(): boolean {
  const supabase = createAdminClient();
  return supabase !== null;
}

export async function createIdea(params: {
  idea: string;
  tier: string;
  userId?: string | null;
  analysis?: IdeaAnalysis;
}): Promise<{ id: string; idea: IdeaRow; analysis: IdeaAnalysis | null } | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: ideaRow, error: ideaError } = await supabase
    .from('ideas')
    .insert({
      idea: params.idea,
      tier: params.tier,
      stage: 1,
      user_id: params.userId || null,
    })
    .select()
    .single();

  if (ideaError || !ideaRow) {
    console.error('DB createIdea error:', ideaError);
    return null;
  }

  if (params.analysis) {
    const { error: analysisError } = await supabase.from('analyses').insert({
      idea_id: ideaRow.id,
      stage1_data: params.analysis,
    });

    if (analysisError) {
      console.error('DB createAnalysis error:', analysisError);
    }
  }

  return {
    id: ideaRow.id,
    idea: ideaRow as IdeaRow,
    analysis: params.analysis || null,
  };
}

export async function getIdea(id: string): Promise<{
  idea: IdeaRow;
  analysis: IdeaAnalysis | null;
  stage2: Stage2MarketAnalysis | null;
  stage2Deep: {
    market: MarketDeepAnalysis | null;
    strategy: StrategyAnalysis | null;
    external: ExternalAnalysis | null;
  };
  report: BusinessReport | null;
} | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: ideaRow, error: ideaError } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (ideaError || !ideaRow) return null;

  const { data: analysisRow } = await supabase
    .from('analyses')
    .select('*')
    .eq('idea_id', id)
    .single();

  const analysis = analysisRow as AnalysisRow | null;

  return {
    idea: ideaRow as IdeaRow,
    analysis: analysis?.stage1_data ?? null,
    stage2: analysis?.stage2_data ?? null,
    stage2Deep: {
      market: analysis?.stage2_deep_market ?? null,
      strategy: analysis?.stage2_deep_strategy ?? null,
      external: analysis?.stage2_deep_external ?? null,
    },
    report: analysis?.report_data ?? null,
  };
}

export async function updateAnalysis(
  ideaId: string,
  updates: {
    stage1_data?: IdeaAnalysis;
    stage2_data?: Stage2MarketAnalysis;
    stage2_deep_market?: MarketDeepAnalysis;
    stage2_deep_strategy?: StrategyAnalysis;
    stage2_deep_external?: ExternalAnalysis;
    report_data?: BusinessReport;
  }
): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  // 기존 데이터 조회 후 병합
  const { data: existing } = await supabase
    .from('analyses')
    .select('*')
    .eq('idea_id', ideaId)
    .single();

  const merged = {
    idea_id: ideaId,
    stage1_data: updates.stage1_data ?? (existing as AnalysisRow)?.stage1_data ?? null,
    stage2_data: updates.stage2_data ?? (existing as AnalysisRow)?.stage2_data ?? null,
    stage2_deep_market: updates.stage2_deep_market ?? (existing as AnalysisRow)?.stage2_deep_market ?? null,
    stage2_deep_strategy: updates.stage2_deep_strategy ?? (existing as AnalysisRow)?.stage2_deep_strategy ?? null,
    stage2_deep_external: updates.stage2_deep_external ?? (existing as AnalysisRow)?.stage2_deep_external ?? null,
    report_data: updates.report_data ?? (existing as AnalysisRow)?.report_data ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('analyses')
    .upsert(merged, { onConflict: 'idea_id' });

  if (error) {
    console.error('DB updateAnalysis error:', error);
    return false;
  }
  return true;
}
