'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Tier } from '@/lib/types';
import { isMockMode } from '@/lib/mock-mode';
import { HeroInput } from '@/components/hero-input';
import { GrokLayout } from '@/components/grok-layout';
import { LogoSliced } from '@/components/logo-sliced';

export function IdeaInputPage() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('light');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (isMockMode()) headers['x-mock-mode'] = 'true';

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers,
        body: JSON.stringify({ idea, tier }),
      });
      const result = await response.json();

      if (result.success) {
        // API 응답을 컴포넌트가 기대하는 구조로 변환
        const transformedData = {
          idea: {
            id: result.data.id,
            idea: result.data.idea,
            tier: result.data.tier,
            createdAt: result.data.createdAt,
            stage: result.data.stage,
          },
          analysis: result.data.analysis,
          currentStage: result.data.stage,
        };
        localStorage.setItem(`idea_${result.data.id}`, JSON.stringify(transformedData));
        window.location.href = `/ideas/${result.data.id}`;
      } else {
        alert('오류가 발생했습니다: ' + result.error.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
      alert('API 호출에 실패했습니다.');
      setLoading(false);
    }
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
              DRAFT
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-light">
              Make your first Draft
            </p>
          </div>
        </motion.div>

        {/* Input Component */}
        <div className="w-full">
          <HeroInput
            value={idea}
            onChange={setIdea}
            onSubmit={handleSubmit}
            tier={tier}
            onTierChange={setTier}
            disabled={loading}
            placeholder="예: 반려견을 위한 AI 건강진단 앱"
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
