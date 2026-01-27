
import React, { useState, useEffect } from 'react';
import { AGENTS, COPYRIGHT } from '../constants.tsx';
import { Project } from '../types.ts';
import { db } from '../services/storageService.ts';

interface WorkflowModuleProps {
  onBack: () => void;
  onConsult?: (project: Project) => void;
}

export const WorkflowModule: React.FC<WorkflowModuleProps> = ({ onBack, onConsult }) => {
  const [projects, setProjects] = useState<Project[]>(db.getAll('projects'));

  useEffect(() => {
    const handleUpdate = () => setProjects(db.getAll('projects'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-4 pt-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#007AFF]/10 rounded-full border border-[#007AFF]/20">
          <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#007AFF]">Project Management Core</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter italic text-[#1D1D1F]">Moje Projekty</h2>
      </header>

      <div className="grid gap-5 max-w-3xl mx-auto">
        {projects.map((project) => {
          const agent = AGENTS.find(a => a.id === project.agentId);
          return (
            <div key={project.id} className="p-8 bg-white border border-black/5 rounded-[44px] shadow-sm group hover:shadow-xl hover:border-black/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-[0.03]" style={{ backgroundColor: agent?.color }}></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[22px] bg-[#F2F2F7] flex items-center justify-center text-3xl shadow-inner border border-black/5 group-hover:scale-110 transition-transform duration-500">
                    {agent?.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-black italic text-xl tracking-tight text-[#1D1D1F]">{project.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase rounded-full tracking-widest shadow-sm">
                        {project.status}
                      </span>
                      <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">Lokalita: Dílna</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onConsult && onConsult(project)}
                    className="flex-1 md:flex-none h-12 px-6 bg-[#007AFF] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Konzultovat s týmem
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        <button className="w-full py-10 border-2 border-dashed border-black/5 rounded-[44px] flex flex-col items-center justify-center gap-3 text-black/20 hover:text-[#007AFF] hover:border-[#007AFF]/20 hover:bg-white transition-all group">
           <span className="text-3xl group-hover:scale-125 transition-transform">⊕</span>
           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Nový Projekt</span>
        </button>
      </div>

      <footer className="pt-12 text-center opacity-10 pb-10">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-black">{COPYRIGHT}</p>
      </footer>
    </div>
  );
};
