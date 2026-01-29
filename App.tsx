import React, { useState, useEffect, useCallback } from 'react';
import { User, AppView, Language, Agent, AgentId, LegalDispute } from './types.ts';
import { AGENTS, JUDY_AGENT, UI_TEXTS, MENU_ITEMS } from './constants.tsx';
import { db } from './services/storageService.ts';
import { Menu } from './components/Menu.tsx';
import { AgentCard } from './components/AgentCard.tsx';
import { RegistrationModule } from './components/RegistrationModule.tsx';
import { ProfileModule } from './components/ProfileModule.tsx';
import { SocialModule } from './components/SocialModule.tsx';
import { MessagesModule } from './components/MessagesModule.tsx';
import { ClaimGuideModule } from './components/ClaimGuideModule.tsx';
import { DocSearchModule } from './components/DocSearchModule.tsx';
import { LucieWorkshopModule } from './components/LucieWorkshopModule.tsx';
import { LegalShieldModule } from './components/LegalShieldModule.tsx';
import { UserGuidesModule } from './components/UserGuidesModule.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { LegalAssistantModule } from './components/LegalAssistantModule.tsx';
import { GeneralChatModule } from './components/GeneralChatModule.tsx';
import { DocumentVerifierModule } from './components/DocumentVerifierModule.tsx';
import { LegalHandshakeModal } from './components/LegalHandshakeModal.tsx';
import { PresentationModule } from './components/PresentationModule.tsx';
import { fetchPageContent } from './services/pageService.ts';
import { getBrowserLanguage } from './utils/locale.ts';

const ViewShell: React.FC<{ 
  title: string; 
  subtitle?: string; 
  onClose: () => void; 
  children: React.ReactNode; 
  id: string;
}> = ({ title, subtitle, onClose, children, id }) => {
  const haptic = (p = 5) => { if ('vibrate' in navigator) navigator.vibrate(p); };
  
  return (
    <div data-ui-id={`SYN-VIEW-SHELL-${id}`} data-ui-name={`Pohled: ${title}`} className="min-h-screen bg-[#FBFBFD] flex flex-col animate-synthesis-in">
      <header className="px-6 h-20 border-b border-black/[0.03] bg-white/80 backdrop-blur-xl sticky top-0 z-[100] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-2xl font-black italic shadow-lg select-none">S</div>
          <div className="space-y-0.5">
            <h2 className="text-base font-black italic tracking-tight text-black uppercase leading-none">{title}</h2>
            {subtitle && <p className="text-[7px] font-black uppercase tracking-[0.4em] text-[#007AFF] leading-none">{subtitle}</p>}
          </div>
        </div>
        <button 
          onClick={() => { haptic(10); onClose(); }}
          className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-sm font-black hover:bg-black hover:text-white transition-all active:scale-90"
          data-ui-id={`SYN-BTN-CLOSE-${id}`}
          data-ui-name="Zavřít modul"
        >✕</button>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const SystemIDBadge: React.FC<{ view: AppView; isHandshake?: boolean }> = ({ view, isHandshake }) => {
  const getViewData = () => {
    if (isHandshake) return { id: 'ID-HANDSHAKE-PROT', name: 'Handshake Integrity' };
    switch (view) {
      case 'TERMINAL': return { id: 'ID-HUB-CORE', name: 'Synthesis Hub' };
      case 'MANUALS': return { id: 'ID-DOC-ARCHIVE', name: 'Manual Hub' };
      case 'WORKSHOP': return { id: 'ID-WRK-STEP-LOCK', name: 'Workshop Lucie' };
      case 'LEGAL_HUB': return { id: 'ID-LEG-SHIELD', name: 'Legal Shield' };
      case 'JUDY_CHAT': return { id: 'ID-JUDY-CORE', name: 'JUDY Advocacy' };
      case 'ADMIN': return { id: 'ID-ADM-KERNEL', name: 'Admin Matrix' };
      case 'PROFILE': return { id: 'ID-USR-IDENTITY', name: 'Guru Profile' };
      case 'SOCIAL': return { id: 'ID-SOC-MATRIX', name: 'The Feed' };
      case 'AGENT_CHAT': return { id: 'ID-AGENT-LINK', name: 'Neural Chat' };
      case 'MESSAGES': return { id: 'ID-MSG-COMMS', name: 'Messenger' };
      case 'CLAIM_GUIDE': return { id: 'ID-CLM-STRATEGY', name: 'Claim Guide' };
      case 'PUBLIC_GUIDES': return { id: 'ID-LIB-BLUEPRINT', name: 'Knowledge Base' };
      case 'VERIFIER': return { id: 'ID-VRF-AUDIT', name: 'Verification Kernel' };
      case 'PRESENTATION': return { id: 'ID-PRZ-VISION', name: 'Vision Presentation' };
      default: return { id: 'ID-SYS-NULL', name: 'System Root' };
    }
  };

  const data = getViewData();

  return (
    <div 
      data-ui-id="SYN-SEC-SYSTEM-BADGE" 
      data-ui-name="Globální ID Odznak"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[15000] pointer-events-none flex flex-col items-center gap-1 animate-fluent-in"
    >
      <div className="px-3 py-1 bg-black/5 backdrop-blur-md border border-black/[0.03] rounded-full flex items-center gap-2 shadow-sm">
        <span className="text-[7px] font-mono font-black text-black/20 uppercase tracking-widest">{data.id}</span>
        <div className="w-1 h-1 bg-blue-500/30 rounded-full"></div>
        <span className="text-[7px] font-black text-black/40 uppercase tracking-widest">{data.name}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeAppView, setActiveAppView] = useState<AppView>('TERMINAL');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang] = useState<Language>(getBrowserLanguage());
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isHandshakeOpen, setIsHandshakeOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState<LegalDispute | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [chatInitialContext, setChatInitialContext] = useState<string | undefined>(undefined);
  
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);
  const [infoPageContent, setInfoPageContent] = useState<string>('');
  const [isSwitchingContext, setIsSwitchingContext] = useState(false);

  const ui = UI_TEXTS[lang];

  // Synthesis Bridge - Robustní inicializace pro dynamické HTML
  const openPresentation = useCallback(() => {
    setIsSwitchingContext(true);
    setTimeout(() => {
      setActiveAppView('PRESENTATION');
      setIsSwitchingContext(false);
      if ('vibrate' in navigator) navigator.vibrate(20);
    }, 800);
  }, []);

  useEffect(() => {
    (window as any).synthesis = {
      openPresentation: (e?: Event) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openPresentation();
      }
    };
  }, [openPresentation]);

  useEffect(() => {
    const savedUser = localStorage.getItem('synthesis_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const dbUser = db.getById('users', parsed.id);
        if (dbUser) setUser(dbUser);
      } catch (e) { console.error("Session recovery failed"); }
    }
  }, []);

  useEffect(() => {
    if (activeInfoPage) {
      setInfoPageContent('<div class="p-20 text-center animate-pulse font-black text-[10px] uppercase tracking-widest opacity-20">Dekryptuji informační uzel...</div>');
      fetchPageContent(activeInfoPage).then(setInfoPageContent);
    }
  }, [activeInfoPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        document.body.classList.toggle('debug-active');
        if ('vibrate' in navigator) navigator.vibrate(20);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetToHome = () => {
    setActiveAppView('TERMINAL');
    setActiveInfoPage(null);
  };

  const handleLogin = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('synthesis_current_user', JSON.stringify(u));
    else localStorage.removeItem('synthesis_current_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    db.update('users', updatedUser.id, updatedUser);
    localStorage.setItem('synthesis_current_user', JSON.stringify(updatedUser));
  };

  const triggerAgent = (agent: Agent, context?: string) => {
    setActiveAgent(agent);
    setChatInitialContext(context);
    setIsHandshakeOpen(true);
  };

  const confirmHandshake = () => {
    setIsHandshakeOpen(false);
    setActiveAppView('AGENT_CHAT');
  };

  const handleMenuSelect = (id: string) => {
    const isAppView = ['TERMINAL', 'MANUALS', 'WORKSHOP', 'LEGAL_HUB', 'JUDY_CHAT', 'ADMIN', 'PROFILE', 'SOCIAL', 'AGENT_CHAT', 'MESSAGES', 'CLAIM_GUIDE', 'PUBLIC_GUIDES', 'VERIFIER', 'PRESENTATION'].includes(id);
    
    if (isAppView) {
      setActiveAppView(id as AppView);
      setActiveInfoPage(null);
    } else {
      setActiveInfoPage(id);
    }
    setIsMenuOpen(false);
  };

  const renderActiveModule = () => {
    if (!user) return <RegistrationModule onLogin={handleLogin} onRegisterClick={() => {}} onShowTerms={() => setActiveInfoPage('terms')} />;

    if (activeInfoPage) {
      const pageInfo = MENU_ITEMS.find(m => m.id === activeInfoPage);
      return (
        <ViewShell 
          title={pageInfo?.label[lang] || 'Protokol'} 
          subtitle="KNOWLEDGE_PROTOCOL" 
          onClose={resetToHome} 
          id={`INFO-${activeInfoPage}`}
        >
          <div className="p-8 md:p-12 prose-synthesis" dangerouslySetInnerHTML={{ __html: infoPageContent }} />
          <div className="flex justify-center pb-12">
             <button onClick={resetToHome} className="px-10 py-5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Návrat do Hubu</button>
          </div>
        </ViewShell>
      );
    }

    switch (activeAppView) {
      case 'PRESENTATION':
        return <PresentationModule onBack={resetToHome} />;
      case 'PROFILE':
        return (
          <ViewShell title="Guru Profil" subtitle="USR_IDENTITY" onClose={resetToHome} id="PROFILE">
            <ProfileModule user={user} onUpdateUser={handleUpdateUser} onBack={resetToHome} onLogout={() => handleLogin(null)} onLoadConversation={() => {}} />
          </ViewShell>
        );
      case 'SOCIAL':
        return (
          <ViewShell title="The Feed" subtitle="SOC_MATRIX" onClose={resetToHome} id="SOCIAL">
            <SocialModule user={user} onBack={resetToHome} />
          </ViewShell>
        );
      case 'MESSAGES':
        return (
          <ViewShell title="Zprávy" subtitle="MSG_COMMS" onClose={resetToHome} id="MESSAGES">
            <MessagesModule onBack={resetToHome} />
          </ViewShell>
        );
      case 'CLAIM_GUIDE':
        return (
          <ViewShell title="Průvodce Reklamací" subtitle="CLM_STRATEGY" onClose={resetToHome} id="CLAIM_GUIDE">
            <ClaimGuideModule onBack={resetToHome} onActivateWithContext={(ctx) => triggerAgent(JUDY_AGENT, ctx)} />
          </ViewShell>
        );
      case 'MANUALS':
        return (
          <ViewShell title="Manual Hub" subtitle="DOC_ARCHIVE" onClose={resetToHome} id="MANUALS">
            <DocSearchModule onBack={resetToHome} />
          </ViewShell>
        );
      case 'WORKSHOP':
        return (
          <ViewShell title="Dílna Lucie" subtitle="WRK_STEP_LOCK" onClose={resetToHome} id="WORKSHOP">
            <LucieWorkshopModule user={user} onBack={resetToHome} onConsultAgent={(agentId, ctx) => { const agent = AGENTS.find(a => a.id === agentId); if (agent) triggerAgent(agent, ctx); }} />
          </ViewShell>
        );
      case 'LEGAL_HUB':
        return (
          <ViewShell title="Právní Štít" subtitle="LEG_SHIELD" onClose={resetToHome} id="LEGAL_HUB">
            <LegalShieldModule onBack={resetToHome} onActivateAssistant={() => triggerAgent(JUDY_AGENT)} />
          </ViewShell>
        );
      case 'PUBLIC_GUIDES':
        return (
          <ViewShell title="Znalostní Jádro" subtitle="LIB_BLUEPRINT" onClose={resetToHome} id="PUBLIC_GUIDES">
            <UserGuidesModule onBack={resetToHome} initialGuideId={selectedGuideId} onAskLucie={(guide) => { const lucie = AGENTS.find(a => a.id === AgentId.LUCKA); if (lucie) triggerAgent(lucie, `Návod: ${guide.title}. Zařízení: ${guide.deviceName}.`); }} />
          </ViewShell>
        );
      case 'ADMIN':
        return <AdminPanel user={user} agents={AGENTS} onUpdateAgents={() => {}} onBack={resetToHome} />;
      case 'VERIFIER':
        return (
          <ViewShell title="Verification Kernel" subtitle="VRF_AUDIT" onClose={resetToHome} id="VERIFIER">
            <DocumentVerifierModule user={user} onBack={resetToHome} onUpdateUser={handleUpdateUser} />
          </ViewShell>
        );
      case 'AGENT_CHAT':
        const agentTitle = activeAgent?.name || 'Neural Link';
        return (
          <ViewShell title={agentTitle} subtitle="NEURAL_CHAT" onClose={resetToHome} id="AGENT_CHAT">
            {activeAgent?.id === AgentId.JUDY ? (
              <LegalAssistantModule agent={activeAgent} lang={lang} user={user} activeDispute={activeDispute} onBack={resetToHome} onSaveDispute={(d) => { const updatedUser = { ...user, disputes: [...(user.disputes || []), d] }; handleUpdateUser(updatedUser); }} onUpdateVault={(data) => { const updatedUser = { ...user, vaultData: { ...user.vaultData, ...data } }; handleUpdateUser(updatedUser); }} onShowBio={() => {}} />
            ) : (
              <GeneralChatModule agent={activeAgent || AGENTS[0]} lang={lang} user={user} initialContext={chatInitialContext} onBack={resetToHome} onOpenGuide={(id) => { setSelectedGuideId(id); setActiveAppView('PUBLIC_GUIDES'); }} />
            )}
          </ViewShell>
        );
      default:
        return (
          <div data-ui-id="SYN-SEC-HUB-ROOT" data-ui-name="Hlavní Nástěnka Hubu" className="p-6 space-y-12 pb-32 max-w-5xl mx-auto animate-synthesis-in">
            {/* V2.2 Header */}
            <header data-ui-id="SYN-HDR-MAIN" data-ui-name="Hlavička Hubu" className="flex justify-between items-center pt-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black text-white rounded-[18px] flex items-center justify-center text-3xl font-black italic shadow-2xl">S</div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-black italic tracking-tight text-black">{ui.hubTitle}</h1>
                  <p className="text-black/30 font-black uppercase tracking-[0.4em] text-[8px]">{ui.hubTagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  data-ui-id="SYN-BTN-VERIFIER-GOTO" 
                  data-ui-name="Spustit Verifier"
                  onClick={() => setActiveAppView('VERIFIER')} 
                  className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xl">🛡️</span>
                </button>
                <button 
                  data-ui-id="SYN-BTN-PROFILE-GOTO" 
                  data-ui-name="Otevřít Profil"
                  onClick={() => setActiveAppView('PROFILE')} 
                  className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
                >
                   <span className="text-xl">👤</span>
                </button>
                <button 
                  data-ui-id="SYN-BTN-MENU-TOGGLE" 
                  data-ui-name="Přepínač Menu"
                  onClick={() => setIsMenuOpen(true)} 
                  className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
                >
                   <span className="text-xl">⋮</span>
                </button>
              </div>
            </header>

            {/* Section: Primární asistenti */}
            <div data-ui-id="SYN-SEC-PRIMARY-AGENTS" data-ui-name="Sekce AI Asistentů" className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-1.5 bg-black/10 rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/25">{ui.primaryAgents}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-5 md:gap-8">
                {AGENTS.map(agent => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    lang={lang} 
                    onClick={() => triggerAgent(agent)} 
                  />
                ))}
              </div>
            </div>

            {/* Toolbox */}
            <div data-ui-id="SYN-SEC-TOOLBOX" data-ui-name="Sekce Pokročilých Nástrojů" className="space-y-8 pt-8">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-1.5 bg-black/10 rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/25">{ui.advancedModules}</h4>
              </div>
              
              <button 
                data-ui-id="SYN-BTN-JUDY-ACTIVATE" 
                data-ui-name="Aktivovat JUDY Advocacy"
                onClick={() => triggerAgent(JUDY_AGENT)}
                className="w-full p-8 bg-white border border-black/[0.03] rounded-[44px] shadow-sm hover:shadow-xl transition-all group flex items-center gap-8 text-left relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-[#F8F2FF] rounded-[22px] flex items-center justify-center text-3xl shrink-0 border border-[#AF52DE]/10 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="text-[#AF52DE]">⚖️</span>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tight text-black uppercase">
                    EDA (LEGAL & RIGHTS)
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#AF52DE]">
                    Právní navigátor
                  </p>
                  <p className="text-[11px] text-black/30 font-medium italic mt-2">
                    {JUDY_AGENT.description[lang]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all">→</div>
              </button>

              {/* Functional Nodes Row */}
              <div data-ui-id="SYN-SEC-QUICK-NODES" data-ui-name="Rychlé Funkční Uzly" className="grid grid-cols-3 gap-4">
                 {[
                   { icon: '📂', label: 'Manuály', view: 'MANUALS', id: 'SYN-BTN-NODE-MANUALS' },
                   { icon: '🛠️', label: 'Dílna', view: 'WORKSHOP', id: 'SYN-BTN-NODE-WORKSHOP' },
                   { icon: '🌍', label: 'Social', view: 'SOCIAL', id: 'SYN-BTN-NODE-SOCIAL' }
                 ].map(node => (
                   <button 
                    data-ui-id={node.id}
                    data-ui-name={`Uzel: ${node.label}`}
                    key={node.label} 
                    onClick={() => setActiveAppView(node.view as AppView)} 
                    className="p-6 bg-white border border-black/[0.03] rounded-[32px] flex flex-col items-center gap-3 hover:shadow-lg transition-all active:scale-95"
                   >
                      <span className="text-2xl">{node.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-black/40">{node.label}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div data-ui-id="SYN-APP-SHELL" data-ui-name="Hlavní Kontejner Aplikace" className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-[#007AFF] selection:text-white overflow-x-hidden">
      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSelect={handleMenuSelect} 
        activeId={activeInfoPage || activeAppView} 
        lang={lang} 
        user={user} 
      />
      
      <main className="min-h-screen">{renderActiveModule()}</main>
      
      {activeAgent && (
        /* Oprava chyby: 'agent' byl zaměněn za 'activeAgent' v props LegalHandshakeModal */
        <LegalHandshakeModal 
          isOpen={isHandshakeOpen} 
          agent={activeAgent} 
          user={user} 
          onClose={() => setIsHandshakeOpen(false)} 
          onConfirm={confirmHandshake} 
        />
      )}

      {/* Globální auditní ID Badge */}
      <SystemIDBadge view={activeAppView} isHandshake={isHandshakeOpen} />
      
      {/* Context Switcher Overlay */}
      {isSwitchingContext && (
        <div className="fixed inset-0 z-[30000] bg-black flex flex-col items-center justify-center space-y-8 animate-fluent-in">
           <div className="w-16 h-16 border-[6px] border-white/5 border-t-[#007AFF] rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/40 animate-pulse italic">Navazuji Vision Link...</p>
        </div>
      )}
      
      <div id="print-matrice" className="hidden print:block"></div>
    </div>
  );
};

export default App;
