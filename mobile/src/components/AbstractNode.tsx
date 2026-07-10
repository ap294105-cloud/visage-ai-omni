import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AbstractNode
 * ------------
 * A central 3D "AI brain node" composed of:
 *
 * • OUTER SHELL  – wireframe icosahedron (electric purple, semi-transparent)
 * • INNER CORE   – emissive sphere with animated scale pulsing
 * • POINT LIGHT  – purple glow emanating from the core centre
 *
 * The entire group gently follows the pointer position (parallax) and
 * auto-rotates on Y + X axes for a living, breathing feel.
 */

/** How aggressively the node follows the pointer (0 = none, 1 = instant). */
const PARALLAX_STRENGTH = 0.15;
/** Lerp factor per frame – higher = snappier response. */
const LERP_FACTOR = 2.5;

export default function AbstractNode() {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  // Target rotation driven by the pointer – we lerp towards these each frame.
  const target = useRef({ rx: 0, ry: 0 });

  const { pointer } = useThree();

  useFrame((_state, delta) => {
    if (!groupRef.current || !coreRef.current) return;

    const elapsed = _state.clock.getElapsedTime();

    /* ---- pointer-driven parallax ---- */
    target.current.ry = pointer.x * PARALLAX_STRENGTH * Math.PI;
    target.current.rx = -pointer.y * PARALLAX_STRENGTH * Math.PI;

    /* ---- auto-rotation ---- */
    const autoY = elapsed * 0.12;
    const autoX = elapsed * 0.06;

    /* ---- lerp towards target + auto ---- */
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      target.current.ry + autoY,
      delta * LERP_FACTOR,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      target.current.rx + autoX,
      delta * LERP_FACTOR,
    );

    /* ---- inner-core scale pulse ---- */
    const pulse = 1 + Math.sin(elapsed * 1.8) * 0.08;
    coreRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      {/* OUTER LAYER – wireframe icosahedron */}
      <mesh>
        <icosahedronGeometry args={[2.2, 2]} />
        <meshStandardMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* INNER CORE – emissive pulsing sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#4c1d95"
          emissive="#6d28d9"
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* POINT LIGHT – purple glow from within */}
      <pointLight
        color="#7c3aed"
        intensity={3}
        distance={12}
        decay={2}
      />
    </group>
  );
}
