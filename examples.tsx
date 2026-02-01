/**
 * 실전 사용 예시
 * 프론트엔드 개발자용
 */

'use client';

import { apiClient, useCreateIdea, useIdea, useGenerateReport, getErrorMessage } from './client';
import type { Tier } from './types';

// ============================================
// 예시 1: 메인 입력 페이지 (Stage 1)
// ============================================

export function IdeaInputPage() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('light');
  const { create, loading, error } = useCreateIdea();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idea.trim()) {
      alert('아이디어를 입력해주세요');
      return;
    }

    try {
      const result = await create({ idea, tier });
      // Stage 1 완료 → Stage 2로 이동
      router.push(`/ideas/${result.id}`);
    } catch (err) {
      // 에러는 이미 상태에 저장됨
      console.error('아이디어 생성 실패:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-center mb-2">
          무한한 아이디어를 펼쳐보세요
        </h1>
        <p className="text-gray-600 text-center mb-8">
          간단한 아이디어 입력만으로 완전한 사업계획이 만들어집니다
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 티어 선택 */}
          <div className="flex gap-4 justify-center">
            {(['light', 'pro', 'heavy'] as Tier[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  tier === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* 아이디어 입력 */}
          <div className="relative">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="예: AI 기반 헬스케어 플랫폼"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-600 focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {getErrorMessage(error)}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? '분석 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// 예시 2: 아이디어 분석 페이지 (Stage 2)
// ============================================

export function IdeaAnalysisPage({ ideaId }: { ideaId: string }) {
  const { data, loading, error } = useIdea(ideaId, {
    poll: true, // 자동 폴링
    pollInterval: 3000,
  });

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">아이디어를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{getErrorMessage(error)}</div>
      </div>
    );
  }

  const analysis = data?.analysis;
  const tier = data?.idea.tier;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">아이디어 분석</h1>

      {/* 기본 분석 (모든 티어) */}
      <div className="space-y-6">
        <AnalysisCard title="타겟 고객" content={analysis?.target} />
        <AnalysisCard title="해결하려는 문제" content={analysis?.problem} />
        <AnalysisCard title="솔루션" content={analysis?.solution} />
      </div>

      {/* 상세 분석 (프로 이상) */}
      {tier === 'light' ? (
        <div className="mt-8 relative">
          <div className="blur-sm select-none pointer-events-none">
            <AnalysisCard title="시장 규모" content="TAM: 10조원, SAM: 1조원..." />
            <AnalysisCard title="경쟁사 분석" content="네이버 헬스케어, 카카오..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="font-semibold mb-2">프로 티어에서 사용 가능</p>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                업그레이드
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {analysis?.marketSize && (
            <AnalysisCard
              title="시장 규모"
              content={`TAM: ${analysis.marketSize.tam}, SAM: ${analysis.marketSize.sam}, SOM: ${analysis.marketSize.som}`}
            />
          )}
          {analysis?.competitors && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">경쟁사 분석</h3>
              <div className="space-y-4">
                {analysis.competitors.map((comp, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-600 pl-4">
                    <h4 className="font-medium">{comp.name}</h4>
                    <p className="text-sm text-gray-600">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 다음 단계 버튼 */}
      <div className="mt-12">
        <button
          onClick={() => window.location.href = `/ideas/${ideaId}/report`}
          className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg"
        >
          리포트 생성하기
        </button>
      </div>
    </div>
  );
}

function AnalysisCard({ title, content }: { title: string; content?: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold mb-2 text-indigo-600">{title}</h3>
      <p className="text-gray-700">{content || '...'}</p>
    </div>
  );
}

// ============================================
// 예시 3: 리포트 페이지 (Stage 3) - 노션 스타일
// ============================================

export function ReportPage({ ideaId }: { ideaId: string }) {
  const { data, loading } = useIdea(ideaId);
  const report = data?.report;

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GenerateReportButton ideaId={ideaId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 노션 스타일 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{report.sections.overview.title}</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            PDF 다운로드
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 목차 */}
        <aside className="w-64 bg-white border-r h-screen sticky top-16 p-6">
          <nav className="space-y-2">
            <NavLink href="#overview">사업 개요</NavLink>
            <NavLink href="#market">시장 분석</NavLink>
            <NavLink href="#competitors">경쟁사 분석</NavLink>
            <NavLink href="#monetization">수익화 모델</NavLink>
            <NavLink href="#structure">사업 구조</NavLink>
            <NavLink href="#development">개발 가이드</NavLink>
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 max-w-3xl mx-auto px-8 py-12">
          <section id="overview" className="mb-16">
            <h2 className="text-3xl font-bold mb-4">사업 개요</h2>
            <p className="text-xl text-gray-600 mb-4">{report.sections.overview.tagline}</p>
            <p className="text-gray-700 leading-relaxed">{report.sections.overview.description}</p>
          </section>

          <section id="market" className="mb-16">
            <h2 className="text-3xl font-bold mb-4">시장 분석</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">시장 규모</h3>
              <ul className="space-y-2">
                <li>TAM: {report.sections.market.size.tam}</li>
                <li>SAM: {report.sections.market.size.sam}</li>
                <li>SOM: {report.sections.market.size.som}</li>
              </ul>
            </div>
          </section>

          {/* 나머지 섹션들... */}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
    >
      {children}
    </a>
  );
}

function GenerateReportButton({ ideaId }: { ideaId: string }) {
  const { generate, loading, progress } = useGenerateReport(ideaId);

  return (
    <div className="text-center">
      <button
        onClick={generate}
        disabled={loading}
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg disabled:bg-gray-300"
      >
        {loading ? `생성 중... ${progress}%` : '리포트 생성하기'}
      </button>
    </div>
  );
}

// ============================================
// 예시 4: 액션 카드 섹션 (Stage 4)
// ============================================

export function ActionCardsSection({ ideaId }: { ideaId: string }) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.getActions(ideaId).then(setActions);
  }, [ideaId]);

  const handleExecuteAction = async (actionType: string) => {
    setLoading(true);
    try {
      const result = await apiClient.executeAction({ ideaId, actionType: actionType as any });
      alert('액션이 생성되었습니다!');
      // 결과 페이지로 이동
    } catch (err) {
      alert(getErrorMessage(err as any));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {actions.map((action) => (
        <div
          key={action.id}
          className={`bg-white p-6 rounded-lg shadow ${
            action.status === 'locked' ? 'opacity-50' : ''
          }`}
        >
          <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{action.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{action.estimatedTime}</span>
            <button
              onClick={() => handleExecuteAction(action.type)}
              disabled={action.status === 'locked' || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:bg-gray-300"
            >
              {action.status === 'locked' ? '잠김' : '생성하기'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 예시 5: 피드백 제출 (프로 티어)
// ============================================

export function FeedbackForm({ ideaId }: { ideaId: string }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const result = await apiClient.submitFeedback({
        ideaId,
        feedback,
      });

      alert('분석이 업데이트되었습니다!');
      window.location.reload(); // 실제로는 상태 업데이트
    } catch (err) {
      const error = err as any;
      if (error.isTierLocked()) {
        alert('이 기능은 프로 티어 이상에서 사용 가능합니다.');
      } else {
        alert(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="수정하고 싶은 내용을 입력하세요"
        className="w-full p-4 border rounded-lg"
        rows={4}
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg"
      >
        {loading ? '업데이트 중...' : '피드백 제출'}
      </button>
    </form>
  );
}

// ============================================
// 예시 6: 에러 핸들링
// ============================================

export function ErrorBoundaryExample() {
  const [error, setError] = useState<any>(null);

  const handleAction = async () => {
    try {
      await apiClient.createIdea({ idea: 'Test', tier: 'invalid' as any });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      <button onClick={handleAction}>테스트</button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-semibold">{error.code}</p>
          <p className="text-red-500">{getErrorMessage(error)}</p>
          {error.details && (
            <pre className="mt-2 text-xs">{JSON.stringify(error.details, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 예시 7: 티어별 UI 분기
// ============================================

export function TierGatedFeature({ tier, requiredTier, children }: {
  tier: Tier;
  requiredTier: Tier;
  children: React.ReactNode;
}) {
  const canAccess = canUseTierFeature(tier, requiredTier);

  if (!canAccess) {
    return (
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="font-semibold mb-2">
              {requiredTier.toUpperCase()} 티어 필요
            </p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
              업그레이드
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// React imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canUseTierFeature } from './client';
