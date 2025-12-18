
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GestureType } from '../types';

const PARTICLE_COUNT = 10000;
const WHITE_RING_COUNT = 7000; // Tập trung phần lớn hạt vào vòng trắng chính
const PURPLE_GLOW_COUNT = 3000;

interface ParticleSystemProps {
  gesture: GestureType;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ gesture }) => {
  const purpleMeshRef = useRef<THREE.InstancedMesh>(null!);
  const whiteMeshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  
  const scratchDir = useMemo(() => new THREE.Vector3(), []);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isWhite = i < WHITE_RING_COUNT;
      data.push({
        position: new THREE.Vector3().randomDirection().multiplyScalar(20 + Math.random() * 10),
        velocity: new THREE.Vector3().randomDirection().multiplyScalar(0.02 + Math.random() * 0.03),
        scale: isWhite ? (Math.random() * 0.035 + 0.035) : (Math.random() * 0.03 + 0.03),
        isWhite,
        noiseOffset: Math.random() * 1000,
      });
    }
    return data;
  }, []);

  // Tính toán hình dáng Monad chuẩn xác
  const monadPositions = useMemo(() => {
    const pos = [];
    const n = 3.2; // Chỉ số n cho Squircle (Superellipse)
    const angleRot = Math.PI / 4; // Xoay 45 độ

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      let x, y, z;
      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 150) {
        attempts++;
        // Sampling trong không gian [-4, 4]
        const tx = (Math.random() - 0.5) * 8;
        const ty = (Math.random() - 0.5) * 8;
        
        // Công thức Squircle: |x|^n + |y|^n
        const val = Math.pow(Math.abs(tx), n) + Math.pow(Math.abs(ty), n);
        
        if (p.isWhite) {
          // Vòng nhẫn trắng: tạo độ dày cố định
          if (val < Math.pow(2.8, n) && val > Math.pow(1.8, n)) {
            x = tx; y = ty; valid = true;
          }
        } else {
          // Lớp tím: nằm sát viền trong và viền ngoài để tạo glow
          if (val < Math.pow(2.9, n) && val > Math.pow(1.7, n)) {
            x = tx; y = ty; valid = true;
          }
        }
      }

      // Xoay hình thoi chuẩn Monad ban đầu
      const rx = (x! * Math.cos(angleRot) - y! * Math.sin(angleRot));
      const ry = (x! * Math.sin(angleRot) + y! * Math.cos(angleRot));
      z = (Math.random() - 0.5) * 0.15; // Độ mỏng mặt phẳng

      pos.push(new THREE.Vector3(rx, ry, z));
    }
    return pos;
  }, [particles]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let pIdx = 0;
    let wIdx = 0;

    const isFist = gesture === GestureType.FIST;
    const isOpen = gesture === GestureType.OPEN;

    // Hiệu ứng xoay tròn liên tục
    // Tăng tốc độ xoay nhẹ khi ở trạng thái Logo để tăng tính thẩm mỹ
    const rotationSpeed = isFist ? 0.4 : 0.2;
    groupRef.current.rotation.z = time * rotationSpeed;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const target = monadPositions[i];
      
      if (isFist) {
        // Hút về logo với gia tốc mượt
        p.position.lerp(target, 0.15);
        // Thêm một chút nhiễu nhẹ để hạt trông như đang "sống"
        p.position.x += Math.sin(time * 10 + p.noiseOffset) * 0.001;
        p.position.y += Math.cos(time * 10 + p.noiseOffset) * 0.001;
      } else if (isOpen) {
        // Nổ tung
        scratchDir.copy(p.position).normalize();
        p.position.addScaledVector(scratchDir, 0.7);
      } else {
        // Trạng thái trôi tự do
        p.position.x += Math.cos(time * 0.3 + p.noiseOffset) * 0.008 + p.velocity.x;
        p.position.y += Math.sin(time * 0.3 + p.noiseOffset) * 0.008 + p.velocity.y;
        p.position.z += p.velocity.z;

        if (p.position.lengthSq() > 1500) {
          p.velocity.negate();
          p.position.multiplyScalar(0.9);
        }
      }

      tempObject.position.copy(p.position);
      
      // Khi khép tay, các hạt co giãn nhẹ theo nhịp tim
      const pulse = isFist ? 1.0 + Math.sin(time * 4 + p.noiseOffset) * 0.05 : 1.0;
      tempObject.scale.setScalar(p.scale * pulse);
      tempObject.updateMatrix();

      if (p.isWhite) {
        whiteMeshRef.current.setMatrixAt(wIdx, tempObject.matrix);
        tempColor.set(0xffffff);
        whiteMeshRef.current.setColorAt(wIdx, tempColor);
        wIdx++;
      } else {
        purpleMeshRef.current.setMatrixAt(pIdx, tempObject.matrix);
        tempColor.set(0x836ef9);
        purpleMeshRef.current.setColorAt(pIdx, tempColor);
        pIdx++;
      }
    }

    whiteMeshRef.current.instanceMatrix.needsUpdate = true;
    purpleMeshRef.current.instanceMatrix.needsUpdate = true;
    if (whiteMeshRef.current.instanceColor) whiteMeshRef.current.instanceColor.needsUpdate = true;
    if (purpleMeshRef.current.instanceColor) purpleMeshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={whiteMeshRef} args={[undefined, undefined, WHITE_RING_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.0} 
          metalness={1.0} 
          emissive="#ffffff" 
          emissiveIntensity={0.8} 
        />
      </instancedMesh>

      <instancedMesh ref={purpleMeshRef} args={[undefined, undefined, PURPLE_GLOW_COUNT]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={0.8} 
          emissive="#836ef9" 
          emissiveIntensity={4.0} 
        />
      </instancedMesh>
    </group>
  );
};

export default ParticleSystem;
