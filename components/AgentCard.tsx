
import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group glass p-6 rounded-[2.5rem] text-left hover:bg-white/15 transition-all duration-500 border border-white/10 hover:border-white/30 hover:scale-[1.02] flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-xl"
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: agent.color }}
      />
      
      <div>
        <div className="text-4xl mb-4 p-3 glass inline-block rounded-2xl border-white/5 shadow-inner">
          {agent.icon}
        </div>
        <h3 className="text-2xl font-black tracking-tight">{agent.name}</h3>
        <p className="text-sm font-semibold mb-2" style={{ color: agent.color }}>{agent.title}</p>
      </div>
      
      <p className="text-xs text-white/60 font-light leading-relaxed">
        {agent.description}
      </p>
    </button>
  );
};
