
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COPYRIGHT } from '../constants.tsx';

interface LegalShieldModuleProps {
  onBack: () => void;
  onActivateAssistant: () => void;
}

export const LegalShieldModule: React.FC<LegalShieldModuleProps> = ({ onBack, onActivateAssistant }) => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const topics = [
    {
      id: 'rejection',
      title: 'Odmítnutí Reklamace',
      icon: '❌',
      description: 'Právní postup při neoprávněném zamítnutí opravy prodejcem.',
      content: `### Neoprávněné zamítnutí? Braňte se.
Prodejci často zamítají reklamace s odkazem na "mechanické poškození" nebo "oxidaci" bez relevantních důkazů.

**Strategický postup:**
1. **Rozporujte protokol:** Nepodepisujte protokol o zamítnutí bez výhrad. Do protokolu uveďte: *"S rozhodnutím nesouhlasím, požaduji přezkum v souladu s § 2169 OZ."*
2. **Fotodokumentace:** Před odevzdáním i po vrácení vše důkladně nafoťte.
3. **Znalec:** Pokud jde o dražší věc, kontaktujte soudního znalce. Seznam na [justice.cz](https://justice.cz).
4. **Náklady:** Pokud znalec potvrdí vadu, prodejce je povinen uhradit i náklady na posudek.`
    },
    {
      id: 'repair-right',
      title: 'Právo na Opravu (EU)',
      icon: '🔧',
      description: 'Využití nové směrnice EU pro vynucení dostupnosti dílů.',
      content: `### Evropské Právo na Opravu (2024+)
Nová legislativa EU radikálně mění hru. Výrobci musí umožnit opravu, i když je zařízení po záruce.

**Co můžete vyžadovat:**
- **Náhradní díly:** Výrobci musí držet díly (baterie, displeje) dostupné po dobu minimálně 7-10 let.
- **Zákaz blokování:** Je zakázáno SW blokovat nezávislé opravy (tzv. anti-repair serializace).
- **Cena dílů:** Cena náhradního dílu nesmí být tak vysoká, aby činila opravu nerentabilní.`
    },
    {
      id: 'refund-exchange',
      title: 'Výměna / Vrácení peněz',
      icon: '💰',
      description: 'Kdy máte nárok na okamžité odstoupení od smlouvy.',
      content: `### Odstoupení od smlouvy
Máte právo na vrácení peněz nebo výměnu za nové kusy v těchto případech:

1. **Nedodržení lhůty:** Pokud reklamace není vyřízena do 30 kalendářních dnů.
2. **Třetí stejná vada:** Pokud se stejná vada objeví potřetí po dvou předchozích opravách.
3. **Čtvrtá různá vada:** Pokud se na zařízení vyskytne čtvrtá různá vada.
4. **Podstatné porušení:** Pokud je vada neodstranitelná a brání řádnému užívání věci.`
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-12 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#007AFF] rounded-[32px] flex items-center justify-center text-white text-4xl shadow-2xl shadow-blue-500/20">⚖️</div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic leading-none">Právní Štít</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#007AFF] mt-2">Synthesis Advocacy Core</p>
          </div>
        </div>
        <p className="text-sm text-black/50 font-medium leading-relaxed max-w-xl italic">
          FixIt Guru není jen o šroubcích. Je o moci nad vlastním majetkem. Použijte naše právní blueprinty k boji proti nekalým praktikám.
        </p>
      </header>

      <section className="bg-black text-white p-10 rounded-[48px] shadow-2xl space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#007AFF] blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 glass-dark rounded-[32px] flex items-center justify-center text-5xl shadow-inner bg-white/10">🏛️</div>
          <div className="space-y-4 text-center md:text-left flex-1">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">JUDY: Advocacy Assistant</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Potřebujete sepsat odvolání, analyzovat účtenku nebo poslat oficiální reakci prodejci? Judy je vaše digitální právní opora v Matrixu.
            </p>
            <button 
              onClick={onActivateAssistant}
              className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              Spustit Právní Pomoc
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {topics.map(topic => (
          <div key={topic.id} className="bg-white border border-black/5 rounded-[48px] overflow-hidden transition-all shadow-sm">
            <button 
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              className="w-full p-10 flex items-center justify-between hover:bg-black/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-8">
                <div className="text-4xl">{topic.icon}</div>
                <div>
                  <h4 className="font-black italic text-xl tracking-tight leading-none">{topic.title}</h4>
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mt-3">{topic.description}</p>
                </div>
              </div>
              <span className={`text-2xl transition-transform duration-500 opacity-20 ${activeTopic === topic.id ? 'rotate-180' : ''}`}>↓</span>
            </button>
            
            {activeTopic === topic.id && (
              <div className="px-10 pb-12 animate-synthesis-in">
                <div className="prose-synthesis pt-10 border-t border-black/5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-12 glass border border-[#007AFF]/20 rounded-[56px] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#007AFF] blur-[80px] opacity-10"></div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Právní Handshake Synthesis</h3>
        <p className="text-sm font-bold italic text-black/60 leading-relaxed">
          "Při jednání s prodejcem buďte věcní a dejte najevo, že znáte svá práva. Funkce přímého exportu dokumentů do PDF byly v této verzi nahrazeny přímou asistencí JUDY."
        </p>
      </div>

      <button onClick={onBack} className="w-full py-8 glass rounded-[36px] font-black text-xs uppercase tracking-[0.3em] text-black/20 hover:text-black transition-all active:scale-95 shadow-sm">
        Zpět k Terminálu
      </button>
      
      <div className="pt-10 text-center pb-20 opacity-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-black">{COPYRIGHT}</p>
      </div>
    </div>
  );
};
