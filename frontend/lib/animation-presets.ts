/**
 * Reusable Animation Presets
 * For Framer Motion and GSAP compatibility
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] },
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.6, ease: 'backOut' },
};

export const clipReveal = {
  initial: { clipPath: 'inset(100% 0% 0% 0%)' },
  animate: { clipPath: 'inset(0% 0% 0% 0%)' },
  transition: { duration: 1.2, ease: [0.6, 0.05, 0.01, 0.9] },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -80 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] },
};

export const slideInRight = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};
