/**
 * 3D Components - Lazy loaded for performance
 */

import dynamic from 'next/dynamic';

export const IdeaVisualization = dynamic(
  () => import('./idea-visualization').then((mod) => ({ default: mod.IdeaVisualization })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-xl">
        <div className="animate-pulse w-24 h-24 rounded-full bg-primary/20" />
      </div>
    ),
  }
);

export const FloatingShapes = dynamic(
  () => import('./floating-shapes').then((mod) => ({ default: mod.FloatingShapes })),
  { ssr: false }
);

export { CanvasWrapper } from './canvas-wrapper';
