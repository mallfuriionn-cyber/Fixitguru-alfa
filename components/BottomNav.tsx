import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onHome: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeId, onSelect, onHome }) => {
  const items: NavItem[] = [
    { id: 'HUB', label: 'Domů', icon: '🏠' },
    { id: 'CLAIM_GUIDE', label: 'Reklamace', icon: '📋' },
    { id: 'LUCIE_WORKSHOP', label: 'Dílna', icon: '🛠️' },
    { id: 'MESSAGES', label: 'Zprávy', icon: '💬' },
    { id: 'PROFILE', label: 'Profil', icon: '👤' }
  ];

  const isActive = (id: string) => activeId === id;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-2xl border-t border-black/[0.04] flex items-center justify-around px-2 z-[90] pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => item.id === 'HUB' ? onHome() : onSelect(item.id)}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all active:scale-90 ${
            isActive(item.id) ? 'text-[#007AFF]' : 'text-black/20'
          }`}
        >
          <span className={`text-xl transition-transform ${isActive(item.id) ? 'scale-110 mb-0.5' : ''}`}>{item.icon}</span>
          <span className={`text-[7px] font-black tracking-widest uppercase transition-opacity ${isActive(item.id) ? 'opacity-100' : 'opacity-60'}`}>
            {item.label}
          </span>
          {isActive(item.id) && (
            <div className="w-1 h-1 bg-[#007AFF] rounded-full mt-0.5 absolute bottom-1" />
          )}
        </button>
      ))}
    </nav>
  );
};
