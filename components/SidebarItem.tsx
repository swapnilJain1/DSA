import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, count, collapsed }) => (
  <button 
    onClick={onClick} 
    title={collapsed ? label : ''} 
    className={`
        flex items-center transition-all duration-300 rounded-xl mb-2 group relative flex-shrink-0 overflow-hidden
        ${collapsed ? 'justify-center w-12 h-12 p-0 mx-auto' : 'w-full px-4 py-3 justify-between'} 
        ${active 
            ? 'btn-glossy text-white shadow-lg' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:shadow-inner'}
    `}
  >
    <div className={`flex items-center relative z-10 ${collapsed ? 'gap-0' : 'gap-3'}`}>
      <Icon size={20} className={`transition-colors duration-300 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-300'}`} />
      {!collapsed && <span className={`font-medium text-sm transition-colors ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</span>}
    </div>
    {!collapsed && count !== undefined && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold relative z-10 border ${active ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/5 text-slate-400 group-hover:text-slate-200'}`}>
        {count}
      </span>
    )}
  </button>
);

export default SidebarItem;