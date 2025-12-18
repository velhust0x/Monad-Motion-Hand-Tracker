
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
      2.0, // Strength: Stronger for "Glowing" feel
      0.4, // Radius: Softer glow
      0.85 // Threshold: Lower to catch more emissive parts
    );
    comp.addPass(renderPass);
    comp.addPass(bloomPass);
    return comp;
  }, [gl, scene, camera]);

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
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ 
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          alpha: false,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)} 
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000);
        }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Lights for depth */}
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={5} color="#836ef9" />
        <pointLight position={[-5, -5, 5]} intensity={2} color="#ffffff" />
        
        <ParticleSystem gesture={gesture} />
        
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Experience;
