
import React from 'react';
import { MENU_ITEMS } from '../constants.tsx';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeModal: string | null;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onSelect, activeModal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <aside className="relative w-full max-w-[320px] h-full bg-white/90 backdrop-blur-3xl border-l border-black/5 shadow-2xl animate-slide-in-right flex flex-col">
        <header className="px-6 pt-12 pb-6 flex justify-between items-center border-b border-black/5">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#007AFF]">System Navigation</p>
            <h3 className="text-xl font-black italic tracking-tighter">Menu</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-sm font-bold active:scale-90 transition-transform"
          >
            ✕
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-3xl transition-all group ${
                activeModal === item.id ? 'bg-[#007AFF] text-white shadow-xl' : 'hover:bg-black/5 text-black/60'
              }`}
            >
              <span className={`text-2xl transition-transform group-hover:scale-110 ${activeModal === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <div className="text-left">
                <p className={`text-sm font-black italic tracking-tight leading-none ${activeModal === item.id ? 'text-white' : 'text-black'}`}>
                  {item.label}
                </p>
                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-40 ${activeModal === item.id ? 'text-white/80' : ''}`}>
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </nav>
        
        <footer className="p-8 border-t border-black/5 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 italic">
            Studio Synthesis v2.1
          </p>
        </footer>
      </aside>
    </div>
  );
};
