import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COPYRIGHT } from '../constants.tsx';

interface ClaimGuideModuleProps {
  onBack: () => void;
  onActivateWithContext?: (template: string) => void;
}

type GuideTab = 'STRATEGY' | 'PREPARATION' | 'DOCS' | 'LEGISLATION';

interface LegalTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: string;
}

const TEMPLATES: LegalTemplate[] = [
  {
    id: 'claim_form',
    title: 'Reklamační list',
    icon: '📦',
    description: 'Základní formulář pro uplatnění vady v záruční lhůtě.',
    content: `**Adresát:** [JMÉNO PRODEJCE], [ADRESA PRODEJCE]

**Věc: Uplatnění práv z vadného plnění (reklamace)**

Dne [DATUM NÁKUPU] jsem ve Vaší provozovně / e-shopu zakoupil(a) zboží [NÁZEV PRODUKTU], č. objednávky [ČÍSLO].

U zboží se projevila následující vada: [POPIS VADY].

Vzhledem k výše uvedenému uplatňuji právo z vadného plnění a v souladu s § 2169 občanského zákoníku požaduji:
*   [ ] Opravu věci
*   [ ] Výměnu za novou věc
*   [ ] Odstoupení od smlouvy a vrácení peněz (v případě podstatného porušení)

Zboží předávám k posouzení. Žádám o vyřízení reklamace v zákonné lhůtě 30 dnů a vydání potvrzení o datu uplatnění.

V [MÍSTO] dne [AKTUÁLNÍ DATUM]

__________________________
[VAŠE JMÉNO]`
  },
  {
    id: 'withdrawal_14',
    title: 'Odstoupení do 14 dnů',
    icon: '↩️',
    description: 'Pro nákupy na e-shopech bez udání důvodu.',
    content: `**Adresát:** [JMÉNO PRODEJCE], [ADRESA PRODEJCE]

**Věc: Oznámení o odstoupení od kupní smlouvy**

Oznamuji, že tímto odstupuji od smlouvy o nákupu tohoto zboží: [NÁZEV ZBOŽÍ], objednaného dne [DATUM] a obdrženého dne [DATUM].

Právo na odstoupení uplatňuji v zákonné lhůtě 14 dnů v souladu s § 1829 odst. 1 občanského zákoníku.

Kupní cenu ve výši [ČÁSTKA] Kč včetně poštovného žádám vrátit na můj bankovní účet č. [ČÍSLO ÚČTU] nejpozději do 14 dnů od doručení tohoto oznámení.

V [MÍSTO] dne [AKTUÁLNÍ DATUM]

__________________________
[VAŠE JMÉNO]`
  },
  {
    id: 'pre_litigation',
    title: 'Předžalobní výzva',
    icon: '⚖️',
    description: 'Poslední varování prodejci před podáním žaloby.',
    content: `**VÝZVA K PLNĚNÍ POVINNOSTI (PŘEDŽALOBNÍ VÝZVA)**
dle § 142a občanského soudního řádu

**Vyzývající:** [VAŠE JMÉNO], [ADRESA]
**Vyzvaný:** [JMÉNO PRODEJCE], [ADRESA/IČO]

Vzhledem k tomu, že jste ani přes opakované urgence nevyřídili reklamaci č. [ČÍSLO] / nevrátili kupní cenu za zboží [PRODUKT], vyzývám Vás tímto k nápravě.

Požadované plnění: [NAPŘ. VRÁCENÍ ČÁSTKY XXX KČ]
Termín plnění: **do 7 dnů** od doručení této výzvy.

Pokud nebude v uvedené lhůtě povinnost splněna, jsem připraven(a) věc řešit soudní cestou. V takovém případě budu nucen(a) požadovat rovněž náhradu nákladů řízení a úrok z prodlení.

V [MÍSTO] dne [AKTUÁLNÍ DATUM]

__________________________
[VAŠE JMÉNO]`
  },
  {
    id: 'cost_reimbursement',
    title: 'Náhrada nákladů',
    icon: '💰',
    description: 'Žádost o proplacení poštovného za uznanou reklamaci.',
    content: `**Adresát:** [JMÉNO PRODEJCE], [ADRESA PRODEJCE]

**Věc: Žádost o náhradu účelně vynaložených nákladů spojených s reklamací**

V návaznosti na uznanou reklamaci zboží [PRODUKT], č. protokolu [ČÍSLO], Vás tímto žádám o náhradu nákladů, které mi v souvislosti s reklamací vznikly.

Jedná se o:
1. Poštovné / Dopravné ve výši [ČÁSTKA] Kč (viz přiložený doklad).

Nárok uplatňuji v souladu s § 1924 občanského zákoníku. Částku prosím zašlete na můj účet [ČÍSLO ÚČTU] do 14 dnů.

V [MÍSTO] dne [AKTUÁLNÍ DATUM]

__________________________
[VAŠE JMÉNO]`
  }
];

export const ClaimGuideModule: React.FC<ClaimGuideModuleProps> = ({ onBack, onActivateWithContext }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('STRATEGY');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTemplateClick = (t: LegalTemplate) => {
    haptic(15);
    setSelectedTemplate(t);
  };

  const handleBuildWithJudy = () => {
    if (!selectedTemplate || !onActivateWithContext) return;
    haptic([10, 60]);
    onActivateWithContext(`Ahoj Judy, chci sestavit dokument na základě tohoto blueprintu: \n\n${selectedTemplate.content}\n\nProsím použij data z mého SVID Matrixu a doplň je do dokumentu.`);
  };

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

  return (
    <div className="p-6 md:p-12 space-y-12 animate-synthesis-in no-scrollbar relative">
      
      {/* TEMPLATE PREVIEW MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-synthesis-in">
           <div className="max-w-2xl w-full bg-white rounded-[56px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-black/5">
              <header className="p-10 border-b border-black/5 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <span className="text-4xl">{selectedTemplate.icon}</span>
                    <div>
                       <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{selectedTemplate.title}</h3>
                       <p className="text-[9px] font-black uppercase text-[#007AFF] mt-2 tracking-widest">Blueprint Integrity v10.0</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTemplate(null)} className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center font-black">✕</button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 bg-[#FBFBFD]">
                 <div className="p-12 bg-white border border-black/5 shadow-inner rounded-[32px] font-serif text-sm leading-relaxed text-black/80 whitespace-pre-wrap" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                    {selectedTemplate.content}
                 </div>
              </div>

              <footer className="p-8 border-t border-black/5 flex gap-4 bg-white">
                 <button 
                  onClick={handleBuildWithJudy}
                  className="flex-1 h-16 bg-black text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                  <span className="text-xl">⚖️</span> Sestavit s JUDY
                 </button>
                 <button onClick={() => setSelectedTemplate(null)} className="px-8 h-16 bg-black/5 text-black/40 rounded-full font-black text-[10px] uppercase tracking-widest">Zavřít</button>
              </footer>
           </div>
        </div>
      )}

      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sticky top-0 z-50 backdrop-blur-xl bg-[#FBFBFD]/80 py-4">
        {[
          { id: 'STRATEGY', label: 'Strategie', icon: '♟️' },
          { id: 'PREPARATION', label: 'Příprava', icon: '📦' },
          { id: 'DOCS', label: 'Dokumenty', icon: '📄' },
          { id: 'LEGISLATION', label: 'Legislativa', icon: '⚖️' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as GuideTab); haptic(5); }}
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
                  onClick={() => { toggleCheck(item.id); haptic(5); }}
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
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-8 animate-synthesis-in">
            <h3 className="text-2xl font-black italic tracking-tighter">Blueprinty Listin</h3>
            <p className="text-sm text-black/40 font-medium px-2">Vyberte si šablonu pro váš spor. Synthesis Jádro zajistí formální správnost dle aktuální legislativy.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {TEMPLATES.map(template => (
                 <button 
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="p-8 bg-white border border-black/5 rounded-[44px] text-left space-y-6 hover:shadow-2xl hover:border-black/10 transition-all group relative overflow-hidden shadow-sm"
                 >
                    <div className="flex items-center justify-between">
                       <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-black/5 group-hover:scale-110 transition-transform">{template.icon}</div>
                       <span className="text-[8px] font-black uppercase text-[#007AFF] tracking-widest">NOZ 2026 Compatible</span>
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-black italic text-xl tracking-tight leading-none">{template.title}</h4>
                       <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mt-3">{template.description}</p>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        )}
      </main>

      <div className="pt-10 text-center pb-20 opacity-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-black">{COPYRIGHT}</p>
      </div>
    </div>
  );
};