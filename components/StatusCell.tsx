import React from 'react';
import { CheckCircle2, Activity, Circle } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';
import { Status } from '../types';

interface StatusCellProps {
  status: Status;
  lastAttempted: string | null;
}

const StatusCell: React.FC<StatusCellProps> = ({ status, lastAttempted }) => {
  let bg = 'bg-slate-500/20 border-slate-500/30', text = 'text-slate-300', label = 'Todo', iconColor = 'text-slate-400';
  
  if (status === 'Solved') {
    bg = 'bg-emerald-500/20 border-emerald-500/30';
    text = 'text-emerald-200';
    iconColor = 'text-emerald-400';
    label = 'Solved';
  } else if (status === 'Attempted') {
    bg = 'bg-amber-500/20 border-amber-500/30';
    text = 'text-amber-200';
    iconColor = 'text-amber-400';
    label = 'Attempted';
  }
  
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border backdrop-blur-sm ${bg} ${text} shadow-sm`}>
        {status === 'Solved' ? <CheckCircle2 size={12} className={iconColor} /> : status === 'Attempted' ? <Activity size={12} className={iconColor} /> : <Circle size={12} className={iconColor} />}
        <span>{label}</span>
      </div>
      <span className="text-[10px] text-white/30 font-medium pl-1 whitespace-nowrap">
        {lastAttempted ? formatTimeAgo(lastAttempted) : 'Never'}
      </span>
    </div>
  );
};

export default StatusCell;