
import React from 'react';
import { User, SocialPost } from '../types.ts';
import { MOCK_SOCIAL_FEED } from '../constants.tsx';

interface SocialModuleProps {
  user: User | null;
  onBack: () => void;
}

export const SocialModule: React.FC<SocialModuleProps> = ({ user, onBack }) => {
  return (
    <div id="social-module" className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-apple-in overscroll-contain">
      <header className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight">The Feed</h2>
        <p className="text-black/40 font-medium italic">Inspirace a postupy od komunity Synthesis.</p>
      </header>

      <div className="space-y-10 pb-32">
        {MOCK_SOCIAL_FEED.map((post) => (
          <article key={post.id} className="bg-white border border-black/[0.06] rounded-[38px] overflow-hidden card-shadow group">
            <div className="p-6 flex items-center justify-between border-b border-black/[0.03]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F2F2F7] rounded-full flex items-center justify-center text-xl shadow-inner">
                  {post.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">{post.author}</p>
                  <p className="text-[9px] font-bold text-[#007AFF] uppercase tracking-widest mt-1.5">{post.type}</p>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black/20">•••</button>
            </div>
            
            <div className="aspect-[4/3] w-full bg-[#F2F2F7] relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
              />
              <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-[9px] font-bold uppercase tracking-widest">
                Synthesis 2026
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight leading-tight">{post.title}</h3>
                <p className="text-black/50 text-sm leading-relaxed font-medium">{post.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.tools.map(tool => (
                  <span key={tool} className="text-[10px] font-bold text-black/30 bg-[#F2F2F7] px-3 py-1.5 rounded-full uppercase tracking-tighter">
                    #{tool.replace(' ', '_')}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 bg-black text-white py-4 rounded-[20px] font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-black/10">
                  Klonovat postup
                </button>
                <button className="w-16 h-14 bg-[#F2F2F7] rounded-[20px] flex items-center justify-center text-xl active:scale-90 transition-all">
                  💬
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Opravený spodní navigační panel */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[320px] px-4">
        <div className="bg-white/80 backdrop-blur-3xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] p-2 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex-1 flex flex-col items-center gap-1 py-2 text-black/30 hover:text-black transition-colors active:scale-90"
          >
            <span className="text-xl">🏠</span>
            <span className="text-[8px] font-black uppercase tracking-widest">Hub</span>
          </button>
          
          <div className="w-px h-8 bg-black/[0.05]" />
          
          <button 
            className="w-14 h-14 bg-black text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-black/20 active:scale-90 transition-all -translate-y-2"
          >
            <span className="text-2xl">⊕</span>
          </button>
          
          <div className="w-px h-8 bg-black/[0.05]" />
          
          <button 
            className="flex-1 flex flex-col items-center gap-1 py-2 text-[#007AFF] active:scale-90"
          >
            <span className="text-xl">🌐</span>
            <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
