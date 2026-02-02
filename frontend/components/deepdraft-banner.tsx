'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function DeepDraftBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative flex items-center gap-4 pl-4 pr-10 py-3 bg-black rounded-xl shadow-xl border border-white/20 overflow-hidden">
        {/* Blueprint/design drawing grid overlay */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="deepdraft-banner-micro" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <pattern id="deepdraft-banner-macro" width="48" height="48" patternUnits="userSpaceOnUse">
                <rect width="48" height="48" fill="url(#deepdraft-banner-micro)" />
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#deepdraft-banner-macro)" />
          </svg>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors z-10"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative z-10 flex flex-col">
          <span className="text-lg font-semibold text-white">DeepDraft</span>
          <span className="text-xs text-white/70">Pro/Heavy 기능을 사용해보세요</span>
        </div>
        <Link
          href="/upgrade"
          className="relative z-10 shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
