'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  videoSrc?: string;
  imageSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  videoSrc,
  imageSrc,
  children,
  className,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const content = contentRef.current;
    const scrollIndicator = scrollIndicatorRef.current;

    if (!title || !content) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(
      title,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3 }
    );

    if (subtitle) {
      tl.fromTo(
        subtitle,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      );
    }

    if (children) {
      tl.fromTo(
        content,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );
    }

    if (scrollIndicator) {
      tl.fromTo(
        scrollIndicator,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      );

      gsap.to(scrollIndicator, {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: 1,
      });
    }

    return () => { tl.kill(); };
  }, [title, subtitle, children]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative h-screen min-h-[100dvh] overflow-hidden flex items-center justify-center',
        className
      )}
    >
      {/* Background */}
      {videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1
          ref={titleRef}
          className={cn(
            'text-[clamp(3rem,8vw,8rem)] font-bold tracking-tight',
            'bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200'
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-6 text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </p>
        )}

        {children && (
          <div ref={contentRef} className="mt-12">
            {children}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-white/60">
          Scroll
        </span>
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
