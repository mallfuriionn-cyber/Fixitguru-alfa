import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PublicGuide } from '../types.ts';
import { COPYRIGHT } from '../constants.tsx';
import { db } from '../services/storageService.ts';

interface UserGuidesModuleProps {
  onBack: () => void;
  onAskLucie: (guide: PublicGuide) => void;
  initialGuideId?: string | null;
}

type SortOption = 'NEWEST' | 'RATING' | 'CATEGORY';

const SynthesisStamp = () => {
  const handleOpenInfo = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    window.dispatchEvent(new CustomEvent('synthesis:open-info', { detail: 'verification-info' }));
  };

  return (
    <button 
      data-ui-id="SYN-BTN-STAMP-INFO"
      data-ui-name="Info Pečeť Synthesis"
      onClick={handleOpenInfo}
      className="synthesis-stamp-ui flex items-center gap-3 py-8 mt-12 border-t-2 border-black/5 select-none animate-pulse hover:opacity-100 transition-opacity group text-left cursor-pointer"
    >
      <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black italic text-xl shadow-2xl border-4 border-[#007AFF]/20 group-hover:border-[#007AFF] transition-all">S</div>
      <div className="flex flex-col">
         <span className="text-[12px] font-black uppercase tracking-[0.3em] leading-none text-black">Synthesis Verified</span>
         <span className="text-[8px] font-bold uppercase tracking-widest text-[#007AFF] mt-1.5">Integrity Core v7.2 // Klikněte pro info</span>
      </div>
    </button>
  );
};

const AuditControlPanel: React.FC = () => {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items = [
    { id: 'AC-01', label: 'Validace ESD uzemnění', desc: 'Kontrola náramku a podložky.' },
    { id: 'AC-02', label: 'Měření napětí (V/Ah)', desc: 'Shoda s nominálními hodnotami.' },
    { id: 'AC-03', label: 'Čistota PCB (IPA 99%)', desc: 'Odstranění tavidla a oxidace.' },
    { id: 'AC-04', label: 'Mechanické tolerance', desc: 'Kontrola lícování a vůlí.' },
    { id: 'AC-05', label: 'Moment utažení šroubů', desc: 'Dle inženýrského datasheetu.' },
    { id: 'AC-06', label: 'Dielektrická pevnost', desc: 'Test izolace VN částí.' },
    { id: 'AC-07', label: 'Tepelný profil (FLIR)', desc: 'Kontrola hotspotů při zátěži.' },
    { id: 'AC-08', label: 'Firmware Integrity', desc: 'Validace kontrolního součtu.' },
    { id: 'AC-09', label: 'Bus Integrity Test', desc: 'Kontrola datových sběrnic.' },
    { id: 'AC-10', label: 'Final Stress Test', desc: '10 min bezchybný provoz.' }
  ];

  const toggle = (id: string) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const progress = (Object.values(checks).filter(Boolean).length / items.length) * 100;

  return (
    <div data-ui-id="SYN-SEC-AUDIT-PANEL" data-ui-name="Auditní Kontrolní Panel" className="bg-black text-white p-8 rounded-[44px] shadow-2xl space-y-8 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Auditní Matrice</p>
          <h5 className="text-xl font-black italic tracking-tighter uppercase">Inženýrská Verifikace</h5>
        </div>
        <div className="text-right">
           <p className="text-2xl font-black italic leading-none">{Math.round(progress)}%</p>
           <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest mt-1">Status Integrity</p>
        </div>
      </header>
      
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map(item => (
          <button 
            data-ui-id={`SYN-BTN-AUDIT-CHECK-${item.id}`}
            data-ui-name={`Audit Bod: ${item.label}`}
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${checks[item.id] ? 'bg-blue-600 border-blue-500 shadow-lg translate-x-1' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${checks[item.id] ? 'bg-white border-white text-blue-600' : 'border-white/10'}`}>
              {checks[item.id] ? '✓' : ''}
            </div>
            <div className="flex-1">
               <p className={`text-[10px] font-black italic uppercase leading-none mb-1 ${checks[item.id] ? 'text-white' : 'text-white/60'}`}>{item.label}</p>
               <p className={`text-[8px] font-medium leading-none ${checks[item.id] ? 'text-white/40' : 'text-white/20'}`}>{item.id} // {item.desc}</p>
            </div>
          </button>
        ))}
      </div>
      
      {progress === 100 && (
        <div data-ui-id="SYN-SEC-AUDIT-COMPLETE" data-ui-name="Indikátor Úspěšného Auditu" className="p-4 bg-green-500/20 border border-green-500/40 rounded-2xl text-center animate-bounce">
           <p className="text-[10px] font-black uppercase tracking-widest text-green-400 italic">✓ Dokumentace Verifikována</p>
        </div>
      )}
    </div>
  );
};

export const UserGuidesModule: React.FC<UserGuidesModuleProps> = ({ onBack, onAskLucie, initialGuideId }) => {
  const [guides, setGuides] = useState<PublicGuide[]>(db.getAll('publicGuides'));
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [selectedGuide, setSelectedGuide] = useState<PublicGuide | null>(null);

  useEffect(() => {
    const handleUpdate = () => setGuides(db.getAll('publicGuides'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  useEffect(() => {
    if (initialGuideId) {
      const guide = guides.find(g => g.id === initialGuideId);
      if (guide) setSelectedGuide(guide);
    }
  }, [initialGuideId, guides]);

  const getSortedGuides = () => {
    const filtered = guides.filter(g => 
      g.title.toLowerCase().includes(search.toLowerCase()) || 
      g.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'RATING') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'CATEGORY') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  };

  const sortedGuides = getSortedGuides();

  const haptic = (p = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const renderRatingStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? 'opacity-100' : 'opacity-20'}>★</span>
        ))}
        <span className="text-[9px] font-black ml-1 text-black/40">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div data-ui-id="SYN-SEC-GUIDES-MODULE" data-ui-name="Modul Znalostního Jádra" className="p-6 md:p-12 space-y-12 animate-synthesis-in no-scrollbar flex flex-col h-full relative">
      <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
        <p className="text-[8px] font-mono opacity-[0.15] uppercase tracking-widest">GUIDE_ARCHIVE // ID-08</p>
      </div>

      <header className="space-y-6 shrink-0 max-w-6xl mx-auto w-full">
        {!selectedGuide && (
          <div data-ui-id="SYN-SEC-GUIDES-FILTERBAR" data-ui-name="Lišta Filtrování Návodů" className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative group flex-1 w-full max-w-xl">
              <input 
                data-ui-id="SYN-INP-GUIDES-SEARCH"
                data-ui-name="Hledání Blueprintu"
                type="text" 
                placeholder="Hledat technický blueprint..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 bg-white border border-black/5 rounded-[28px] px-8 outline-none font-bold text-lg shadow-sm focus:ring-4 ring-blue-500/5 transition-all"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20 group-hover:text-blue-500 transition-colors font-bold text-xl">🔍</div>
            </div>
            
            <div className="flex bg-black/5 p-1 rounded-2xl shrink-0">
               {[
                 { id: 'NEWEST', label: 'Nejnovější', icon: '🕒' },
                 { id: 'RATING', label: 'Nejlepší', icon: '★' },
                 { id: 'CATEGORY', label: 'Kategorie', icon: '📂' }
               ].map(opt => (
                 <button 
                  data-ui-id={`SYN-BTN-GUIDES-SORT-${opt.id}`}
                  data-ui-name={`Řazení: ${opt.label}`}
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id as SortOption); haptic(5); }}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortBy === opt.id ? 'bg-white text-black shadow-md' : 'text-black/30 hover:text-black/60'}`}
                 >
                   <span>{opt.icon}</span>
                   {opt.label}
                 </button>
               ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {selectedGuide ? (
          <div data-ui-id="SYN-SEC-GUIDE-DETAIL" data-ui-name="Detail Technického Blueprintu" className="max-w-6xl mx-auto space-y-8 animate-synthesis-in">
             <button 
               data-ui-id="SYN-BTN-GUIDE-BACK-LIST"
               data-ui-name="Zpět do seznamu návodů"
               onClick={() => setSelectedGuide(null)} 
               className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
             >
               ← Zpět do seznamu
             </button>
             
             <article className="bg-white border border-black/5 rounded-[56px] p-8 md:p-16 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[150px] -z-10"></div>
                
                <header className="space-y-6 border-b border-black/5 pb-10">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100">{selectedGuide.category}</span>
                        {renderRatingStars(selectedGuide.rating)}
                      </div>
                      <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">{selectedGuide.date}</p>
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-tight uppercase">{selectedGuide.title}</h3>
                      <p className="text-lg md:text-xl font-bold text-black/40 italic uppercase tracking-[0.2em]">{selectedGuide.deviceName}</p>
                   </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   <div className="lg:col-span-7 space-y-12">
                      <section className="space-y-4">
                         <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 flex items-center gap-3">
                           I. Diagnostický Nález
                         </h4>
                         <div className="p-10 bg-blue-50/30 rounded-[40px] border border-blue-100 shadow-inner italic text-black/70 leading-relaxed font-medium text-lg">
                            {selectedGuide.diagnosis}
                         </div>
                      </section>

                      <section className="space-y-8">
                         <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600">II. Detailní Technický Postup</h4>
                         <div className="prose-synthesis detailed-procedure">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedGuide.procedure}</ReactMarkdown>
                         </div>
                      </section>

                      <SynthesisStamp />
                   </div>

                   <aside className="lg:col-span-5 space-y-8">
                      {/* NOVÝ AUDIT CONTROL PANEL */}
                      <AuditControlPanel />

                      <div data-ui-id="SYN-SEC-GUIDE-TOOLS" data-ui-name="Sekce Požadovaného Nářadí" className="p-8 bg-white border border-black/5 rounded-[44px] shadow-sm space-y-6">
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Požadované Nářadí</h5>
                         <ul className="space-y-3">
                            {['ESD Sada (Náramek, Podložka)', 'Multimetr s tenkými hroty', 'IPA 99.9%', 'Momentový šroubovák (0.2-2Nm)', 'Mikroskop (min 20x)'].map(tool => (
                               <li key={tool} className="flex items-center gap-4 text-xs font-bold italic text-black/60 group">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></div> {tool}
                               </li>
                            ))}
                         </ul>
                      </div>

                      <button 
                        data-ui-id="SYN-BTN-GUIDE-CONSULT-LUCIE"
                        data-ui-name="Aktivovat Mentora pro tento návod"
                        onClick={() => onAskLucie(selectedGuide)}
                        className="w-full h-24 bg-blue-600 text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 flex flex-col items-center justify-center group overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <span className="group-hover:scale-110 transition-transform mb-1 relative z-10">🛠️ AKTIVOVAT MENTORA</span>
                        <span className="text-[8px] opacity-40 relative z-10">Spustit Step-Lock navigaci</span>
                      </button>
                   </aside>
                </div>

                <footer className="pt-12 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-30">
                   <p className="text-[9px] font-black uppercase tracking-widest text-black italic">Blueprint Integrity Hash: {Math.random().toString(16).slice(2, 20).toUpperCase()}</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-black">Uživatel: {selectedGuide.author}</p>
                </footer>
             </article>
          </div>
        ) : (
          <div data-ui-id="SYN-SEC-GUIDES-GRID" data-ui-name="Mřížka Výsledků Vyhledávání" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
            {sortedGuides.length === 0 ? (
              <div className="col-span-full p-32 text-center border-2 border-dashed border-black/5 rounded-[56px] space-y-4 opacity-30">
                 <span className="text-6xl grayscale">📚</span>
                 <p className="font-black uppercase tracking-widest text-[10px]">Nebyly nalezeny žádné blueprinty v Jádru</p>
              </div>
            ) : sortedGuides.map(guide => (
              <button 
                data-ui-id={`SYN-BTN-GUIDE-CARD-${guide.id}`}
                data-ui-name={`Karta Návodu: ${guide.title}`}
                key={guide.id}
                onClick={() => { haptic(5); setSelectedGuide(guide); }}
                className="bg-white border border-black/5 p-10 rounded-[48px] text-left space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden shadow-sm flex flex-col min-h-[400px]"
              >
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">{guide.authorAvatar || '👤'}</div>
                   <div className="text-right space-y-1">
                      <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest bg-blue-50 px-3 py-1 rounded-full">{guide.category}</span>
                      <div className="pt-1">{renderRatingStars(guide.rating)}</div>
                   </div>
                </div>
                <div className="space-y-2 flex-1">
                   <h4 className="text-2xl font-black italic tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 uppercase">{guide.title}</h4>
                   <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.3em]">{guide.deviceName}</p>
                </div>
                <p className="text-sm text-black/40 italic font-medium line-clamp-3 border-t border-black/5 pt-4">{guide.diagnosis}</p>
                <div className="pt-4 border-t border-black/[0.03] flex justify-between items-center">
                   <span className="text-[8px] font-black text-black/20 uppercase">{guide.date}</span>
                   <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Detailní Blueprint →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .detailed-procedure h3 {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.2em;
          margin-top: 45px;
          margin-bottom: 20px;
          color: #007AFF;
          border-left: 6px solid #007AFF;
          padding-left: 15px;
          background: rgba(0, 122, 255, 0.03);
          padding-top: 10px;
          padding-bottom: 10px;
        }
        .detailed-procedure p {
          font-size: 16px;
          line-height: 1.8;
          color: #444;
          margin-bottom: 15px;
          font-weight: 500;
        }
        .detailed-procedure ol {
          list-style: decimal;
          padding-left: 25px;
          margin-bottom: 30px;
          space-y-4;
        }
        .detailed-procedure li {
          margin-bottom: 15px;
          font-weight: 600;
          color: #1D1D1F;
          font-size: 15px;
          line-height: 1.6;
        }
        .detailed-procedure strong {
          color: #000;
          font-weight: 900;
        }
      `}} />
    </div>
  );
};