
import React, { useEffect, useRef } from 'react';
import * as HandsModule from '@mediapipe/hands';
import { GestureType } from '../types';

const Hands = (HandsModule as any).Hands || (HandsModule as any).default?.Hands || (HandsModule as any).default || HandsModule;

interface HandTrackerProps {
  onUpdate: (gesture: GestureType) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);
  const frameIdRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  
  // Smoothing variables
  const smoothedDistRef = useRef<number>(0.3); 
  const smoothingFactor = 0.2; // Smoother transitions

  useEffect(() => {
    let active = true;

    const setupHands = async () => {
      try {
        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1, // Tăng lên 1 để nhận diện chính xác hơn (tránh nhầm vật thể)
          minDetectionConfidence: 0.8, // Tăng ngưỡng phát hiện (phải cực kỳ chắc chắn là tay)
          minTrackingConfidence: 0.8,  // Tăng ngưỡng tracking để giảm nhiễu
        });

        hands.onResults((results: any) => {
          isProcessingRef.current = false;
          if (!active || !results) return;

          // Feedback UI
          if (canvasRef.current && results.image) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.save();
              ctx.clearRect(0, 0, 160, 120);
              ctx.globalAlpha = 0.4;
              ctx.drawImage(results.image, 0, 0, 160, 120);
              
              // Draw landmarks for feedback if hand detected
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                 ctx.fillStyle = "#836ef9";
                 ctx.globalAlpha = 1.0;
                 results.multiHandLandmarks[0].forEach((point: any) => {
                   ctx.beginPath();
                   ctx.arc(point.x * 160, point.y * 120, 1.5, 0, 2 * Math.PI);
                   ctx.fill();
                 });
              }
              ctx.restore();
            }
          }

          let currentGesture: GestureType = GestureType.NONE;
          
          // Kiểm tra xem MediaPipe có thực sự tin tưởng đây là bàn tay không (Handedness check)
          const hasConfidentHand = results.multiHandedness && results.multiHandedness.length > 0 && results.multiHandedness[0].score > 0.9;

          if (hasConfidentHand && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const wrist = landmarks[0];
            const index = landmarks[8];
            const middle = landmarks[12];
            const ring = landmarks[16];
            const pinky = landmarks[20];

            // Calculate distance for gesture detection
            const dist = (p1: any, p2: any) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
            const rawAvg = (dist(index, wrist) + dist(middle, wrist) + dist(ring, wrist) + dist(pinky, wrist)) / 4;
            
            // EMA smoothing
            smoothedDistRef.current = (rawAvg * smoothingFactor) + (smoothedDistRef.current * (1 - smoothingFactor));
            const smoothed = smoothedDistRef.current;

            // Strict thresholds for high-end feel
            if (smoothed > 0.38) currentGesture = GestureType.OPEN;
            else if (smoothed < 0.20) currentGesture = GestureType.FIST;
            else currentGesture = GestureType.NONE;
          } else {
            // No hand or low confidence: reset smoothed value slowly
            smoothedDistRef.current = (0.3 * 0.1) + (smoothedDistRef.current * 0.9);
          }

          if (currentGesture !== lastGestureRef.current) {
            lastGestureRef.current = currentGesture;
            onUpdate(currentGesture);
          }
        });

        handsRef.current = hands;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 30 } }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              if (active) startLoop();
            }).catch(console.error);
          };
        }
      } catch (err) {
        console.error("Hand Tracker Initialization failed:", err);
      }
    };

    const startLoop = () => {
      const process = async () => {
        if (!active) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2 && !video.paused && !isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            await handsRef.current.send({ image: video });
          } catch (e) {
            isProcessingRef.current = false;
          }
        }
        frameIdRef.current = requestAnimationFrame(process);
      };
      frameIdRef.current = requestAnimationFrame(process);
    };

    setupHands();

    return () => {
      active = false;
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (handsRef.current) {
        try { handsRef.current.close(); } catch(e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [onUpdate]);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start pointer-events-none">
      <video ref={videoRef} className="hidden" playsInline muted />
      <div className="relative overflow-hidden rounded-xl border-2 border-[#836ef9]/40 shadow-[0_0_20px_rgba(131,110,249,0.3)] bg-black/60 backdrop-blur-xl">
        <canvas ref={canvasRef} width={160} height={120} style={{ transform: 'scaleX(-1)' }} />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#836ef9] animate-pulse" />
          <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Biometric Link</span>
        </div>
      </div>
    </div>
  );
};

export default HandTracker;
