
import React, { useState } from 'react';
import { COPYRIGHT } from '../constants.tsx';

interface LucieWorkshopModuleProps {
  onBack: () => void;
}

type WorkshopTab = 'METHODOLOGY' | 'SAFETY' | 'DOCS' | 'ONBOARDING';

export const LucieWorkshopModule: React.FC<LucieWorkshopModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<WorkshopTab>('METHODOLOGY');
  const [safetyStep, setSafetyStep] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const safetyItems = [
    { id: 'power', text: 'Zařízení odpojeno od napájení (AC/Baterie)' },
    { id: 'esd', text: 'ESD ochrana připravena (náramek/podložka)' },
    { id: 'workspace', text: 'Čistý a osvětlený pracovní prostor' },
    { id: 'tools', text: 'Správné bity a nářadí připraveny' },
    { id: 'storage', text: 'Organizér na šroubky připraven' }
  ];

  const methodologySteps = [
    { title: 'Vizuální inspekce', text: 'Hledejte známky poškození, praskliny nebo chybějící šroubky.' },
    { title: 'Uvolnění upevnění', text: 'Odšroubujte všechny viditelné šroubky. Pozor na skryté pod gumovými nožičkami.' },
    { title: 'Oddělení šasi', text: 'Použijte plastové trsátko (spudger). Postupujte po obvodu, nikdy nepoužívejte kov na plast.' },
    { title: 'Odpojení flexů', text: 'Před úplným oddělením zkontrolujte, zda nejsou připojeny ploché kabely.' }
  ];

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allSafetyChecked = safetyItems.every(item => checklist[item.id]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#007AFF] rounded-[32px] flex items-center justify-center text-white text-4xl shadow-2xl shadow-blue-500/20">📋</div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic leading-none text-[#1D1D1F]">Dílna Lucie</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#007AFF] mt-2">Průvodce & Mentoring Core</p>
          </div>
        </div>
      </header>

      {/* Navigace Sub-modulů */}
      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'METHODOLOGY', label: 'Metodika', icon: '📐' },
          { id: 'SAFETY', label: 'Bezpečnost', icon: '🛡️' },
          { id: 'DOCS', label: 'Dokumentace', icon: '📝' },
          { id: 'ONBOARDING', label: 'On-boarding', icon: '🎓' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as WorkshopTab)}
            className={`h-12 px-6 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-[#007AFF] text-white shadow-lg' : 'bg-white border border-black/5 text-black/40 hover:bg-black/5'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Obsah sub-modulů */}
      <main className="min-h-[400px]">
        {activeTab === 'METHODOLOGY' && (
          <div className="space-y-8 animate-synthesis-in">
            <h3 className="text-2xl font-black italic tracking-tighter">Metodika Rozborek</h3>
            <div className="grid gap-4">
              {methodologySteps.map((step, i) => (
                <div key={i} className="p-8 bg-white border border-black/5 rounded-[40px] flex gap-6 shadow-sm group hover:border-[#007AFF]/30 transition-all">
                  <div className="w-12 h-12 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-xl font-black text-[#007AFF] shrink-0">{i+1}</div>
                  <div className="space-y-2">
                    <h4 className="font-black italic text-lg">{step.title}</h4>
                    <p className="text-sm text-black/50 font-medium leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SAFETY' && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="p-10 bg-red-50 border border-red-100 rounded-[48px] space-y-4">
              <h3 className="text-2xl font-black italic tracking-tighter text-red-700">Bezpečnostní Protokol</h3>
              <p className="text-sm text-red-900/60 font-medium">Před každou operací musíme ověřit vaši připravenost. Bezpečnost je v Studio Synthesis na prvním místě.</p>
            </div>
            
            <div className="bg-white border border-black/5 rounded-[48px] p-8 space-y-4 shadow-sm">
              {safetyItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full p-6 flex items-center gap-6 rounded-[28px] hover:bg-black/[0.02] transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${checklist[item.id] ? 'bg-green-500 border-green-500 text-white' : 'border-black/5'}`}>
                    {checklist[item.id] ? '✓' : ''}
                  </div>
                  <span className={`text-sm font-black italic transition-all ${checklist[item.id] ? 'text-black opacity-100' : 'text-black/40'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            {allSafetyChecked && (
              <div className="p-8 bg-green-50 border border-green-100 rounded-[40px] text-center animate-bounce">
                <p className="text-green-700 font-black uppercase text-xs tracking-widest">Jste připraveni! Můžete začít s opravou.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-8 animate-synthesis-in">
            <h3 className="text-2xl font-black italic tracking-tighter">Dokumentace Procesů</h3>
            <div className="bg-white border border-black/5 rounded-[48px] p-10 space-y-6 shadow-sm">
              <p className="text-sm text-black/50 font-medium leading-relaxed">
                Kvalitní dokumentace je klíčem k úspěšné reklamaci nebo budoucí opravě. Lucie vám pomůže vygenerovat strukturovaný report.
              </p>
              <div className="space-y-4">
                <input type="text" placeholder="Název zařízení / Model" className="w-full h-16 bg-[#FBFBFD] border border-black/5 rounded-2xl px-6 outline-none font-bold" />
                <textarea placeholder="Počáteční stav / Popis závady..." className="w-full h-32 bg-[#FBFBFD] border border-black/5 rounded-3xl px-6 py-4 outline-none font-medium" />
                <button className="w-full h-16 bg-[#007AFF] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Inicializovat Report</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ONBOARDING' && (
          <div className="space-y-12 animate-synthesis-in">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black italic tracking-tighter">Cesta Gurua</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Vítejte v operačním systému Synthesis</p>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Získejte Synthesis ID', text: 'Vaše digitální identita s biometrickým Handshakem.' },
                { title: 'Vyberte si specialistu', text: 'Každý agent má specifické know-how pro váš úkol.' },
                { title: 'Sdílejte znalosti', text: 'Získávejte XP a stoupejte v hierarchii Studio Synthesis.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0">{i+1}</div>
                  <div className="space-y-1 pt-1">
                    <h5 className="font-black italic text-lg leading-none">{step.title}</h5>
                    <p className="text-sm text-black/40 font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="pt-12 text-center opacity-20 pb-10">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-[#1D1D1F]">{COPYRIGHT}</p>
      </footer>

      <button onClick={onBack} className="w-full py-8 glass rounded-[36px] font-black text-xs uppercase tracking-[0.3em] text-black/20 hover:text-black transition-all active:scale-95 shadow-sm">
        Zpět k Terminálu
      </button>
    </div>
  );
};
