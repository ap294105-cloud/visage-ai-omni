import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ParticleBackground
 * ------------------
 * An immersive dual-layer particle field that slowly rotates around the
 * camera, evoking a neural-network / cosmic-void atmosphere.
 *
 * Layer 1 – 2 000 tiny bright particles (white → purple palette)
 * Layer 2 –   500 larger, dimmer particles for parallax depth
 */

/* ---------- helpers ---------- */

/** Generate `count` random positions on the surface of a sphere of `radius`. */
function randomSpherePositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random()); // cube-root for uniform volume
    const i3 = i * 3;
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/** Generate per-particle colours interpolating between two THREE.Color values. */
function randomColors(
  count: number,
  colorA: THREE.Color,
  colorB: THREE.Color,
): Float32Array {
  const colors = new Float32Array(count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < count; i++) {
    tmp.lerpColors(colorA, colorB, Math.random());
    const i3 = i * 3;
    colors[i3] = tmp.r;
    colors[i3 + 1] = tmp.g;
    colors[i3 + 2] = tmp.b;
  }
  return colors;
}

/* ---------- sub-components ---------- */

interface ParticleLayerProps {
  count: number;
  radius: number;
  size: number;
  colorA: string;
  colorB: string;
  opacity: number;
  rotationSpeed: number;
}

function ParticleLayer({
  count,
  radius,
  size,
  colorA,
  colorB,
  opacity,
  rotationSpeed,
}: ParticleLayerProps) {
  const groupRef = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const a = new THREE.Color(colorA);
    const b = new THREE.Color(colorB);
    return {
      positions: randomSpherePositions(count, radius),
      colors: randomColors(count, a, b),
    };
  }, [count, radius, colorA, colorB]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------- main component ---------- */

export default function ParticleBackground() {
  return (
    <group>
      {/* Layer 1 – dense, small, bright particles */}
      <ParticleLayer
        count={2000}
        radius={25}
        size={0.35}
        colorA="#ffffff"
        colorB="#a78bfa" /* light purple */
        opacity={0.85}
        rotationSpeed={0.015}
      />

      {/* Layer 2 – sparse, larger, dimmer particles for depth */}
      <ParticleLayer
        count={500}
        radius={40}
        size={0.5}
        colorA="#6d28d9" /* deeper purple */
        colorB="#c4b5fd" /* lavender */
        opacity={0.35}
        rotationSpeed={-0.008} /* counter-rotate for parallax */
      />
    </group>
  );
}
