
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';

interface ProfileModuleProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLoginClick?: () => void;
  onRegisterDetailedClick?: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  user, 
  onUpdateUser, 
  onBack, 
  onLoginClick, 
  onRegisterDetailedClick 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [editedBio, setEditedBio] = useState(user?.bio || '');

  if (!user) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 animate-synthesis-in bg-[#FBFBFD]">
      <div className="relative">
        <div className="w-32 h-32 glass rounded-[40px] flex items-center justify-center text-6xl shadow-inner border border-black/5 animate-pulse text-black/10">
          👤
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#007AFF] text-white p-3 rounded-full border-4 border-[#FBFBFD] shadow-2xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" /></svg>
        </div>
      </div>

      <div className="space-y-4 max-w-xs">
        <h2 className="text-4xl font-black tracking-tight text-[#1D1D1F] italic">Anonymous</h2>
        <p className="text-black/40 text-sm font-medium leading-relaxed">
          Vstoupili jste jako host. Pro plný přístup k Synthesis ID, historii oprav a Media Cloud se musíte identifikovat.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button 
          onClick={onLoginClick}
          className="w-full py-6 bg-black text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
        >
          Přihlásit k ID
        </button>
        <button 
          onClick={onRegisterDetailedClick}
          className="w-full py-6 glass text-black rounded-[28px] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all border border-black/10"
        >
          Vytvořit Synthesis ID
        </button>
      </div>

      <button 
        onClick={onBack} 
        className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] hover:text-black transition-colors pt-4"
      >
        ← Zpět k Hubu
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-10 animate-synthesis-in pb-32 bg-[#FBFBFD]">
      {/* Identity Card Header */}
      <header className="relative p-10 glass rounded-[56px] border border-black/5 id-card-glow overflow-hidden pulse-aura">
        <div className="absolute top-0 right-0 p-8">
           <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center border border-black/5">
              <span className="text-[10px] font-mono font-bold text-[#007AFF]">ID</span>
           </div>
        </div>
        
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8 relative z-10">
          <div className="relative">
             <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-6xl shadow-2xl border border-black/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#007AFF]/5 to-transparent"></div>
                {user.avatar}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-[#007AFF] text-white text-[10px] font-black px-4 py-2 rounded-full border-4 border-[#FBFBFD] shadow-xl">
               LVL {user.level}
             </div>
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">{user.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.4em]">Public Hash: {user.virtualHash}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-black/5 text-black/60 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-black/5">
                {user.role}
              </span>
              {user.isOwner && (
                <span className="bg-[#007AFF] text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-blue-500/40">
                  ✦ Core Owner
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-black/5 grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Repairs</p>
              <p className="text-2xl font-black italic">{user.stats.repairs}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Success</p>
              <p className="text-2xl font-black italic text-green-600">{user.stats.success}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Posts</p>
              <p className="text-2xl font-black italic">{user.stats.publishedPosts}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Trust Score</p>
              <p className="text-2xl font-black italic text-blue-600">9.8</p>
           </div>
        </div>
      </header>

      {/* Secret ID Section - High Security */}
      <section className="glass border border-red-500/10 rounded-[48px] p-10 space-y-6 bg-red-500/[0.01]">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60">Secret Synthesis ID</h3>
            <p className="text-[9px] font-bold text-black/20 uppercase italic leading-none">Nikomu nesdělovat. Ani administrátor toto ID nevidí.</p>
          </div>
          <button 
            onClick={() => setShowSecret(!showSecret)}
            className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-black/5 hover:border-red-500/20 transition-all shadow-sm"
          >
            {showSecret ? '🔒' : '👁️'}
          </button>
        </div>
        
        <div className="relative h-16 bg-[#F2F2F7] rounded-2xl flex items-center justify-center border border-black/5 overflow-hidden">
           {showSecret ? (
             <span className="text-xl font-mono font-black tracking-widest text-red-600 animate-synthesis-in">
               {user.secretId}
             </span>
           ) : (
             <div className="flex gap-2">
               {[1,2,3,4,5,6,7].map(i => (
                 <div key={i} className="w-3 h-3 bg-black/5 rounded-full blur-[2px]"></div>
               ))}
             </div>
           )}
        </div>
      </section>

      {/* Hardware Log */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 px-4">Hardware Log (Handshake)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {user.equipment.map(item => (
             <div key={item} className="p-6 glass rounded-[32px] border border-black/5 flex flex-col gap-3 group hover:border-[#007AFF]/20 transition-all shadow-sm">
                <span className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">🛠️</span>
                <p className="text-xs font-bold text-black/80 uppercase tracking-tight leading-tight">{item}</p>
             </div>
           ))}
           <button className="p-6 border-2 border-dashed border-black/5 rounded-[32px] flex items-center justify-center text-black/10 font-black text-xs uppercase tracking-widest hover:border-[#007AFF]/40 hover:text-[#007AFF] transition-all">
              + ADD HW
           </button>
        </div>
      </section>

      <div className="pt-8 space-y-4">
        <button onClick={onBack} className="w-full py-6 glass rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all active:scale-95 shadow-sm">
          Zpět k Terminálu
        </button>
        <button onClick={() => window.location.reload()} className="w-full py-2 text-[9px] font-black text-red-500/40 uppercase tracking-[0.4em] hover:text-red-500 transition-colors">
          Disconnect Synthesis ID
        </button>
      </div>
    </div>
  );
};
