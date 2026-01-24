
import React, { useState } from 'react';
import { User, AgentId } from '../types.ts';
import { AGENTS } from '../constants.tsx';

interface UserDetailPanelProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
}

export const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ user, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'insight' | 'permissions'>('identity');

  const updatePermission = (key: keyof NonNullable<User['permissions']>) => {
    const currentPermissions = user.permissions || {
      canPublishWithoutApproval: false,
      hasExpertManuals: false,
      isAgeVerified: false,
      isModerator: false,
    };
    onUpdateUser({
      ...user,
      permissions: {
        ...currentPermissions,
        [key]: !currentPermissions[key],
      },
    });
  };

  const activeAgent = AGENTS.find(a => a.id === user.activeAssistantId);

  return (
    <div className="fixed inset-0 z-[150] bg-[#FBFBFD] animate-synthesis-in flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-[#007AFF]/5 blur-[120px] -z-10"></div>
      
      <header className="px-8 pt-12 pb-6 border-b border-black/5 flex justify-between items-end shrink-0 backdrop-blur-3xl bg-white/80">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Synthesis Guru Insight</p>
          <h2 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">Profil Gurua: {user.name}</h2>
        </div>
        <button onClick={onClose} className="h-12 px-8 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
          Zavřít Panel
        </button>
      </header>

      <nav className="flex px-6 h-[64px] border-b border-black/5 gap-1 shrink-0 items-center bg-white/50 backdrop-blur-md">
        {[
          { id: 'identity', label: 'Identita' },
          { id: 'insight', label: 'Aktivita' },
          { id: 'permissions', label: 'Oprávnění' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`h-[40px] px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'text-black/30 hover:bg-black/5'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar pb-32">
        {activeTab === 'identity' && (
          <div className="space-y-10 animate-synthesis-in">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-10 rounded-[48px] border-black/5 space-y-6 shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-white border border-black/5 text-black rounded-[28px] flex items-center justify-center text-4xl shadow-sm">
                      {user.avatar}
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30 text-black">Public Virtual Hash</p>
                      <p className="text-xl font-black text-[#007AFF] italic">{user.virtualHash}</p>
                   </div>
                </div>
                <div className="pt-6 space-y-3">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-black">Guru Level / Progress</p>
                      <span className="text-xs font-black text-black/60 italic">{user.guruLevelLabel || 'Lvl ' + user.level}</span>
                   </div>
                   <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden border border-black/5">
                      <div className="h-full bg-[#007AFF] rounded-full shadow-[0_0_12px_rgba(0,122,255,0.2)]" style={{ width: `${Math.min(100, (user.level / 100) * 100)}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="glass p-10 rounded-[48px] border-black/5 space-y-6 shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-white border border-black/5 text-black rounded-[28px] flex items-center justify-center text-4xl shadow-sm">
                      {activeAgent?.icon || '🤖'}
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30 text-black">Aktivní Synthesis Asistent</p>
                      <p className="text-xl font-black text-black italic">{activeAgent?.name || 'Všeobecný Jádro'}</p>
                   </div>
                </div>
                <p className="text-xs text-black/30 font-medium leading-relaxed italic border-t border-black/5 pt-6">
                   "Uživatel preferuje technickou hloubku a multimodální analýzu schémat."
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
