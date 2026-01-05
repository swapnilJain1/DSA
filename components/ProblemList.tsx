import React from 'react';
import { Problem } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProblemListProps {
  problems: Problem[];
  activeProblemId: string;
  onSelectProblem: (problem: Problem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, activeProblemId, onSelectProblem, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Problems</h2>
          <p className="text-xs text-gray-500 mt-1">Select a challenge to begin</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {problems.map(problem => {
            const isActive = problem.id === activeProblemId;
            const difficultyColor = 
              problem.difficulty === 'Easy' ? 'text-green-400' : 
              problem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400';

            return (
              <button
                key={problem.id}
                onClick={() => {
                  onSelectProblem(problem);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full text-left p-3 rounded-lg transition-all border border-transparent
                  ${isActive 
                    ? 'bg-blue-600/10 border-blue-600/20 text-blue-100' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'}
                `}
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium truncate">{problem.title}</span>
                  {isActive ? <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> : <Circle className="w-4 h-4 opacity-20 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-800 ${difficultyColor}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-gray-600">{problem.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProblemList;