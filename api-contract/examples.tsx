/**
 * API 사용 예시 (Frontend)
 * Next.js/React 환경 기준
 */

'use client';

import { useState } from 'react';
import { useStage1, useFullPipeline, useRateLimit, api } from './client';
import type { Tier } from './types';

// ============================================================================
// Example 1: Stage 1 단일 실행
// ============================================================================

export function Stage1Form() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('pro');
  const { analyze, loading, error, data } = useStage1();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await analyze({ idea, tier });
      alert('분석 완료!');
    } catch (err) {
      // error state가 이미 set 되어 있음
      console.error('분석 실패:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="아이디어를 입력하세요"
          rows={5}
        />

        <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
          <option value="light">Light</option>
          <option value="pro">Pro</option>
          <option value="heavy">Heavy</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? '분석 중...' : '아이디어 분석'}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>❌ {error.message}</p>
          {error.code === 'RATE_LIMIT' && (
            <p>한도: {error.details.limit}, 사용: {error.details.used}</p>
          )}
        </div>
      )}

      {data && (
        <div className="result">
          <h3>분석 결과</h3>
          <p><strong>타겟:</strong> {data.target}</p>
          <p><strong>문제:</strong> {data.problem}</p>
          <p><strong>솔루션:</strong> {data.solution}</p>
          <p><strong>신뢰도:</strong> {(data.confidence_score * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Full Pipeline (Step-by-Step UI)
// ============================================================================

export function FullPipelineForm() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('pro');
  const { run, loading, error, data, progress } = useFullPipeline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await run({ idea, tier, includeActions: false }, true); // streaming
      alert('전체 파이프라인 완료!');
    } catch (err) {
      console.error('실패:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="아이디어를 한 줄로"
        />
        <button type="submit" disabled={loading}>
          {loading ? '생성 중...' : '사업계획서 생성'}
        </button>
      </form>

      {loading && progress && (
        <div className="progress">
          <p>Stage {progress.stage}: {progress.message}</p>
          {progress.progress !== undefined && (
            <progress value={progress.progress} max={100} />
          )}
        </div>
      )}

      {error && <p className="error">❌ {error.message}</p>}

      {data && (
        <div className="result">
          <h2>{data.stage3.title}</h2>
          <p>{data.stage3.subtitle}</p>

          <div className="sections">
            {data.stage3.sections.map((section) => (
              <section key={section.id}>
                <h3>{section.title}</h3>
                {section.content && (
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
                {section.subsections?.map((sub) => (
                  <div key={sub.id}>
                    <h4>{sub.title}</h4>
                    <div dangerouslySetInnerHTML={{ __html: sub.content }} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Rate Limit 표시
// ============================================================================

export function RateLimitBadge() {
  const { fetch, loading, data } = useRateLimit();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading || !data) return <div>로딩 중...</div>;

  const percentage = (data.used / data.limit) * 100;

  return (
    <div className="rate-limit-badge">
      <p>
        {data.tier.toUpperCase()} 플랜: {data.used}/{data.limit} 사용
      </p>
      <progress value={data.used} max={data.limit} />
      {percentage > 80 && (
        <p className="warning">⚠️ 사용량이 80%를 넘었습니다!</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Sequential Pipeline (단계별 실행)
// ============================================================================

export function SequentialPipeline() {
  const [idea, setIdea] = useState('');
  const [tier] = useState<Tier>('pro');
  const [stage1Result, setStage1Result] = useState(null);
  const [stage2Result, setStage2Result] = useState(null);
  const [stage3Result, setStage3Result] = useState(null);
  const [loading, setLoading] = useState(false);

  const runStage1 = async () => {
    setLoading(true);
    try {
      const response = await api.analyzeIdea({ idea, tier });
      setStage1Result(response.data);
    } finally {
      setLoading(false);
    }
  };

  const runStage2 = async () => {
    if (!stage1Result) return;
    setLoading(true);
    try {
      const response = await api.analyzeMarket({ stage1Result, tier });
      setStage2Result(response.data);
    } finally {
      setLoading(false);
    }
  };

  const runStage3 = async () => {
    if (!stage1Result || !stage2Result) return;
    setLoading(true);
    try {
      const response = await api.generateReport({
        stage1Result,
        stage2Result,
        tier
      });
      setStage3Result(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sequential-pipeline">
      <div className="step">
        <h3>Step 1: 아이디어 입력</h3>
        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="아이디어"
        />
        <button onClick={runStage1} disabled={loading || !idea}>
          분석 시작
        </button>
        {stage1Result && <div>✅ Stage 1 완료</div>}
      </div>

      <div className="step">
        <h3>Step 2: 시장 분석</h3>
        <button onClick={runStage2} disabled={loading || !stage1Result}>
          시장 분석
        </button>
        {stage2Result && <div>✅ Stage 2 완료</div>}
      </div>

      <div className="step">
        <h3>Step 3: 리포트 생성</h3>
        <button onClick={runStage3} disabled={loading || !stage2Result}>
          리포트 생성
        </button>
        {stage3Result && <div>✅ Stage 3 완료</div>}
      </div>

      {stage3Result && (
        <div className="final-result">
          <h2>🎉 사업계획서 완성!</h2>
          <a href={`/report/${stage3Result.metadata.generated_at}`}>
            보고서 보기
          </a>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Error Handling
// ============================================================================

export function ErrorHandlingExample() {
  const handleApiCall = async () => {
    try {
      const response = await api.analyzeIdea({
        idea: '짧은 아이디어',
        tier: 'pro',
      });
      console.log('성공:', response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.code) {
          case 'RATE_LIMIT':
            alert(`사용량 초과! ${error.details.reset_at}에 리셋됩니다.`);
            break;
          case 'TIER_LIMIT':
            alert('프로 플랜으로 업그레이드하세요.');
            // redirect to pricing page
            window.location.href = '/pricing';
            break;
          case 'INVALID_INPUT':
            alert(`입력 오류: ${error.message}`);
            break;
          case 'AI_API_ERROR':
            alert('AI 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도하세요.');
            break;
          default:
            alert(`오류 발생: ${error.message}`);
        }
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  return <button onClick={handleApiCall}>에러 핸들링 테스트</button>;
}

// ============================================================================
// Example 6: TypeScript Type Guards
// ============================================================================

import type { Stage4Output, LandingPageOutput } from './types';

function isLandingPageOutput(output: Stage4Output): output is LandingPageOutput {
  return 'html_template' in output;
}

export function Stage4Handler({ output }: { output: Stage4Output }) {
  if (isLandingPageOutput(output)) {
    return (
      <div>
        <h3>랜딩페이지 생성 완료</h3>
        <iframe srcDoc={output.html_template} />
      </div>
    );
  }

  // 다른 액션 타입 처리
  return <div>다른 액션 타입</div>;
}

// ============================================================================
// Example 7: Optimistic UI Update
// ============================================================================

export function OptimisticPipeline() {
  const [idea, setIdea] = useState('');
  const [optimisticResult, setOptimisticResult] = useState(null);
  const [actualResult, setActualResult] = useState(null);

  const handleSubmit = async () => {
    // Optimistic update
    setOptimisticResult({
      stage1: { target: '분석 중...', problem: '...', solution: '...' },
    });

    try {
      const response = await api.runFullPipeline({ idea, tier: 'pro' });
      setActualResult(response.data);
      setOptimisticResult(null);
    } catch (err) {
      setOptimisticResult(null);
      alert('실패');
    }
  };

  const displayResult = actualResult || optimisticResult;

  return (
    <div>
      <button onClick={handleSubmit}>생성</button>
      {displayResult && (
        <div className={optimisticResult ? 'loading' : ''}>
          {/* 결과 표시 */}
        </div>
      )}
    </div>
  );
}
