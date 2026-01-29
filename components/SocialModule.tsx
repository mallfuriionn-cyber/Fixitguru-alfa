import React, { useState, useEffect } from 'react';
import { User, SocialPost } from '../types.ts';
import { COPYRIGHT } from '../constants.tsx';
import { db } from '../services/storageService.ts';

interface SocialModuleProps {
  user: User | null;
  onBack: () => void;
}

export const SocialModule: React.FC<SocialModuleProps> = ({ user, onBack }) => {
  const [posts, setPosts] = useState<SocialPost[]>(db.getAll('posts'));

  useEffect(() => {
    const handleUpdate = () => setPosts(db.getAll('posts'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  return (
    <div id="social-module" className="p-6 md:p-12 space-y-12 animate-synthesis-in overscroll-contain no-scrollbar relative">
      <div className="space-y-10 pb-20 max-w-2xl mx-auto">
        {posts.map((post) => (
          <article key={post.id} className="bg-white border border-black/5 rounded-[56px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group relative">
            {/* Header */}
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-black/5">
                  {post.avatar}
                </div>
                <div>
                  <p className="font-black text-base italic leading-none text-[#1D1D1F]">{post.author}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-1 h-1 bg-[#007AFF] rounded-full"></span>
                    <p className="text-[9px] font-bold text-[#007AFF] uppercase tracking-widest">{post.type}</p>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-black/20">•••</button>
            </div>
            
            {/* Image Section */}
            <div className="aspect-[16/10] w-full bg-[#F2F2F7] relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
              />
              <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-xl">
                Synthesis 2026
              </div>
            </div>

            {/* Content */}
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <h3 className="text-3xl font-black italic tracking-tighter leading-none text-[#1D1D1F]">{post.title}</h3>
                <p className="text-black/50 text-sm leading-relaxed font-medium">{post.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tools.map(tool => (
                  <span key={tool} className="text-[9px] font-black text-black/40 bg-black/5 px-4 py-2 rounded-full uppercase tracking-widest border border-black/5">
                    #{tool.replace(' ', '_')}
                  </span>
                ))}
              </div>

              <div className="pt-6 flex gap-4">
                <button className="flex-1 bg-black text-white py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-black/10 hover:bg-black/90">
                  Klonovat postup
                </button>
                <button className="w-16 h-16 bg-[#F2F2F7] rounded-[28px] flex items-center justify-center text-xl active:scale-90 transition-all hover:bg-black/5 border border-black/5 shadow-sm">
                  💬
                </button>
              </div>
            </div>
          </article>
        ))}

        <footer className="text-center opacity-10 py-10">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-black italic">{COPYRIGHT}</p>
        </footer>
      </div>

      <button 
        className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-[30px] flex items-center justify-center shadow-2xl shadow-black/30 active:scale-90 transition-all border-4 border-[#FBFBFD] z-[100]"
      >
        <span className="text-3xl font-light">＋</span>
      </button>
    </div>
  );
};