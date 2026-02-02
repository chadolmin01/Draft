'use client';

import { IdeaAnalysisPage } from '@/components/idea-analysis-page';
import { GrokLayout } from '@/components/grok-layout';
import { LogoSliced } from '@/components/logo-sliced';
import { getMockIdea } from '@/lib/mock-data';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function LoadingView() {
  return (
    <GrokLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-foreground/15 border-t-foreground/60 animate-spin" />
          <LogoSliced className="relative w-12 h-12 text-foreground/90" />
        </div>
        <p className="text-sm text-muted-foreground">아이디어를 분석하고 있습니다...</p>
      </div>
    </GrokLayout>
  );
}

export default function IdeaPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const isDemoId = id?.startsWith('demo-');
      const mockData = getMockIdea(id);

      if (isDemoId && mockData) {
        setData(mockData);
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`idea_${id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setData(parsed);
            setLoading(false);
            return;
          } catch {
            // parse 실패 시 API 시도
          }
        }
      }

      try {
        const res = await fetch(`/api/ideas/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const apiData = json.data;
            const stage2 = json.stage2;
            const stage2Deep = json.stage2Deep;
            const report = json.report;
            if (typeof window !== 'undefined') {
              localStorage.setItem(`idea_${id}`, JSON.stringify(apiData));
              if (stage2) localStorage.setItem(`idea_${id}_stage2`, JSON.stringify(stage2));
              if (stage2Deep?.market) localStorage.setItem(`idea_${id}_deep_market-deep`, JSON.stringify(stage2Deep.market));
              if (stage2Deep?.strategy) localStorage.setItem(`idea_${id}_deep_strategy`, JSON.stringify(stage2Deep.strategy));
              if (stage2Deep?.external) localStorage.setItem(`idea_${id}_deep_external`, JSON.stringify(stage2Deep.external));
              if (report) localStorage.setItem(`idea_${id}_report`, JSON.stringify(report));
            }
            setData({
              idea: apiData.idea,
              analysis: apiData.analysis,
              currentStage: apiData.currentStage,
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // API 실패 시 localStorage 폴백
      }

      const stored = typeof window !== 'undefined' ? localStorage.getItem(`idea_${id}`) : null;
      if (stored) {
        setData(JSON.parse(stored));
      } else if (mockData) {
        setData(mockData);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return <LoadingView />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 px-6">
          <div className="space-y-3">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-foreground">아이디어를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">잘못된 링크이거나 만료된 데이터입니다.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              ← 홈으로 돌아가기
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              뒤로 가기
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            💡 Tip: localStorage가 삭제되었을 수 있습니다. 개발자 도구에서 확인해보세요.
          </div>
        </div>
      </div>
    );
  }

  return <IdeaAnalysisPage data={data} />;
}
