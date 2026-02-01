'use client';

import { useState } from 'react';
import type { Stage1Output, ApiResponse, Tier } from '@/types/api';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [tier, setTier] = useState<Tier>('pro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Stage1Output | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/stage1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, tier }),
      });

      const data: ApiResponse<Stage1Output> = await response.json();

      if (!data.success) {
        setError(data.error?.message || '오류가 발생했습니다.');
        return;
      }

      setResult(data.data!);
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">
          AI 스타트업 플랫폼
        </h1>
        <p className="text-center text-gray-600 mb-8">
          아이디어 하나로 사업계획서 자동 생성
        </p>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                아이디어를 입력하세요
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="예: 대학교 커피 찌꺼기로 굿즈를 만드는 사업"
                className="w-full h-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                티어 선택
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={loading}
              >
                <option value="light">Light (기본)</option>
                <option value="pro">Pro (수익 분석 포함)</option>
                <option value="heavy">Heavy (심화 분석)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || idea.length < 10}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '분석 중...' : '아이디어 분석 시작'}
            </button>
          </form>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              AI가 아이디어를 분석하고 있습니다... (30초 소요)
            </p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">분석 결과</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">타겟 고객</h3>
                <p className="text-gray-700">{result.target}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">문제점</h3>
                <p className="text-gray-700">{result.problem}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">솔루션</h3>
                <p className="text-gray-700">{result.solution}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">신뢰도</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-purple-600 h-4 rounded-full"
                      style={{
                        width: `${result.confidence_score * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-4 font-semibold">
                    {(result.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {result.confidence_reason}
                </p>
              </div>

              {/* Pro 티어: 수익 분석 */}
              {result.revenue_analysis && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">
                    💰 수익 모델 분석 (Pro)
                  </h3>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">수익원</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {result.revenue_analysis.revenue_streams.map(
                        (stream, i) => (
                          <li key={i}>{stream}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">가격 전략</h4>
                    <p className="text-gray-700">
                      {result.revenue_analysis.pricing_strategy}
                    </p>
                  </div>

                  {result.monetization_difficulty && (
                    <div>
                      <h4 className="font-medium mb-2">수익화 난이도</h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          result.monetization_difficulty === '낮음'
                            ? 'bg-green-100 text-green-800'
                            : result.monetization_difficulty === '중간'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.monetization_difficulty}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {result.monetization_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* JSON 다운로드 */}
              <div className="border-t pt-6">
                <button
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify(result, null, 2)],
                      { type: 'application/json' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'stage1-result.json';
                    a.click();
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  📥 JSON 다운로드
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
