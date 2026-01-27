
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ViewState, User, MenuItem, AgentId, Language, LegalDispute, UserRole } from './types.ts';
import { AGENTS as INITIAL_AGENTS, UI_TEXTS, JUDY_AGENT } from './constants.tsx';
import { AgentCard } from './components/AgentCard.tsx';
import { RegistrationModule } from './components/RegistrationModule.tsx';
import { ProfileModule } from './components/ProfileModule.tsx';
import { Menu } from './components/Menu.tsx';
import { DetailedRegistration } from './components/DetailedRegistration.tsx';
import { LucieWorkshopModule } from './components/LucieWorkshopModule.tsx';
import { DocSearchModule } from './components/DocSearchModule.tsx';
import { ClaimGuideModule } from './components/ClaimGuideModule.tsx';
import { LegalShieldModule } from './components/LegalShieldModule.tsx';
import { LegalAssistantModule } from './components/LegalAssistantModule.tsx';
import { MessagesModule } from './components/MessagesModule.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { gemini } from './services/geminiService.ts';
import { fetchPageContent } from './services/pageService.ts';
import { getBrowserLanguage } from './utils/locale.ts';
import { db } from './services/storageService.ts';
import { getRoleMeta } from './utils/permissionUtils.ts';

export default function App() {
  const [view, setView] = useState<ViewState | 'SVID_VERIFY'>('REGISTRATION');
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(getBrowserLanguage() as Language);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [pendingAgent, setPendingAgent] = useState<Agent | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);
  const [infoPageContent, setInfoPageContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [activeDisputeContext, setActiveDisputeContext] = useState<LegalDispute | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDbUpdate = () => {
      const lastUserStr = localStorage.getItem('synthesis_last_user');
      if (lastUserStr && user) {
        try {
          const parsed = JSON.parse(lastUserStr);
          const updated = db.getById('users', parsed.id);
          if (updated) setUser(updated);
        } catch(e) {}
      }
    };
    window.addEventListener('db-update', handleDbUpdate);
    return () => window.removeEventListener('db-update', handleDbUpdate);
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeInfoPage) fetchPageContent(activeInfoPage).then(setInfoPageContent);
  }, [activeInfoPage]);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const persistUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('synthesis_last_user', JSON.stringify(updatedUser));
    db.update('users', updatedUser.id, updatedUser);
  };

  const navigateTo = (id: string) => {
    haptic(5);
    setIsMenuOpen(false); 
    setActiveInfoPage(null);
    if (['HUB', 'PROFILE', 'SOCIAL', 'ADMIN', 'MESSAGES', 'LEGAL_SHIELD', 'DOC_SEARCH', 'CLAIM_GUIDE', 'LUCIE_WORKSHOP'].includes(id)) {
      setView(id as ViewState);
    } else {
      setActiveInfoPage(id);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    haptic([10, 20]);
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: currentInput, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = gemini.streamMessage(currentAgent!, history, [{ text: currentInput }], lang);
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);
      let fullText = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1].text = fullText;
            return next;
          });
        }
      }
    } finally { setIsLoading(false); }
  };

  const renderView = () => {
    if (activeInfoPage) {
      return (
        <div className="flex-1 flex flex-col h-full animate-synthesis-in overflow-hidden">
          <header className="h-20 px-6 border-b border-black/5 flex justify-between items-center bg-white/70 backdrop-blur-xl shrink-0">
            <button onClick={() => setActiveInfoPage(null)} className="h-10 px-6 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">← Zpět</button>
            <h3 className="text-[10px] font-black uppercase opacity-30">Synthesis Info iD 10</h3>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar max-w-4xl mx-auto w-full">
            <div className="prose-synthesis" dangerouslySetInnerHTML={{ __html: infoPageContent }} />
          </div>
        </div>
      );
    }

    switch (view) {
      case 'REGISTRATION': return <RegistrationModule 
        onLogin={(u) => { if (u) { persistUser(u); setView('HUB'); } }} 
        onRegisterClick={() => setView('DETAILED_REGISTRATION')} 
        onShowTerms={() => setActiveInfoPage('terms')} 
      />;
      case 'DETAILED_REGISTRATION': return <DetailedRegistration onComplete={(u) => { db.insert('users', u); persistUser(u); setView('HUB'); }} onCancel={() => setView('REGISTRATION')} />;
      case 'HUB': return (
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-12 no-scrollbar max-w-6xl mx-auto w-full pb-32">
          <section className="text-center space-y-4 pt-4">
             <div className="w-16 h-16 bg-black text-white rounded-[20px] flex items-center justify-center text-3xl mx-auto font-black italic shadow-2xl">S</div>
             <h1 className="text-4xl font-black italic tracking-tighter text-[#1D1D1F]">FixIt Guru Hub</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Synthesis OS v5.8 Alpha</p>
          </section>

          {/* 2x2 Grid asistentů - RESTORED LOOK */}
          <section className="grid grid-cols-2 gap-4">
            {agents.map(a => <AgentCard key={a.id} agent={a} lang={lang} onClick={() => { setPendingAgent(a); setShowTermsModal(true); }} />)}
          </section>

          {/* Speciální funkce */}
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 px-2">Speciální Moduly Jádra</p>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { id: 'DOC_SEARCH', icon: '📂', label: 'Manuály', color: 'bg-indigo-50 text-indigo-600' },
                 { id: 'LUCIE_WORKSHOP', icon: '🛠️', label: 'Dílna Lucie', color: 'bg-emerald-50 text-emerald-600' },
                 { id: 'LEGAL_SHIELD', icon: '⚖️', label: 'Právní Štít', color: 'bg-slate-100 text-slate-800' },
                 { id: 'MESSAGES', icon: '💬', label: 'Komunita', color: 'bg-blue-50 text-blue-600' }
               ].map(m => (
                 <button key={m.id} onClick={() => navigateTo(m.id)} className="p-6 bg-white border border-black/5 rounded-[36px] text-left space-y-4 active:scale-95 transition-all shadow-sm hover:shadow-md group">
                   <div className={`w-12 h-12 ${m.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>{m.icon}</div>
                   <h4 className="font-black italic text-sm">{m.label}</h4>
                 </button>
               ))}
            </div>
          </section>

          {showTermsModal && pendingAgent && (
            <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white rounded-[56px] p-10 space-y-8 animate-synthesis-in shadow-2xl border border-black/5">
                 <div className="text-center space-y-4">
                    <div className="text-7xl drop-shadow-xl">{pendingAgent.icon}</div>
                    <h3 className="text-3xl font-black italic tracking-tighter">{pendingAgent.name}</h3>
                    <p className="text-sm text-black/50 italic px-4 leading-relaxed">"{pendingAgent.description[lang]}"</p>
                 </div>
                 <div className="space-y-3">
                    <button onClick={() => { setCurrentAgent(pendingAgent); setMessages([{role:'model', text: `### Připraven k akci.\nJsem **${pendingAgent.name}**. S čím dnes pohneme v Matrixu?`, timestamp: new Date()}]); setView('CHAT'); setShowTermsModal(false); }} className="w-full py-5 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Inicializovat Sezení</button>
                    <button onClick={() => setShowTermsModal(false)} className="w-full py-4 text-black/30 font-black text-[10px] uppercase tracking-widest">Zrušit</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      );
      case 'CHAT': return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFD] max-w-5xl mx-auto w-full">
           <header className="h-20 px-6 border-b border-black/5 flex justify-between items-center bg-white/80 backdrop-blur-xl shrink-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-2xl shadow-inner">{currentAgent?.icon}</div>
                 <div>
                    <h3 className="font-black italic text-lg leading-none">{currentAgent?.name}</h3>
                    <p className="text-[7px] font-black uppercase text-[#007AFF] tracking-widest mt-1">Aktivní Relace</p>
                 </div>
              </div>
              <button onClick={() => setView('HUB')} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform">✕</button>
           </header>
           <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`px-6 py-4 max-w-[90%] shadow-sm ${m.role === 'user' ? 'bubble-user' : 'bubble-model bg-white'}`}>
                      <div className="prose-synthesis text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown></div>
                   </div>
                </div>
              ))}
              {isLoading && <div className="text-[10px] font-black uppercase text-black/20 animate-pulse px-2 italic tracking-widest">Asistent přemýšlí...</div>}
              <div ref={messagesEndRef} />
           </div>
           <footer className="p-4 pb-8 border-t border-black/5 bg-white shrink-0">
              <div className="flex gap-2 max-w-3xl mx-auto w-full">
                 <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Zadejte dotaz..." className="flex-1 h-12 bg-[#F2F2F7] rounded-full px-6 outline-none font-medium text-sm shadow-inner" />
                 <button onClick={handleSendMessage} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg font-black text-lg active:scale-90 transition-transform">↑</button>
              </div>
           </footer>
        </div>
      );
      case 'LEGAL_SHIELD': return <LegalShieldModule onBack={() => setView('HUB')} onActivateAssistant={() => setView('LEGAL_ASSISTANT_CHAT')} />;
      case 'LEGAL_ASSISTANT_CHAT': return <LegalAssistantModule agent={JUDY_AGENT} lang={lang} onBack={() => setView('LEGAL_SHIELD')} onSaveDispute={d => user && persistUser({...user, disputes: [d, ...(user.disputes || [])]})} onUpdateVault={v => user && persistUser({...user, vaultData: {...user.vaultData, ...v}})} onShowBio={() => setActiveInfoPage('judy-bio')} user={user || undefined} initialMessages={activeDisputeContext?.chatTranscript} activeDispute={activeDisputeContext} />;
      case 'PROFILE': return <ProfileModule user={user} onUpdateUser={persistUser} onBack={() => setView('HUB')} onLogout={() => { setUser(null); setView('REGISTRATION'); }} onLoadConversation={c => { setMessages(c.messages); setView('CHAT'); }} onContinueDispute={d => { setActiveDisputeContext(d); setView('LEGAL_ASSISTANT_CHAT'); }} />;
      case 'LUCIE_WORKSHOP': return <LucieWorkshopModule onBack={() => setView('HUB')} onUpdateXP={xp => user && persistUser({...user, level: user.level + xp})} />;
      case 'DOC_SEARCH': return <DocSearchModule onBack={() => setView('HUB')} />;
      case 'CLAIM_GUIDE': return <ClaimGuideModule onBack={() => setView('HUB')} />;
      case 'MESSAGES': return <MessagesModule onBack={() => setView('HUB')} onKudos={xp => user && persistUser({...user, level: user.level + xp})} />;
      case 'ADMIN': return <AdminPanel user={user} agents={agents} onUpdateAgents={setAgents} onBack={() => setView('HUB')} />;
      default: return null;
    }
  };

  const roleMeta = user ? getRoleMeta(user.role) : getRoleMeta(UserRole.HOST);
  // FIX: Architekt je vždy brán jako verifikovaný i bez dokladu
  const isAnon = user && user.role !== UserRole.ARCHITECT && (!user.virtualDocument?.isVerified || user.privacyDelay);

  return (
    <div className="flex flex-col h-screen w-full bg-[#FBFBFD] overflow-hidden relative">
      {view !== 'REGISTRATION' && view !== 'DETAILED_REGISTRATION' && (
        <header className="h-20 px-6 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-black/[0.04] z-[1000] shrink-0">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('HUB')}>
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black italic">S</div>
              <div className="flex flex-col">
                 <span className="font-black italic text-sm leading-none">FixIt Guru</span>
                 <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAnon ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    <span className="text-[7px] font-black uppercase text-black/30 tracking-widest">{roleMeta.label}</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => setView('PROFILE')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${view === 'PROFILE' ? 'bg-black text-white shadow-lg' : 'bg-black/5 text-black/30'}`}>👤</button>
              <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform">⋮</button>
           </div>
        </header>
      )}
      <main className="flex-1 flex flex-col overflow-hidden relative">{renderView()}</main>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onSelect={navigateTo} activeModal={view} lang={lang} user={user} />
    </div>
  );
}
