
import React from 'react';
import { MENU_ITEMS } from '../constants';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/20 animate-in slide-in-from-top-4 duration-300">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <span className="font-bold text-sm tracking-widest text-blue-400">SYNTHESIS MENU</span>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <nav className="p-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left text-sm"
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
