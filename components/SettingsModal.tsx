import React, { useState, useEffect } from 'react';
import { Settings, X, Key, ShieldCheck, ExternalLink, Save, Trash2, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: string, undo: any) => void;
  apiKey: string;
  onSave: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, showToast, apiKey, onSave }) => {
    const [inputKey, setInputKey] = useState(apiKey);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        setInputKey(apiKey);
    }, [apiKey, isOpen]);

    const handleSave = () => {
        if (!inputKey.trim()) {
            showToast("Please enter a valid API Key", "error", null);
            return;
        }
        onSave(inputKey.trim());
        onClose();
    };

    const handleClear = () => {
        onSave('');
        setInputKey('');
        showToast("API Key removed", "info", null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Settings size={20} className="text-indigo-600"/> Settings
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-200 p-1">
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* API Key Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Key size={16} className="text-amber-500" /> Google Gemini API Key
                            </label>
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                            >
                                Get API Key <ExternalLink size={10} />
                            </a>
                        </div>
                        
                        <div className="relative group">
                            <input
                                type={showKey ? "text" : "password"}
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="Paste your API key here..."
                                className={`w-full bg-slate-50 border ${apiKey ? 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl px-4 py-3 pr-12 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all shadow-inner font-mono`}
                            />
                            <button 
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {apiKey && (
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                <ShieldCheck size={14} /> Key is configured and saved locally.
                            </div>
                        )}

                        <div className="flex gap-3">
                             <button 
                                onClick={handleSave}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                             >
                                <Save size={16} /> {apiKey ? 'Update Key' : 'Save Key'}
                             </button>
                             {apiKey && (
                                 <button 
                                    onClick={handleClear}
                                    className="bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 px-4 py-2.5 rounded-lg transition-all"
                                    title="Remove Key"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                             )}
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={14} /> Privacy & Security Model
                        </h4>
                        <ul className="space-y-2">
                            <li className="flex gap-3 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                                <span><strong>Local Storage Only:</strong> Your API key is stored directly in your browser's local storage.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                                <span><strong>Direct Connection:</strong> Requests are sent directly from your browser to Google's servers. No intermediate backend server sees your key.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                                <span><strong>BYOK:</strong> "Bring Your Own Key" ensures you have full control over your usage and limits.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;