
import React from 'react';
import { MENU_ITEMS } from '../constants.tsx';
import { Language, User } from '../types.ts';
import { hasPermission } from '../utils/permissionUtils.ts';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeModal: string | null;
  lang: Language;
  user: User | null;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onSelect, activeModal, lang, user }) => {
  // Přidání efektu pro zablokování scrollu na body při otevřeném menu
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = user && hasPermission(user, 'ACCESS_KERNEL');

  return (
    <div className="fixed inset-0 z-[5000] flex justify-end overflow-hidden transition-all">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 animate-fade-in" 
        onClick={onClose} 
      />
      <aside className="relative w-[320px] h-full bg-white/90 backdrop-blur-3xl border-l border-black/5 shadow-2xl animate-slide-in-right flex flex-col pointer-events-auto">
        <header className="px-8 h-24 flex justify-between items-center border-b border-black/5 shrink-0 pt-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#007AFF]">System Control</p>
            <h3 className="text-3xl font-black italic tracking-tighter text-[#1D1D1F]">Menu</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-lg font-bold active:scale-90 transition-transform">✕</button>
        </header>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          {isAdmin && (
            <div className="mb-4 space-y-1.5">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 px-4 mb-2">Privileged Access</p>
              <button
                onClick={() => onSelect('ADMIN')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[28px] transition-all group border-2 ${
                  activeModal === 'ADMIN' 
                  ? 'bg-black text-white border-black shadow-xl' 
                  : 'bg-white border-red-500/5 hover:border-red-500/20 text-red-600 shadow-sm'
                }`}
              >
                <span className="text-2xl">⚙️</span>
                <div className="text-left leading-tight">
                  <p className="text-base font-black italic tracking-tight">Správa Jádra</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Admin Console</p>
                </div>
              </button>
              <div className="h-px bg-black/5 mx-4 mt-4"></div>
            </div>
          )}

          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/20 px-4 mb-2">Informace</p>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[28px] transition-all group ${
                activeModal === item.id ? 'bg-[#007AFF] text-white shadow-xl' : 'hover:bg-black/5 text-[#1D1D1F]/50 text-left'
              }`}
            >
              <span className={`text-2xl transition-transform group-hover:scale-110 ${activeModal === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <div className="text-left leading-tight">
                <p className={`text-base font-black italic tracking-tight ${activeModal === item.id ? 'text-white' : 'text-[#1D1D1F] group-hover:text-black'}`}>
                  {item.label[lang]}
                </p>
                <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${activeModal === item.id ? 'opacity-70' : 'opacity-40'}`}>
                  {item.description[lang]}
                </p>
              </div>
            </button>
          ))}
        </nav>
        
        <footer className="p-8 border-t border-black/5 text-center shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 italic">Synthesis Kernel v5.7 Alpha</p>
        </footer>
      </aside>
    </div>
  );
};
