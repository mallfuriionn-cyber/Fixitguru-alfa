import React, { useState, useEffect } from 'react';
import { Agent, User, UserRole } from '../types.ts';
import { db } from '../services/storageService.ts';
import { hasPermission } from '../utils/permissionUtils.ts';
import { fetchPageContent } from '../services/pageService.ts';
import { ProjectMap } from './ProjectMap.tsx';

interface AdminPanelProps {
  user: User | null;
  agents: Agent[];
  onUpdateAgents: (agents: Agent[]) => void;
  onBack: () => void;
}

type AdminDomain = 'IDENTITY' | 'WORKSHOP' | 'LEGAL' | 'KERNEL' | 'LOGGING' | 'OTHER' | 'SYSTEM_MAP';

interface SettingGroup {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, agents, onUpdateAgents, onBack }) => {
  const [activeDomain, setActiveDomain] = useState<AdminDomain>('IDENTITY');
  const [selectedSettingGroup, setSelectedSettingGroup] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerContent, setExplainerContent] = useState('');
  const [groupContent, setGroupContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  useEffect(() => {
    (window as any).openHelp = (slug: string) => {
      const event = new CustomEvent('synthesis:admin-help', { detail: slug });
      window.dispatchEvent(event);
    };

    const handler = (e: any) => handleOpenHelp(e.detail);
    window.addEventListener('synthesis:admin-help', handler);
    
    return () => {
      window.removeEventListener('synthesis:admin-help', handler);
    };
  }, []);

  useEffect(() => {
    if (selectedSettingGroup) {
      loadGroupSettings(selectedSettingGroup);
    }
  }, [selectedSettingGroup]);

  const loadGroupSettings = async (groupId: string) => {
    setGroupContent('<div class="p-20 text-center animate-pulse font-black text-[10px] uppercase tracking-widest text-black/20">Dekryptuji parametry Jádra...</div>');
    const content = await fetchPageContent(`admin/modules/${groupId}-settings`);
    setGroupContent(content);
  };

  const handleOpenHelp = async (slug: string) => {
    haptic(5);
    setExplainerContent('<div class="p-10 text-center animate-pulse text-[10px] font-black uppercase tracking-widest opacity-20">Navazuji spojení s Kernel Docs...</div>');
    setShowExplainer(true);
    const content = await fetchPageContent(`admin/explainers/${slug}`);
    setExplainerContent(content);
  };

  const handleSave = () => {
    haptic([20, 10, 20]);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedSettingGroup(null);
    }, 1200);
  };

  if (!user || !hasPermission(user, 'ACCESS_KERNEL')) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white p-10 space-y-6 relative">
        <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
          <p className="text-[8px] font-mono opacity-[0.15] uppercase tracking-widest">KERNEL_ADMIN // ID-07</p>
        </div>
        <div className="w-20 h-20 border-4 border-red-500 rounded-full flex items-center justify-center text-4xl animate-pulse">🔒</div>
        <h2 className="text-xl font-black italic uppercase tracking-widest text-center">Access Denied // Kernel Auth Required</h2>
        <button onClick={onBack} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Návrat k terminálu</button>
      </div>
    );
  }

  const domainConfig: Record<AdminDomain, { label: string; icon: string; groups: SettingGroup[] }> = {
    IDENTITY: {
      label: 'SVID & Identita',
      icon: '🆔',
      groups: [
        { id: 'svid', title: 'SEE-256 Encryption', desc: 'Správa šifrovacích iterací a síly klíčů pro SVID.', icon: '🔐' },
        { id: 'handshake', title: 'Hardware Handshake', desc: 'Konfigurace fyzického ověřování pomocí Passkeys.', icon: '🤝' },
        { id: 'privacy', title: 'Privacy Logic', desc: 'Pravidla pro anonymizaci a automatické mazání dat.', icon: '🛡️' }
      ]
    },
    WORKSHOP: {
      label: 'Dílna & Bezpečnost',
      icon: '🛠️',
      groups: [
        { id: 'workshop', title: 'Step-Lock Protocol', desc: 'Nastavení rigidity a vizuální verifikace opravy.', icon: '🚦' },
        { id: 'voltage', title: 'Safety Thresholds', desc: 'Limity pro detekci nebezpečného napětí v obvodech.', icon: '⚡' },
        { id: 'vision', title: 'Neural Vision', desc: 'Konfigurace OCR analýzy a identifikace komponent.', icon: '👁️' }
      ]
    },
    LEGAL: {
      label: 'JUDY Advocacy',
      icon: '⚖️',
      groups: [
        { id: 'judy', title: 'Legislative Engine', desc: 'Verze NOZ a datasetů pro právní analýzu.', icon: '📖' },
        { id: 'search', title: 'Grounding Depth', desc: 'Hloubka ověřování faktů skrze Google Search.', icon: '🔍' },
        { id: 'templates', title: 'Luxury Printing', desc: 'Správa šablon a pečetí integrity na dokumentech.', icon: '📄' }
      ]
    },
    KERNEL: {
      label: 'Systémové Jádro',
      icon: '🧠',
      groups: [
        { id: 'orchestrator', title: 'Model Cascade', desc: 'Pravidla pro přepínání Gemini Pro/Flash/Lite.', icon: '📈' },
        { id: 'bus', title: 'Neural Bus Control', desc: 'Synchronizace kontextu mezi agenty.', icon: '🧬' },
        { id: 'rbac', title: 'Permission Structure', desc: 'Globální správa rolí Architect/Guru/Subject.', icon: '👤' }
      ]
    },
    LOGGING: {
      label: 'Audit & Telemetrie',
      icon: '📝',
      groups: [
        { id: 'audit', title: 'Global Audit', desc: 'Záznamy o každém systémovém Handshaku.', icon: '📋' },
        { id: 'telemetry', title: 'Node Health', desc: 'Sledování latence a výkonu síťových uzlů.', icon: '📡' }
      ]
    },
    OTHER: {
      label: 'Ostatní',
      icon: '📁',
      groups: [
        { id: 'other', title: 'Externí Zdroje', desc: 'Prezentace projektu a doplňkové vizualizace.', icon: '🚀' }
      ]
    },
    SYSTEM_MAP: { label: 'Blueprint', icon: '🗺️', groups: [] }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FBFBFD] animate-synthesis-in relative font-sans">
      <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
        <p className="text-[8px] font-mono opacity-[0.15] uppercase tracking-widest">KERNEL_ADMIN // ID-07</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-toggle {
          appearance: none;
          width: 44px; height: 24px;
          background: #E5E5EA;
          border-radius: 100px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .admin-toggle:checked { background: #007AFF; }
        .admin-toggle::after {
          content: '';
          position: absolute; top: 2px; left: 2px;
          width: 20px; height: 20px;
          background: white; border-radius: 50%;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .admin-toggle:checked::after { transform: translateX(20px); }
        
        .help-btn {
          width: 24px; height: 24px;
          background: rgba(0, 122, 255, 0.08);
          color: #007AFF;
          border-radius: 50%;
          display: inline-flex; items-center; justify-center;
          font-size: 11px; font-weight: 900;
          cursor: pointer; transition: all 0.2s;
          border: 1px solid rgba(0, 122, 255, 0.1);
          vertical-align: middle;
          margin-left: 8px;
        }
        .help-btn:hover { background: #007AFF; color: white; transform: scale(1.15) rotate(15deg); }
        
        .admin-sidebar-item {
          width: 100%; padding: 16px; border-radius: 20px;
          display: flex; items-center; gap: 16px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .admin-sidebar-item.active {
          background: black; color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          transform: translateX(8px);
        }

        .mobile-domain-btn {
          padding: 12px 20px;
          border-radius: 16px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          white-space: nowrap;
          transition: all 0.3s;
        }
        .mobile-domain-btn.active {
          background: black;
          color: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}} />

      {activeDomain === 'SYSTEM_MAP' && (
        <ProjectMap onBack={() => setActiveDomain('KERNEL')} />
      )}

      {showExplainer && (
        <div className="fixed inset-0 z-[11000] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fluent-in">
           <div className="max-w-xl w-full bg-white rounded-[40px] sm:rounded-[56px] shadow-2xl border border-black/5 overflow-hidden flex flex-col max-h-[85vh]">
              <header className="p-8 sm:p-10 border-b border-black/5 flex justify-between items-center bg-white/80">
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#007AFF]">Kernel Documentation</p>
                    <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase mt-1">Explainer Protokolu</h3>
                 </div>
                 <button onClick={() => { setShowExplainer(false); haptic(2); }} className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-full flex items-center justify-center font-black active:scale-90 transition-transform">✕</button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 no-scrollbar bg-[#FBFBFD]">
                 <div className="prose-synthesis" dangerouslySetInnerHTML={{ __html: explainerContent }} />
              </div>
              <footer className="p-6 sm:p-8 border-t border-black/5 bg-white text-center">
                 <p className="text-[9px] font-black uppercase tracking-widest text-black/20 italic">Studio Synthesis | Mallfurion Identity</p>
              </footer>
           </div>
        </div>
      )}

      <div className="flex h-full flex-col md:flex-row">
        <aside className="hidden md:flex w-[320px] bg-white border-r border-black/[0.04] flex-col shrink-0 z-[100] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#007AFF]/[0.02] to-transparent pointer-events-none"></div>
          <header className="p-10 pb-6 relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-black text-white rounded-[14px] flex items-center justify-center font-black italic text-xl shadow-xl">S</div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-none">Core Control</h2>
                <p className="text-[8px] font-black text-[#007AFF] uppercase mt-2 tracking-[0.2em]">Synthesis OS v5.9.3</p>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 mb-8 px-4">Domény Jádra</p>
          </header>
          
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar relative z-10">
            {(Object.keys(domainConfig) as AdminDomain[]).map(domain => {
               if (domain === 'SYSTEM_MAP') return null;
               return (
                <button 
                  key={domain}
                  onClick={() => { setActiveDomain(domain); setSelectedSettingGroup(null); haptic(5); }}
                  className={`admin-sidebar-item group ${activeDomain === domain ? 'active' : 'text-black/30 hover:bg-black/5 hover:text-black'}`}
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">{domainConfig[domain].icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-left">{domainConfig[domain].label}</span>
                </button>
               );
            })}
            <div className="pt-6 border-t border-black/5 mt-6 mx-4">
              <button 
                onClick={() => { setActiveDomain('SYSTEM_MAP'); haptic(15); }}
                className="admin-sidebar-item text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100"
              >
                <span className="text-2xl">🗺️</span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-left">System Blueprint</span>
              </button>
            </div>
          </nav>
          <footer className="p-10 border-t border-black/5 relative z-10 bg-white">
            <button 
              onClick={onBack} 
              className="w-full h-14 bg-red-50 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              Ukončit Sezení
            </button>
          </footer>
        </aside>

        <nav className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar p-4 bg-white border-b border-black/[0.04] shrink-0 sticky top-0 z-[110]">
          {(Object.keys(domainConfig) as AdminDomain[]).map(domain => {
            if (domain === 'SYSTEM_MAP') return null;
            return (
              <button
                key={domain}
                onClick={() => { setActiveDomain(domain); setSelectedSettingGroup(null); haptic(5); }}
                className={`mobile-domain-btn ${activeDomain === domain ? 'active' : 'bg-black/5 text-black/40'}`}
              >
                {domainConfig[domain].label}
              </button>
            );
          })}
          <button 
            onClick={() => { setActiveDomain('SYSTEM_MAP'); haptic(15); }}
            className="mobile-domain-btn bg-blue-50 text-blue-600 border border-blue-100"
          >
            Blueprint 🗺️
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FBFBFD] pb-32">
          <div className="max-w-4xl mx-auto p-6 sm:p-12 md:p-20 space-y-12 sm:space-y-16">
            {!selectedSettingGroup ? (
              <div className="space-y-12 sm:space-y-16 animate-synthesis-in">
                <header className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF]">Administrace // {activeDomain}</p>
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">{domainConfig[activeDomain].label}</h1>
                  <p className="text-base sm:text-lg text-black/40 font-medium italic max-w-lg">Vyberte funkční blok pro hloubkovou modifikaci parametrů.</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  {domainConfig[activeDomain].groups.map(group => (
                    <button 
                      key={group.id}
                      onClick={() => { setSelectedSettingGroup(group.id); haptic(10); }}
                      className="p-8 sm:p-10 bg-white border border-black/5 rounded-[40px] sm:rounded-[48px] text-left group hover:shadow-2xl hover:-translate-y-2 transition-all shadow-sm flex flex-col justify-between min-h-[240px] sm:min-h-[280px]"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/5 rounded-[20px] sm:rounded-[22px] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform">{group.icon}</div>
                          <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-green-50 text-green-600 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest border border-green-100">Synchronní</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase leading-none">{group.title}</h4>
                          <p className="text-11px sm:text-[12px] font-medium text-black/40 leading-relaxed italic line-clamp-2 sm:line-clamp-none">{group.desc}</p>
                        </div>
                      </div>
                      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-black/5 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Detailní nastavení Jádra</span>
                         <span className="text-xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="md:hidden pt-10">
                  <button onClick={onBack} className="w-full h-14 bg-red-50 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95">Ukončit Sezení Administrace</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-10 animate-synthesis-in max-w-3xl">
                <button onClick={() => setSelectedSettingGroup(null)} className="flex items-center gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all hover:translate-x-[-4px]">
                  <span className="text-lg">←</span> Zpět na přehled domény
                </button>
                <div className="p-8 sm:p-12 bg-white border border-black/5 rounded-[48px] sm:rounded-[64px] shadow-2xl space-y-10 sm:space-y-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#007AFF]/5 blur-[120px] -z-0"></div>
                   <header className="space-y-4 relative z-10 border-b border-black/5 pb-8 sm:pb-10">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg">⚙️</div>
                         <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase">{domainConfig[activeDomain].groups.find(g => g.id === selectedSettingGroup)?.title}</h2>
                      </div>
                      <p className="text-sm sm:text-base text-black/40 font-medium italic pl-1">Inženýrská konfigurace parametrů pro {selectedSettingGroup.toUpperCase()}.</p>
                   </header>
                   <div className="space-y-8 sm:space-y-10 relative z-10">
                      <div className="admin-settings-container" dangerouslySetInnerHTML={{ __html: groupContent }} />
                   </div>
                   <div className="pt-8 sm:pt-10 border-t border-black/5 flex flex-col sm:flex-row gap-4 relative z-10">
                      <button onClick={handleSave} disabled={isSaving} className="flex-1 h-14 sm:h-16 bg-black text-white rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-30">{isSaving ? 'Zapisuji do Jádra...' : 'Zapsat změny do Jádra'}</button>
                      <button onClick={() => setSelectedSettingGroup(null)} className="h-14 sm:h-16 px-10 bg-black/5 text-black rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black/10 transition-colors">Zrušit</button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};