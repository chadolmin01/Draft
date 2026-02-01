'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { cn } from '@/lib/utils';

interface CanvasWrapperProps {
  children: React.ReactNode;
  className?: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

export function CanvasWrapper({
  children,
  className,
  camera = { position: [0, 0, 5], fov: 50 },
}: CanvasWrapperProps) {
  return (
    <div className={cn('w-full h-full min-h-[400px]', className)}>
      <Canvas
        camera={{
          position: camera.position,
          fov: camera.fov,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#666" wireframe />
            </mesh>
          }
        >
          {children}
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
              blendFunction={BlendFunction.ADD}
            />
            <Vignette
              offset={0.3}
              darkness={0.5}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
