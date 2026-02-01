'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface CustomCursorProps {
  className?: string;
  enabled?: boolean;
}

export function CustomCursor({ className, enabled = true }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    cursor.style.display = 'block';

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, textarea, [data-cursor="pointer"]');
      setIsHovering(!!interactive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);

    const quickToCursor = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
    const quickToCursorY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });

    let rafId: number;
    const animate = () => {
      const { x, y } = mouseRef.current;

      quickToCursor(x);
      quickToCursorY(y);
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      gsap.set(cursorDot, { x, y, xPercent: -50, yPercent: -50 });

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    if (isHovering) {
      gsap.to(cursor, { scale: 1.5, duration: 0.2 });
      gsap.to(cursorDot, { scale: 0.5, duration: 0.2 });
    } else {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
      gsap.to(cursorDot, { scale: 1, duration: 0.2 });
    }
  }, [isHovering]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (isClicking) {
      gsap.to(cursor, { scale: 0.8, duration: 0.1 });
    } else {
      gsap.to(cursor, { scale: isHovering ? 1.5 : 1, duration: 0.2 });
    }
  }, [isClicking, isHovering]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className={cn(
          'fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] rounded-full border-2 border-primary',
          'opacity-0 transition-opacity duration-300',
          'hidden md:block',
          className
        )}
        style={{ willChange: 'transform' }}
      />
      <div
        ref={cursorDotRef}
        className={cn(
          'fixed top-0 left-0 w-2 h-2 pointer-events-none z-[9999] rounded-full bg-primary',
          'opacity-0 md:opacity-100 transition-opacity duration-300',
          'hidden md:block'
        )}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
