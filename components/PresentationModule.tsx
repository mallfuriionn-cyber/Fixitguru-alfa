
import React from 'react';
import { COPYRIGHT } from '../constants.tsx';

interface PresentationModuleProps {
  onBack: () => void;
}

export const PresentationModule: React.FC<PresentationModuleProps> = ({ onBack }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#000814] text-white animate-fade-in no-scrollbar h-full selection:bg-[#007AFF] selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#007AFF]/10 blur-[200px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-[#007AFF]/5 blur-[150px] rounded-full"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 h-20 px-10 flex justify-between items-center z-50 backdrop-blur-3xl bg-[#000814]/60 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white text-black font-black flex items-center justify-center rounded-2xl shadow-xl">S</div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#007AFF] leading-none mb-0.5">Synthesis Terminal</span>
            <span className="font-black italic tracking-tighter text-2xl leading-none">FixIt Guru</span>
          </div>
        </div>
        <button onClick={onBack} className="h-10 px-8 glass-dark rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all">Zavřít Prezentaci</button>
      </nav>

      <div className="max-w-6xl mx-auto px-10 pt-48 pb-40 space-y-40">
        {/* Hero Section */}
        <header className="space-y-12 max-w-4xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#007AFF]/10 rounded-full border border-[#007AFF]/20">
            <span className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Synthesis Alpha Protocol v2.6</span>
          </div>
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter italic leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
            Budoucnost <br />je opravena.
          </h1>
          <p className="text-2xl md:text-3xl text-white/40 font-medium leading-relaxed max-w-2xl">
            FixIt Guru je inteligentní operační vrstva pro cirkulární ekonomiku. Propojujeme expertní AI se skutečným inženýrstvím.
          </p>
        </header>

        {/* Vision Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="p-16 glass-dark border border-white/5 rounded-[64px] space-y-8 hover:bg-white/[0.07] transition-all group">
            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="text-4xl font-black italic tracking-tighter">Proč FixIt Guru?</h3>
            <p className="text-white/50 text-xl leading-relaxed">
              Ročně vyprodukujeme miliony tun elektroodpadu. Většina věcí končí v koši jen proto, že neexistuje snadno dostupná cesta k jejich opravě. Studio Synthesis tento řetězec rozbíjí.
            </p>
          </div>
          <div className="p-16 bg-[#007AFF]/5 border border-[#007AFF]/10 backdrop-blur-3xl rounded-[64px] space-y-8 hover:bg-[#007AFF]/10 transition-all group">
            <div className="w-20 h-20 bg-[#007AFF]/20 rounded-[28px] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform text-[#007AFF]">✦</div>
            <h3 className="text-4xl font-black italic tracking-tighter text-[#007AFF]">Vize 2026</h3>
            <p className="text-white/50 text-xl leading-relaxed">
              Každé zařízení má své digitální dvojče a svého asistenta. Oprava není nutné zlo, ale tvůrčí akt technologické svobody a suverenity.
            </p>
          </div>
        </section>

        {/* Agents Quartet */}
        <section className="space-y-16">
          <div className="flex items-center gap-6">
            <h2 className="text-5xl font-black italic tracking-tighter">Kvarteto Synthesis</h2>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '⚡', name: 'KAREL', role: 'Hardware God' },
              { icon: '📋', name: 'LUCIE', role: 'Step Mentor' },
              { icon: '🌱', name: 'DÁŠA', role: 'Eco Visionary' },
              { icon: '🔧', name: 'FRANTIŠEK', role: 'Master Craft' }
            ].map((agent) => (
              <div key={agent.name} className="p-10 glass-dark border border-white/5 rounded-[48px] text-center space-y-6 hover:translate-y-[-10px] transition-all hover:bg-white/10 group">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-500">{agent.icon}</div>
                <div>
                  <h4 className="font-black italic text-2xl tracking-tighter">{agent.name}</h4>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mt-1">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Core */}
        <section className="py-20 border-y border-white/5 flex flex-col md:flex-row justify-between items-center gap-20">
           <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF]">Powered By</p>
              <h3 className="text-5xl font-black italic tracking-tighter">Technologické Jádro</h3>
           </div>
           <div className="flex flex-wrap justify-center gap-12">
              <div className="text-center space-y-2">
                <p className="text-4xl font-black">R19</p>
                <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">React Framework</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-black">G3P</p>
                <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Gemini 3 Pro</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl font-black">V-CORE</p>
                <p className="text-[8px] font-black uppercase opacity-20 tracking-widest">Vision Logic</p>
              </div>
           </div>
        </section>

        {/* Presentation Footer */}
        <footer className="pt-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] italic">{COPYRIGHT}</p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
            <span>Privacy</span>
            <span>Security</span>
            <span>Handshake</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
