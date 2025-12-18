
import React from 'react';
import { GestureType } from '../types';

interface UIOverlayProps {
  gesture: GestureType;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gesture }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-8 md:p-12">
      {/* Top Banner - Authentic Monad Style */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col border-l-2 border-[#836ef9] pl-4 backdrop-blur-sm bg-black/10 py-1">
          <span className="text-[10px] text-[#836ef9] font-bold tracking-[0.4em] uppercase opacity-80">Link Status</span>
          <span className="text-white text-[11px] font-bold tracking-widest">Made By Velhust</span>
        </div>
        
        <div className="text-center group">
          <h2 className="text-5xl md:text-6xl font-cinzel font-bold tracking-[0.5em] text-white drop-shadow-[0_0_30px_rgba(131,110,249,1)] transition-all duration-700">
            MONAD MAINNET LIVE NOW!
          </h2>
          <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-transparent via-[#836ef9] to-transparent mt-2 transition-all duration-1000 mx-auto" style={{ width: gesture === GestureType.FIST ? '100%' : '20%' }} />
        </div>

        <div className="flex flex-col border-r-2 border-[#836ef9] pr-4 text-right backdrop-blur-sm bg-black/10 py-1">
          <span className="text-[10px] text-[#836ef9] font-bold tracking-[0.4em] uppercase opacity-80">Core Version</span>
          <span className="text-white text-[11px] font-bold tracking-widest">3.0.0-PRO</span>
        </div>
      </div>

      {/* Center Prompt */}
      {gesture === GestureType.NONE && (
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center animate-bounce opacity-40">
           <span className="text-white text-[10px] tracking-[0.6em] uppercase font-bold">Close Fist to Assemble</span>
        </div>
      )}

      {/* Bottom Controls Indicator */}
      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col gap-4">
          <div className={`flex items-center gap-5 p-3 rounded-r-xl border-l-4 transition-all duration-500 ${gesture === GestureType.OPEN ? 'bg-[#836ef9]/20 border-white scale-105' : 'bg-transparent border-transparent'}`}>
            <div 
              className={`w-4 h-4 rotate-45 transition-all duration-500 ${gesture === GestureType.OPEN ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,1)] scale-125' : 'bg-gray-800 border border-gray-700'}`} 
            />
            <div className="flex flex-col">
              <span className={`text-[9px] tracking-[0.3em] uppercase font-black ${gesture === GestureType.OPEN ? 'text-white' : 'text-gray-600'}`}>
                Quantum Shift
              </span>
              <span className={`text-xs font-bold tracking-[0.2em] ${gesture === GestureType.OPEN ? 'text-white' : 'text-gray-500'}`}>
                DISPERSION_MODE
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-5 p-3 rounded-r-xl border-l-4 transition-all duration-500 ${gesture === GestureType.FIST ? 'bg-[#836ef9]/30 border-[#836ef9] scale-105' : 'bg-transparent border-transparent'}`}>
            <div 
              className={`w-4 h-4 rotate-45 transition-all duration-500 ${gesture === GestureType.FIST ? 'bg-[#836ef9] shadow-[0_0_30px_rgba(131,110,249,1)] scale-125' : 'bg-gray-800 border border-gray-700'}`} 
            />
             <div className="flex flex-col">
              <span className={`text-[9px] tracking-[0.3em] uppercase font-black ${gesture === GestureType.FIST ? 'text-[#836ef9]' : 'text-gray-600'}`}>
                Singularity
              </span>
              <span className={`text-xs font-bold tracking-[0.2em] ${gesture === GestureType.FIST ? 'text-[#836ef9]' : 'text-gray-500'}`}>
                LOGO_SYNCHRONIZED
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 bg-black/40 backdrop-blur-md p-4 rounded-tl-3xl border-t border-l border-[#836ef9]/30">
          <div className="flex gap-1.5 h-4 items-end">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 transition-all duration-300 ${gesture !== GestureType.NONE ? 'bg-[#836ef9] animate-pulse' : 'bg-gray-800'}`} 
                style={{ 
                  height: `${20 + Math.random() * 80}%`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '600ms'
                }} 
              />
            ))}
          </div>
          <span className="text-[9px] text-white/50 uppercase tracking-[0.5em] font-mono font-bold">Biometric Synchronization</span>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
