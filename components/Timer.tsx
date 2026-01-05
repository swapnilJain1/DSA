import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Maximize, Clock, Save, StopCircle } from 'lucide-react';
import { formatTimerDisplay } from '../utils/helpers';

interface TimerProps {
  initialTime?: number;
  timeAdjustment?: { value: number, id: string } | null;
  onTimeUpdate?: (seconds: number) => void;
  onSave?: (seconds: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime = 0, timeAdjustment, onTimeUpdate, onSave, isOpen, onClose }) => {
  const [seconds, setSeconds] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isHovered, setIsHovered] = useState(true); // Default to hovered to make controls visible immediately
  
  // Refs for logic and PiP
  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(initialTime);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync initial time if provided and timer not running
  useEffect(() => {
    // If the timer is closed or just opening, or if external initialTime changes significantly (e.g. starting a new session)
    // we should sync. However, we must be careful not to overwrite running time.
    if (!isRunning && isOpen) {
        setSeconds(initialTime);
        accumulatedTimeRef.current = initialTime;
    }
  }, [initialTime, isOpen, isRunning]);

  // Handle external time adjustments (e.g. from AI hints)
  useEffect(() => {
      if (timeAdjustment) {
          const adj = timeAdjustment.value;
          setSeconds(prev => prev + adj);
          accumulatedTimeRef.current += adj;
          // If running, we need to shift the base start time to account for the jump
          if (isRunning) {
              startTimeRef.current -= (adj * 1000);
          }
          // Redraw canvas immediately for PiP
          setTimeout(() => drawCanvas(accumulatedTimeRef.current + (isRunning ? 0 : 0), !isRunning), 0);
      }
  }, [timeAdjustment]);

  // Update document title
  useEffect(() => {
    if (isOpen) {
        document.title = isRunning ? `⏱️ ${formatTimerDisplay(seconds)} - DSA` : 'DSA Master';
    }
    return () => { document.title = 'DSA Master'; };
  }, [seconds, isRunning, isOpen]);

  // Report time back to parent
  useEffect(() => {
      onTimeUpdate?.(seconds);
  }, [seconds]);

  // Canvas drawing for PiP
  const drawCanvas = useCallback((sec: number, paused = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#1e293b'; // Slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Status Text
    ctx.fillStyle = paused ? '#fbbf24' : '#4ade80';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(paused ? "PAUSED" : "RUNNING", canvas.width / 2, 40);

    // Time Text
    const timeStr = formatTimerDisplay(sec);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeStr, canvas.width / 2, canvas.height / 2 + 10);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        // Calculate delta since start
        const delta = Math.floor((now - startTimeRef.current) / 1000);
        const newSec = accumulatedTimeRef.current + delta;
        setSeconds(newSec);
        drawCanvas(newSec, false);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      accumulatedTimeRef.current = seconds; // Update accumulator on pause
      drawCanvas(seconds, true);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, drawCanvas]);

  // PiP & Media Session Logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isRunning) {
        video.play().catch(() => {});
    } else {
        video.pause();
    }
    
    const onPause = () => setIsRunning(false);
    const onPlay = () => setIsRunning(true);
    
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'DSA Focus Timer',
            artist: 'DSA Master'
        });
        navigator.mediaSession.setActionHandler('play', () => setIsRunning(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsRunning(false));
    }
    
    return () => {
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onPlay);
      if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [isRunning]);

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      
      drawCanvas(seconds, !isRunning);
      
      if (!video.srcObject) {
        const stream = canvas.captureStream();
        video.srcObject = stream;
      }
      
      try {
        await video.play(); 
        await video.requestPictureInPicture();
        if (!isRunning) video.pause();
      } catch (err) {
        console.error("PiP failed:", err);
      }
    }
  };

  const handleSaveAndClose = () => {
      setIsRunning(false);
      onSave?.(seconds);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed bottom-6 right-6 z-[100] flex flex-col items-end transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(true)} 
    >
      {/* Hidden elements for PiP */}
      <canvas ref={canvasRef} width="300" height="150" className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />

      <div className={`
        bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/50 
        transition-all duration-300 overflow-hidden
        ${isHovered ? 'w-64 p-4' : 'w-auto px-4 py-3 cursor-pointer'}
      `}>
        
        {/* Collapsed View */}
        {!isHovered && (
             <div className="flex items-center gap-3">
                 <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                 <span className="font-mono font-bold text-lg tracking-wider">{formatTimerDisplay(seconds)}</span>
             </div>
        )}

        {/* Expanded View */}
        {isHovered && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12}/> Session Timer
                    </span>
                    <button onClick={togglePiP} className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 rounded" title="Pop Clock (Picture-in-Picture)">
                        <Maximize size={14} />
                    </button>
                </div>
                
                <div className={`text-4xl font-mono font-bold text-center tabular-nums py-2 ${isRunning ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {formatTimerDisplay(seconds)}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`
                            py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all
                            ${isRunning 
                                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                        `}
                    >
                        {isRunning ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
                        {isRunning ? 'PAUSE' : 'START'}
                    </button>
                    
                    <button 
                        onClick={handleSaveAndClose}
                        className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2 font-bold text-xs transition-all"
                    >
                        <Save size={16} />
                        SAVE
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Timer;