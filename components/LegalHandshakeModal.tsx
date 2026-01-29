import React, { useState, useEffect } from 'react';
import { Agent, User, UserRole, AgentId } from '../types.ts';

interface LegalHandshakeModalProps {
  isOpen: boolean;
  agent: Agent;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

interface IntegrityPoint {
  id: string;
  text: string;
}

export const LegalHandshakeModal: React.FC<LegalHandshakeModalProps> = ({ isOpen, agent, user, onClose, onConfirm }) => {
  const isHost = user?.role === UserRole.HOST;
  const [accepted, setAccepted] = useState(!isHost);

  useEffect(() => {
    if (isOpen) setAccepted(!isHost);
  }, [agent, isHost, isOpen]);

  if (!isOpen) return null;

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleConfirm = () => {
    if (!accepted) return;
    haptic([10, 50]);
    onConfirm();
  };

  const openLp05Info = () => {
    haptic(5);
    window.dispatchEvent(new CustomEvent('synthesis:open-info', { detail: 'lp-05' }));
  };

  // Dynamická generace bodů dle agenta
  const getAgentContextPoints = (id: AgentId): IntegrityPoint[] => {
    switch (id) {
      case AgentId.KAJA:
        return [
          { id: 'SY-KJ-01', text: 'Beru na vědomí riziko elektrostatického výboje (ESD) na CPU.' },
          { id: 'SY-KJ-02', text: 'Potvrzuji, že zařízení je fyzicky odpojeno od sítě 230V.' },
          { id: 'SY-KJ-03', text: 'Akceptuji nevratnost změn na logické desce a firmware.' }
        ];
      case AgentId.LUCKA:
        return [
          { id: 'SY-LC-01', text: 'Budu dodržovat metodiku Step-Lock bez vynechávání kroků.' },
          { id: 'SY-LC-02', text: 'Pracovní plocha je očištěna a připravena dle standardu.' },
          { id: 'SY-LC-03', text: 'Rozumím, že Lucie je mentor, nikoliv certifikovaný dozor.' }
        ];
      case AgentId.JUDY:
        return [
          { id: 'SY-JD-01', text: 'Rozumím, že výstupy JUDY nenahrazují certifikované poradenství.' },
          { id: 'SY-JD-02', text: 'Zavazuji se k validaci faktických polí dokumentu před podpisem.' },
          { id: 'SY-JD-03', text: 'Akceptuji mandát digitální suverenity v souladu s NOZ 2026.' }
        ];
      case AgentId.DASA:
        return [
          { id: 'SY-DS-01', text: 'Budu respektovat biologickou integritu organických systémů.' },
          { id: 'SY-DS-02', text: 'Používám výhradně demineralizované roztoky Synthesis.' },
          { id: 'SY-DS-03', text: 'Rozumím principům cirkulárního pěstování v Jádru.' }
        ];
      case AgentId.FRANTA:
        return [
          { id: 'SY-FR-01', text: 'Mám nasazeny ochranné brýle a vyztužené rukavice.' },
          { id: 'SY-FR-02', text: 'Budu respektovat krouticí momenty definované v datasheetu.' },
          { id: 'SY-FR-03', text: 'Akceptuji mechanická rizika při práci s těžkým nářadím.' }
        ];
      default:
        return [
          { id: 'SY-GEN-01', text: 'Akceptuji riziko zániku záruky výrobce demontáží.' },
          { id: 'SY-GEN-02', text: 'Budu dodržovat bezpečnostní instrukce Step-Lock.' },
          { id: 'SY-GEN-03', text: 'Rozumím, že asistence není certifikovaný servis.' }
        ];
    }
  };

  const points = getAgentContextPoints(agent.id);

  return (
    <div className="fixed inset-0 z-[12000] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fluent-in">
      <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
        <p className="text-[8px] font-mono opacity-[0.25] uppercase tracking-widest text-white">LEGAL_HANDSHAKE // ID-10</p>
      </div>

      <div className="max-w-xl w-full bg-white rounded-[48px] sm:rounded-[56px] shadow-2xl flex flex-col overflow-hidden border border-black/5 relative">
        <div className="absolute top-0 right-0 w-64 h-64 blur-[120px] opacity-[0.08]" style={{ backgroundColor: agent.color }}></div>
        
        <header className="p-8 sm:p-12 pb-6 border-b border-black/5 relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-white border border-black/5 rounded-[24px] flex items-center justify-center text-4xl shadow-sm" style={{ color: agent.color }}>
              {agent.icon}
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity active:scale-90">✕</button>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Legal Handshake Required</p>
            <h3 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase leading-none text-black">Vstup do relace <br/>s {agent.name}</h3>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 no-scrollbar relative z-10">
          <div className="space-y-6">
            <div className="p-8 bg-amber-50 border border-amber-100 rounded-[32px] space-y-3 shadow-inner">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Inženýrské Varování</p>
              </div>
              <p className="text-sm font-bold italic text-amber-900/70 leading-relaxed">
                {agent.warning?.cs || "Vstupujete do expertního režimu asistence. Berte na vědomí, že AI instrukce jsou doporučující a uživatel nese plnou odpovědnost za integritu HW."}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={openLp05Info}
                className="flex items-center gap-2 group transition-all"
              >
                <p className="text-[10px] font-black uppercase text-black/30 tracking-[0.3em] px-2 group-hover:text-blue-600">Protokol LP-05</p>
                <span className="w-4 h-4 rounded-full border border-black/10 flex items-center justify-center text-[8px] font-black text-black/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">?</span>
              </button>
              
              <ul className="space-y-4">
                {points.map((point) => (
                  <li key={point.id} className="flex gap-4 items-start group">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 animate-pulse"></div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-bold text-black/50 italic leading-relaxed group-hover:text-black transition-colors">{point.text}</p>
                      <span className="text-[7px] font-mono font-black text-black/10 group-hover:text-blue-600/30 uppercase mt-0.5 tracking-widest">SUB-ID: {point.id}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <footer className="p-8 sm:p-12 pt-6 border-t border-black/5 bg-[#FBFBFD] relative z-10">
          <div className="space-y-6">
            <label className={`w-full flex items-center gap-5 p-6 rounded-[32px] border transition-all cursor-pointer ${accepted ? 'bg-blue-50 border-blue-200' : 'bg-white border-black/5 hover:border-black/20'}`}>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={accepted} 
                  disabled={!isHost}
                  onChange={(e) => { setAccepted(e.target.checked); haptic(5); }}
                  className="w-8 h-8 rounded-xl border-2 border-black/10 checked:bg-blue-600 checked:border-blue-600 appearance-none transition-all cursor-pointer disabled:bg-green-500 disabled:border-green-500" 
                />
                {!isHost && <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-black">✓</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black italic text-black">Potvrzuji Mandát Integrity</p>
                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isHost ? 'text-black/30' : 'text-green-600'}`}>
                  {isHost ? 'Povinný souhlas pro tuto relaci' : 'Trvale potvrzeno skrze SVID registraci'}
                </p>
              </div>
            </label>

            <div className="space-y-4">
              <button 
                onClick={handleConfirm}
                disabled={!accepted}
                className="w-full h-16 sm:h-20 bg-black text-white rounded-[28px] sm:rounded-[32px] font-black text-[11px] sm:text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group overflow-hidden relative"
              >
                <span className="relative z-10">Vstoupit do relace</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>
              
              <div className="text-center pt-2">
                <p className="text-[7px] font-mono text-black/15 uppercase tracking-[0.5em] animate-pulse">
                  BATCH_AUDIT: {points.map(p => p.id.split('-').pop()).join('.')}.{agent.id.slice(0,3)}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};