
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black text-center px-4">
      <div className="mb-8 animate-pulse">
        <h1 className="text-6xl md:text-8xl font-cinzel font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#a08cff] via-[#836ef9] to-[#ffffff] drop-shadow-[0_0_15px_rgba(131,110,249,0.5)]">
          MONAD MOTION HAND TRACKER
        </h1>
        <p className="text-[#a08cff] mt-4 tracking-widest uppercase opacity-80 text-sm md:text-base">
          Made by @0xVelhust
        </p>
      </div>
      
      <button
        onClick={onStart}
        className="group relative px-12 py-4 overflow-hidden rounded-full bg-[#836ef9] text-white font-bold text-xl tracking-widest transition-all duration-300 hover:bg-[#a08cff] hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(131,110,249,0.5)]"
      >
        <span className="relative z-10 uppercase">Start</span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#836ef9] to-[#5a45d1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      <div className="mt-12 text-gray-500 text-sm max-w-md">
        <p>Grant camera access to control the Monad Logo with your hand gestures.</p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span>Open Hand: Explode</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#836ef9] animate-ping"></span>
            <span>Fist: Monad Assemble</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
