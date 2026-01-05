import React from 'react';
import { calculateEfficiency, formatTime } from '../utils/helpers';

interface EfficiencyBadgeProps {
  difficulty: string;
  timeTaken: number;
}

const EfficiencyBadge: React.FC<EfficiencyBadgeProps> = ({ difficulty, timeTaken }) => {
  const data = calculateEfficiency(difficulty, timeTaken);
  if (!data) return <span className="text-white/20 text-xs font-mono">-</span>;
  
  let glassClass = 'bg-orange-500/20 border-orange-500/30 text-orange-200';
  if (data.grade === 'Elite') glassClass = 'bg-purple-500/20 border-purple-500/30 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
  else if (data.grade === 'High') glassClass = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200';
  else if (data.grade === 'Avg') glassClass = 'bg-blue-500/20 border-blue-500/30 text-blue-200';

  return (
    <div className="flex items-center gap-2 group/badge relative w-fit z-0 hover:z-[100]">
      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider min-w-[50px] text-center shadow-sm cursor-help backdrop-blur-md ${glassClass}`}>
        {data.grade}
      </div>
      <div className="absolute opacity-0 group-hover/badge:opacity-100 bottom-full right-0 mb-2 bg-black/95 backdrop-blur-xl text-white text-xs p-3 rounded-xl w-48 pointer-events-none transition-all duration-200 z-[100] shadow-2xl border border-white/20 translate-y-2 group-hover/badge:translate-y-0 whitespace-nowrap ring-1 ring-white/10">
        <div className="font-bold text-indigo-200 mb-1 border-b border-white/10 pb-1 flex justify-between items-center">
          <span>{data.grade} Grade</span>
        </div>
        <div className="flex justify-between py-1 text-white/80">
          <span>Time:</span> <span className="font-mono text-emerald-400">{formatTime(timeTaken)}</span>
        </div>
        <div className="flex justify-between py-1 text-white/50">
          <span>Target:</span> <span className="font-mono">{formatTime(data.standard)}</span>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyBadge;