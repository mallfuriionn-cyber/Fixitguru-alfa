
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, LegalDispute } from '../types.ts';

interface ProfileModuleProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLoginClick?: () => void;
  onRegisterDetailedClick?: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  user, 
  onUpdateUser, 
  onBack 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'claims'>('profile');
  const [selectedDispute, setSelectedDispute] = useState<LegalDispute | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const displayDisputes = user?.disputes || [];

  const handleExportPDF = (dispute: LegalDispute) => {
    alert(`Generuji PDF pro: ${dispute.title}\nSoubor obsahuje kompletní zápis a extrahovaná data.`);
  };

  const handleShare = (anonymized: boolean) => {
    alert(anonymized ? "Generuji odkaz pro sdílení (osobní údaje skryty)." : "Generuji kompletní odkaz pro sdílení.");
    setShowShareModal(false);
  };

  if (!user) return <div className="p-20 text-center font-black uppercase tracking-widest text-black/20">Identifikujte se v terminálu.</div>;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-10 animate-synthesis-in pb-32 bg-[#FBFBFD] no-scrollbar">
      {/* Identity Card */}
      <header className="relative p-10 glass rounded-[56px] border border-black/5 pulse-aura overflow-hidden">
        <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
           {user.security.level === 'Maximální' && (
             <div className="bg-[#007AFF]/10 text-[#007AFF] px-4 py-2 rounded-full border border-[#007AFF]/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse"></span>
                <span className="text-[8px] font-black uppercase tracking-widest">Hardware Verified</span>
             </div>
           )}
           <div className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30">Security: {user.security.level}</div>
        </div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-5xl shadow-2xl border border-black/10">
            {user.avatar}
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">{user.name}</h2>
            <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.4em]">{user.virtualHash}</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex px-4 gap-8">
        {['profile', 'claims'].map(tab => (
          <button 
            key={tab}
            onClick={() => {setActiveSubTab(tab as any); setSelectedDispute(null);}}
            className={`pb-4 border-b-2 text-[11px] font-black uppercase tracking-[0.4em] transition-all ${activeSubTab === tab ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-black/20'}`}
          >
            {tab === 'profile' ? 'Identita' : 'Moje Reklamace'}
          </button>
        ))}
      </nav>

      {activeSubTab === 'profile' ? (
        <section className="space-y-8 animate-synthesis-in">
          <div className="p-10 glass rounded-[48px] border border-black/5 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Zabezpečení Účtu</h3>
                <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase rounded-full tracking-widest">{user.security.method}</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-black/5 rounded-[32px] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <span className="text-2xl">🆔</span>
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Passkey Status</p>
                         <p className="text-sm font-black italic">Aktivní (Hardware)</p>
                      </div>
                   </div>
                   <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                </div>
                <div className="p-6 bg-white border border-black/5 rounded-[32px] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="G" />
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Google Integration</p>
                         <p className="text-sm font-black italic">{user.security.method === 'GOOGLE' ? 'Propojeno' : 'Dostupné'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="px-4 space-y-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Synthesis Statistiky</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Opravy', val: user.stats.repairs },
                  { label: 'Eko Score', val: user.stats.growing },
                  { label: 'Úspěšnost', val: user.stats.success },
                  { label: 'Publikace', val: user.stats.publishedPosts }
                ].map((s, i) => (
                  <div key={i} className="p-8 bg-white border border-black/5 rounded-[36px] text-center space-y-1 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{s.label}</p>
                    <p className="text-2xl font-black italic tracking-tighter">{s.val}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>
      ) : (
        <section className="space-y-6 animate-synthesis-in">
          {selectedDispute ? (
            <div className="space-y-8 animate-synthesis-in">
               <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedDispute(null)} className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">← Zpět na seznam</button>
                  <div className="flex gap-2">
                    <button onClick={() => handleExportPDF(selectedDispute)} className="h-10 px-5 glass rounded-full text-[9px] font-black uppercase tracking-widest border border-black/5">Export PDF</button>
                    <button onClick={() => setShowShareModal(true)} className="h-10 px-5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest">Sdílet</button>
                  </div>
               </div>

               <div className="p-10 bg-white border border-black/5 rounded-[48px] space-y-8">
                  <header className="space-y-2 border-b border-black/5 pb-8">
                     <h3 className="text-2xl font-black italic tracking-tighter">{selectedDispute.title}</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">{selectedDispute.date} • {selectedDispute.status}</p>
                  </header>

                  {selectedDispute.extractedData && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Osobní údaje v případu</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-[#FBFBFD] border border-black/5 rounded-[32px]">
                          {Object.entries(selectedDispute.extractedData).map(([key, val]) => val && (
                            <div key={key}>
                               <p className="text-[8px] font-black uppercase opacity-20">{key}</p>
                               <p className="text-xs font-bold">{val}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest opacity-20">Zápis konverzace</h4>
                     <div className="space-y-6">
                        {selectedDispute.chatTranscript.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <p className="text-[8px] font-black uppercase mb-1 opacity-20">{msg.role === 'user' ? 'Uživatel' : 'JUDY'}</p>
                            <div className={`p-5 rounded-[24px] text-xs leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-[#F2F2F7] text-black' : 'bg-black/5 text-black'}`}>
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text.split('EXTRAKCE:')[0]}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayDisputes.length === 0 ? (
                <div className="p-20 text-center glass rounded-[48px] border border-black/5 border-dashed">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Žádné aktivní reklamace.</p>
                </div>
              ) : (
                displayDisputes.map(d => (
                   <button 
                    key={d.id} 
                    onClick={() => setSelectedDispute(d)}
                    className="p-8 bg-white border border-black/5 rounded-[44px] flex items-center justify-between shadow-sm group hover:border-[#007AFF]/30 transition-all text-left"
                   >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl">🏛️</div>
                        <div>
                           <h4 className="text-lg font-black italic tracking-tighter leading-none group-hover:text-[#007AFF] transition-colors">{d.title}</h4>
                           <p className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest mt-2">{d.status}</p>
                        </div>
                      </div>
                      <span className="text-black/10 text-2xl group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[250] bg-black/40 backdrop-blur-md flex items-center justify-center p-6 animate-synthesis-in">
          <div className="w-full max-w-md bg-white rounded-[48px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Sdílet Případ</h3>
            <div className="space-y-4">
              <button 
                onClick={() => handleShare(false)}
                className="w-full p-6 glass border border-black/5 rounded-[28px] text-left hover:bg-black hover:text-white transition-all group"
              >
                <p className="text-sm font-black italic leading-none">Všechny informace</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2 group-hover:opacity-60">Kompletní zápis a osobní údaje</p>
              </button>
              <button 
                onClick={() => handleShare(true)}
                className="w-full p-6 glass border border-black/5 rounded-[28px] text-left hover:bg-black hover:text-white transition-all group"
              >
                <p className="text-sm font-black italic leading-none">Bez osobních údajů</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-2 group-hover:opacity-60">Odstraní jméno, adresu a kontakty</p>
              </button>
            </div>
            <button onClick={() => setShowShareModal(false)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-black/20">Zavřít</button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="w-full py-6 glass rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all">Zpět k Terminálu</button>
    </div>
  );
};
