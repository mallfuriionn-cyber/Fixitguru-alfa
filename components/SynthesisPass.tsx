
import React from 'react';
import { User, Language } from '../types.ts';
import { UI_TEXTS } from '../constants.tsx';

interface SynthesisPassProps {
  user: User;
  lang: Language;
  onClose?: () => void;
}

export const SynthesisPass: React.FC<SynthesisPassProps> = ({ user, lang, onClose }) => {
  const ui = UI_TEXTS[lang];
  
  // Tier based on level
  const tier = user.level >= 50 ? 'GOLD' : user.level >= 20 ? 'SILVER' : 'BRONZE';
  const tierColor = tier === 'GOLD' ? '#FFD700' : tier === 'SILVER' ? '#C0C0C0' : '#CD7F32';

  return (
    <div className="relative w-full max-w-[320px] aspect-[1/1.58] group animate-synthesis-in perspective-1000">
      {/* Background Holographic Glow */}
      <div className="absolute inset-0 bg-[#007AFF]/20 blur-[60px] rounded-[40px] group-hover:bg-[#007AFF]/40 transition-all duration-700 -z-10"></div>
      
      <div className="w-full h-full glass rounded-[40px] overflow-hidden border border-white/20 shadow-2xl relative flex flex-col p-8 transition-transform duration-700 hover:rotate-y-6 hover:scale-[1.02]">
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg">S</div>
          <div className="text-right">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-[#007AFF]">{ui.synthesisPass}</p>
            <p className="text-[10px] font-black italic text-[#1D1D1F] tracking-tighter">Verified Identity</p>
          </div>
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[32px] border border-black/5 shadow-inner flex items-center justify-center text-5xl">
              {user.avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-black text-white w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border-2 border-white">
              {user.level}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-[#1D1D1F] leading-none">{user.name}</h3>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/30 mt-2">{user.virtualHash}</p>
          </div>
        </div>

        {/* QR Simulation / Security Code */}
        <div className="mt-auto bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-black/5 flex flex-col items-center space-y-3 relative z-10">
          <div className="grid grid-cols-6 gap-1 opacity-20">
             {[...Array(24)].map((_, i) => (
               <div key={i} className={`w-2 h-2 rounded-[2px] ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
             ))}
          </div>
          <p className="text-[7px] font-mono text-black/40 tracking-widest uppercase">Valid: {user.pass?.expiryDate || 'PERPETUAL'}</p>
        </div>

        {/* Tier Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColor }}></div>
           <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">{tier} ACCESS</span>
        </div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-45 pointer-events-none">
           <p className="text-6xl font-black">SYNTHESIS</p>
        </div>
      </div>
      
      {onClose && (
        <button onClick={onClose} className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm shadow-xl active:scale-90 transition-transform">✕</button>
      )}
    </div>
  );
};
