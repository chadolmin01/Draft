'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BusinessReport } from '@/lib/types';
import { X, Check, Lightbulb, Share2 } from 'lucide-react';

interface ShareDialogProps {
  report: BusinessReport;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ report, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  if (!isOpen) return null;

  // 현재 페이지 URL 생성
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ideas/${report.ideaId}/report`
    : '';

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('링크 복사 실패:', error);
      alert('링크 복사에 실패했습니다');
    }
  };

  // LinkedIn 공유
  const shareToLinkedIn = () => {
    const text = `${report.sections.overview.title} - 사업 계획서`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  // Twitter 공유
  const shareToTwitter = () => {
    const text = `${report.sections.overview.title} - ${report.sections.overview.tagline}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Facebook 공유
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  // Email 공유
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`사업 계획서: ${report.sections.overview.title}`);
    const body = encodeURIComponent(
      `${report.sections.overview.title}\n\n${report.sections.overview.tagline}\n\n다음 링크에서 전체 사업 계획서를 확인하세요:\n${currentUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Web Share API (모바일 지원)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.sections.overview.title,
          text: report.sections.overview.tagline,
          url: currentUrl,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      alert('이 브라우저는 네이티브 공유를 지원하지 않습니다');
    }
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* 다이얼로그 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border/60 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] z-50 p-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">리포트 공유</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 리포트 정보 */}
        <div className="bg-foreground/[0.02] border border-border/60 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-1">{report.sections.overview.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.sections.overview.tagline}
          </p>
        </div>

        {/* 링크 복사 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-muted-foreground mb-2 block">
            공유 링크
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              aria-label="공유 링크 URL"
              className="flex-1 px-4 py-2 bg-foreground/[0.02] border border-border/60 rounded-lg text-sm"
            />
            <Button onClick={copyLink} variant="outline" className="shrink-0">
              {copied ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  복사됨
                </span>
              ) : (
                '복사'
              )}
            </Button>
          </div>
        </div>

        {/* 소셜 미디어 공유 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-muted-foreground mb-3 block">
            소셜 미디어에 공유
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareToLinkedIn}
              variant="outline"
              className="justify-start gap-3 h-12"
            >
              <div className="w-8 h-8 rounded bg-[#0A66C2] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              LinkedIn
            </Button>

            <Button
              onClick={shareToTwitter}
              variant="outline"
              className="justify-start gap-3 h-12"
            >
              <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              X (Twitter)
            </Button>

            <Button
              onClick={shareToFacebook}
              variant="outline"
              className="justify-start gap-3 h-12"
            >
              <div className="w-8 h-8 rounded bg-[#1877F2] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              Facebook
            </Button>

            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="justify-start gap-3 h-12"
            >
              <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Email
            </Button>
          </div>
        </div>

        {/* 네이티브 공유 (모바일) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={shareNative}
            variant="outline"
            className="w-full h-12 justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            더 많은 옵션으로 공유
          </Button>
        )}

        {/* 정보 */}
        <div className="mt-6 p-4 bg-foreground/[0.02] rounded-lg border border-border/60 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-foreground/60" />
          <p className="text-xs text-muted-foreground">
            <strong>참고:</strong> 리포트는 현재 브라우저의 로컬 저장소에 저장되어 있습니다. 
            다른 사람이 링크에 접근하려면 서버 저장소 기능이 필요합니다. (향후 업데이트 예정)
          </p>
        </div>
      </div>
    </>
  );
}

// 공유 버튼 컴포넌트 (report-page에서 사용)
export function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="h-8 text-xs font-medium gap-2"
    >
      <Share2 className="w-4 h-4" />
      공유
    </Button>
  );
}
