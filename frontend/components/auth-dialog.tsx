'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, UserPlus, X } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthDialog({ open, onClose, initialMode = 'signin' }: AuthDialogProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: err } = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        setSuccess('가입 완료! 이메일 확인 링크를 확인해주세요.');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !mounted) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-lg border border-border/60 bg-card p-6 shadow-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {mode === 'signin' ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              이메일
            </label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-9"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              비밀번호
            </label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="h-9"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 h-9 text-xs">
              {loading ? '처리 중...' : mode === 'signin' ? '로그인' : '가입하기'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setSuccess(null);
              }}
              className="h-9 text-xs"
            >
              {mode === 'signin' ? (
                <>
                  <UserPlus className="mr-1 h-3 w-3" />
                  가입
                </>
              ) : (
                <>
                  <LogIn className="mr-1 h-3 w-3" />
                  로그인
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
