-- AI 스타트업 플랫폼 초기 스키마
-- Supabase Dashboard > SQL Editor에서 실행하거나: supabase db push

-- ideas 테이블: 아이디어 메타데이터
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  idea TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('light', 'pro', 'heavy')),
  stage INTEGER NOT NULL DEFAULT 1 CHECK (stage >= 1 AND stage <= 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- analyses 테이블: Stage별 분석 결과 (JSONB)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE UNIQUE,
  stage1_data JSONB,
  stage2_data JSONB,
  stage2_deep_market JSONB,
  stage2_deep_strategy JSONB,
  stage2_deep_external JSONB,
  report_data JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_idea_id ON analyses(idea_id);

-- RLS (Row Level Security) 정책
-- MVP: API에서 service_role 사용 시 RLS 우회. 추후 인증 연동 시 정책 강화.
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- ideas: 로그인 사용자는 자신의 데이터, 익명(user_id NULL)은 모두 접근 허용
CREATE POLICY "ideas_select" ON ideas
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "ideas_insert" ON ideas
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "ideas_update" ON ideas
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "ideas_delete" ON ideas
  FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- analyses: idea와 연결된 데이터만 접근
CREATE POLICY "analyses_select" ON analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ideas i
      WHERE i.id = analyses.idea_id
      AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "analyses_insert" ON analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas i
      WHERE i.id = analyses.idea_id
      AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "analyses_update" ON analyses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ideas i
      WHERE i.id = analyses.idea_id
      AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "analyses_delete" ON analyses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ideas i
      WHERE i.id = analyses.idea_id
      AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

COMMENT ON TABLE ideas IS '아이디어 메타데이터 (Stage 1 입력)';
COMMENT ON TABLE analyses IS 'Stage별 AI 분석 결과 (JSONB)';
