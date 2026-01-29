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
      className="group relative flex flex-col items-center justify-center p-8 text-center transition-all duration-300 active:scale-[0.97] rounded-[48px] bg-white border border-black/[0.03] shadow-sm hover:shadow-xl overflow-hidden aspect-[0.9/1]"
    >
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Icon Square Container */}
        <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-4xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.02)] border border-black/[0.02] transition-transform duration-500 group-hover:scale-110">
           <span style={{ color: agent.color }}>{agent.icon}</span>
        </div>

        <div className="space-y-1.5">
           <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-black leading-none uppercase">
             {agent.name}
           </h3>
           <p 
             className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none"
             style={{ color: agent.color }}
           >
             {agent.title[lang]}
           </p>
        </div>
      </div>
      
      {/* Subtle Background Glow */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: agent.color }}
      />
    </button>
  );
};