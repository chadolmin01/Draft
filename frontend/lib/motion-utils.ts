/**
 * Motion Utilities for Framer Motion with accessibility support
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Get animation config based on reduced motion preference
 */
export function getAnimationConfig(shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.01 }
    };
  }
  return null; // Use component's default animations
}

/**
 * Fade variants with reduced motion support
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Slide up variants with reduced motion support
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Scale variants with reduced motion support
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

/**
 * Stagger container variants
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Default transition config
 */
export const defaultTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut',
};

/**
 * Spring transition config
 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Get duration based on reduced motion
 */
export function getDuration(shouldReduceMotion: boolean, defaultDuration: number = 0.3): number {
  return shouldReduceMotion ? 0.01 : defaultDuration;
}
