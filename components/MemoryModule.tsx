
import React, { useState } from 'react';
import { MOCK_MEMORY } from '../constants.tsx';

interface MemoryModuleProps {
  onBack: () => void;
}

export const MemoryModule: React.FC<MemoryModuleProps> = ({ onBack }) => {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-8 animate-apple-in">
      <header className="space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">The Memory</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Hledat v historii..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F2F2F7] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 ring-black/5 transition-all"
          />
        </div>
      </header>

      <div className="space-y-3">
        {MOCK_MEMORY.map((thread) => (
          <button key={thread.id} className="w-full p-6 bg-white border border-black/5 rounded-[28px] text-left hover:bg-black/5 transition-all flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-black">{thread.title}</h3>
              <span className="text-[10px] font-bold opacity-30 uppercase">{thread.date}</span>
            </div>
            <p className="text-sm text-black/40 line-clamp-1 italic">{thread.preview}</p>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="w-full py-5 border border-black/5 rounded-3xl font-bold text-black/30 hover:bg-black/5 transition-all">
        Zpět k Hubu
      </button>
    </div>
  );
};
