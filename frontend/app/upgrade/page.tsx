'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Check, Zap, Clock, Image, ListTodo, Users, Mic, FlaskConical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoSliced } from '@/components/logo-sliced';

type PlanMode = 'subscription' | 'tokens';

const subscriptionPlans = [
  {
    id: 'light',
    name: 'Draft',
    price: 'Free',
    priceSub: '',
    cta: 'Current Plan',
    ctaVariant: 'outline' as const,
    popular: false,
    features: [
      { icon: Check, text: '기본 아이디어 분석' },
      { icon: Clock, text: '단기 컨텍스트 메모리' },
      { icon: Image, text: 'Draft 티어 시각화' },
      { icon: ListTodo, text: '기본 태스크 관리' },
    ],
  },
  {
    id: 'pro',
    name: 'DeepDraft Pro',
    price: '$5',
    priceSub: '/month',
    cta: 'Upgrade to Pro',
    ctaVariant: 'primary' as const,
    popular: true,
    features: [
      { icon: Zap, text: '심층 분석 잠금 해제' },
      { icon: Check, text: '시장·수익·경쟁사 상세 리포트' },
      { icon: Clock, text: '확장 메모리 (128k 토큰)' },
      { icon: Users, text: '팀 협업 및 공유' },
      { icon: Mic, text: '우선순위 지원' },
      { icon: Plus, text: 'Draft 기능 전체 포함' },
    ],
  },
  {
    id: 'heavy',
    name: 'DeepDraft Heavy',
    price: '$20',
    priceSub: '/month',
    cta: 'Contact Sales',
    ctaVariant: 'secondary' as const,
    popular: false,
    features: [
      { icon: FlaskConical, text: 'Heavy 전용 모델 접근' },
      { icon: Clock, text: '무제한급 메모리 (256k+ 토큰)' },
      { icon: Image, text: '초고해상도 설계도 생성' },
      { icon: Zap, text: '전용 API 속도 보장' },
      { icon: Check, text: '24/7 전담 매니저 지원' },
      { icon: Plus, text: 'Pro 기능 전체 포함' },
    ],
  },
];

const tokenPacks = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$5',
    priceSub: '1,000 토큰',
    cta: '구매하기',
    ctaVariant: 'outline' as const,
    popular: false,
    features: [
      { icon: Zap, text: 'Pro/Heavy 분석 약 10회' },
      { icon: Clock, text: '유효기간 30일' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$40',
    priceSub: '10,000 토큰',
    cta: '구매하기',
    ctaVariant: 'primary' as const,
    popular: true,
    features: [
      { icon: Zap, text: 'Pro/Heavy 분석 약 100회' },
      { icon: Check, text: '20% 할인' },
      { icon: Clock, text: '유효기간 90일' },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$150',
    priceSub: '50,000 토큰',
    cta: '구매하기',
    ctaVariant: 'secondary' as const,
    popular: false,
    features: [
      { icon: Zap, text: 'Pro/Heavy 분석 약 500회' },
      { icon: Check, text: '40% 할인' },
      { icon: Clock, text: '유효기간 180일' },
    ],
  },
];

export default function UpgradePage() {
  const [planMode, setPlanMode] = useState<PlanMode>('subscription');
  const plans = planMode === 'subscription' ? subscriptionPlans : tokenPacks;

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-auto">
      {/* Grid background - matches home */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="w-full h-full opacity-[0.04] dark:opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="upgrade-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="upgrade-grid-macro" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#upgrade-grid)" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#upgrade-grid-macro)" className="text-foreground" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-2.5 md:px-8 md:py-3 w-full shrink-0">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <LogoSliced className="w-6 h-6 md:w-7 md:h-7" />
            <span className="font-semibold text-xs md:text-sm text-foreground tracking-tight">Draft</span>
          </Link>
          <Link
            href="/"
            className="p-1.5 rounded-full hover:bg-secondary/80 dark:hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </Link>
        </header>

        {/* Main - full width edge to edge */}
        <main className="flex-1 flex flex-col items-stretch justify-start w-full px-4 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8 max-w-5xl mx-auto">
          {/* Title - DeepDraft */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-3 md:mb-4"
          >
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              DeepDraft
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-light mt-1.5">
              Pro/Heavy 플랜으로 심층 분석을 사용해보세요
            </p>
          </motion.div>

          {/* Plan mode toggle - 구독 / 토큰 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <div className="inline-flex p-0.5 rounded-full bg-secondary/50 border border-border/50">
              <button
                onClick={() => setPlanMode('subscription')}
                className={cn(
                  'w-12 py-1.5 text-xs font-medium rounded-full transition-colors',
                  planMode === 'subscription'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                구독
              </button>
              <button
                onClick={() => setPlanMode('tokens')}
                className={cn(
                  'w-12 py-1.5 text-xs font-medium rounded-full transition-colors',
                  planMode === 'tokens'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                토큰
              </button>
            </div>
          </motion.div>

          {/* Plan cards - 동일 레이아웃, 내용만 전환 */}
          <div className="grid md:grid-cols-3 gap-3 md:gap-4 w-full min-h-[280px] mt-4 md:mt-8">
            {plans.map((plan, i) => (
              <PlanCard
                key={`${planMode}-${plan.id}`}
                plan={plan}
                mode={planMode}
                index={i}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

type PlanItem = (typeof subscriptionPlans)[0] | (typeof tokenPacks)[0];

function PlanCard({
  plan,
  mode,
  index,
}: {
  plan: PlanItem;
  mode: PlanMode;
  index: number;
}) {
  const isPopular = plan.popular;
  const href = mode === 'subscription' && plan.id === 'light' ? '/' : '/signup';

  return (
    <div
      className={cn(
        'relative flex flex-col p-4 md:p-5 rounded-3xl border bg-background/80 backdrop-blur-sm h-full',
        isPopular ? 'border-foreground/15 shadow-sm' : 'border-border/25'
      )}
    >
      {isPopular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-medium rounded-full bg-foreground text-background">
          Popular
        </span>
      )}
      <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-xl font-bold text-foreground">{plan.price}</span>
        {plan.priceSub && (
          <span className="text-xs text-muted-foreground ml-0.5">{plan.priceSub}</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 flex-1 min-h-0">
        {plan.features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Icon className="h-3 w-3 shrink-0 mt-0.5 text-foreground/60" />
              <span>{feature.text}</span>
            </li>
          );
        })}
      </ul>
      <Link
        href={href}
        className={cn(
          'w-full py-2 rounded-full text-xs font-medium text-center transition-colors mt-4 shrink-0',
          plan.ctaVariant === 'primary'
            ? 'bg-foreground text-background hover:opacity-90'
            : plan.ctaVariant === 'secondary'
              ? 'bg-secondary/60 text-foreground hover:bg-secondary/80 border border-border/50'
              : 'bg-secondary/40 text-foreground hover:bg-secondary/60 border border-border/50'
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
