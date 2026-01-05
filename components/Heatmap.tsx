import React, { useEffect, useRef } from 'react';
import { Question } from '../types';

export const Heatmap = ({ data }: { data: Question[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const weeks = 53;
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((weeks * 7) - 1 - i));
    return d.toLocaleDateString('en-CA');
  });
  
  const activityMap = data.reduce((acc: any, q: any) => {
    if (q.lastAttempted && (q.status === 'Solved' || q.status === 'Attempted')) {
      acc[new Date(q.lastAttempted).toLocaleDateString('en-CA')] = (acc[new Date(q.lastAttempted).toLocaleDateString('en-CA')] || 0) + 1;
    }
    return acc;
  }, {});

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);
  
  return (
    <div ref={containerRef} className="w-full overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex gap-1 min-w-max">
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const count = activityMap[days[weekIndex * 7 + dayIndex]] || 0;
              return <div key={dayIndex} title={`${days[weekIndex * 7 + dayIndex]}: ${count}`} className={`w-3 h-3 rounded-sm ${!count ? 'bg-slate-700/50' : count === 1 ? 'bg-indigo-500/50' : count <= 3 ? 'bg-indigo-400' : 'bg-indigo-300'}`} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MiniHeatmap = ({ data }: { data: Question[] }) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-CA');
  });
  
  const activityMap = data.reduce((acc: any, q: any) => {
    if (q.lastAttempted && (q.status === 'Solved' || q.status === 'Attempted')) {
      const d = new Date(q.lastAttempted).toLocaleDateString('en-CA');
      acc[d] = (acc[d] || 0) + 1;
    }
    return acc;
  }, {});
  
  return (
    <div className="flex gap-1 mt-3 justify-between">
      {days.map((date) => {
        const count = activityMap[date] || 0;
        const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' });
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div className={`w-6 h-6 rounded-md shadow-inner ${!count ? 'bg-white/5 border border-white/5' : count === 1 ? 'bg-indigo-400 border-indigo-300' : 'bg-emerald-400 border-emerald-300'} transition-all`} />
            <span className="text-[9px] text-indigo-200 font-medium uppercase">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
};