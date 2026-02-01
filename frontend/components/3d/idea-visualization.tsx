'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { CanvasWrapper } from './canvas-wrapper';

interface IdeaVisualizationProps {
  idea?: string;
  className?: string;
}

function IdeaShape() {
  const meshRef = useRef<Mesh>(null);
  const targetScaleRef = useRef(new Vector3(1, 1, 1));
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.2 + (hovered ? 0.1 : 0);
    meshRef.current.rotation.y = time * 0.3 + (hovered ? 0.2 : 0);
    targetScaleRef.current.setScalar(hovered ? 1.2 : 1);
    meshRef.current.scale.lerp(targetScaleRef.current, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <dodecahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color={hovered ? '#a78bfa' : '#8b5cf6'}
        emissive={hovered ? '#7c3aed' : '#6d28d9'}
        emissiveIntensity={hovered ? 0.4 : 0.2}
        metalness={0.3}
        roughness={0.5}
      />
    </mesh>
  );
}

export function IdeaVisualization({ idea, className }: IdeaVisualizationProps) {
  return (
    <CanvasWrapper className={className}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ec4899" />
      <IdeaShape />
    </CanvasWrapper>
  );
}
