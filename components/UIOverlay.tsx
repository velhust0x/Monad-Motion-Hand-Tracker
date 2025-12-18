
import React from 'react';
import { GestureType } from '../types';

interface UIOverlayProps {
  gesture: GestureType;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gesture }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-8">
      {/* Top Banner - Futuristic HUD Style */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col border-l-2 border-[#836ef9] pl-4">
          <span className="text-[10px] text-[#836ef9] font-bold tracking-[0.3em] uppercase opacity-60">System Status</span>
          <span className="text-white text-xs font-bold tracking-widest">KINETIC_LINK_STABLE</span>
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#836ef9] drop-shadow-[0_0_20px_rgba(131,110,249,0.8)]">
            MONAD
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#836ef9] to-transparent mt-2" />
        </div>

        <div className="flex flex-col border-r-2 border-[#836ef9] pr-4 text-right">
          <span className="text-[10px] text-[#836ef9] font-bold tracking-[0.3em] uppercase opacity-60">Neural Engine</span>
          <span className="text-white text-xs font-bold tracking-widest">v2.5.0-ALPHA</span>
        </div>
      </div>

      {/* Middle Decorative Crosshair (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
        <div className="w-32 h-32 border border-white rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white" />
        </div>
      </div>

      {/* Bottom Controls Indicator */}
      <div className="flex justify-between items-end w-full mb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 group">
            <div 
              className={`w-3 h-3 rotate-45 transition-all duration-500 ${gesture === GestureType.OPEN ? 'bg-white scale-150 shadow-[0_0_20px_rgba(255,255,255,1)]' : 'bg-gray-800 border border-gray-700'}`} 
            />
            <div className="flex flex-col">
              <span className={`text-[9px] tracking-widest uppercase font-bold ${gesture === GestureType.OPEN ? 'text-white' : 'text-gray-600'}`}>
                Hand State
              </span>
              <span className={`text-xs font-bold tracking-[0.2em] ${gesture === GestureType.OPEN ? 'text-white' : 'text-gray-500'}`}>
                EXPAND_MODE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div 
              className={`w-3 h-3 rotate-45 transition-all duration-500 ${gesture === GestureType.FIST ? 'bg-[#836ef9] scale-150 shadow-[0_0_25px_rgba(131,110,249,1)]' : 'bg-gray-800 border border-gray-700'}`} 
            />
             <div className="flex flex-col">
              <span className={`text-[9px] tracking-widest uppercase font-bold ${gesture === GestureType.FIST ? 'text-[#836ef9]' : 'text-gray-600'}`}>
                Hand State
              </span>
              <span className={`text-xs font-bold tracking-[0.2em] ${gesture === GestureType.FIST ? 'text-[#836ef9]' : 'text-gray-500'}`}>
                ASSEMBLY_CORE
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-1 h-3 ${gesture !== GestureType.NONE ? 'bg-[#836ef9] animate-pulse' : 'bg-gray-800'}`} style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <span className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-mono">Real-time Kinematics</span>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
