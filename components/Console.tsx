import React from 'react';
import { TestResult } from '../types';
import { CheckCircle2, XCircle, Terminal, AlertTriangle } from 'lucide-react';

interface ConsoleProps {
  results: TestResult[] | null;
  isOpen: boolean;
  onToggle: () => void;
}

const Console: React.FC<ConsoleProps> = ({ results, isOpen, onToggle }) => {
  // If console is meant to be embedded in a split view (always open conceptually), we ignore the toggle for visual collapsing sometimes, 
  // but here we treat 'isOpen' as whether content is shown.
  
  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-sm">
      {!results ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
            <Terminal size={24} className="opacity-50"/>
            <p>Run code to see output...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {results.length === 0 && <div className="text-yellow-500 flex items-center gap-2"><AlertTriangle size={14}/> No test cases found.</div>}
          
          {results.map((result, idx) => (
            <div key={idx} className="border-l-2 border-slate-800 pl-3 py-1">
              <div className="flex items-center gap-2 mb-2">
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className={`font-bold text-xs ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Test Case {idx + 1}
                </span>
              </div>

              {result.error ? (
                   <div className="bg-rose-950/20 border border-rose-500/20 p-2 rounded text-rose-300 text-xs break-words">
                      <span className="font-bold">Error:</span> {result.error}
                   </div>
              ) : (
                  <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex gap-2">
                          <span className="text-slate-500 w-16 shrink-0">Input:</span>
                          <code className="text-indigo-200">{result.input}</code>
                      </div>
                      <div className="flex gap-2">
                          <span className="text-slate-500 w-16 shrink-0">Expected:</span>
                          <code className="text-emerald-200/80">{result.expected}</code>
                      </div>
                      <div className="flex gap-2">
                          <span className="text-slate-500 w-16 shrink-0">Actual:</span>
                          <code className={result.passed ? 'text-slate-200' : 'text-rose-300 font-bold'}>{result.actual}</code>
                      </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Console;