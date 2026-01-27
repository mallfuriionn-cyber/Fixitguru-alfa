
import React from 'react';
import { Agent, Language } from '../types.ts';

interface AgentCardProps {
  agent: Agent;
  lang: Language;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, lang, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col justify-between min-h-[160px] p-6 text-left transition-all duration-700 active:scale-[0.97] rounded-[32px] bg-white border border-black/[0.04] shadow-sm hover:shadow-xl hover:translate-y-[-3px] overflow-hidden"
    >
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 blur-[60px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none rounded-full"
        style={{ backgroundColor: agent.color }}
      />
      
      <div className="relative z-10 space-y-3">
        <div className="w-12 h-12 bg-[#FBFBFD] rounded-[18px] flex items-center justify-center text-3xl shadow-inner border border-black/5 transition-all duration-700 group-hover:scale-105">
           <span>{agent.icon}</span>
        </div>

        <div className="space-y-1">
           <h3 className="text-lg font-black tracking-tighter text-[#1D1D1F] leading-tight italic">
             {agent.name}
           </h3>
           <p className="text-[7px] font-black uppercase tracking-[0.1em] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: agent.color }}>
             {agent.title[lang]}
           </p>
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-2">
        <p className="text-[10px] text-black/40 font-bold leading-tight line-clamp-2 group-hover:text-black/70 transition-colors italic">
          {agent.description[lang]}
        </p>
      </div>

      <div className="absolute bottom-6 right-6 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">
         <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white shadow-lg">
            <span className="text-xs">→</span>
         </div>
      </div>
    </button>
  );
};
