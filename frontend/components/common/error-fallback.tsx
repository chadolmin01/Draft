/**
 * 공통 에러 폴백 컴포넌트
 * localStorage 캐시 삭제 등으로 데이터를 찾을 수 없을 때 표시
 */

'use client';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showTip?: boolean;
}

export function ErrorFallback({
  title = '아이디어를 찾을 수 없습니다',
  message = '잘못된 링크이거나 만료된 데이터입니다.',
  showBackButton = true,
  showTip = true,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-6 max-w-md">
        <div className="space-y-3">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            ← 홈으로 돌아가기
          </a>
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              뒤로 가기
            </button>
          )}
        </div>
        
        {showTip && (
          <div className="text-xs text-muted-foreground border border-border/50 rounded-lg p-3 bg-secondary/20">
            💡 <strong>Tip:</strong> localStorage가 삭제되었을 수 있습니다.
            <br />
            개발자 도구 (F12) → Application → Local Storage를 확인해보세요.
          </div>
        )}
      </div>
    </div>
  );
}
