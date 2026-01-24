import React, { useState } from 'react';
import { COPYRIGHT } from '../constants.tsx';

interface LegalShieldModuleProps {
  onBack: () => void;
}

export const LegalShieldModule: React.FC<LegalShieldModuleProps> = ({ onBack }) => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const topics = [
    {
      id: 'rejection',
      title: 'Zamítnutí reklamace',
      icon: '❌',
      description: 'Co dělat, když prodejce tvrdí, že závada je "neopravitelná" nebo způsobená vámi.',
      content: `### Reklamace zamítnuta? Braňte se.
Prodejci často zamítají reklamace s odkazem na "mechanické poškození" nebo "oxidaci", i když k ní nedošlo.

**Vaše kroky:**
1. **Rozporujte protokol:** Nepodepisujte protokol o zamítnutí bez výhrad. Do protokolu uveďte "S rozhodnutím nesouhlasím, požaduji přezkum".
2. **Znalecký posudek:** Pokud jde o dražší věc, kontaktujte soudního znalce. Seznam najdete na justice.cz.
3. **Předžalobní výzva:** Pokud znalec potvrdí vaši pravdu, pošlete prodejci předžalobní výzvu. Náklady na znalce musí prodejce uhradit.`
    },
    {
      id: 'repair-rights',
      title: 'Právo na opravu (EU)',
      icon: '🔧',
      description: 'Nová legislativa nutí výrobce poskytovat náhradní díly po dobu 10 let.',
      content: `### Nové právo EU na opravu
Od roku 2024 platí v EU přísnější pravidla pro výrobce elektroniky.

**Klíčové body:**
- **Dostupnost dílů:** Výrobci musí zajistit díly (displeje, baterie) po dobu 7-10 let od ukončení prodeje modelu.
- **Zákaz serializace:** Je zakázáno SW blokovat díly, které nejsou od výrobce (např. varovné hlášky u baterií).
- **Servisní manuály:** Výrobci musí zveřejnit postupy oprav tak, aby je mohl provést nezávislý servis.`
    },
    {
      id: 'return-funds',
      title: 'Vrácení peněz / Výměna',
      icon: '💰',
      description: 'Kdy máte nárok na okamžité odstoupení od smlouvy.',
      content: `### Kdy chtít peníze zpět?
Podle občanského zákoníku máte nárok na vrácení peněz v těchto případech:

1. **3. stejná závada:** Pokud se stejná vada objeví po dvou opravách znovu.
2. **4. různá závada:** Pokud se na zařízení vyskytne více různých vad najednou nebo postupně.
3. **Nedodržení lhůty:** Pokud prodejce nevyřídí reklamaci do 30 dnů (pokud jste se nedohodli na delší době).`
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-8 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#007AFF] rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/20">⚖️</div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic leading-none">Právní Štít</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF] mt-1">Synthesis Legal Support</p>
          </div>
        </div>
        <p className="text-sm text-black/50 font-medium leading-relaxed max-w-xl">
          Nenechte se odbýt nekalými praktikami prodejců. Synthesis OS vám poskytuje právní oporu a nástroje pro vymáhání vašich práv na opravu.
        </p>
      </header>

      <div className="grid gap-4">
        {topics.map(topic => (
          <div key={topic.id} className="bg-white border border-black/5 rounded-[40px] overflow-hidden transition-all shadow-sm">
            <button 
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
              className="w-full p-8 flex items-center justify-between hover:bg-black/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-6">
                <div className="text-3xl">{topic.icon}</div>
                <div>
                  <h4 className="font-black italic text-lg">{topic.title}</h4>
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1">{topic.description}</p>
                </div>
              </div>
              <span className={`text-2xl transition-transform duration-300 ${activeTopic === topic.id ? 'rotate-180' : ''}`}>↓</span>
            </button>
            
            {activeTopic === topic.id && (
              <div className="px-8 pb-10 animate-synthesis-in">
                <div className="prose-synthesis pt-6 border-t border-black/5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.content}</ReactMarkdown>
                </div>
                <div className="mt-8 flex gap-3">
                  <button className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Stáhnout vzor výzvy</button>
                  <button className="px-6 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest">Více informací</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-10 glass border border-[#007AFF]/10 rounded-[48px] space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Horká Linka Synthesis</h3>
        <p className="text-sm font-bold italic text-black/60">"Máte specifický problém s prodejcem, který zde není uveden? Kontaktujte naše komunitní moderátory v sekci Zprávy."</p>
      </div>

      <button onClick={onBack} className="w-full py-6 glass rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all active:scale-95 shadow-sm">
        Zpět k Hubu
      </button>
      
      <div className="pt-10 text-center pb-20 opacity-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-black">{COPYRIGHT}</p>
      </div>
    </div>
  );
};

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
