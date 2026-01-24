
import React from 'react';
import { MOCK_PROJECTS, AGENTS } from '../constants.tsx';

interface WorkflowModuleProps {
  onBack: () => void;
}

export const WorkflowModule: React.FC<WorkflowModuleProps> = ({ onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-8 animate-apple-in">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight">Workflow</h2>
        <p className="text-black/40 font-medium">Správa vašich aktivních projektů.</p>
      </header>

      <div className="grid gap-4">
        {MOCK_PROJECTS.map((project) => {
          const agent = AGENTS.find(a => a.id === project.agentId);
          return (
            <div key={project.id} className="p-6 bg-white border border-black/5 rounded-[28px] card-shadow flex items-center justify-between group hover:border-black/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center text-2xl">
                  {agent?.icon}
                </div>
                <div>
                  <h3 className="font-bold text-black">{project.title}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Status: {project.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold opacity-30 uppercase">{project.lastUpdate}</p>
                <button className="text-[#007AFF] text-xs font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Otevřít →</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onBack} className="w-full py-5 border border-black/5 rounded-3xl font-bold text-black/30 hover:bg-black/5 transition-all">
        Zpět k Hubu
      </button>
    </div>
  );
};
