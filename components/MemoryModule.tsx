
import React, { useState } from 'react';
import { MOCK_MEMORY, COPYRIGHT } from '../constants.tsx';

interface MemoryModuleProps {
  onBack: () => void;
}

export const MemoryModule: React.FC<MemoryModuleProps> = ({ onBack }) => {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest">History Extraction Core</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter italic text-[#1D1D1F]">The Memory</h2>
        <div className="relative max-w-xl">
          <input 
            type="text" 
            placeholder="Hledat v neuronové historii..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 bg-white border border-black/5 rounded-[28px] px-8 outline-none text-base font-bold shadow-sm focus:ring-4 ring-[#007AFF]/5 transition-all"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20">🔍</div>
        </div>
      </header>

      <div className="space-y-4 max-w-3xl mx-auto">
        {MOCK_MEMORY.map((thread) => (
          <button key={thread.id} className="w-full p-8 bg-white border border-black/5 rounded-[44px] text-left hover:shadow-xl hover:border-black/10 transition-all flex flex-col gap-4 group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-black group-hover:bg-[#007AFF] transition-colors"></div>
            <div className="flex justify-between items-center relative z-10">
              <h3 className="font-black italic text-xl tracking-tight text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">{thread.title}</h3>
              <span className="px-3 py-1 bg-black/5 rounded-full text-[9px] font-black text-black/30 uppercase tracking-widest">{thread.date}</span>
            </div>
            <p className="text-sm text-black/40 font-medium leading-relaxed italic line-clamp-2 relative z-10">{thread.preview}</p>
            <div className="flex justify-between items-center pt-2">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#007AFF]">ID: {thread.id.toUpperCase()}</span>
               <span className="text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">EXTRACT →</span>
            </div>
          </button>
        ))}
      </div>

      <footer className="pt-12 text-center opacity-10 pb-10">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-black">{COPYRIGHT}</p>
      </footer>

      <button onClick={onBack} className="w-full py-8 glass rounded-[36px] font-black text-xs uppercase tracking-[0.3em] text-black/20 hover:text-black transition-all active:scale-95 shadow-sm">
        Zpět k Hubu
      </button>
    </div>
  );
};
