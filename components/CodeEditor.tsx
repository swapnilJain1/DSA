import React from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import Prism from 'prismjs';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = 'javascript', readOnly = false }) => {
  
  const highlight = (input: string) => {
    const grammar = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(input, grammar, language);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      const { key } = e;
      const target = e.target as HTMLTextAreaElement;
      const { selectionStart, selectionEnd, value } = target;

      const pairs: Record<string, string> = {
          '(': ')',
          '{': '}',
          '[': ']',
          '"': '"',
          "'": "'"
      };

      if (pairs[key]) {
          e.preventDefault();
          const nextChar = value.substring(selectionStart, selectionStart + 1);
          // If we are just typing the closing character and it's already there (type-over)
          if (nextChar === key && (key === '"' || key === "'")) {
              target.selectionStart = target.selectionEnd = selectionStart + 1;
              return;
          }

          const newValue = value.substring(0, selectionStart) + key + pairs[key] + value.substring(selectionEnd);
          onChange(newValue);
          
          // Must defer cursor update for React rerender cycle
          setTimeout(() => {
              target.selectionStart = target.selectionEnd = selectionStart + 1;
          }, 0);
      }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 font-mono text-sm overflow-hidden rounded-xl border border-slate-800 shadow-inner group flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 select-none z-10 relative shrink-0">
        <span className="uppercase font-bold tracking-wider">{language}</span>
        {!readOnly && (
            <span className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
               Editor Active
            </span>
        )}
      </div>
      
      <div className="flex-1 relative overflow-auto custom-scrollbar bg-[#1d1f21]"> 
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={highlight}
          padding={24}
          disabled={readOnly}
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: '"Fira Code", monospace',
            fontSize: 14,
            backgroundColor: 'transparent',
            minHeight: '100%',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
    </div>
  );
};

export default CodeEditor;