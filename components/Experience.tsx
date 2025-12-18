
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GestureType } from '../types';
import HandTracker from './HandTracker';
import ParticleSystem from './ParticleSystem';

interface ExperienceProps {
  gesture: GestureType;
  onHandUpdate: (gesture: GestureType) => void;
}

const PostProcessing: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  
  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.8,  // Strength: Vừa đủ để lung linh
      0.6,  // Radius: Tăng bán kính để glow tỏa rộng mềm mại
      0.2   // Threshold: Hạ thấp threshold để màu tím lan tỏa tốt hơn, nhưng vật liệu trắng đã được giảm cường độ emissive để không bị lóa
    );
    comp.addPass(renderPass);
    comp.addPass(bloomPass);
    return comp;
  }, [gl, scene, camera, size]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};

const Experience: React.FC<ExperienceProps> = ({ gesture, onHandUpdate }) => {
  return (
    <div className="w-full h-full relative bg-black">
      <HandTracker onUpdate={onHandUpdate} />
      
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          alpha: false,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)} 
        onCreated={({ gl }) => {
          gl.setClearColor(0x020108);
        }}
      >
        <color attach="background" args={['#010005']} />
        
        <ambientLight intensity={0.2} />
        {/* Ánh sáng điểm để tạo khối cho các hạt box */}
        <pointLight position={[5, 5, 5]} intensity={5} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={10} color="#836ef9" />
        
        <ParticleSystem gesture={gesture} />
        
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Experience;
