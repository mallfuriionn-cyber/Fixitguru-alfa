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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeModal && activeModal !== 'log') {
      setModalContent('<div class="animate-pulse flex space-y-3 flex-col"><div class="h-3 bg-white/5 rounded w-3/4"></div><div class="h-3 bg-white/5 rounded"></div><div class="h-3 bg-white/5 rounded w-5/6"></div></div>');
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
    <div className="h-screen w-full flex relative overflow-hidden text-white bg-[#000814]">
      {/* Sidebar Navigation */}
      <Menu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelect={(id) => setActiveModal(id)}
        activeModal={activeModal}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        {/* Header */}
        <header className="p-4 flex justify-between items-center z-40 border-b border-white/5 acrylic">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-fluent hover:bg-white/5 transition-colors reveal-focus"
            >
              ☰
            </button>
            <div className="flex flex-col">
              <div className="text-xs font-black tracking-tighter text-blue-400">GURU.V2</div>
              <h1 className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase">
                {currentAgent ? `${currentAgent.name} // ${currentAgent.title}` : 'FIXIT GURU ALPHA'}
              </h1>
            </div>
          </div>
          {currentAgent && (
            <button 
              onClick={resetChat}
              className="px-4 py-2 text-xs font-medium acrylic hover:bg-white/10 transition-colors reveal-focus"
            >
              Ukončit relaci
            </button>
          )}
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-hidden p-6 relative z-30 flex flex-col">
          {!currentAgent ? (
            <div className="h-full flex flex-col justify-center max-w-6xl mx-auto w-full">
              <div className="mb-10">
                <h2 className="text-4xl font-bold mb-2 tracking-tight">Vítejte v Synthesis.</h2>
                <p className="text-white/40 text-xs font-medium uppercase tracking-[0.2em]">Centrum pro opravy a udržitelnost</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AGENTS.map(agent => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onClick={() => setCurrentAgent(agent)} 
                  />
                ))}
              </div>

              <div className="mt-12 p-6 acrylic border-white/5 max-w-2xl">
                <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-blue-400">Rychlá diagnostika</h3>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">Vyberte si agenta výše pro zahájení interaktivní diagnostiky. Každý náš expert využívá nejmodernější model Gemini 3 pro přesné a bezpečné rady.</p>
                <div className="flex gap-4">
                   <div className="text-[10px] px-3 py-1 acrylic-deep rounded-full border border-white/10 opacity-60">Status: Alpha 0.1.0</div>
                   <div className="text-[10px] px-3 py-1 acrylic-deep rounded-full border border-white/10 opacity-60">Engine: Gemini 3 Flash</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col acrylic overflow-hidden mb-4 animate-fluent">
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                    <div className="text-5xl">{currentAgent.icon}</div>
                    <p className="text-xs max-w-xs leading-relaxed uppercase tracking-[0.2em] font-bold">
                      {currentAgent.name} čeká na vaše instrukce
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fluent`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-fluent ${
                      m.role === 'user' 
                        ? 'bg-blue-600/90 text-white shadow-lg' 
                        : 'acrylic-deep border-white/5 text-white/90 leading-relaxed text-sm'
                    }`}>
                      {m.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                      ))}
                      <div className="text-[9px] opacity-30 mt-2 text-right uppercase font-mono">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="acrylic-deep px-4 py-3 rounded-fluent flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/5 border-t border-white/5">
                <div className="relative flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Zadejte dotaz (např. 'jak vyměnit displej u iPhonu')"
                    className="flex-1 acrylic-deep border border-white/10 rounded-fluent px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-white/20 text-sm"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="w-12 h-12 bg-white text-black rounded-fluent flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all disabled:opacity-10 reveal-focus"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-3 text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-medium z-40 bg-[#000814]/50 border-t border-white/5">
          {COPYRIGHT}
        </footer>
      </div>

      {/* Modals */}
      <Modal 
        title="Technický deník & Katalog" 
        isOpen={activeModal === 'log'} 
        onClose={() => setActiveModal(null)}
      >
        <TechnicalLog />
      </Modal>

      <Modal 
        title={getModalTitle(activeModal)} 
        isOpen={activeModal !== null && activeModal !== 'log'} 
        onClose={() => setActiveModal(null)}
      >
        <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: modalContent }} />
      </Modal>
    </div>
  );
};

export default App;