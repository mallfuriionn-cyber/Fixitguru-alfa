
import React from 'react';
import { MOCK_CLOUD, AGENTS, COPYRIGHT } from '../constants.tsx';

interface CloudModuleProps {
  onBack: () => void;
}

export const CloudModule: React.FC<CloudModuleProps> = ({ onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="flex justify-between items-end pt-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#007AFF]/10 rounded-full border border-[#007AFF]/20">
            <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#007AFF]">Synthesis Media Cloud</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter italic text-[#1D1D1F]">Media</h2>
          <p className="text-sm text-black/40 font-medium italic">Schémata, datasheety a fotodokumentace.</p>
        </div>
        <button className="h-12 px-8 glass border border-black/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">Spravovat</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {MOCK_CLOUD.map((file) => {
          const agent = AGENTS.find(a => a.id === file.agentId);
          return (
            <div key={file.id} className="aspect-square bg-white border border-black/5 rounded-[40px] overflow-hidden relative group shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
              <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              
              {/* Overlay elements */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-xl hover:scale-110 transition-transform">↗</button>
              </div>

              {agent && (
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center text-xl shadow-lg border border-white/40">
                  {agent.icon}
                </div>
              )}
              {file.type === 'schema' && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/10">
                  Blueprint
                </div>
              )}
            </div>
          );
        })}
        <button className="aspect-square border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center gap-3 text-black/10 hover:border-[#007AFF]/20 hover:text-[#007AFF] hover:bg-white transition-all group">
          <span className="text-4xl group-hover:scale-125 transition-transform">⊕</span>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100">Upload</span>
        </button>
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
