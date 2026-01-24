import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ViewState, User, MenuItem } from './types.ts';
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
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [locale, setLocale] = useState(getBrowserLanguage());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setScreenSize('desktop');
      else if (window.innerWidth >= 768) setScreenSize('tablet');
      else setScreenSize('mobile');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      'LEGAL_SHIELD': 'LEGAL_SHIELD'
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
      case 'PROFILE': return <ProfileModule user={user} onUpdateUser={setUser} onBack={() => setView('HUB')} onLoginClick={() => setView('REGISTRATION')} onRegisterDetailedClick={() => setView('DETAILED_REGISTRATION')} />;
      case 'SOCIAL': return <SocialModule user={user} onBack={() => setView('HUB')} />;
      case 'WORKFLOW': return <WorkflowModule onBack={() => setView('HUB')} />;
      case 'MEMORY': return <MemoryModule onBack={() => setView('HUB')} />;
      case 'CLOUD': return <CloudModule onBack={() => setView('HUB')} />;
      case 'MESSAGES': return <MessagesModule onBack={() => setView('HUB')} />;
      case 'LEGAL_SHIELD': return <LegalShieldModule onBack={() => setView('HUB')} />;
      case 'ADMIN': return <AdminPanel agents={agents} menuItems={menuItems} onUpdateAgents={setAgents} onUpdateMenu={setMenuItems} onBack={() => setView('HUB')} />;
      case 'CHAT': return (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-synthesis-in max-w-5xl mx-auto w-full px-4 bg-[#FBFBFD]">
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
                  {locale === 'cs' ? 'Synchronizace s jádrem...' : 'Syncing with kernel...'}
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
                placeholder={locale === 'cs' ? "Zadejte technický dotaz..." : "Enter technical query..."} 
                className="flex-1 bg-white border border-black/10 rounded-full px-8 py-5 focus:outline-none focus:ring-4 ring-black/5 text-base font-medium text-[#1D1D1F] placeholder:text-black/20 shadow-sm transition-all" 
              />
              <button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()} className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-2xl active:scale-90 transition-all disabled:opacity-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      );
      case 'HUB':
      default: return (
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-24 space-y-12 animate-synthesis-in h-full flex flex-col no-scrollbar max-w-6xl mx-auto w-full bg-[#FBFBFD]">
          {/* Hero Section */}
          <section className="text-center space-y-6 shrink-0 pt-4">
            <div className="relative inline-block">
               <div className="w-24 h-24 bg-white text-[#1D1D1F] rounded-[36px] flex items-center justify-center text-5xl font-black mx-auto shadow-2xl relative z-10 border border-black/5 glass pulse-aura">
                 S
               </div>
               <div className="absolute inset-0 bg-[#007AFF] blur-[50px] opacity-10 rounded-full scale-150 -z-0"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter text-[#1D1D1F] leading-none italic">FixIt Guru</h2>
              <p className="text-black/30 text-[11px] font-black uppercase tracking-[0.5em]">Synthesis OS v2.1 Alpha</p>
            </div>
          </section>

          {/* Assistant Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onClick={() => { setPendingAgent(agent); setShowTerms(true); }} />
            ))}
          </section>

          {/* New Section Divider & Extra Features */}
          <section className="space-y-8">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-black/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#FBFBFD] px-4 text-[10px] font-black uppercase tracking-[0.4em] text-black/20 italic">
                  {locale === 'cs' ? 'Specializovaná Podpora' : 'Specialized Support'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button 
                onClick={() => navigateTo('LEGAL_SHIELD')}
                className="p-8 glass rounded-[40px] border border-black/5 flex items-center gap-6 hover:border-[#007AFF]/30 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚖️</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter text-[#1D1D1F]">
                    {locale === 'cs' ? 'Právní Štít' : 'Legal Shield'}
                  </h4>
                  <p className="text-xs text-black/40 font-medium leading-relaxed">
                    {locale === 'cs' ? 'Pomoc při reklamacích a vymáhání práva na opravu.' : 'Support for claims and enforcing the right to repair.'}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => navigateTo('id-system')}
                className="p-8 glass rounded-[40px] border border-black/5 flex items-center gap-6 hover:border-[#007AFF]/30 transition-all text-left shadow-sm group"
              >
                <div className="w-16 h-16 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🆔</div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter text-[#1D1D1F]">Synthesis ID Core</h4>
                  <p className="text-xs text-black/40 font-medium leading-relaxed">
                    {locale === 'cs' ? 'Správa vaší digitální reputace a oprávnění.' : 'Manage your digital reputation and permissions.'}
                  </p>
                </div>
              </button>
            </div>
          </section>

          <footer className="pt-12 text-center pb-16 opacity-15">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] italic text-black">{COPYRIGHT}</p>
          </footer>
        </div>
      );
    }
  };

  const renderListMenuItem = (item: MenuItem) => (
    <button 
      key={item.id} 
      onClick={() => navigateTo(item.id)} 
      className="flex items-center w-full h-[84px] px-8 transition-all hover:bg-black/[0.02] active:bg-black/[0.05] border-b border-black/5 group"
    >
      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl group-active:scale-90 transition-transform">
        {item.icon}
      </div>
      <div className="ml-5 flex-1 text-left">
        <span className="block text-base font-black text-[#1D1D1F] leading-none italic">{item.label}</span>
        <span className="block text-[10px] text-black/30 font-bold uppercase tracking-widest mt-2">{item.description}</span>
      </div>
      <span className="text-black/10 group-hover:text-black transition-colors text-lg">→</span>
    </button>
  );

  return (
    <div className="h-full w-full flex relative overflow-hidden bg-[#FBFBFD] text-[#1D1D1F] flex-col">
      
      {/* SIDEBAR - Tablet/Desktop */}
      {(screenSize === 'desktop' || screenSize === 'tablet') && user && view !== 'REGISTRATION' && (
        <aside className="fixed left-0 top-0 bottom-0 w-24 xl:w-80 bg-white/80 backdrop-blur-3xl border-r border-black/5 flex flex-col z-[100] transition-all">
          <div className="h-24 flex items-center px-8 justify-center xl:justify-start">
             <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">S</div>
             <span className="hidden xl:block ml-4 font-black italic text-2xl tracking-tighter">FixIt Guru</span>
          </div>
          <nav className="flex-1 py-12 space-y-3 px-6 overflow-y-auto no-scrollbar">
            {menuItems.filter(i => i.category === 'submodule').map(item => (
              <button 
                key={item.id} 
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-center xl:justify-start h-14 rounded-2xl transition-all ${view === item.id ? 'bg-black text-white shadow-lg shadow-black/10' : 'hover:bg-black/5 text-black/40'}`}
              >
                <span className={`text-2xl xl:ml-5 ${view === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</span>
                <span className="hidden xl:block ml-5 text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* MOBILE HEADER */}
      <header className={`px-6 h-24 flex justify-between items-center z-[110] bg-white/80 backdrop-blur-3xl shrink-0 border-b border-black/5 ${screenSize !== 'mobile' ? 'hidden' : ''} ${view === 'REGISTRATION' ? 'hidden' : ''}`}>
        <div className="flex items-center gap-4" onClick={() => navigateTo('HUB')}>
           <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg">S</div>
           <span className="text-2xl font-black italic tracking-tighter text-[#1D1D1F]">FixIt Guru</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 active:scale-90 transition-transform">
          <span className="text-xl font-black">{isMenuOpen ? '✕' : '•••'}</span>
        </button>
      </header>

      {/* MAIN VIEWPORT */}
      <main className={`flex-1 overflow-hidden relative z-30 flex flex-col ${screenSize !== 'mobile' && user && view !== 'REGISTRATION' ? 'ml-24 xl:ml-80' : ''}`}>
        {renderView()}
      </main>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && screenSize === 'mobile' && (
        <div className="fixed inset-0 z-[120] bg-white animate-synthesis-in flex flex-col overflow-hidden">
          <header className="px-8 h-24 border-b border-black/5 flex justify-between items-center shrink-0">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter">Control Center</h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Synthesis OS v2.1</p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center active:scale-90 transition-transform text-black">✕</button>
          </header>
          
          <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
            <section className="mt-10">
              <h3 className="px-8 mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Operativní Jádro</h3>
              <div className="space-y-1">
                {menuItems.filter(i => i.category === 'submodule').map(renderListMenuItem)}
              </div>
            </section>
            
            <section className="mt-12">
              <h3 className="px-8 mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Info & Standardy</h3>
              <div className="space-y-1">
                {menuItems.filter(i => i.category === 'info').map(renderListMenuItem)}
              </div>
            </section>
            
            <section className="mt-12">
              <h3 className="px-8 mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Identita</h3>
              <div className="space-y-1">
                {renderListMenuItem({ id: 'PROFILE', label: locale === 'cs' ? 'Můj Profil' : 'My Profile', icon: '👤', description: 'Synthesis ID Config', category: 'user' })}
                {user?.isAdmin && renderListMenuItem({ id: 'ADMIN', label: 'Kernel Admin', icon: '⚙️', description: 'System Management', category: 'user' })}
              </div>
            </section>

            <div className="p-16 text-center opacity-10">
              <div className="w-16 h-16 bg-black rounded-[24px] mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">{COPYRIGHT}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal title={locale === 'cs' ? "Bezpečnostní Protokol" : "Safety Protocol"} isOpen={showTerms} onClose={() => setShowTerms(false)}>
        <div className="space-y-10 py-6 text-center max-w-sm mx-auto animate-synthesis-in">
          <div className="w-28 h-28 glass rounded-[44px] flex items-center justify-center text-6xl mx-auto shadow-sm">
            {pendingAgent?.icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl font-black italic text-[#1D1D1F] tracking-tight leading-none">{pendingAgent?.name}</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">{pendingAgent?.title}</p>
          </div>
          <div className="bg-[#F2F2F7] p-8 rounded-[36px] text-left border border-black/5 shadow-inner">
            <p className="text-sm font-bold text-black/60 leading-relaxed italic">⚠️ {pendingAgent?.warning}</p>
          </div>
          <button 
            onClick={startChat} 
            className="w-full py-6 bg-black text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
          >
            {locale === 'cs' ? 'AKTIVOVAT AGENTA' : 'ACTIVATE AGENT'}
          </button>
        </div>
      </Modal>

      <Modal title={menuItems.find(i => i.id === activeInfoPage)?.label || 'Synthesis Docs'} isOpen={activeInfoPage !== null} onClose={() => setActiveInfoPage(null)}>
        <div className="prose-synthesis pb-16 overflow-hidden" dangerouslySetInnerHTML={{ __html: infoPageContent }} />
      </Modal>
    </div>
  );
};

export default App;