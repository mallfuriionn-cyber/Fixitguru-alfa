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
      className="group acrylic p-5 text-left transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[160px] relative overflow-hidden reveal-focus"
    >
      <div 
        className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: agent.color }}
      />
      
      <div>
        <div className="text-3xl mb-3 opacity-90 group-hover:scale-110 transition-transform inline-block">
          {agent.icon}
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white/90">{agent.name}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: agent.color }}>
          {agent.title}
        </p>
      </div>
      
      <p className="text-xs text-white/50 leading-snug">
        {agent.description}
      </p>
    </button>
  );
};