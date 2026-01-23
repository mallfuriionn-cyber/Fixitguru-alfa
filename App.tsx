import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentId, Message } from './types';
import { AGENTS, COPYRIGHT, MENU_ITEMS } from './constants';
import { AgentCard } from './components/AgentCard';
import { Menu } from './components/Menu';
import { Modal } from './components/Modal';
import { TechnicalLog } from './components/TechnicalLog';
import { gemini } from './services/geminiService';
import { fetchPageContent } from './services/pageService';

const App: React.FC = () => {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Dynamicky načte obsah stránky, když se změní activeModal
  useEffect(() => {
    if (activeModal && activeModal !== 'log') {
      setModalContent('<div class="animate-pulse flex space-y-4 flex-col"><div class="h-4 bg-white/10 rounded w-3/4"></div><div class="h-4 bg-white/10 rounded"></div><div class="h-4 bg-white/10 rounded w-5/6"></div></div>');
      fetchPageContent(activeModal).then(setModalContent);
    }
  }, [activeModal]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentAgent || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await gemini.sendMessage(currentAgent, history, input);
    
    const botMessage: Message = {
      role: 'model',
      text: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const resetChat = () => {
    setCurrentAgent(null);
    setMessages([]);
  };

  const getModalTitle = (id: string | null) => {
    return MENU_ITEMS.find(item => item.id === id)?.label || 'Stránka';
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden text-white bg-[#000814]">
      {/* Background Auras */}
      <div className="aura w-[500px] h-[500px] top-[-100px] left-[-100px] bg-blue-600"></div>
      <div className="aura w-[400px] h-[400px] bottom-[-50px] right-[-50px] bg-cyan-900"></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          {currentAgent ? (
            <button 
              onClick={resetChat}
              className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ←
            </button>
          ) : (
             <div className="text-xl font-black tracking-tighter text-blue-400">GURU.V2</div>
          )}
          <h1 className="text-sm font-bold tracking-[0.2em] opacity-80">
            {currentAgent ? `${currentAgent.name} // ${currentAgent.title}` : 'FIXIT GURU ALPHA'}
          </h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 relative z-30 flex flex-col">
        {!currentAgent ? (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-center mb-12 max-w-xl">
              <h2 className="text-5xl font-black mb-4 tracking-tight leading-none">Vítejte v Synthesis.</h2>
              <p className="text-white/40 text-sm font-light uppercase tracking-[0.3em]">Vyberte svého experta na opravy</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
              {AGENTS.map(agent => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  onClick={() => setCurrentAgent(agent)} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col glass rounded-[3rem] border-white/10 shadow-2xl overflow-hidden mb-6">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                  <div className="text-6xl">{currentAgent.icon}</div>
                  <p className="text-sm max-w-xs leading-relaxed uppercase tracking-widest">
                    Zadejte dotaz k opravě nebo údržbě. {currentAgent.name} je připraven.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`max-w-[80%] p-5 rounded-3xl ${
                    m.role === 'user' 
                      ? 'bg-blue-600/80 text-white rounded-tr-none shadow-lg' 
                      : 'glass border-white/5 text-white/90 rounded-tl-none leading-relaxed'
                  }`}>
                    {m.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-3' : ''}>{line}</p>
                    ))}
                    <div className="text-[10px] opacity-40 mt-2 text-right">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/5 border-t border-white/10">
              <div className="relative flex items-center gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Zeptejte se na cokoli..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all disabled:opacity-20 disabled:grayscale"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-[10px] text-center text-white/30 uppercase tracking-[0.3em] font-light z-40 bg-[#000814]">
        {COPYRIGHT}
      </footer>

      {/* Menu & Modals */}
      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSelect={(id) => {
          setIsMenuOpen(false);
          setActiveModal(id);
        }}
      />

      {/* Technický deník má speciální komponentu */}
      <Modal 
        title="Technický deník & Katalog" 
        isOpen={activeModal === 'log'} 
        onClose={() => setActiveModal(null)}
      >
        <TechnicalLog />
      </Modal>

      {/* Ostatní stránky se načítají dynamicky z HTML souborů */}
      <Modal 
        title={getModalTitle(activeModal)} 
        isOpen={activeModal !== null && activeModal !== 'log'} 
        onClose={() => setActiveModal(null)}
      >
        <div dangerouslySetInnerHTML={{ __html: modalContent }} />
      </Modal>
    </div>
  );
};

export default App;
