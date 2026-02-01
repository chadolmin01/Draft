'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDuration } from '@/lib/motion-utils';

/**
 * Hook to safely get reduced motion preference after hydration
 */
function useSafeReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return shouldReduceMotion;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      transition={{ duration: getDuration(shouldReduceMotion, 0.3), ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: getDuration(shouldReduceMotion, duration), 
        delay: shouldReduceMotion ? 0 : delay, 
        ease: 'easeOut' 
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: getDuration(shouldReduceMotion, duration), 
        delay: shouldReduceMotion ? 0 : delay, 
        ease: 'easeOut' 
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.3,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: getDuration(shouldReduceMotion, duration), 
        delay: shouldReduceMotion ? 0 : delay, 
        ease: 'easeOut' 
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
}) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0.01 : 0.3,
          }
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Curtain wipe page transition */
export function CurtainTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ clipPath: shouldReduceMotion ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      exit={{ clipPath: shouldReduceMotion ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
      transition={{ duration: getDuration(shouldReduceMotion, 0.6), ease: [0.6, 0.05, 0.01, 0.9] }}
    >
      {children}
    </motion.div>
  );
}

/** Elastic scale page transition */
export function ElasticTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useSafeReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.05 }}
      transition={{ 
        duration: getDuration(shouldReduceMotion, 0.5), 
        ease: [0.34, 1.56, 0.64, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}
