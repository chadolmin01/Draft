-- auth.users 트리거 제거
-- 트리거가 signup 실패를 유발할 수 있어, 앱 레벨(auth callback, /api/profile)에서 profile 생성으로 전환

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
