/**
 * 공통 에러 컴포넌트
 */

import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  fullScreen?: boolean;
}

export function ErrorDisplay({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  onBack,
  fullScreen = true,
}: ErrorDisplayProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-12';

  return (
    <div className={containerClass}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😞</div>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>다시 시도</Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline">
              돌아가기
            </Button>
          )}
          {!onRetry && !onBack && (
            <Button onClick={() => window.location.href = '/'}>
              홈으로 가기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
}

export function ApiErrorDisplay({ error }: { error: any }) {
  let message = '알 수 없는 오류가 발생했습니다.';

  if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return <InlineError message={message} />;
}
