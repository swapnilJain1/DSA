import React from 'react';
import { CheckCircle2, AlertTriangle, Target, Undo2, X } from 'lucide-react';

interface Toast {
    id: number;
    message: string;
    type: string;
    undoAction?: string;
    undoData?: any;
}

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: number) => void;
    handleUndo: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast, handleUndo }) => (
    <div className="fixed bottom-24 md:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-xs px-4 md:max-w-md md:px-0 transition-all duration-300">
        {toasts.map((toast) => (
            <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md transform transition-all duration-300 pointer-events-auto border ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : toast.type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-800' : 'bg-white/90 border-gray-200 text-slate-800'}`}>
                {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                {toast.type === 'error' && <AlertTriangle size={18} className="text-rose-500" />}
                {toast.type === 'info' && <Target size={18} className="text-slate-500" />}
                <span className="text-sm font-semibold flex-1">{toast.message}</span>
                {toast.undoAction && <button onClick={() => handleUndo(toast.id)} className="flex items-center gap-1 text-xs font-bold bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded transition-colors"><Undo2 size={14} /> Undo</button>}
                <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={16} /></button>
            </div>
        ))}
    </div>
);

export default ToastContainer;