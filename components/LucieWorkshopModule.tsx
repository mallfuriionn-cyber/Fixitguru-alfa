import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COPYRIGHT, AGENTS } from '../constants.tsx';
import { WorkshopReport, AgentId, UserRole, PublicGuide, SavedManual } from '../types.ts';
import { db } from '../services/storageService.ts';

interface LucieWorkshopModuleProps {
  onBack: () => void;
  onConsultAgent?: (agentId: AgentId, context: string) => void;
  onUpdateXP?: (amount: number) => void;
  user?: any;
  initialContext?: string;
}

type WorkshopTab = 'LIVE' | 'SAFETY' | 'ARCHIVE' | 'DOCS';

const SynthesisStamp = () => {
  const handleOpenInfo = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    window.dispatchEvent(new CustomEvent('synthesis:open-info', { detail: 'verification-info' }));
  };

  return (
    <button 
      onClick={handleOpenInfo}
      className="synthesis-stamp-ui hover:opacity-100 transition-opacity group cursor-pointer text-left"
    >
      <div className="s-icon group-hover:scale-110 transition-transform">S</div>
      <span className="s-text">Verified by Synthesis Core // Info</span>
    </button>
  );
};

export const LucieWorkshopModule: React.FC<LucieWorkshopModuleProps> = ({ onBack, onConsultAgent, onUpdateXP, user }) => {
  const [activeTab, setActiveTab] = useState<WorkshopTab>('LIVE');
  const [reports, setReports] = useState<WorkshopReport[]>(db.getAll('reports'));
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSealing, setIsSealing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<WorkshopReport | null>(null);
  
  const [reportForm, setReportForm] = useState({
    deviceName: '',
    initialState: '',
    steps: '',
    conclusion: ''
  });

  useEffect(() => {
    const handleUpdate = () => setReports(db.getAll('reports'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const haptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const methodologySteps = [
    { title: 'Vizuální inspekce', text: 'Hledejte známky poškození, praskliny nebo chybějící šroubky.', icon: '🔍' },
    { title: 'Uvolnění upevnění', text: 'Odšroubujte všechny viditelné šroubky. Pozor na skryté pod gumovými nožičkami.', icon: '🪛' },
    { title: 'Oddělení šasi', text: 'Použijte plastové trsátko. Postupujte po obvodu, nikdy nepoužívejte kov na plast.', icon: '🔓' },
    { title: 'Odpojení flexů', text: 'Před úplným oddělením zkontrolujte, zda nejsou připojeny ploché kabely.', icon: '⚡' },
    { title: 'Dokumentace vnitřku', text: 'Vyfoťte si rozložení komponent pro snadnější montáž.', icon: '📸' }
  ];

  const handleStepComplete = (index: number) => {
    if (completedSteps.includes(index)) return;
    haptic([10, 30]);
    setCompletedSteps([...completedSteps, index]);
    if (onUpdateXP) onUpdateXP(2); 
    if (index < methodologySteps.length - 1) setActiveStep(index + 1);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.deviceName) return;
    haptic([20, 50, 20]);
    
    const timestamp = new Date().toLocaleDateString('cs-CZ');
    const newReport: WorkshopReport = {
      id: 'wr-' + Math.random().toString(36).substr(2, 5),
      deviceName: reportForm.deviceName,
      initialState: reportForm.initialState,
      steps: reportForm.steps || 'Provedena metodická demontáž Step-Lock.',
      conclusion: reportForm.conclusion || 'Zařízení připraveno k servisnímu zásahu.',
      date: timestamp,
      status: 'Final'
    };
    db.insert('reports', newReport);

    const publicGuide: PublicGuide = {
      id: 'pg-' + newReport.id,
      title: `Návod: ${newReport.deviceName}`,
      author: user?.name || 'Inženýr Synthesis',
      authorAvatar: user?.avatar || '👤',
      date: newReport.date,
      deviceName: newReport.deviceName,
      diagnosis: newReport.initialState,
      procedure: newReport.steps,
      conclusion: newReport.conclusion,
      category: 'Komunitní opravy'
    };
    db.insert('publicGuides', publicGuide);

    const manualEntry: SavedManual = {
      id: 'man-' + newReport.id,
      title: `Vlastní postup: ${newReport.deviceName}`,
      brand: 'Vlastní',
      model: newReport.deviceName,
      category: 'Uživatelské postupy',
      originalText: `Diagnóza: ${newReport.initialState}`,
      translatedText: `### Postup opravy\n${newReport.steps}\n\n### Závěr\n${newReport.conclusion}`,
      sourceUrl: 'Synthesis Workshop',
      dateAdded: timestamp
    };
    db.insert('manuals', manualEntry);

    db.insert('projects', {
      id: 'proj-' + newReport.id,
      title: 'Oprava: ' + newReport.deviceName,
      status: 'Dokončeno',
      agentId: AgentId.LUCKA,
      lastUpdate: 'Právě teď',
      description: newReport.initialState
    });

    setReportForm({ deviceName: '', initialState: '', steps: '', conclusion: '' });
    setActiveTab('ARCHIVE');
    haptic([10, 10, 10]);
  };

  const handleOpenPreview = (report: WorkshopReport) => {
    haptic(10);
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  const handlePrint = () => {
    if (!previewReport) return;
    setIsSealing(true);
    const report = previewReport;
    const matrice = document.getElementById('print-matrice');
    if (!matrice) return;
    const isVerified = user?.role === UserRole.ARCHITECT || (user?.virtualDocument?.isVerified && !user?.privacyDelay);
    matrice.innerHTML = `
      <div style="padding: 25mm; min-height: 297mm; display: flex; flex-direction: column; background: white; font-family: 'Libre Baskerville', serif;">
        <header class="legal-header-block">
          <div style="max-width: 45%;">
            <p style="font-weight: 900; text-transform: uppercase; color: #007AFF; margin-bottom: 4pt; letter-spacing: 1.2pt;">Vydavatel Protokolu</p>
            <p style="font-weight: 800; font-size: 11pt; margin: 0;">${user?.name || 'Inženýr Synthesis'}</p>
            <p style="margin: 2pt 0; opacity: 0.8;">SVID: ${user?.virtualHash?.slice(0, 12) || 'ANONYM'}</p>
          </div>
          <div style="text-align: right; max-width: 45%;">
            <p style="font-weight: 900; text-transform: uppercase; color: #111; margin-bottom: 4pt; letter-spacing: 1.2pt;">Systém</p>
            <p style="font-weight: 800; font-size: 11pt; margin: 0;">Step-Lock v2.6</p>
            <p style="margin: 2pt 0; opacity: 0.8;">Synthesis Workshop Core</p>
          </div>
        </header>
        <div style="text-align: right; margin-bottom: 40pt; font-family: 'Inter', sans-serif; font-size: 10pt; font-weight: 600;">V PRG-NODE, dne ${report.date}</div>
        <div class="legal-matrice-header">
          <h1 style="text-decoration: none;">SERVISNÍ PROTOKOL</h1>
          <p style="font-family: 'Inter', sans-serif; font-size: 11pt; font-weight: 900; letter-spacing: 2pt; margin-top: 10pt;">${report.deviceName.toUpperCase()}</p>
        </div>
        <main class="legal-body" style="flex: 1; line-height: 1.8;">
          <h2>I. Diagnostický Nález</h2>
          <p>${report.initialState}</p>
          <h2>II. Provedené Úkony</h2>
          <p>${report.steps}</p>
          <h2>III. Závěrečné Posouzení</h2>
          <p>${report.conclusion}</p>
        </main>
        <div class="signature-section"><div class="signature-line">Vlastnoruční podpis inženýra</div></div>
        <footer style="margin-top: 50pt; padding-top: 20pt; border-top: 0.5pt solid #ddd; display: flex; justify-content: space-between; align-items: flex-end;">
           <div style="font-family: 'Inter', sans-serif; font-size: 7.5pt; color: #666; font-style: italic;">Tento protokol byl vygenerován metodikou Step-Lock.</div>
           <div class="synthesis-seal-v9"><div class="synthesis-seal-inner"><span class="seal-main-char">S</span><span class="seal-sub-text">Verified</span></div></div>
        </footer>
      </div>
    `;
    setTimeout(() => { window.print(); setIsSealing(false); matrice.innerHTML = ""; }, 1000);
  };

  const handleShare = async () => {
    if (!previewReport) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Servisní Protokol: ${previewReport.deviceName}`,
          text: `Detailní záznam opravy z Jádra Fixit Guru.`,
          url: window.location.href
        });
      } catch (e) { }
    }
  };

  const consultKarel = (deviceName: string) => {
    if (onConsultAgent) {
      onConsultAgent(AgentId.KAJA, `Ahoj Karle, v Dílně právě rozebírám ${deviceName} a narazil jsem na technický problém se schématem. Můžeš mi pomoci s diagnózou PCB?`);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 animate-synthesis-in no-scrollbar relative flex flex-col h-full">
      {/* LIVE PREVIEW MODAL */}
      {isPreviewOpen && previewReport && (
        <div className="fixed inset-0 z-[30000] bg-black/80 backdrop-blur-3xl flex flex-col no-print animate-fluent-in">
          <header className="h-20 px-8 flex items-center justify-between bg-black/40 border-b border-white/10 shrink-0">
            <h3 className="text-white font-black italic uppercase text-xs tracking-widest">Náhled Servisního Protokolu</h3>
            <div className="flex gap-3">
              <button onClick={handleShare} className="h-10 px-6 bg-white/10 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all">Sdílet</button>
              <button onClick={handlePrint} className="h-10 px-6 bg-emerald-600 text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">Tisknout PDF</button>
              <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center">✕</button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar">
             <div className="max-w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-12 md:p-20 font-serif relative" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                <div className="flex justify-between items-start mb-16 opacity-40">
                   <div className="text-[10px] font-black uppercase">Vydavatel: {user?.name || 'Inženýr'}</div>
                   <div className="text-[10px] font-black uppercase">Datum: {previewReport.date}</div>
                </div>
                <h1 className="text-3xl font-black italic tracking-tight mb-10 text-center border-y-2 border-black py-6">SERVISNÍ PROTOKOL</h1>
                <h2 className="text-xl font-black mb-8">{previewReport.deviceName.toUpperCase()}</h2>
                
                <div className="space-y-10 text-sm leading-relaxed">
                   <section>
                      <h4 className="font-black italic uppercase text-xs mb-3">I. Diagnostický Nález</h4>
                      <p>{previewReport.initialState}</p>
                   </section>
                   <section>
                      <h4 className="font-black italic uppercase text-xs mb-3">II. Provedené Úkony</h4>
                      <p>{previewReport.steps}</p>
                   </section>
                   <section>
                      <h4 className="font-black italic uppercase text-xs mb-3">III. Závěrečné Posouzení</h4>
                      <p>{previewReport.conclusion}</p>
                   </section>
                </div>

                <div className="absolute bottom-20 left-20 right-20 flex justify-between items-end">
                   <div className="text-[8px] italic opacity-20">SUB-ID: ID-REPORT-VERIFIED</div>
                   <div className="w-16 h-16 border-4 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 font-black italic text-xl rotate-[-15deg]">VERIFIED</div>
                </div>
             </div>
          </div>
        </div>
      )}

      {isSealing && <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center space-y-6"><div className="w-20 h-20 border-4 border-black/5 border-t-[#007AFF] rounded-full animate-spin"></div><p className="font-black text-xs uppercase tracking-[0.4em] animate-pulse text-[#007AFF]">Generování Listiny...</p></div>}
      
      <nav className="flex gap-2 p-1 bg-black/5 rounded-[24px] sticky top-0 z-30 backdrop-blur-xl shrink-0">
        {[
          { id: 'LIVE', label: 'Step-Lock', icon: '🚀' },
          { id: 'SAFETY', label: 'Bezpečnost', icon: '🛡️' },
          { id: 'DOCS', label: 'Protokol', icon: '📝' },
          { id: 'ARCHIVE', label: 'Historie', icon: '📚' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as WorkshopTab); haptic(5); }}
            className={`flex-1 h-12 rounded-[20px] flex items-center justify-center gap-2 whitespace-nowrap transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:bg-white/50'}`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
      <main className="flex-1 min-h-0">
        {activeTab === 'LIVE' && (
          <div className="space-y-10 animate-synthesis-in h-full">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black italic tracking-tighter">Aktivní Průvodce</h3>
               <p className="text-[9px] font-black uppercase text-emerald-600/40 tracking-widest">Procedural Integrity Active</p>
            </div>
            <div className="space-y-4">
              {methodologySteps.map((step, i) => (
                <div key={i} className={`p-8 rounded-[44px] border transition-all duration-500 relative overflow-hidden ${activeStep === i ? 'bg-white border-emerald-500 shadow-2xl scale-[1.02]' : completedSteps.includes(i) ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-white border-black/5 opacity-40'}`}>
                  <div className="flex gap-8 items-start relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${completedSteps.includes(i) ? 'bg-green-500 border-green-400 text-white' : 'bg-[#F2F2F7] border-black/5'}`}>{completedSteps.includes(i) ? '✓' : step.icon}</div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-black italic text-xl tracking-tight leading-none">{step.title}</h4>
                      <p className="text-sm text-black/60 font-medium leading-relaxed">{step.text}</p>
                      {activeStep === i && !completedSteps.includes(i) && (
                        <div className="flex gap-3 pt-4">
                          <button onClick={() => handleStepComplete(i)} className="px-8 h-12 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl">Dokončit tento krok</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {activeStep === i && <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'SAFETY' && (
          <div className="space-y-10 animate-synthesis-in">
            <div className="p-12 bg-red-50 border border-red-100 rounded-[56px] space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
               <h3 className="text-4xl font-black italic tracking-tighter text-red-700 relative z-10">Bezpečnostní Štít</h3>
               <p className="text-base text-red-900/60 font-medium leading-relaxed relative z-10">Protokol Synthesis 2.1: Před zásahem do napájecích obvodů (SMPS) vždy vyčkejte 5 minut na vybití vysokonapěťových kondenzátorů. 230V neodpouští metodické chyby.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'ESD Ochrana', desc: 'Zápěstní náramek uzemněn.', icon: '🔌' },
                { title: 'Izolace', desc: 'Pracovní podložka je antistatická.', icon: '🛡️' },
                { title: 'Osvětlení', desc: 'Shadow-free LED osvětlení aktivní.', icon: '💡' },
                { title: 'Ventilace', desc: 'Odsávání zplodin z pájení zapnuto.', icon: '🌬️' }
              ].map(item => (
                <div key={item.title} className="p-8 bg-white border border-black/5 rounded-[44px] flex items-center gap-6 shadow-sm hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">{item.icon}</div>
                  <div><h5 className="font-black italic text-lg leading-none">{item.title}</h5><p className="text-[10px] font-bold text-black/30 uppercase mt-1.5">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'DOCS' && (
          <form onSubmit={handleSaveReport} className="space-y-8 animate-synthesis-in max-w-2xl mx-auto">
             <div className="bg-white border border-black/5 rounded-[56px] p-12 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px]"></div>
                <div className="space-y-2 relative z-10"><h3 className="text-3xl font-black italic tracking-tighter">Nový Servisní Protokol</h3><p className="text-sm text-black/40 font-medium">Strukturovaný záznam vaší inženýrské práce.</p></div>
                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Zařízení</label>
                    <input type="text" required value={reportForm.deviceName} onChange={e => setReportForm({...reportForm, deviceName: e.target.value})} placeholder="např. MacBook Pro M1" className="w-full h-16 bg-[#FBFBFD] border border-black/5 rounded-2xl px-6 outline-none font-bold text-lg focus:ring-4 ring-emerald-500/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Diagnóza</label>
                    <textarea value={reportForm.initialState} onChange={e => setReportForm({...reportForm, initialState: e.target.value})} placeholder="Co bylo zjištěno před rozborkou..." className="w-full h-32 bg-[#FBFBFD] border border-black/5 rounded-3xl px-6 py-5 outline-none font-medium resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Postup (veřejný)</label>
                    <textarea value={reportForm.steps} onChange={e => setReportForm({...reportForm, steps: e.target.value})} placeholder="Popište kroky pro ostatní..." className="w-full h-32 bg-[#FBFBFD] border border-black/5 rounded-3xl px-6 py-5 outline-none font-medium resize-none" />
                  </div>
                </div>
                <button type="submit" className="w-full h-16 bg-black text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all relative z-10">Finalizovat & Publikovat do Jádra</button>
             </div>
          </form>
        )}
        {activeTab === 'ARCHIVE' && (
          <div className="space-y-8 animate-synthesis-in">
             <h3 className="text-2xl font-black italic tracking-tighter px-2">Digitální Archiv</h3>
             {reports.length === 0 ? (
               <div className="p-32 text-center border-2 border-dashed border-black/5 rounded-[56px] space-y-4"><span className="text-6xl grayscale opacity-20">🗄️</span><p className="text-[10px] font-black uppercase tracking-widest text-black/20">Žádné protokoly v archivu.</p></div>
             ) : (
               <div className="grid gap-6">
                 {reports.map(report => (
                   <div key={report.id} className="bg-white border border-black/5 rounded-[48px] p-10 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
                         <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Verified</span>
                         <button onClick={() => db.delete('reports', report.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                      <div className="space-y-6">
                        <div><p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{report.date} | ID: {report.id}</p><h4 className="text-3xl font-black italic tracking-tighter leading-none">{report.deviceName}</h4></div>
                        <div className="grid md:grid-cols-2 gap-8 border-t border-black/5 pt-8">
                           <div className="space-y-2"><p className="text-[9px] font-black uppercase text-black/20">Výchozí stav</p><p className="text-sm font-bold italic text-black/60 leading-relaxed">{report.initialState}</p></div>
                           <div className="space-y-2"><p className="text-[9px] font-black uppercase text-black/20">Závěr</p><p className="text-sm font-bold italic text-black/60 leading-relaxed">{report.conclusion}</p></div>
                        </div>
                        <div className="flex gap-4 pt-4">
                           <button onClick={() => consultKarel(report.deviceName)} className="flex-1 h-14 bg-[#F2F2F7] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">Consult with Karel</button>
                           <button onClick={() => handleOpenPreview(report)} className="w-14 h-14 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center text-xl shadow-lg active:scale-90 transition-all">📄</button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>
      <footer className="text-center opacity-10 pb-20 shrink-0"><p className="text-[9px] font-black uppercase tracking-[0.8em] italic text-[#1D1D1F]">{COPYRIGHT}</p></footer>
    </div>
  );
};