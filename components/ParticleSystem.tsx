
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GestureType } from '../types';

// Increased particle count for a much denser and seamless look
const PARTICLE_COUNT = 6000;
const OUTER_COUNT = 4500;
const INNER_COUNT = 1500;

interface ParticleSystemProps {
  gesture: GestureType;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ gesture }) => {
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null!);
  const cubeMeshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  
  // Reusable scratchpad variables to avoid GC thrashing (Lag prevention)
  const scratchDir = useMemo(() => new THREE.Vector3(), []);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        position: new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 20),
        velocity: new THREE.Vector3().randomDirection().multiplyScalar(0.01 + Math.random() * 0.02),
        scale: Math.random() * 0.04 + 0.035, // Slightly smaller particles for better detail
        type: Math.random() > 0.3 ? 'sphere' : 'cube',
      });
    }
    return data;
  }, []);

  const monadPositions = useMemo(() => {
    const pos = [];
    // Lower exponent for smoother, less 'boxy' squircle which prevents edge thinning
    const exponent = 3.8; 
    const angleRot = Math.PI / 4;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Use i / PARTICLE_COUNT to ensure perfectly uniform spacing around the perimeter
      // instead of purely random 't' which can create clusters/gaps.
      const t = (i / (i < OUTER_COUNT ? OUTER_COUNT : INNER_COUNT)) * Math.PI * 2;
      
      const isOuter = i < OUTER_COUNT;
      const baseRadius = isOuter ? 2.3 : 1.0;
      // Tighten thickness to make the lines look 'solid'
      const thickness = isOuter ? 0.22 : 0.12;
      
      const r = baseRadius + (Math.random() - 0.5) * thickness;
      
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      
      // Super-ellipse parametric formula
      let rawX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / exponent);
      let rawY = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / exponent);
      
      // Rotation to get the Monad diamond shape
      const x = (rawX * Math.cos(angleRot) - rawY * Math.sin(angleRot)) * r;
      const y = (rawX * Math.sin(angleRot) + rawY * Math.cos(angleRot)) * r;
      const z = (Math.random() - 0.5) * 0.12;

      pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let sIdx = 0;
    let cIdx = 0;

    const isFist = gesture === GestureType.FIST;
    const isOpen = gesture === GestureType.OPEN;

    // Smooth continuous group rotation
    const rotationSpeed = isFist ? 0.025 : 0.006;
    groupRef.current.rotation.z += rotationSpeed;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, isFist ? Math.sin(time * 0.4) * 0.25 : 0, 0.06);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      
      if (isFist) {
        // High responsiveness lerp for assembly
        p.position.lerp(monadPositions[i], 0.18);
      } else if (isOpen) {
        // Explosion with normalized vector
        scratchDir.copy(p.position).normalize();
        if (scratchDir.lengthSq() === 0) scratchDir.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        p.position.addScaledVector(scratchDir, 0.7);
      } else {
        // Floating idle with boundary check
        p.position.add(p.velocity);
        if (p.position.lengthSq() > 1024) { // 32^2
          p.position.multiplyScalar(0.9);
          p.velocity.negate();
        }
      }

      tempObject.position.copy(p.position);
      tempObject.scale.setScalar(p.scale);
      tempObject.rotation.x += 0.03;
      tempObject.rotation.y += 0.03;
      tempObject.updateMatrix();

      // Premium Monad Color Palette
      const colors = [0x836ef9, 0xa08cff, 0xffffff];
      let colorIdx;
      
      if (i >= OUTER_COUNT) {
        // Inner logo: bright white/silver for core energy
        colorIdx = (i % 3 === 0) ? 2 : 1;
      } else {
        // Outer logo: deep Monad purple with white highlights
        colorIdx = (i % 8 === 0) ? 2 : (i % 2 === 0 ? 0 : 1);
      }
      
      if (p.type === 'sphere') {
        sphereMeshRef.current.setMatrixAt(sIdx, tempObject.matrix);
        tempColor.set(colors[colorIdx]);
        sphereMeshRef.current.setColorAt(sIdx, tempColor);
        sIdx++;
      } else {
        cubeMeshRef.current.setMatrixAt(cIdx, tempObject.matrix);
        tempColor.set(colors[colorIdx]);
        cubeMeshRef.current.setColorAt(cIdx, tempColor);
        cIdx++;
      }
    }

    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
    cubeMeshRef.current.instanceMatrix.needsUpdate = true;
    if (sphereMeshRef.current.instanceColor) sphereMeshRef.current.instanceColor.needsUpdate = true;
    if (cubeMeshRef.current.instanceColor) cubeMeshRef.current.instanceColor.needsUpdate = true;
  });

  const sphereCount = useMemo(() => particles.filter(p => p.type === 'sphere').length, [particles]);
  const cubeCount = PARTICLE_COUNT - sphereCount;

  return (
    <group ref={groupRef}>
      <instancedMesh ref={sphereMeshRef} args={[undefined, undefined, sphereCount]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshStandardMaterial 
          roughness={0.05} 
          metalness={1.0} 
          emissive="#836ef9" 
          emissiveIntensity={0.8} 
        />
      </instancedMesh>
      <instancedMesh ref={cubeMeshRef} args={[undefined, undefined, cubeCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.05} 
          metalness={1.0} 
          emissive="#ffffff" 
          emissiveIntensity={0.5} 
        />
      </instancedMesh>
    </group>
  );
};

export default ParticleSystem;
