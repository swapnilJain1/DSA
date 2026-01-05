import React from 'react';
import { Clock } from 'lucide-react';
import { Question } from '../types';
import { formatTime, formatTimeAgo, getDifficultyColor } from '../utils/helpers';

interface MobileQuestionCardProps {
  question: Question;
  onClick: () => void;
  view: string;
  onTagClick: (tag: string) => void;
}

const MobileQuestionCard: React.FC<MobileQuestionCardProps> = ({ question, onClick, view, onTagClick }) => (
  <div 
    onClick={onClick} 
    className="glass-card p-5 rounded-2xl mb-4 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] border border-white/10 relative overflow-hidden group"
    data-testid="mobile-question-card"
  >
    {/* Subtle gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/5 transition-all duration-500 pointer-events-none" />
    
    <div className="flex justify-between items-start mb-3 relative z-10">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border shadow-sm ${getDifficultyColor(question.difficulty)}`}>{question.difficulty}</span>
      {view !== 'todo' && <span className="text-[10px] text-white/40 font-medium">{formatTimeAgo(question.lastAttempted)}</span>}
    </div>
    
    <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg leading-tight drop-shadow-sm relative z-10">{question.title}</h3>
    
    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-white/10 relative z-10">
      <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
        {question.topics.slice(0, 2).map((t: any) => (
            <span 
                key={t} 
                onClick={(e) => { e.stopPropagation(); onTagClick(t); }}
                className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-indigo-100/80 border border-white/5 truncate backdrop-blur-sm hover:bg-indigo-500/20 hover:text-indigo-300 cursor-pointer transition-colors"
            >
                {t}
            </span>
        ))}
        {question.topics.length > 2 && <span className="text-[10px] text-white/30 font-medium">+{question.topics.length - 2}</span>}
      </div>
      {view !== 'todo' && (
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Clock size={14} />
            <span className="font-mono text-white/80">{formatTime(question.timeTaken)}</span>
          </div>
      )}
    </div>
  </div>
);

export default MobileQuestionCard;