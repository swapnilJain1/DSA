import React, { memo } from 'react';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = memo(({ content }) => {
  if (!content) return <p className="text-slate-500 italic">No description provided.</p>;
  
  const lines = content.split('\n');
  let inTable = false;
  let inCodeBlock = false;
  let tableRows: React.ReactElement[] = [];
  const output: React.ReactElement[] = [];

  // Helper to parse inline styles: Bold (**text**) and Code (`text`)
  const parseInline = (text: string) => {
    // Regex splits the text into tokens: bold, code, or normal text
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-white/10 text-indigo-300 font-mono text-xs px-1.5 py-0.5 rounded border border-white/10 shadow-sm">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-white shadow-black drop-shadow-sm">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
  };

  lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Code Block Logic
      if (trimmed.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (!inCodeBlock) {
              // Closing block
              output.push(
                  <div key={`code-end-${idx}`} className="my-4" />
              );
          }
          return; // Skip the delimiter line
      }

      if (inCodeBlock) {
          output.push(
              <div key={idx} className="bg-black/40 text-slate-300 px-4 py-0.5 font-mono text-sm border-l-2 border-indigo-500 whitespace-pre-wrap backdrop-blur-md">
                  {line}
              </div>
          );
          return;
      }

      // Table Logic
      if (trimmed.startsWith('|')) {
          inTable = true;
          const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
          const isHeader = lines[idx+1]?.includes('---');
          if (!line.includes('---')) {
              tableRows.push(
                  <tr key={idx} className={isHeader ? "bg-white/10 font-bold text-white" : "border-b border-white/5 hover:bg-white/5 transition-colors"}>
                      {cells.map((cell, cIdx) => <td key={cIdx} className="p-3 border-r border-white/5 last:border-r-0 text-slate-300">{cell}</td>)}
                  </tr>
              );
          }
      } else {
          // End Table if needed
          if (inTable) {
              output.push(<div key={`tbl-${idx}`} className="rounded-xl overflow-hidden border border-white/10 my-4 shadow-sm bg-black/20"><table className="w-full text-sm border-collapse">{tableRows}</table></div>);
              tableRows = [];
              inTable = false;
          }
          
          if (trimmed) {
              // Headers
              if (trimmed.startsWith('###')) {
                   output.push(<h3 key={idx} className="text-md font-bold text-indigo-200 mt-6 mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{trimmed.replace('###', '')}</h3>);
              } else if (trimmed.startsWith('##')) {
                   output.push(<h2 key={idx} className="text-lg font-bold text-white mt-8 mb-3 border-b border-white/10 pb-2">{trimmed.replace('##', '')}</h2>);
              } else if (trimmed.startsWith('- ')) {
                   // Bullet points
                   output.push(<li key={idx} className="ml-4 list-disc text-slate-300 leading-relaxed mb-1 pl-1 marker:text-indigo-400">{parseInline(trimmed.replace('- ', ''))}</li>)
              } else {
                  // Standard Paragraph
                  output.push(<p key={idx} className="mb-2 text-slate-300 leading-relaxed tracking-wide font-light">{parseInline(line)}</p>);
              }
          }
      }
  });
  // Flush remaining table if ends on table
  if (inTable) output.push(<div key="tbl-end" className="rounded-xl overflow-hidden border border-white/10 my-4 shadow-sm bg-black/20"><table className="w-full text-sm border-collapse">{tableRows}</table></div>);

  return <div className="prose prose-sm prose-invert max-w-none pb-4">{output}</div>;
});

export default MarkdownView;