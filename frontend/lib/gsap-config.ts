/**
 * GSAP Configuration
 * ScrollTrigger, common ease functions, and animation presets
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Common ease functions
export const eases = {
  power4: {
    in: 'power4.in',
    out: 'power4.out',
    inOut: 'power4.inOut',
  },
  expo: {
    in: 'expo.in',
    out: 'expo.out',
    inOut: 'expo.inOut',
  },
  back: {
    in: 'back.in',
    out: 'back.out',
    inOut: 'back.inOut',
  },
  elastic: {
    in: 'elastic.in',
    out: 'elastic.out',
    inOut: 'elastic.inOut',
  },
  custom: [0.6, 0.05, 0.01, 0.9] as [number, number, number, number],
} as const;

// Reusable animation presets
export const animationPresets = {
  fadeInUp: {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: eases.custom,
  },
  fadeInDown: {
    opacity: 0,
    y: -60,
    duration: 0.8,
    ease: eases.custom,
  },
  scaleIn: {
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: 'back.out',
  },
  clipReveal: {
    clipPath: 'inset(100% 0% 0% 0%)',
    duration: 1.2,
    ease: 'power4.out',
  },
  stagger: {
    stagger: 0.1,
    duration: 0.5,
    ease: eases.custom,
  },
} as const;

// ScrollTrigger defaults
export function setupScrollTriggerDefaults() {
  ScrollTrigger.defaults({
    toggleActions: 'play none none reverse',
  });
}

// Kill all ScrollTrigger instances (for cleanup)
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

export { gsap, ScrollTrigger };
