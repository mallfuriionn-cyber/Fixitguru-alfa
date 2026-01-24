
import React, { useState } from 'react';
import { MOCK_CHATS, MOCK_MESSAGES } from '../constants.tsx';
import { ChatThread, DirectMessage } from '../types.ts';

interface MessagesModuleProps {
  onBack: () => void;
}

export const MessagesModule: React.FC<MessagesModuleProps> = ({ onBack }) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_CHATS);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const chatMessages = activeThreadId ? MOCK_MESSAGES[activeThreadId] || [] : [];

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeThreadId) return;
    // V reálné aplikaci by zde byl API call
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-apple-in">
      {!activeThreadId ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="px-6 pt-12 pb-6 bg-white border-b border-black/5 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007AFF] mb-1">Synthesis Communications</p>
              <h2 className="text-4xl font-black tracking-tighter">Zprávy</h2>
            </div>
            <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity mb-2">Hub</button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {threads.map(thread => (
              <button 
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className="w-full p-6 bg-[#FBFBFD] border border-black/5 rounded-[32px] flex items-center gap-4 text-left hover:bg-black hover:text-white group transition-all"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:bg-white/10 group-hover:scale-105 transition-all">
                  {thread.participantAvatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-lg">{thread.participantName}</span>
                    <span className="text-[9px] font-bold uppercase opacity-30 group-hover:opacity-60">{thread.lastTimestamp}</span>
                  </div>
                  <p className="text-sm opacity-40 group-hover:opacity-80 truncate leading-tight">{thread.lastMessage}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {thread.unreadCount}
                  </div>
                )}
              </button>
            ))}
            <div className="pt-8 text-center">
              <button className="px-8 py-4 bg-black/5 rounded-full text-[10px] font-black uppercase tracking-widest text-black/30 hover:bg-black hover:text-white transition-all">
                Nová konverzace
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="px-6 py-4 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center gap-4">
            <button onClick={() => setActiveThreadId(null)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-xl font-light">←</button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeThread?.participantAvatar}</span>
              <div>
                <h3 className="text-sm font-black leading-none">{activeThread?.participantName}</h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-green-500 mt-1">Online</p>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            {chatMessages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-[24px] ${msg.senderId === 'me' ? 'bg-black text-white' : 'bg-[#F2F2F7] text-black'} card-shadow`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  <p className="text-[8px] font-bold uppercase opacity-30 mt-2 text-right">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-black/5">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Napište zprávu..."
                className="flex-1 bg-[#F2F2F7] rounded-full px-6 py-4 focus:outline-none font-medium"
              />
              <button 
                onClick={handleSendMessage}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
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
