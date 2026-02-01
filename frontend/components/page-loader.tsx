'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

export function PageLoader({
  onComplete,
  duration = 2000,
  className,
}: PageLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const counterRef = useRef<HTMLSpanElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counter = counterRef.current;
    const curtain = curtainRef.current;
    const logo = logoRef.current;

    if (!counter || !curtain || !logo) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete?.();
      },
    });

    // Logo scale in
    tl.fromTo(
      logo,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5 }
    );

    // Counter animation 0-100
    tl.to(
      {},
      {
        duration: duration / 1000 - 0.5,
        onUpdate: function () {
          const progress = this.progress();
          const value = Math.floor(progress * 100);
          counter.textContent = value.toString();
        },
      },
      '-=0.3'
    );

    // Curtain reveal
    tl.to(
      curtain,
      {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut',
      },
      '-=0.5'
    );

    return () => { tl.kill(); };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-black',
        className
      )}
    >
      {/* Curtain */}
      <div
        ref={curtainRef}
        className="absolute inset-0 bg-slate-950 z-10 flex items-center justify-center"
      >
        <div ref={logoRef} className="text-center">
          <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            ✨
          </div>
          <span
            ref={counterRef}
            className="text-4xl font-mono font-bold text-white tabular-nums"
          >
            0
          </span>
          <span className="text-4xl font-mono font-bold text-white/40">%</span>
        </div>
      </div>
    </div>
  );
}
