
import React, { useState, useEffect } from 'react';
import { COPYRIGHT, AGENTS } from '../constants.tsx';
import { WorkshopReport, AgentId } from '../types.ts';
import { db } from '../services/storageService.ts';

interface LucieWorkshopModuleProps {
  onBack: () => void;
  onConsultAgent?: (agentId: AgentId, context: string) => void;
  onUpdateXP?: (amount: number) => void;
}

type WorkshopTab = 'LIVE' | 'SAFETY' | 'ARCHIVE' | 'DOCS';

export const LucieWorkshopModule: React.FC<LucieWorkshopModuleProps> = ({ onBack, onConsultAgent, onUpdateXP }) => {
  const [activeTab, setActiveTab] = useState<WorkshopTab>('LIVE');
  const [reports, setReports] = useState<WorkshopReport[]>(db.getAll('reports'));
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
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
    const newReport: WorkshopReport = {
      id: 'wr-' + Math.random().toString(36).substr(2, 5),
      deviceName: reportForm.deviceName,
      initialState: reportForm.initialState,
      steps: reportForm.steps,
      conclusion: reportForm.conclusion,
      date: new Date().toLocaleDateString(),
      status: 'Final'
    };

    db.insert('reports', newReport);
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
  };

  const consultKarel = (deviceName: string) => {
    if (onConsultAgent) {
      onConsultAgent(AgentId.KAJA, `Ahoj Karle, v Dílně Lucie právě rozebírám ${deviceName} a narazil jsem na technický problém se schématem. Můžeš mi pomoci s diagnózou PCB?`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar pb-32">
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#007AFF] rounded-[32px] flex items-center justify-center text-white text-4xl shadow-2xl shadow-blue-500/20">📋</div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter italic leading-none text-[#1D1D1F]">Dílna Lucie</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#007AFF] mt-2">Step-Lock Mentor Core v2.6</p>
            </div>
          </div>
          <button onClick={onBack} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-sm active:scale-90 transition-transform">✕</button>
        </div>
      </header>

      <nav className="flex gap-2 p-1 bg-black/5 rounded-[24px] sticky top-0 z-30 backdrop-blur-xl">
        {[
          { id: 'LIVE', label: 'Step-Lock Live', icon: '🚀' },
          { id: 'SAFETY', label: 'Bezpečnost', icon: '🛡️' },
          { id: 'DOCS', label: 'Nový Protokol', icon: '📝' },
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

      <main className="min-h-[500px]">
        {activeTab === 'LIVE' && (
          <div className="space-y-10 animate-synthesis-in">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-2xl font-black italic tracking-tighter">Aktivní Průvodce</h3>
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">Progress</span>
                  <div className="w-32 h-1.5 bg-black/5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#007AFF] transition-all duration-700" style={{ width: `${(completedSteps.length / methodologySteps.length) * 100}%` }}></div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              {methodologySteps.map((step, i) => (
                <div 
                  key={i} 
                  className={`p-8 rounded-[44px] border transition-all duration-500 relative overflow-hidden ${
                    activeStep === i ? 'bg-white border-[#007AFF] shadow-2xl scale-[1.02]' : 
                    completedSteps.includes(i) ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-white border-black/5 opacity-40'
                  }`}
                >
                  <div className="flex gap-8 items-start relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${
                      completedSteps.includes(i) ? 'bg-green-500 border-green-400 text-white' : 'bg-[#F2F2F7] border-black/5'
                    }`}>
                      {completedSteps.includes(i) ? '✓' : step.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-black italic text-xl tracking-tight leading-none">{step.title}</h4>
                      <p className="text-sm text-black/60 font-medium leading-relaxed">{step.text}</p>
                      
                      {activeStep === i && !completedSteps.includes(i) && (
                        <button 
                          onClick={() => handleStepComplete(i)}
                          className="mt-4 px-8 h-12 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                        >
                          Dokončit tento krok
                        </button>
                      )}
                    </div>
                  </div>
                  {activeStep === i && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007AFF]"></div>}
                </div>
              ))}
            </div>

            {completedSteps.length === methodologySteps.length && (
              <div className="p-12 bg-black text-white rounded-[56px] text-center space-y-6 shadow-2xl animate-bounce">
                <div className="text-6xl">🏆</div>
                <h3 className="text-3xl font-black italic tracking-tighter">Rozborka Dokončena!</h3>
                <p className="text-white/50 text-sm">Metodika Step-Lock byla úspěšně dodržena. Získali jste +10 XP do Synthesis ID.</p>
                <button onClick={() => setActiveTab('DOCS')} className="px-10 py-5 bg-[#007AFF] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl">Vytvořit Protokol</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'SAFETY' && (
          <div className="space-y-10 animate-synthesis-in">
            <div className="p-12 bg-red-50 border border-red-100 rounded-[56px] space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
               <h3 className="text-4xl font-black italic tracking-tighter text-red-700 relative z-10">Bezpečnostní Štít</h3>
               <p className="text-base text-red-900/60 font-medium leading-relaxed relative z-10">
                 Protokol Lucie 2.1: Před zásahem do napájecích obvodů (SMPS) vždy vyčkejte 5 minut na vybití vysokonapěťových kondenzátorů. 230V neodpouští metodické chyby.
               </p>
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
                  <div>
                    <h5 className="font-black italic text-lg leading-none">{item.title}</h5>
                    <p className="text-[10px] font-bold text-black/30 uppercase mt-1.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DOCS' && (
          <form onSubmit={handleSaveReport} className="space-y-8 animate-synthesis-in max-w-2xl mx-auto">
             <div className="bg-white border border-black/5 rounded-[56px] p-12 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/5 blur-[120px]"></div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-3xl font-black italic tracking-tighter">Nový Servisní Protokol</h3>
                  <p className="text-sm text-black/40 font-medium">Strukturovaný záznam vaší inženýrské práce.</p>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Zařízení</label>
                    <input 
                      type="text" 
                      required
                      value={reportForm.deviceName}
                      onChange={e => setReportForm({...reportForm, deviceName: e.target.value})}
                      placeholder="např. MacBook Pro M1" 
                      className="w-full h-16 bg-[#FBFBFD] border border-black/5 rounded-2xl px-6 outline-none font-bold text-lg focus:ring-4 ring-[#007AFF]/5 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Diagnóza</label>
                    <textarea 
                      value={reportForm.initialState}
                      onChange={e => setReportForm({...reportForm, initialState: e.target.value})}
                      placeholder="Co bylo zjištěno před rozborkou..." 
                      className="w-full h-32 bg-[#FBFBFD] border border-black/5 rounded-3xl px-6 py-5 outline-none font-medium resize-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 px-4">Postup & Závěr</label>
                    <textarea 
                      value={reportForm.conclusion}
                      onChange={e => setReportForm({...reportForm, conclusion: e.target.value})}
                      placeholder="Výsledek operace..." 
                      className="w-full h-32 bg-[#FBFBFD] border border-black/5 rounded-3xl px-6 py-5 outline-none font-medium resize-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-16 bg-black text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all relative z-10"
                >
                  Finalizovat & Uložit do Jádra
                </button>
             </div>
          </form>
        )}

        {activeTab === 'ARCHIVE' && (
          <div className="space-y-8 animate-synthesis-in">
             <h3 className="text-2xl font-black italic tracking-tighter px-2">Digitální Archiv</h3>
             {reports.length === 0 ? (
               <div className="p-32 text-center border-2 border-dashed border-black/5 rounded-[56px] space-y-4">
                  <span className="text-6xl opacity-20">🗄️</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Žádné protokoly v archivu.</p>
               </div>
             ) : (
               <div className="grid gap-6">
                 {reports.map(report => (
                   <div key={report.id} className="bg-white border border-black/5 rounded-[48px] p-10 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
                         <span className="px-4 py-1.5 bg-green-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Verified</span>
                         <button 
                          onClick={() => db.delete('reports', report.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                         >✕</button>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest mb-1">{report.date} | ID: {report.id}</p>
                          <h4 className="text-3xl font-black italic tracking-tighter leading-none">{report.deviceName}</h4>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 border-t border-black/5 pt-8">
                           <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase text-black/20">Výchozí stav</p>
                              <p className="text-sm font-bold italic text-black/60 leading-relaxed">{report.initialState}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase text-black/20">Závěr</p>
                              <p className="text-sm font-bold italic text-black/60 leading-relaxed">{report.conclusion}</p>
                           </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button 
                            onClick={() => consultKarel(report.deviceName)}
                            className="flex-1 h-14 bg-[#F2F2F7] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                           >
                            Consult with Karel (HW God)
                           </button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>

      <footer className="text-center opacity-10 pb-20">
        <p className="text-[9px] font-black uppercase tracking-[0.8em] italic text-[#1D1D1F]">{COPYRIGHT}</p>
      </footer>
    </div>
  );
};
