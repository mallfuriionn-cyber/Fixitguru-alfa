
import React from 'react';
import { MOCK_CLOUD, AGENTS } from '../constants.tsx';

interface CloudModuleProps {
  onBack: () => void;
}

export const CloudModule: React.FC<CloudModuleProps> = ({ onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-8 animate-apple-in">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight">Media</h2>
          <p className="text-black/40 font-medium">Cloud Studio Synthesis</p>
        </div>
        <button className="text-[#007AFF] text-sm font-bold">Vybrat</button>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {MOCK_CLOUD.map((file) => {
          const agent = AGENTS.find(a => a.id === file.agentId);
          return (
            <div key={file.id} className="aspect-square bg-[#F2F2F7] rounded-xl overflow-hidden relative group">
              <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {agent && (
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-white/80 backdrop-blur rounded-lg flex items-center justify-center text-xs">
                  {agent.icon}
                </div>
              )}
              {file.type === 'schema' && (
                <div className="absolute top-1 left-1 bg-black/50 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Schema
                </div>
              )}
            </div>
          );
        })}
        <button className="aspect-square border-2 border-dashed border-black/5 rounded-xl flex items-center justify-center text-2xl text-black/10 hover:border-black/20 hover:text-black/20 transition-all">
          +
        </button>
      </div>

      <button onClick={onBack} className="w-full py-5 border border-black/5 rounded-3xl font-bold text-black/30 hover:bg-black/5 transition-all">
        Zpět k Hubu
      </button>
    </div>
  );
};
