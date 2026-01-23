import React from 'react';
import { MENU_ITEMS } from '../constants';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeModal: string | null;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onSelect, activeModal }) => {
  // Always render but hide if not open for sidebar feel, 
  // though user requested Left Sidebar (Hamburger menu).
  // We'll implement it as a collapsible sidebar.

  return (
    <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out border-r border-white/10 acrylic-deep ${isOpen ? 'w-64' : 'w-0 overflow-hidden md:w-16'}`}>
      <div className="flex flex-col h-full pt-20">
        <nav className="flex-1 px-2 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-fluent transition-all group reveal-focus ${activeModal === item.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              title={item.label}
            >
              <span className="text-xl opacity-80 group-hover:opacity-100">{item.icon}</span>
              <span className={`text-sm font-medium transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 opacity-40 text-[9px] uppercase tracking-tighter">
          {isOpen && "Studio Synthesis v2.1"}
        </div>
      </div>
    </aside>
  );
};