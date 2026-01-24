
import React from 'react';
import { Agent } from '../types.ts';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group bg-white p-5 text-left transition-all active:scale-[0.96] flex flex-col justify-between min-h-[190px] md:min-h-[240px] rounded-[40px] border border-black/5 shadow-sm hover:shadow-2xl hover:border-black/10 relative overflow-hidden"
    >
      {/* Background Aura */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-24 h-24 blur-[40px] opacity-[0.03] transition-opacity group-hover:opacity-[0.1]"
        style={{ backgroundColor: agent.color }}
      />
      
      {/* Icon & Meta */}
      <div className="relative z-10 space-y-3">
        <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-all group-hover:scale-110 group-hover:-rotate-3 duration-500 ease-out">
           {agent.icon}
        </div>
        <div className="space-y-1">
           <h3 className="text-lg md:text-xl font-black tracking-tight text-[#1D1D1F] leading-tight italic">{agent.name}</h3>
           <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: agent.color }}>
             {agent.title}
           </p>
        </div>
      </div>
      
      {/* Description */}
      <p className="relative z-10 text-[11px] md:text-[13px] text-black/40 font-medium leading-relaxed mt-4 line-clamp-2 md:line-clamp-3 group-hover:text-black/60 transition-colors">
        {agent.description}
      </p>

      {/* indicator */}
      <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
         <span className="text-sm font-black" style={{ color: agent.color }}>→</span>
      </div>
    </button>
  );
};
