
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ViewState, User, MenuItem, AgentId, LegalDispute, UserRole } from './types.ts';
import { AGENTS as INITIAL_AGENTS, MENU_ITEMS as INITIAL_MENU, COPYRIGHT } from './constants.tsx';
import { AgentCard } from './components/AgentCard.tsx';
import { Modal } from './components/Modal.tsx';
import { VoiceControl } from './components/VoiceControl.tsx';
import { RegistrationModule } from './components/RegistrationModule.tsx';
import { ProfileModule } from './components/ProfileModule.tsx';
import { SocialModule } from './components/SocialModule.tsx';
import { WorkflowModule } from './components/WorkflowModule.tsx';
import { MemoryModule } from './components/MemoryModule.tsx';
import { CloudModule } from './components/CloudModule.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { DetailedRegistration } from './components/DetailedRegistration.tsx';
import { MessagesModule } from './components/MessagesModule.tsx';
import { LegalShieldModule } from './components/LegalShieldModule.tsx';
import { LegalAssistantModule } from './components/LegalAssistantModule.tsx';
import { LucieWorkshopModule } from './components/LucieWorkshopModule.tsx';
import { DocSearchModule } from './components/DocSearchModule.tsx';
import { Menu } from './components/Menu.tsx';
import { gemini } from './services/geminiService.ts';
import { fetchPageContent } from './services/pageService.ts';
import { getBrowserLanguage } from './utils/locale.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('REGISTRATION');
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU as MenuItem[]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [pendingAgent, setPendingAgent] = useState<Agent | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);
  const [infoPageContent, setInfoPageContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [locale, setLocale] = useState(getBrowserLanguage());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) navigateTo(e.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    if (activeInfoPage) {
      setInfoPageContent('<div class="animate-pulse space-y-4 pt-4"><div class="h-4 bg-black/5 rounded w-3/4"></div><div class="h-4 bg-black/5 rounded"></div></div>');
      fetchPageContent(activeInfoPage).then(setInfoPageContent);
    }
  }, [activeInfoPage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'CHAT') scrollToBottom();
  }, [messages, isLoading, view]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || !currentAgent || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: textToSend, timestamp: new Date() }]);
    if (!customMessage) setInput('');
    setIsLoading(true);

    const botMsg: Message = { role: 'model', text: '', timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = gemini.streamMessage(currentAgent, history, textToSend);
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1].text = fullText;
          return next;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (loggedUser: User | null) => {
    setUser(loggedUser);
    setView('HUB');
  };

  const handleSaveDispute = (dispute: LegalDispute) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      disputes: [dispute, ...(user.disputes || [])]
    };
    setUser(updatedUser);
  };

  const navigateTo = (id: string) => {
    setIsMenuOpen(false);
    
    const viewStates: Record<string, ViewState> = {
      'HUB': 'HUB', 
      'PROFILE': 'PROFILE', 
      'SOCIAL': 'SOCIAL', 
      'WORKFLOW': 'WORKFLOW', 
      'MEMORY': 'MEMORY', 
      'CLOUD': 'CLOUD', 
      'ADMIN': 'ADMIN', 
      'MESSAGES': 'MESSAGES',
      'LEGAL_SHIELD': 'LEGAL_SHIELD',
      'LEGAL_ASSISTANT_CHAT': 'LEGAL_ASSISTANT_CHAT',
      'REGISTRATION': 'REGISTRATION',
      'LUCIE_WORKSHOP': 'LUCIE_WORKSHOP',
      'DOC_SEARCH': 'DOC_SEARCH'
    };

    if (viewStates[id]) {
      setView(viewStates[id]);
      setActiveInfoPage(null);
    } else {
      const menuItem = menuItems.find(item => item.id === id);
      if (menuItem && menuItem.category === 'info') {
        setActiveInfoPage(id);
      }
    }
  };

  const startChat = () => {
    if (!pendingAgent) return;
    setMessages([]);
    setCurrentAgent(pendingAgent);
    setView('CHAT');
    setShowTerms(false);
    
    const welcomeText = locale === 'cs' 
      ? `### ${pendingAgent.icon} ${pendingAgent.name} PŘIPOJEN\n**${pendingAgent.title}**\n\nJsem připraven asistovat v rámci Synthesis OS. Co budeme dnes tvořit?`
      : `### ${pendingAgent.icon} ${pendingAgent.name} CONNECTED\n**${pendingAgent.title}**\n\nI am ready to assist within Synthesis OS. What are we building today?`;

    setMessages([{ 
      role: 'model', 
      text: welcomeText, 
      timestamp: new Date() 
    }]);
  };

  const renderView = () => {
    switch (view) {
      case 'REGISTRATION': return <RegistrationModule onLogin={handleLogin} onRegisterClick={() => setView('DETAILED_REGISTRATION')} />;
      case 'DETAILED_REGISTRATION': return <DetailedRegistration onComplete={handleLogin} onCancel={() => setView('REGISTRATION')} />;
      case 'PROFILE': return <ProfileModule user={user} onUpdateUser={setUser} onBack={() => setView('HUB')} />;
      case 'SOCIAL': return <SocialModule user={user} onBack={() => setView('HUB')} />;
      case 'WORKFLOW': return <WorkflowModule onBack={() => setView('HUB')} />;
      case 'MEMORY': return <MemoryModule onBack={() => setView('HUB')} />;
      case 'CLOUD': return <CloudModule onBack={() => setView('HUB')} />;
      case 'MESSAGES': return <MessagesModule onBack={() => setView('HUB')} />;
      case 'LEGAL_SHIELD': return <LegalShieldModule onBack={() => setView('HUB')} onActivateAssistant={() => setView('LEGAL_ASSISTANT_CHAT')} />;
      case 'LUCIE_WORKSHOP': return <LucieWorkshopModule onBack={() => setView('HUB')} />;
      case 'DOC_SEARCH': return <DocSearchModule onBack={() => setView('HUB')} />;
      case 'LEGAL_ASSISTANT_CHAT': {
        const judyAgent = agents.find(a => a.id === AgentId.JUDY);
        if (!judyAgent) return <div className="p-20 text-center">Chyba: Agent JUDY nebyl nalezen.</div>;
        return <LegalAssistantModule agent={judyAgent} onBack={() => setView('LEGAL_SHIELD')} onSaveDispute={handleSaveDispute} />;
      }
      case 'ADMIN': return <AdminPanel agents={agents} menuItems={menuItems} onUpdateAgents={setAgents} onUpdateMenu={setMenuItems} onBack={() => setView('HUB')} />;
      case 'CHAT': return (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-synthesis-in max-w-5xl mx-auto w-full px-4 pt-16 bg-[#FBFBFD]">
          <div className="py-6 border-b border-black/5 flex justify-between items-center bg-[#FBFBFD]/80 backdrop-blur-xl shrink-0 sticky top-0 z-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                   {currentAgent?.icon}
                </div>
                <div>
                   <h3 className="text-lg font-black leading-none text-[#1D1D1F] italic">{currentAgent?.name}</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] mt-1.5">{currentAgent?.title}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <VoiceControl isActive={isVoiceActive} onToggle={() => setIsVoiceActive(!isVoiceActive)} />
                <button onClick={() => setView('HUB')} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-sm font-bold active:scale-90 transition-transform">✕</button>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto py-8 space-y-6 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 ${m.role === 'user' ? 'bubble-user shadow-lg' : 'bubble-model'}`}>
                  <div className="prose-synthesis">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/5 px-6 py-3 rounded-full animate-pulse italic text-[12px] font-bold text-black/30">
                  Syncing with kernel...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-6 bg-[#FBFBFD] border-t border-black/5 shrink-0 pb-10">
            <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                placeholder="Zadejte technický dotaz..." 
                className="flex-1 bg-white border border-black/10 rounded-full px-8 py-5 focus:outline-none focus:ring-4 ring-[#007AFF]/10 text-base font-medium text-[#1D1D1F] placeholder:text-black/20 shadow-sm transition-all" 
              />
              <button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()} className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-2xl active:scale-90 transition-all disabled:opacity-10">
                ↑
              </button>
            </div>
          </div>
        </div>
      );
      case 'HUB':
      default: return (
        <div className="flex-1 overflow-y-auto px-6 pt-32 pb-24 space-y-12 animate-synthesis-in h-full flex flex-col no-scrollbar max-w-6xl mx-auto w-full bg-[#FBFBFD]">
          {/* Logo Section */}
          <section className="text-center space-y-4 shrink-0">
            <div className="relative inline-block">
               <div className="w-24 h-24 bg-white text-[#1D1D1F] rounded-[36px] flex items-center justify-center text-5xl font-black mx-auto shadow-2xl relative z-10 border border-black/5 glass pulse-aura">
                 S
               </div>
               <div className="absolute inset-0 bg-[#007AFF] blur-[50px] opacity-10 rounded-full scale-150 -z-0"></div>
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-black tracking-tighter text-[#1D1D1F] leading-none italic">FixIt Guru</h2>
              <p className="text-black/30 text-[11px] font-black uppercase tracking-[0.5em]">Synthesis OS v2.1 Alpha</p>
            </div>
          </section>

          {/* Assistant Grid 2x2 forcing grid-cols-2 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
            {agents.filter(a => a.id !== AgentId.JUDY).map(agent => (
              <AgentCard key={agent.id} agent={agent} onClick={() => { setPendingAgent(agent); setShowTerms(true); }} />
            ))}
          </section>

          {/* Special Support */}
          <section className="space-y-8">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-black/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FBFBFD] px-4 text-[10px] font-black uppercase tracking-[0.4em] text-black/20 italic">
                  Ostatní Funkce
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button 
                onClick={() => navigateTo('DOC_SEARCH')}
                className="p-8 glass rounded-[40px] border border-black/5 flex items-center gap-6 hover:border-[#007AFF]/30 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📂</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter text-[#1D1D1F]">Manual Search</h4>
                  <p className="text-xs text-black/40 font-medium leading-relaxed">Vyhledávač návodů, modelů a schémat.</p>
                </div>
              </button>
              <button 
                onClick={() => navigateTo('LUCIE_WORKSHOP')}
                className="p-8 glass rounded-[40px] border border-black/5 flex items-center gap-6 hover:border-[#007AFF]/30 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📋</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter text-[#1D1D1F]">Mentorská Dílna</h4>
                  <p className="text-xs text-black/40 font-medium leading-relaxed">Průvodce procesy a metodika oprav.</p>
                </div>
              </button>
              <button 
                onClick={() => navigateTo('LEGAL_SHIELD')}
                className="p-8 glass rounded-[40px] border border-black/5 flex items-center gap-6 hover:border-[#007AFF]/30 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚖️</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter text-[#1D1D1F]">Právní Štít</h4>
                  <p className="text-xs text-black/40 font-medium leading-relaxed">Pomoc při reklamacích a právo na opravu.</p>
                </div>
              </button>
            </div>
          </section>

          <footer className="pt-12 pb-24 text-center opacity-20">
             <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-[#1D1D1F]">{COPYRIGHT}</p>
          </footer>

          {showTerms && pendingAgent && (
             <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
                <div className="max-w-md w-full space-y-8">
                   <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center text-4xl mx-auto shadow-2xl pulse-aura">
                         {pendingAgent.icon}
                      </div>
                      <h3 className="text-3xl font-black italic tracking-tighter text-[#1D1D1F]">Bezpečnostní Protokol</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]">{pendingAgent.name} / {pendingAgent.title}</p>
                   </div>
                   <div className="bg-black/5 rounded-[36px] p-8 space-y-4">
                      <p className="text-xs font-bold leading-relaxed text-black/60 italic">"{pendingAgent.warning}"</p>
                      <div className="h-px bg-black/5 w-full" />
                      <p className="text-[10px] font-medium leading-relaxed text-black/40">
                         Pokračováním souhlasíte se zásadami Studio Synthesis a přebíráte plnou odpovědnost za technické úkony.
                      </p>
                   </div>
                   <div className="flex flex-col gap-3">
                      <button onClick={startChat} className="w-full h-16 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Rozumím a Souhlasím</button>
                      <button onClick={() => setShowTerms(false)} className="w-full h-14 bg-black/5 text-black/40 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Zrušit</button>
                   </div>
                </div>
             </div>
          )}
        </div>
      );
    }
  };

  const isAuthView = view === 'REGISTRATION' || view === 'DETAILED_REGISTRATION';

  return (
    <div className="flex flex-col h-screen w-full bg-[#FBFBFD] text-[#1D1D1F] overflow-hidden">
      {!isAuthView && (
        <header className="fixed top-0 left-0 right-0 h-20 z-[100] px-6 bg-white/70 backdrop-blur-3xl border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('HUB')}>
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-2xl font-black shadow-lg transition-transform group-hover:scale-105 active:scale-95">S</div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#007AFF] leading-none mb-1">Studio Synthesis</span>
              <span className="text-xl font-black italic tracking-tighter text-[#1D1D1F] leading-none">FixIt Guru</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <button 
                onClick={() => navigateTo('ADMIN')}
                className="w-12 h-12 rounded-full hover:bg-black/5 flex items-center justify-center transition-all active:scale-90"
              >
                <span className="text-2xl" title="Administrace">⚙️</span>
              </button>
            )}
            
            <button 
              onClick={() => navigateTo('PROFILE')}
              className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-all active:scale-90 border border-black/5 bg-white shadow-sm`}
            >
              <span className="text-2xl" title="Profil">{user?.avatar || '👤'}</span>
            </button>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-12 h-12 rounded-full hover:bg-black/5 flex items-center justify-center transition-all active:scale-90"
            >
              <span className="text-2xl" title="Menu">⋮</span>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {renderView()}
      </main>
      
      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSelect={navigateTo} 
        activeModal={activeInfoPage} 
      />

      {activeInfoPage && (
        <Modal 
          title={menuItems.find(i => i.id === activeInfoPage)?.label || ''} 
          isOpen={!!activeInfoPage} 
          onClose={() => setActiveInfoPage(null)}
        >
          <div className="prose-synthesis max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: infoPageContent }} />
        </Modal>
      )}
    </div>
  );
};

export default App;
