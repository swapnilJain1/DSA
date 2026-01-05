import React from 'react';
import { Download, Upload, Plus, Search, Settings } from 'lucide-react';
import Button from './Button';

interface HeaderProps {
  onAdd: () => void;
  onSearch: (query: string) => void;
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
  viewTitle: string;
}

const Header: React.FC<HeaderProps> = ({ onAdd, onSearch, onExport, onImport, onSettings, viewTitle }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent">
      {/* Left Side: Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{viewTitle}</h2>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-64 transition-all shadow-sm"
          />
        </div>

        <div className="h-8 w-px bg-gray-300 mx-1 hidden md:block"></div>

        <button onClick={onExport} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Export Data">
          <Download className="w-5 h-5" />
          <span className="sr-only">Export</span>
        </button>
        <button onClick={onImport} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Import Data">
          <Upload className="w-5 h-5" />
          <span className="sr-only">Import</span>
        </button>
        <button onClick={onSettings} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm" title="Settings">
          <Settings className="w-5 h-5" />
          <span className="sr-only">Settings</span>
        </button>
        
        <Button onClick={onAdd} icon={<Plus className="w-4 h-4"/>} className="ml-2 shadow-lg shadow-indigo-500/30">
          Add
        </Button>
      </div>
    </header>
  );
};

export default Header;