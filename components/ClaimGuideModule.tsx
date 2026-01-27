
import React, { useState } from 'react';
import { COPYRIGHT } from '../constants.tsx';

interface ClaimGuideModuleProps {
  onBack: () => void;
}

type GuideTab = 'STRATEGY' | 'PREPARATION' | 'DOCS' | 'LEGISLATION';

export const ClaimGuideModule: React.FC<ClaimGuideModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('STRATEGY');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const prepItems = [
    { id: 'receipt', text: 'Originální účtenka nebo faktura (fyzická/PDF)' },
    { id: 'photos', text: 'Fotodokumentace vady a celkového stavu zařízení' },
    { id: 'original_box', text: 'Původní obal (není zákonná povinnost, ale doporučeno)' },
    { id: 'accessories', text: 'Kompletní příslušenství k zařízení' },
    { id: 'backup', text: 'Záloha dat (prodejce za ně neručí)' }
  ];

  const strategySteps = [
    { title: 'Identifikace vady', text: 'Jasně a stručně popište, co nefunguje. Vyhněte se vágním termínům.' },
    { title: 'Výběr nároku', text: 'Rozhodněte se, zda chcete opravu, výměnu za nové, nebo slevu z kupní ceny.' },
    { title: 'Podání reklamace', text: 'Uplatněte reklamaci u prodejce. Musí vám vydat potvrzení o datu podání.' },
    { title: 'Sledování lhůty', text: 'Prodejce má na vyřízení 30 kalendářních dnů. Pokud to nestihne, máte nárok na vrácení peněz.' }
  ];

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allPrepChecked = prepItems.every(item => checklist[item.id]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#1D1D1F] rounded-[32px] flex items-center justify-center text-white text-4xl shadow-2xl shadow-black/20">⚖️</div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic leading-none text-[#1D1D1F]">Průvodce Reklamací</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#1D1D1F]/40 mt-2">Advocacy & Strategy Core</p>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'STRATEGY', label: 'Strategie', icon: '♟️' },
          { id: 'PREPARATION', label: 'Příprava', icon: '📦' },
          { id: 'DOCS', label: 'Dokumentace', icon: '📄' },
          { id: 'LEGISLATION', label: 'Legislativa', icon: '⚖️' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GuideTab)}
            className={`h-12 px-6 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-[#1D1D1F] text-white shadow-lg' : 'bg-white border border-black/5 text-black/40 hover:bg-black/5'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="min-h-[400px]">
        {activeTab === 'STRATEGY' && (
          <div className="space-y-8 animate-synthesis-in">
            <h3 className="text-2xl font-black italic tracking-tighter">Strategický Postup</h3>
            <div className="grid gap-4">
              {strategySteps.map((step, i) => (
                <div key={i} className="p-8 bg-white border border-black/5 rounded-[40px] flex gap-6 shadow-sm group hover:border-black/30 transition-all">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl font-black shrink-0">{i+1}</div>
                  <div className="space-y-2">
                    <h4 className="font-black italic text-lg">{step.title}</h4>
                    <p className="text-sm text-black/50 font-medium leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'PREPARATION' && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="p-10 bg-[#1D1D1F] text-white rounded-[48px] space-y-4">
              <h3 className="text-2xl font-black italic tracking-tighter">Přípravný Checklist</h3>
              <p className="text-sm text-white/60 font-medium">Než vyrazíte k prodejci, ujistěte se, že máte vše potřebné. Správná příprava je 50 % úspěchu.</p>
            </div>
            
            <div className="bg-white border border-black/5 rounded-[48px] p-8 space-y-4 shadow-sm">
              {prepItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full p-6 flex items-center gap-6 rounded-[28px] hover:bg-black/[0.02] transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${checklist[item.id] ? 'bg-black border-black text-white' : 'border-black/5'}`}>
                    {checklist[item.id] ? '✓' : ''}
                  </div>
                  <span className={`text-sm font-black italic transition-all ${checklist[item.id] ? 'text-black opacity-100' : 'text-black/40'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            {allPrepChecked && (
              <div className="p-8 bg-green-50 border border-green-100 rounded-[40px] text-center animate-bounce">
                <p className="text-green-700 font-black uppercase text-xs tracking-widest">Máte vše připraveno k podání reklamace!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-8 animate-synthesis-in">
            <h3 className="text-2xl font-black italic tracking-tighter">Dokumentace & Vzory</h3>
            <div className="bg-white border border-black/5 rounded-[48px] p-10 space-y-6 shadow-sm">
              <p className="text-sm text-black/50 font-medium leading-relaxed">
                Potřebujete sepsat formální reklamaci nebo odstoupení od smlouvy? Zde jsou typické formáty používané v r. 2026.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="h-20 px-8 bg-[#FBFBFD] border border-black/5 rounded-3xl flex items-center justify-between">
                    <span className="font-black italic text-sm text-black/30">Vzor: Reklamační list</span>
                 </div>
                 <div className="h-20 px-8 bg-[#FBFBFD] border border-black/5 rounded-3xl flex items-center justify-between">
                    <span className="font-black italic text-sm text-black/30">Vzor: Odstoupení do 14 dnů</span>
                 </div>
                 <div className="h-20 px-8 bg-[#FBFBFD] border border-black/5 rounded-3xl flex items-center justify-between">
                    <span className="font-black italic text-sm text-black/30">Vzor: Předžalobní výzva</span>
                 </div>
                 <div className="h-20 px-8 bg-[#FBFBFD] border border-black/5 rounded-3xl flex items-center justify-between">
                    <span className="font-black italic text-sm text-black/30">Vzor: Žádost o náhradu nákladů</span>
                 </div>
              </div>
              <p className="text-[10px] text-black/20 italic text-center">Funkce přímého tisku vzorů byla v této verzi deaktivována.</p>
            </div>
          </div>
        )}

        {activeTab === 'LEGISLATION' && (
          <div className="space-y-12 animate-synthesis-in">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black italic tracking-tighter">Vaše Práva v Roce 2026</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Zákon o ochraně spotřebitele & NOZ</p>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Odpovědnost za vady', text: 'Prodejce odpovídá za vady, které se projeví v době 24 měsíců od převzetí.' },
                { title: 'Důkazní břemeno', text: 'V prvním roce se má za to, že věc byla vadná již při převzetí. Prodejce musí dokázat opak.' },
                { title: 'Lhůta 30 dnů', text: 'Reklamace musí být vyřízena bez zbytečného odkladu, nejpozději do 30 dnů.' }
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
