-- profiles 테이블: 계정별 티어 (가입 시 light, 결제 또는 수동 업그레이드 시 pro/heavy)
-- Supabase Dashboard > SQL Editor에서 실행하거나: supabase db push

-- profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'light' CHECK (tier IN ('light', 'pro', 'heavy')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- profile 생성: auth callback (OAuth) 및 /api/profile (이메일 가입)에서 앱 레벨로 처리
-- (auth.users 트리거는 signup 실패를 유발할 수 있어 사용하지 않음)

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 profile만 조회 가능
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- 사용자는 profile 생성만 가능 (tier는 light만, 기존 유저용)
-- tier 업데이트는 service_role(결제 웹훅, 대시보드 수동)으로만
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid() AND tier = 'light');

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

COMMENT ON TABLE profiles IS '계정별 티어 (가입=light, 결제/수동업그레이드=pro/heavy)';
