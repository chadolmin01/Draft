/**
 * localStorage 모니터링 및 관리 컴포넌트
 * 개발 중에만 표시
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getStorageSize,
  getAllIdeas,
  cleanupOldItems,
  keepRecentIdeas,
  removeIdeaData,
  initStorageCleanup,
} from '@/lib/storage';
import { isMockMode, enableMockMode, disableMockMode } from '@/lib/mock-mode';

export function StorageMonitor() {
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5, percentage: 0 });
  const [ideas, setIdeas] = useState<Array<{ id: string; timestamp: number }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  // 개발 환경에서만 표시
  const isDev = process.env.NODE_ENV === 'development';

  const refreshData = () => {
    setStorageInfo(getStorageSize());
    setIdeas(getAllIdeas());
  };

  useEffect(() => {
    if (!isDev) return;
    refreshData();
    setMockMode(isMockMode());
  }, [isDev]);

  const handleCleanupExpired = () => {
    const count = cleanupOldItems();
    alert(`만료된 항목 ${count}개를 삭제했습니다.`);
    refreshData();
  };

  const handleKeepRecent = () => {
    const count = keepRecentIdeas(10);
    alert(`오래된 아이디어 ${count}개를 삭제했습니다. (최근 10개 유지)`);
    refreshData();
  };

  const handleDeleteIdea = (ideaId: string) => {
    if (confirm(`아이디어 "${ideaId}"의 모든 데이터를 삭제하시겠습니까?`)) {
      removeIdeaData(ideaId);
      alert('삭제되었습니다.');
      refreshData();
    }
  };

  const handleToggleMock = () => {
    if (mockMode) {
      disableMockMode();
      setMockMode(false);
    } else {
      enableMockMode();
      setMockMode(true);
    }
    alert(`Mock 모드: ${!mockMode ? 'ON' : 'OFF'}`);
  };

  const handleClearAll = () => {
    if (confirm('모든 localStorage 데이터를 삭제하시겠습니까? (복구 불가)')) {
      localStorage.clear();
      alert('모든 데이터가 삭제되었습니다.');
      refreshData();
    }
  };

  if (!isDev) return null;

  return (
    <>
      {/* 플로팅 버튼 */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="rounded-full w-12 h-12 p-0 shadow-lg"
          title="Storage Monitor"
        >
          <span className="text-lg">💾</span>
        </Button>
      </div>

      {/* 모니터 패널 */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">localStorage Monitor</h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            
            {/* 사용량 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">사용량</span>
                <span className="font-mono font-semibold">
                  {storageInfo.used}MB / {storageInfo.total}MB
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    storageInfo.percentage > 80
                      ? 'bg-red-500'
                      : storageInfo.percentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {storageInfo.percentage}% 사용 중
              </div>
            </div>
          </div>

          {/* 아이디어 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              저장된 아이디어 ({ideas.length}개)
            </div>
            {ideas.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">
                저장된 아이디어가 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg text-xs hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="font-mono truncate">{idea.id}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {new Date(idea.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteIdea(idea.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="p-4 border-t border-border bg-secondary/10 space-y-2">
            <Button
              onClick={() => window.location.href = '/'}
              variant="default"
              size="sm"
              className="w-full text-xs font-semibold"
            >
              🏠 홈으로 가기
            </Button>
            <Button
              onClick={handleToggleMock}
              variant={mockMode ? "default" : "outline"}
              size="sm"
              className="w-full text-xs"
            >
              {mockMode ? '🟢 Mock 모드 ON' : '⚪ Mock 모드 OFF'}
            </Button>
            <div className="h-px bg-border my-2" />
            <Button
              onClick={handleCleanupExpired}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🗑️ 만료된 항목 정리
            </Button>
            <Button
              onClick={handleKeepRecent}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              📦 최근 10개만 유지
            </Button>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🔄 새로고침
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="w-full text-xs text-destructive hover:bg-destructive/10"
            >
              ⚠️ 전체 삭제
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
