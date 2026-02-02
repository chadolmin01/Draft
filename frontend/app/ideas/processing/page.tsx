'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GrokLayout } from '@/components/grok-layout';
import { LogoSliced } from '@/components/logo-sliced';
import { isMockMode } from '@/lib/mock-mode';

const PENDING_KEY = 'pending_idea_submit';
const IN_PROGRESS_KEY = 'pending_idea_in_progress';

const CIRCLE_R = 45;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;

      const raw = sessionStorage.getItem(PENDING_KEY);
      const inProgress = sessionStorage.getItem(IN_PROGRESS_KEY);

      if (!raw) {
        if (inProgress) return;
        router.replace('/');
        return;
      }

      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.setItem(IN_PROGRESS_KEY, '1');

      let payload: { idea: string; tier: string; userId: string | null };
      try {
        payload = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem(IN_PROGRESS_KEY);
        router.replace('/');
        return;
      }

      const { idea, tier, userId } = payload;
      if (!idea?.trim()) {
        sessionStorage.removeItem(IN_PROGRESS_KEY);
        router.replace('/');
        return;
      }

      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 1.5, 90));
      }, 150);

      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (isMockMode()) headers['x-mock-mode'] = 'true';

        const response = await fetch('/api/ideas', {
          method: 'POST',
          headers,
          body: JSON.stringify({ idea: idea.trim(), tier: tier || 'light', userId }),
        });

        let result: { success: boolean; data?: { id: string; idea: string; tier: string; createdAt: string; stage: number; analysis: unknown }; error?: { message: string } };
        try {
          result = await response.json();
        } catch {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);
          sessionStorage.removeItem(IN_PROGRESS_KEY);
          setError('응답 처리에 실패했습니다.');
          return;
        }

        if (result.success && result.data) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);
          sessionStorage.removeItem(IN_PROGRESS_KEY);
          const transformedData = {
            idea: {
              id: result.data!.id,
              idea: result.data!.idea,
              tier: result.data!.tier,
              createdAt: result.data!.createdAt,
              stage: result.data!.stage,
            },
            analysis: result.data!.analysis,
            currentStage: result.data!.stage,
          };
          localStorage.setItem(`idea_${result.data!.id}`, JSON.stringify(transformedData));
          await new Promise((r) => setTimeout(r, 300));
          router.replace(`/ideas/${result.data!.id}`);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);
          sessionStorage.removeItem(IN_PROGRESS_KEY);
          setError(result.error?.message || '오류가 발생했습니다.');
        }
      } catch (err) {
        console.error('API 호출 실패:', err);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setProgress(100);
        sessionStorage.removeItem(IN_PROGRESS_KEY);
        setError(err instanceof Error ? err.message : 'API 호출에 실패했습니다.');
      }
    };

    run();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [router]);

  if (error) {
    return (
      <GrokLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <p className="text-destructive font-medium">{error}</p>
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-secondary/60 hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </GrokLayout>
    );
  }

  const strokeOffset = CIRCLE_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <GrokLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${CIRCLE_R * 2} ${CIRCLE_R * 2}`}>
            <circle
              cx={CIRCLE_R}
              cy={CIRCLE_R}
              r={CIRCLE_R - 2}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground/10"
            />
            <circle
              cx={CIRCLE_R}
              cy={CIRCLE_R}
              r={CIRCLE_R - 2}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="text-foreground/70 transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <LogoSliced className="relative w-12 h-12 text-foreground/90" />
        </div>
        <p className="text-sm text-muted-foreground">아이디어를 분석하고 있습니다...</p>
      </div>
    </GrokLayout>
  );
}
