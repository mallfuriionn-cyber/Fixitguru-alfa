import React from 'react';
import { MENU_ITEMS } from '../constants.tsx';
import { Language, User } from '../types.ts';
import { hasPermission } from '../utils/permissionUtils.ts';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeId: string | null;
  lang: Language;
  user: User | null;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onSelect, activeId, lang, user }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const haptic = (p: number = 5) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  if (!isOpen) return null;

  const isAdmin = user && hasPermission(user, 'ACCESS_KERNEL');

  const getItemClass = (id: string, variant: 'primary' | 'secondary' | 'admin' = 'secondary') => {
    const isActive = activeId === id;
    const base = "w-full flex items-center gap-4 px-5 py-4 rounded-[28px] transition-all duration-300 group relative overflow-hidden";
    
    if (variant === 'primary') {
      return `${base} ${isActive ? 'bg-black text-white shadow-2xl scale-[1.02]' : 'bg-white border border-black/5 text-black hover:bg-black/5 hover:pl-7 shadow-sm'}`;
    }
    
    if (variant === 'admin') {
      return `${base} ${isActive ? 'bg-red-600 text-white shadow-xl scale-[1.02]' : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:pl-7 shadow-sm'}`;
    }

    return `${base} ${isActive ? 'bg-[#007AFF] text-white shadow-xl scale-[1.02]' : 'bg-white border border-black/5 text-black/50 hover:text-black hover:bg-black/5 hover:pl-7 shadow-sm'}`;
  };

  const categories = [
    { id: 'core', label: { cs: 'Systémové Moduly', en: 'Core Modules' } },
    { id: 'legal', label: { cs: 'Právní Nástroje', en: 'Legal Hub' } },
    { id: 'identity', label: { cs: 'Identita & SVID', en: 'Identity' } },
    { id: 'info', label: { cs: 'Informační Protokoly', en: 'Info Pages' } },
    { id: 'future', label: { cs: 'Budoucnost Synthesis', en: 'Future' } }
  ];

  return (
    <div className="fixed inset-0 z-[5000] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        data-ui-id="SYN-BTN-MENU-BACKDROP"
        data-ui-name="Pozadí Menu (Zavřít)"
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Sidebar Panel */}
      <aside 
        data-ui-id="SYN-NAV-SIDEBAR"
        data-ui-name="Postranní Panel Navigace"
        className="relative w-[300px] sm:w-[340px] max-w-[85vw] h-full bg-white/95 backdrop-blur-3xl border-l border-black/10 shadow-2xl animate-slide-in-right flex flex-col pointer-events-auto transition-transform duration-500 ease-out"
      >
        <header className="px-6 sm:px-8 h-24 flex justify-between items-center border-b border-black/5 shrink-0 pt-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Synthesis OS Control</p>
            <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-[#1D1D1F]">Menu</h3>
          </div>
          <button 
            data-ui-id="SYN-BTN-MENU-CLOSE"
            data-ui-name="Zavřít Menu"
            onClick={onClose} 
            onMouseEnter={() => haptic(2)}
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-lg font-bold hover:bg-black hover:text-white active:scale-90 transition-all duration-300"
          >
            ✕
          </button>
        </header>

        <nav data-ui-id="SYN-SEC-MENU-NAV" data-ui-name="Navigační Strom" className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
          {/* Uživatelský profil v menu */}
          <div className="space-y-2">
            <button
              data-ui-id="SYN-BTN-MENU-PROFILE"
              data-ui-name="Menu: Přejít na Profil"
              onClick={() => { haptic(10); onSelect('PROFILE'); }}
              className={getItemClass('PROFILE', 'primary')}
            >
              <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110 duration-500">{user?.avatar || '👤'}</span>
              <div className="text-left leading-tight">
                <p className="text-sm sm:text-base font-black italic tracking-tight">{user?.name}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${activeId === 'PROFILE' ? 'opacity-70' : 'opacity-40'}`}>Guru Profil</p>
              </div>
            </button>

            <button
              data-ui-id="SYN-BTN-MENU-MESSAGES"
              data-ui-name="Menu: Přejít na Zprávy"
              onClick={() => { haptic(10); onSelect('MESSAGES'); }}
              className={getItemClass('MESSAGES', 'primary')}
            >
              <span className="text-xl sm:text-2xl transition-transform group-hover:rotate-12 duration-500">💬</span>
              <div className="text-left leading-tight">
                <p className="text-sm sm:text-base font-black italic tracking-tight">Zprávy</p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${activeId === 'MESSAGES' ? 'opacity-70' : 'opacity-40'}`}>Messenger</p>
              </div>
            </button>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-black/5 space-y-3">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-red-500 px-4 mb-1">Privileged Access</p>
              <button
                data-ui-id="SYN-BTN-MENU-ADMIN"
                data-ui-name="Menu: Kernel Admin"
                onClick={() => { haptic(15); onSelect('ADMIN'); }}
                className={getItemClass('ADMIN', 'admin')}
              >
                <span className="text-xl sm:text-2xl transition-all group-hover:rotate-90 duration-700">⚙️</span>
                <div className="text-left leading-tight">
                  <p className="text-sm sm:text-base font-black italic tracking-tight">Správa Jádra</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${activeId === 'ADMIN' ? 'opacity-70' : 'opacity-40'}`}>Admin Console</p>
                </div>
              </button>
            </div>
          )}

          {categories.map(cat => (
            <div key={cat.id} className="pt-4 border-t border-black/5">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/20 px-4 mb-3">{cat.label[lang]}</p>
              <div className="space-y-2">
                {MENU_ITEMS.filter(item => item.category === cat.id).map((item) => (
                  <button
                    data-ui-id={`SYN-BTN-MENU-ITEM-${item.id}`}
                    data-ui-name={`Menu: ${item.label[lang]}`}
                    key={item.id}
                    onClick={() => { haptic(10); onSelect(item.id); }}
                    className={getItemClass(item.id)}
                  >
                    <span className="text-xl sm:text-2xl transition-transform group-hover:scale-125 duration-500">
                      {item.icon}
                    </span>
                    <div className="text-left leading-tight">
                      <p className={`text-sm sm:text-base font-black italic tracking-tight ${activeId === item.id ? 'text-white' : 'text-black'}`}>
                        {item.label[lang]}
                      </p>
                      <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${activeId === item.id ? 'opacity-70' : 'opacity-40'}`}>
                        {item.description[lang]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <footer className="p-8 border-t border-black/5 text-center shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20 italic">Synthesis Core v5.9.3 Alpha</p>
        </footer>
      </aside>
    </div>
  );
};