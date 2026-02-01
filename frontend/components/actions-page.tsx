'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ActionCard, Tier } from '@/lib/types';

interface ActionsPageProps {
  actions: ActionCard[];
  ideaId: string;
  tier: Tier;
}

export function ActionsPage({ actions, ideaId, tier }: ActionsPageProps) {
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);

  const handleExecuteAction = async (actionId: string, actionType: string) => {
    setGeneratingAction(actionId);

    // TODO: API 연동
    console.log('액션 실행:', actionType);

    setTimeout(() => {
      setGeneratingAction(null);
      alert(`${actionType} 생성 완료! (백엔드 연동 후 실제 결과 제공)`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-16 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-16 space-y-4">
          <a 
            href={`/ideas/${ideaId}/report`} 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            ← 리포트로 돌아가기
          </a>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-3">
              실행 액션
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              아이디어를 현실로 만들기 위한 다음 단계를 준비하세요.
            </p>
          </div>
        </div>

        {/* 액션 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {actions.map((action) => (
            <ActionCardComponent
              key={action.id}
              action={action}
              userTier={tier}
              isGenerating={generatingAction === action.id}
              onExecute={() => handleExecuteAction(action.id, action.type)}
            />
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="bg-secondary/30 border border-border rounded-2xl p-8 lg:p-10">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="text-primary">💡</span> 사용 가이드
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">1. 액션 선택</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                필요한 산출물(기획서, MVP 등)을 선택하세요.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">2. 원클릭 생성</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI가 리포트를 분석하여 초안을 자동 작성합니다.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">3. 즉시 활용</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                결과물을 다운로드하여 바로 실무에 투입하세요.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">4. 티어 확장</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                상위 티어에서 더 전문적인 도구를 해제하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 개별 액션 카드 컴포넌트
function ActionCardComponent({
  action,
  userTier,
  isGenerating,
  onExecute,
}: {
  action: ActionCard;
  userTier: Tier;
  isGenerating: boolean;
  onExecute: () => void;
}) {
  const isLocked = action.status === 'locked';
  const tierLevels: Record<Tier, number> = { light: 1, pro: 2, heavy: 3 };
  const canAccess = tierLevels[userTier] >= tierLevels[action.tier];

  const icons: Record<string, string> = {
    'landing-page': '🌐',
    'business-plan': '📄',
    'pitch-deck': '📊',
    'mvp-guide': '💻',
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-8 transition-all duration-300 ${
        isLocked || !canAccess
          ? 'opacity-70 bg-secondary/50 grayscale-[0.5]'
          : 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                !canAccess ? 'bg-muted' : 'bg-primary/10'
            }`}>
              {icons[action.type] || '📦'}
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                {action.tier} Plan
              </p>
            </div>
          </div>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full border border-border">
            {action.estimatedTime}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8 h-10 line-clamp-2">
            {action.description}
        </p>
      </div>

      <div className="mt-auto">
        {!canAccess ? (
          <div className="space-y-3">
             <Button
              disabled
              variant="outline"
              className="w-full bg-transparent border-dashed text-muted-foreground h-12"
            >
              🔒 {action.tier.toUpperCase()} 필요
            </Button>
            <button className="text-xs font-medium text-primary hover:underline w-full text-center">
              지금 업그레이드하고 잠금 해제 →
            </button>
          </div>
        ) : (
          <Button
            onClick={onExecute}
            disabled={isGenerating}
            className="w-full h-12 text-base font-medium shadow-sm"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                생성 중...
              </span>
            ) : (
              '생성 시작하기'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}