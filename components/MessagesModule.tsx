import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CHATS, MOCK_MESSAGES, MOCK_USERS, MOCK_PROJECTS } from '../constants.tsx';
import { ChatThread, DirectMessage, User, InteractionType, Project } from '../types.ts';
import { SynthesisPass } from './SynthesisPass.tsx';

interface MessagesModuleProps {
  onBack: () => void;
  onKudos?: (amount: number) => void;
}

type MessageView = 'LIST' | 'CHAT' | 'NEW_CHAT';

export const MessagesModule: React.FC<MessagesModuleProps> = ({ onBack, onKudos }) => {
  const [view, setView] = useState<MessageView>('LIST');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_CHATS);
  const [messages, setMessages] = useState<Record<string, DirectMessage[]>>(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
  const [viewingUserPass, setViewingUserPass] = useState<User | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, messages]);

  // Sync textarea height with content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '34px'; // Base height
      const nextHeight = Math.max(34, Math.min(textareaRef.current.scrollHeight, 160));
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

  const haptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const activeThread = threads.find(t => t.id === activeThreadId);
  const currentMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const handleSendMessage = (type: InteractionType = 'TEXT', payload: any = null, customText: string = '') => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && type === 'TEXT') return;
    if (!activeThreadId) return;

    haptic([10, 20]);
    if (type === 'KUDOS' && onKudos) onKudos(1);
    
    const newMsg: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      senderName: 'Já',
      senderAvatar: '👤',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      payload
    };

    setMessages(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg]
    }));
    
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
        ? { ...t, lastMessage: type === 'TEXT' ? textToSend : `[${type}] ${textToSend}`, lastTimestamp: 'Právě teď' } 
        : t
    ));
    
    setInputText('');
    setIsActionPanelOpen(false);
  };

  const openUserProfile = (userId: string) => {
    const fullUser = MOCK_USERS.find(u => u.id === userId);
    if (fullUser) {
      setViewingUserPass(fullUser as User);
    }
  };

  const renderMessageContent = (msg: DirectMessage) => {
    switch (msg.type) {
      case 'KUDOS':
        return (
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3 py-2 border-b border-white/20">
                <span className="text-2xl animate-bounce">✨</span>
                <span className="font-black text-[10px] uppercase tracking-widest text-white">Synthesis Kudos +1</span>
             </div>
             <p className="text-[14px] font-bold italic opacity-90">"{msg.text}"</p>
          </div>
        );
      case 'PROJECT_SHARE':
        return (
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Projekt</span>
                <span className="text-[8px] font-black uppercase text-green-300">Verified</span>
             </div>
             <div className="space-y-1">
                <h4 className="font-black italic text-lg leading-tight">{msg.payload?.title}</h4>
                <p className="text-[11px] opacity-60 leading-tight">Součástí jsou inženýrská schémata a seznam dílů.</p>
             </div>
             <button className="w-full py-3 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">Zobrazit Blueprint</button>
          </div>
        );
      default:
        return <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFD] animate-synthesis-in relative">
      {viewingUserPass && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-2xl p-6 animate-synthesis-in">
          <SynthesisPass user={viewingUserPass} lang="cs" onClose={() => setViewingUserPass(null)} />
        </div>
      )}

      {view === 'LIST' && (
        <div className="flex-1 flex flex-col overflow-hidden max-w-2xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2 no-scrollbar pb-32">
            {threads.map(thread => (
              <button 
                key={thread.id}
                onClick={() => { haptic(5); setActiveThreadId(thread.id); setView('CHAT'); }}
                className="w-full p-6 bg-white border border-black/5 rounded-[40px] flex items-center gap-5 text-left hover:shadow-xl group transition-all relative overflow-hidden shadow-sm"
              >
                <div 
                  className="w-16 h-16 bg-[#F2F2F7] rounded-[24px] flex items-center justify-center text-3xl shadow-inner border border-black/5 group-hover:scale-105 transition-all relative"
                  onClick={(e) => { e.stopPropagation(); openUserProfile(thread.participantId); }}
                >
                  {thread.participantAvatar}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-lg italic tracking-tight">{thread.participantName}</span>
                    <span className="text-[9px] font-black uppercase opacity-20 group-hover:opacity-40">{thread.lastTimestamp}</span>
                  </div>
                  <p className="text-sm font-medium opacity-40 group-hover:opacity-80 truncate leading-tight italic">{thread.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'CHAT' && (
        <div className="flex-1 flex flex-col overflow-hidden max-w-3xl mx-auto w-full relative">
          <header className="px-6 py-4 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => { haptic(5); setView('LIST'); }} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-xl active:scale-90">←</button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => openUserProfile(activeThread?.participantId!)}>
                <div className="w-11 h-11 bg-black/5 rounded-2xl flex items-center justify-center text-2xl">{activeThread?.participantAvatar}</div>
                <div>
                  <h3 className="text-base font-black leading-none italic">{activeThread?.participantName}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Člen Komunity
                  </p>
                </div>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col no-scrollbar bg-[#FBFBFD]">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'} animate-synthesis-in`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[32px] shadow-lg relative ${
                  msg.senderId === 'me' 
                    ? msg.type === 'KUDOS' ? 'bg-gradient-to-br from-[#007AFF] to-blue-400 text-white rounded-br-none shadow-blue-500/20' : 'bg-black text-white rounded-br-none shadow-black/10' 
                    : 'bg-white border border-black/5 text-black rounded-bl-none shadow-sm'
                }`}>
                  {renderMessageContent(msg)}
                  <div className={`text-[8px] font-black uppercase tracking-widest mt-3 opacity-30 ${msg.senderId === 'me' ? 'text-right opacity-60' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isActionPanelOpen && (
            <div className="absolute bottom-[80px] left-6 right-6 z-20 bg-white/90 backdrop-blur-2xl border border-black/5 rounded-[40px] p-6 shadow-2xl animate-synthesis-in">
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleSendMessage('KUDOS', { amount: 1 }, 'Díky za skvělou radu!')} className="flex flex-col items-center gap-3 p-6 bg-blue-50 rounded-[32px] group active:scale-95 transition-all">
                     <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-[#007AFF]">Darovat Kudos</span>
                  </button>
                  <button onClick={() => handleSendMessage('PROJECT_SHARE', MOCK_PROJECTS[0], 'Mrkni na můj postup.')} className="flex flex-col items-center gap-3 p-6 bg-black text-white rounded-[32px] group active:scale-95 transition-all">
                     <span className="text-3xl group-hover:scale-110 transition-transform">📂</span>
                     <span className="text-[9px] font-black uppercase tracking-widest">Sdílet Projekt</span>
                  </button>
               </div>
            </div>
          )}

          <div className="p-4 bg-white border-t border-black/5 pb-10 z-10">
            <div className="flex items-end gap-3 max-w-2xl mx-auto">
              <button onClick={() => { haptic(5); setIsActionPanelOpen(!isActionPanelOpen); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all active:scale-90 mb-0.5 ${isActionPanelOpen ? 'bg-black text-white rotate-45' : 'bg-black/5 text-black/40'}`}>＋</button>
              <div className="flex-1 bg-[#F2F2F7] rounded-[22px] px-3 py-1 shadow-sm smart-input-area overflow-hidden">
                <textarea 
                  ref={textareaRef}
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }} 
                  placeholder="Napište zprávu..." 
                  className="w-full bg-transparent outline-none font-medium text-sm smart-input no-scrollbar" 
                  rows={1}
                />
              </div>
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-10 mb-0.5"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};