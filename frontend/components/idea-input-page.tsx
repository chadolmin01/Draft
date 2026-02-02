'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Tier } from '@/lib/types';
import { HeroInput } from '@/components/hero-input';
import { GrokLayout } from '@/components/grok-layout';
import { LogoSliced } from '@/components/logo-sliced';
import { useAuth } from '@/lib/auth-context';

const PENDING_KEY = 'pending_idea_submit';

export function IdeaInputPage() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('light');
  const { user, userTier, userTierLoading } = useAuth();

  // 로그인 시 계정 티어(profile.tier) 사용, 비로그인 시 선택한 tier
  const effectiveTier = user ? userTier : tier;
  const isDeepDraft = effectiveTier === 'pro' || effectiveTier === 'heavy';
  const showTitleSkeleton = user && userTierLoading;

  const handleSubmit = () => {
    if (!idea.trim()) return;
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ idea: idea.trim(), tier: effectiveTier, userId: user?.id ?? null })
    );
    window.location.href = '/ideas/processing';
  };

  return (
    <GrokLayout>
      <div className="flex flex-col items-center gap-8">
        {/* Logo & Title - Minimal, Clean */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <LogoSliced className="w-12 h-12 flex-shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              {showTitleSkeleton ? (
                <span className="inline-block w-24 h-8 animate-pulse bg-muted rounded" />
              ) : (
                isDeepDraft ? 'DeepDraft' : 'Draft'
              )}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-light">
              {showTitleSkeleton ? (
                <span className="inline-block w-40 h-4 animate-pulse bg-muted rounded mt-1" />
              ) : (
                isDeepDraft ? '심층 분석으로 비즈니스 플랜 완성' : 'Make your first Draft'
              )}
            </p>
          </div>
        </motion.div>

        {/* Input Component */}
        <div className="w-full">
          <HeroInput
            value={idea}
            onChange={setIdea}
            onSubmit={handleSubmit}
            tier={effectiveTier}
            onTierChange={setTier}
            disabled={false}
            placeholder="예: 반려견을 위한 AI 건강진단 앱"
            isLoggedIn={!!user}
            tierReadOnly={!!user}
          />
        </div>

        {/* Info Text - Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center max-w-md"
        >
          <p className="text-xs text-muted-foreground font-light">
            AI가 당신의 아이디어를 완벽한 비즈니스 플랜으로 변환합니다
          </p>
        </motion.div>
      </div>
    </GrokLayout>
  );
}
