'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface FloatingShapesProps {
  mousePosition?: { x: number; y: number };
}

export function FloatingShapes({ mousePosition = { x: 0, y: 0 } }: FloatingShapesProps) {
  const sphereRef = useRef<Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (sphereRef.current) {
      sphereRef.current.rotation.x = time * 0.2;
      sphereRef.current.rotation.y = time * 0.3;
      sphereRef.current.position.x = Math.sin(time * 0.5) * 0.5 + mousePosition.x * 2;
      sphereRef.current.position.y = Math.cos(time * 0.3) * 0.5 + mousePosition.y * 2;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
      <mesh position={[2, 1, -1]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#be185d"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[-1.5, -0.5, -0.5]}>
        <tetrahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
