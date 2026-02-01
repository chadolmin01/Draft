'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import '@/lib/gsap-config';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;

    if (!trigger || !content) return;

    const getScrollWidth = () => content.scrollWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: () => `+=${getScrollWidth()}`,
        scrub: 1,
        pin: true,
      },
    });

    tl.to(content, {
      x: () => -getScrollWidth(),
      ease: 'none',
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={triggerRef} className={cn('relative overflow-hidden', className)}>
      <div className="h-screen flex items-center overflow-hidden">
        <div
          ref={contentRef}
          className="flex gap-8 lg:gap-16 items-center px-8 lg:px-16 py-8"
          style={{ willChange: 'transform' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
