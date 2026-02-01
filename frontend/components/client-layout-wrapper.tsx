/**
 * Client-side Layout Wrapper
 * AuthProvider, localStorage 초기화, Storage Monitor, Toast Provider,
 * Mobile Optimizations, Custom Cursor, Smooth Scroll 포함
 */

'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { StorageMonitor } from '@/components/storage-monitor';
import { initStorageCleanup } from '@/lib/storage';
import { ToastProvider, Toaster } from '@/components/ui/toast';
import { initMobileOptimizations } from '@/lib/mobile-utils';
import { CustomCursor } from '@/components/custom-cursor';
import { SmoothScroll } from '@/components/smooth-scroll';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    initStorageCleanup();
    initMobileOptimizations();
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <SmoothScroll enabled={!isMobile}>
          {children}
        </SmoothScroll>
        <CustomCursor enabled={!isMobile} />
        <StorageMonitor />
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  );
}
