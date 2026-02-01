/**
 * Mobile and Touch Utilities
 */

/**
 * Check if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get viewport height accounting for mobile browser UI
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
}

/**
 * Set CSS custom property for dynamic viewport height
 */
export function setDynamicViewportHeight(): void {
  if (typeof window === 'undefined') return;
  
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Initialize mobile optimizations
 */
export function initMobileOptimizations(): void {
  if (typeof window === 'undefined') return;
  
  // Set initial viewport height
  setDynamicViewportHeight();
  
  // Update on resize (throttled)
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setDynamicViewportHeight, 100);
  });
  
  // Add touch class to body for CSS targeting
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }
  
  // Add mobile class to body for CSS targeting
  if (isMobile()) {
    document.body.classList.add('mobile-device');
  }
  
  // Prevent pull-to-refresh on mobile (optional)
  document.body.style.overscrollBehavior = 'none';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
