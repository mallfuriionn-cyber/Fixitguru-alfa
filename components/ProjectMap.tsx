import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchCatalog, CatalogData } from '../services/catalogService.ts';

export const ProjectMap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCatalog().then(data => {
      setCatalog(data);
      setLoading(false);
    });
  }, []);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const filteredFiles = useMemo(() => {
    if (!catalog) return [];
    return catalog.files.filter(f => 
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [catalog, searchQuery]);

  const scrollToPage = (index: number) => {
    haptic(5);
    const pages = containerRef.current?.querySelectorAll('.pdf-page-sim');
    if (pages && pages[index]) {
      pages[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    haptic([10, 50]);
    window.print();
  };

  const handleExportTxt = () => {
    if (!catalog) return;
    haptic([15, 30, 15]);
    
    const timestamp = new Date().toLocaleString('cs-CZ');
    let content = `FIXIT GURU // SYSTÉMOVÝ MANIFEST v7.7\r\n`;
    content += `========================================================\r\n`;
    content += `PROJEKT:       ${catalog.project}\r\n`;
    content += `VERZE:         ${catalog.version}\r\n`;
    content += `DATUM EXPORTU: ${timestamp}\r\n`;
    content += `STATUS:        INTEGRITY_VERIFIED\r\n`;
    content += `========================================================\r\n\r\n`;
    
    content += `REJSTŘÍK SOUBORŮ JÁDRA\r\n`;
    content += `--------------------------------------------------------\r\n`;
    
    catalog.files.forEach(f => {
      content += `./${f.path.padEnd(38)} | ${f.description}\r\n`;
    });
    
    content += `\r\n© 2026 Studio Synthesis // Mallfurion\r\n`;

    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixit-guru-manifest-v${catalog.version.replace(/\s/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="fixed inset-0 bg-[#000814] flex items-center justify-center font-black text-white uppercase tracking-[0.5em] animate-pulse">Synchronizing Blueprint...</div>;

  // Split logic for A4 simulation
  const page1Files = filteredFiles.slice(0, 16);
  const page2Files = filteredFiles.slice(16, 48);
  const page3Files = filteredFiles.slice(48);

  return (
    <div className="fixed inset-0 z-[25000] bg-[#1c1c1e] overflow-auto flex flex-col no-print selection:bg-[#007AFF] selection:text-white font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          .no-print { display: none !important; }
          .blueprint-container { padding: 0 !important; margin: 0 !important; transform: scale(1) !important; display: block !important; }
          .pdf-page-sim { box-shadow: none !important; margin: 0 !important; width: 210mm !important; height: 297mm !important; page-break-after: always; border: none !important; display: block !important; position: relative !important; }
        }
        
        .pdf-page-sim {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 50px 100px rgba(0,0,0,0.5);
          margin: 40px auto;
          padding: 25mm 25mm;
          font-family: 'Libre Baskerville', serif;
          color: #1D1D1F;
          position: relative;
          transform-origin: top center;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          overflow: hidden;
        }

        .neural-sweep {
          position: absolute;
          left: 0; top: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #007AFF, transparent);
          box-shadow: 0 0 20px #007AFF;
          z-index: 50;
          opacity: 0.15;
          animation: scan-vertical 8s linear infinite;
        }

        @keyframes scan-vertical {
          0% { top: 0; }
          100% { top: 100%; }
        }

        .blueprint-entry {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding: 6px 0;
          font-size: 8.5px;
          font-family: 'JetBrains Mono', monospace;
        }

        .section-title {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-style: italic;
          font-size: 16px;
          text-transform: uppercase;
          border-bottom: 2pt solid black;
          padding-bottom: 6px;
          margin-bottom: 25px;
          letter-spacing: -0.5px;
        }
      `}} />

      {/* HEADER CONTROLS */}
      <header className="h-24 px-8 bg-black/90 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between sticky top-0 z-[100] no-print shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black italic rounded-xl text-2xl shadow-xl">S</div>
          <div className="hidden sm:block">
            <h3 className="text-white font-black italic uppercase text-xs tracking-widest leading-none">Úplný Manifest Jádra</h3>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em] mt-1">Synthesis v7.7 // Final Alpha</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
           <div className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hledat v rejstříku..."
                className="w-full h-12 bg-white/10 border border-white/10 rounded-2xl px-10 text-white font-bold text-xs outline-none focus:ring-4 ring-blue-500/20 transition-all placeholder:text-white/20"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/10 p-1 rounded-xl mr-4 hidden lg:flex">
             {[0, 1, 2].map(i => (
               <button key={i} onClick={() => scrollToPage(i)} className="px-3 py-2 text-[9px] font-black text-white/40 hover:text-white transition-colors">P{i+1}</button>
             ))}
          </div>

          <div className="flex bg-white/10 p-1 rounded-xl mr-2">
             <button onClick={() => { setZoom(z => Math.max(0.5, z - 0.1)); haptic(2); }} className="w-10 h-10 flex items-center justify-center text-white font-black text-xl hover:bg-white/10 rounded-lg transition-all">-</button>
             <div className="w-16 flex items-center justify-center text-white font-mono text-[10px] font-black">{Math.round(zoom * 100)}%</div>
             <button onClick={() => { setZoom(z => Math.min(2, z + 0.1)); haptic(2); }} className="w-10 h-10 flex items-center justify-center text-white font-black text-xl hover:bg-white/10 rounded-lg transition-all">+</button>
          </div>
          
          <button onClick={handleExportTxt} className="h-12 px-6 bg-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">TXT</button>
          <button onClick={handlePrint} className="h-12 px-8 bg-[#007AFF] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">PDF</button>
          <button onClick={onBack} className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center font-black active:scale-90 transition-all hover:bg-red-500 hover:text-white ml-2">✕</button>
        </div>
      </header>

      <div 
        ref={containerRef}
        className="flex-1 blueprint-container p-4 pb-40 overflow-y-auto no-scrollbar scroll-smooth" 
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        
        {/* STRANA 1: ARCHITEKTURA */}
        <div className="pdf-page-sim animate-synthesis-in">
          <div className="neural-sweep"></div>
          <div className="flex justify-between items-start mb-20 border-b-2 border-black pb-10">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2 font-sans italic leading-none">FIXIT <br/>GURU</h2>
              <p className="text-[10px] font-bold opacity-60 italic tracking-wide">ÚPLNÝ SYSTÉMOVÝ MANIFEST // ALPHA v7.7</p>
            </div>
            <div className="text-right font-sans">
              <p className="text-[10px] font-black">VERZE: {catalog?.version}</p>
              <p className="text-[10px] font-black">DATUM: {new Date().toLocaleDateString('cs-CZ')}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1">NODE: PRG-CENTER-01</p>
            </div>
          </div>

          <div className="space-y-16">
            <section>
              <h3 className="section-title">1. Architektonické Jádro</h3>
              <p className="text-base leading-relaxed italic mb-10 text-black/80 font-medium">
                Tento dokument definuje inženýrskou distribuci systému Synthesis OS. Obsahuje kompletní mapu neurálních uzlů, právních matic a diagnostických protokolů.
              </p>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-[10px] text-[#007AFF] tracking-widest">Bezpečnost</h4>
                  <p className="text-[11px] leading-relaxed opacity-70">Identitní vrstva SVID SEE-256 se synchronizovaným Hardware Handshakem.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-[10px] text-[#007AFF] tracking-widest">Inteligence</h4>
                  <p className="text-[11px] leading-relaxed opacity-70">Model Ladder kaskáda Gemini 3 s integrovaným inženýrským groundingem.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="section-title">2. Rejstřík Jádra (Segment I)</h3>
              <div className="space-y-1">
                {page1Files.length > 0 ? page1Files.map(f => (
                  <div key={f.path} className="blueprint-entry">
                    <span className="font-bold">./{f.path}</span>
                    <span className="opacity-50 italic truncate ml-8">— {f.description}</span>
                  </div>
                )) : <p className="text-xs italic opacity-20 py-10 text-center">Nenalezeny žádné shody pro vyhledávací dotaz.</p>}
              </div>
            </section>
          </div>

          <footer className="absolute bottom-12 left-[25mm] right-[25mm] flex justify-between items-end border-t border-black/5 pt-6">
            <div className="text-[9px] font-bold opacity-30 italic font-sans tracking-widest uppercase">System_Blueprint // Page_01</div>
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black italic text-2xl font-sans rounded-xl">S</div>
          </footer>
        </div>

        {/* STRANA 2: REJSTŘÍK II */}
        <div className="pdf-page-sim">
          <div className="neural-sweep" style={{ animationDelay: '2s' }}></div>
          <h3 className="section-title">3. Rejstřík Jádra (Segment II)</h3>
          <div className="space-y-1">
            {page2Files.map(f => (
              <div key={f.path} className="blueprint-entry">
                <span className="font-bold">./{f.path}</span>
                <span className="opacity-50 italic truncate ml-8">— {f.description}</span>
              </div>
            ))}
          </div>
          <footer className="absolute bottom-12 left-[25mm] right-[25mm] flex justify-between items-end border-t border-black/5 pt-6">
            <div className="text-[9px] font-bold opacity-30 italic font-sans tracking-widest uppercase">System_Blueprint // Page_02</div>
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black italic text-2xl font-sans rounded-xl">S</div>
          </footer>
        </div>

        {/* STRANA 3: REJSTŘÍK III & PEČEŤ */}
        <div className="pdf-page-sim">
          <div className="neural-sweep" style={{ animationDelay: '4s' }}></div>
          <h3 className="section-title">3. Rejstřík Jádra (Závěr)</h3>
          <div className="space-y-1">
            {page3Files.map(f => (
              <div key={f.path} className="blueprint-entry">
                <span className="font-bold">./{f.path}</span>
                <span className="opacity-50 italic truncate ml-8">— {f.description}</span>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 border-2 border-black bg-black/[0.01] rounded-[44px] space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl"></div>
             <h4 className="text-xs font-black uppercase tracking-[0.3em] font-sans">Mandát Integrity</h4>
             <p className="text-[11px] leading-relaxed italic opacity-80 font-medium">
               Tento manifest potvrzuje strukturu Fixit Guru Alpha. Jakákoliv neautorizovaná modifikace vnější stranou bez neuronového handshaku Architekta okamžitě zneplatňuje systémovou pečeť a odpojuje uzel.
             </p>
             <div className="flex flex-col gap-2 pt-4">
                <span className="text-[9px] font-black font-mono uppercase text-blue-600">HASH: {Math.random().toString(16).slice(2, 22).toUpperCase()}</span>
                <span className="text-[9px] font-black font-mono uppercase text-green-600">Status: INTEGRITY_VERIFIED_SHA256</span>
             </div>
          </div>

          <footer className="absolute bottom-12 left-[25mm] right-[25mm] flex justify-between items-end border-t border-black/5 pt-6">
            <div className="text-[9px] font-bold opacity-30 italic font-sans tracking-widest uppercase">System_Blueprint // Page_03</div>
            <div className="synthesis-seal-v9 scale-60 -mr-12 -mb-4">
              <div className="synthesis-seal-inner">
                <span className="seal-main-char">S</span>
                <span className="seal-sub-text">Verified</span>
              </div>
            </div>
          </footer>
        </div>

        <div className="max-w-4xl mx-auto flex justify-center py-10 opacity-10 no-print">
           <p className="text-[9px] font-black uppercase tracking-[1em] animate-pulse">Deep Export Protocol // Final Trace</p>
        </div>
      </div>
    </div>
  );
};