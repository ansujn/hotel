"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh, Group } from "three";

/**
 * Monogram — a "K" silhouette built from three rotated boxes inside
 * a double gold ring. Pure geometry, no font JSON required.
 */
function Monogram() {
  const group = useRef<Group | null>(null);
  const ring = useRef<Mesh | null>(null);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.45;
    if (ring.current) ring.current.rotation.z -= dt * 0.25;
  });

  const goldMat = (
    <meshStandardMaterial
      color="#D4AF37"
      metalness={1}
      roughness={0.2}
      emissive="#5A3D00"
      emissiveIntensity={0.22}
    />
  );

  return (
    <group ref={group}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.045, 24, 96]} />
        {goldMat}
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.012, 16, 96]} />
        <meshStandardMaterial color="#F4D27E" metalness={1} roughness={0.3} />
      </mesh>

      {/* Vertical bar of K */}
      <mesh position={[-0.32, 0, 0]}>
        <boxGeometry args={[0.18, 1.3, 0.18]} />
        {goldMat}
      </mesh>
      {/* Upper diagonal of K */}
      <mesh position={[0.05, 0.3, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.16, 0.95, 0.18]} />
        {goldMat}
      </mesh>
      {/* Lower diagonal of K */}
      <mesh position={[0.05, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.16, 0.95, 0.18]} />
        {goldMat}
      </mesh>
    </group>
  );
}

export default function KibanaLogo3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} color="#FFE9B0" />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#FFB070" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#FFD27E" />

      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.6}>
          <Monogram />
        </Float>
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
