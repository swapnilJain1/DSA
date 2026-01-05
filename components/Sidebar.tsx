import React from 'react';
import { LayoutDashboard, ListTodo, PieChart, Menu, X, Code2 } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: any) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  totalCount: number;
  todoCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, totalCount, todoCount }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: totalCount },
    { id: 'todo', icon: ListTodo, label: 'To-Do List', badge: todoCount },
    { id: 'analytics', icon: PieChart, label: 'Analytics', badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button (Floating) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-50 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-white transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl lg:shadow-none
      `}>
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">DSA Master</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Track. Practice.</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-1">
          <nav className="space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${currentView === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full
                    ${currentView === item.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Card */}
        <div className="p-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm text-gray-200">Weekly Goal</h4>
                <span className="text-orange-400">🔥</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                 <span className="text-2xl font-bold text-white">2</span>
                 <span className="text-sm text-gray-500 mb-1">/ 5</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[40%] rounded-full"></div>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-[10px] text-gray-600">v1.0.0 &copy; 2024</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;