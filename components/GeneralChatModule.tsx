import React, { useState, useRef, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, Language, User, UserAsset, PublicGuide } from '../types.ts';
import { gemini } from '../services/geminiService.ts';
import { db } from '../services/storageService.ts';

interface GeneralChatModuleProps {
  agent: Agent;
  lang: Language;
  onBack: () => void;
  user: User;
  onOpenGuide?: (guideId: string) => void;
  initialContext?: string;
}

const SynthesisStamp = () => {
  const handleOpenInfo = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    window.dispatchEvent(new CustomEvent('synthesis:open-info', { detail: 'verification-info' }));
  };

  return (
    <button 
      onClick={handleOpenInfo}
      className="synthesis-stamp-ui group hover:opacity-100 transition-opacity cursor-pointer text-left"
    >
      <div className="s-icon group-hover:scale-110 transition-transform">S</div>
      <span className="s-text">Verified by Synthesis Core // Info</span>
    </button>
  );
};

const GuideDiscoveryCard = ({ guide, onOpen }: { guide: PublicGuide, onOpen: () => void }) => {
  return (
    <div className="mt-4 p-5 bg-gradient-to-br from-blue-600 to-[#007AFF] rounded-[28px] shadow-2xl animate-synthesis-in border border-white/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">📚</div>
        <div className="flex-1 space-y-1">
          <p className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-none">Nalezen Blueprint Synthesis</p>
          <h4 className="text-sm font-black italic text-white leading-tight">{guide.title}</h4>
          <p className="text-[10px] font-bold text-white/70 italic leading-tight">{guide.deviceName}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Chcete se podívat na návod?</p>
        <button 
          onClick={onOpen}
          className="h-9 px-5 bg-white text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Zobrazit Blueprint
        </button>
      </div>
    </div>
  );
};

const MemoizedMessage = memo(({ m, user, showStamp, suggestedGuide, onOpenGuide }: { m: Message, user: User, showStamp: boolean, suggestedGuide?: PublicGuide | null, onOpenGuide?: (id: string) => void }) => {
  return (
    <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-synthesis-in`}>
      <div className={`p-6 rounded-[32px] max-w-[90%] shadow-sm ${m.role === 'user' ? 'bg-[#1D1D1F] text-white rounded-tr-none' : 'bg-white border border-black/5 text-black rounded-tl-none'}`}>
        <div className="prose-synthesis text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
        </div>
        
        {m.role === 'model' && showStamp && <SynthesisStamp />}
        
        {m.role === 'model' && suggestedGuide && (
          <GuideDiscoveryCard guide={suggestedGuide} onOpen={() => onOpenGuide?.(suggestedGuide.id)} />
        )}

        {m.attachments && m.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {m.attachments.map(id => {
              const asset = user.assets?.find(a => a.id === id);
              if (!asset) return null;
              return (
                <div key={id} className="px-3 py-1.5 bg-white/10 rounded-xl flex items-center gap-2 border border-white/5">
                  <span className="text-xs">{asset.type === 'IMAGE' ? '🖼️' : '📄'}</span>
                  <span className="text-[9px] font-bold truncate max-w-[80px]">{asset.name}</span>
                </div>
              );
            })}
          </div>
        )}
        <p className={`text-[8px] font-black uppercase tracking-widest mt-3 opacity-20 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

export const GeneralChatModule: React.FC<GeneralChatModuleProps> = ({ agent, lang, onBack, user, onOpenGuide, initialContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Synthesis OS generuje odpověď');
  const [pendingAssets, setPendingAssets] = useState<UserAsset[]>([]);
  const [lastSuggestedGuide, setLastSuggestedGuide] = useState<PublicGuide | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (messages.length === 0) {
        if (initialContext) {
           setMessages([{ 
             role: 'user', 
             text: initialContext, 
             timestamp: new Date() 
           }]);
           await handleContextTrigger(initialContext);
        } else {
           setMessages([{
             role: 'model',
             text: `### Ahoj, jsem ${agent.name}. ${agent.icon}\n${agent.description[lang]}\nJak ti mohu dnes v rámci Synthesis OS pomoci s tvým projektem?`,
             timestamp: new Date()
           }]);
        }
      }
    };
    initChat();
  }, [agent, initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const findMatchingGuide = (query: string): PublicGuide | null => {
    const guides = db.getAll('publicGuides');
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    const exactMatch = guides.find(g => 
      query.toLowerCase().includes(g.deviceName.toLowerCase()) ||
      g.deviceName.toLowerCase().includes(query.toLowerCase())
    );
    if (exactMatch) return exactMatch;

    return guides.find(g => {
      const gTitle = g.title.toLowerCase();
      const gDevice = g.deviceName.toLowerCase();
      const gCat = g.category.toLowerCase();
      return terms.some(t => gTitle.includes(t) || gDevice.includes(t) || gCat.includes(t));
    }) || null;
  };

  const isStructuredDocument = (text: string) => {
    const hasHeaders = (text.match(/###/g) || []).length >= 2;
    const isLong = text.length > 400;
    const hasSteps = text.includes('1.') || text.includes('* ');
    return (hasHeaders && isLong) || (hasHeaders && hasSteps) || text.includes('[DOKUMENT_START]');
  };

  const handleContextTrigger = async (context: string) => {
    setIsLoading(true);
    setLoadingStatus('Synthesis OS přebírá inženýrský kontext');
    try {
      const stream = gemini.streamMessage(agent, [], [{ text: context }], lang);
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);
      let fullText = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text.replace(/\*?⚠️.*?dosáhlo limitu.*?okruh.*?\*?/gi, "");
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1].text = fullText;
            return next;
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPendingAssets(prev => [...prev, {
          id: 'asset-' + Date.now() + Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: isImage ? 'IMAGE' : 'DOCUMENT',
          mimeType: file.type || 'application/octet-stream',
          data: base64,
          createdAt: new Date().toISOString(),
          sourceAgent: agent.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && pendingAssets.length === 0) || isLoading) return;
    const currentInput = input;
    const currentAssets = [...pendingAssets];
    setInput('');
    setPendingAssets([]);
    haptic(15);

    const foundGuide = findMatchingGuide(currentInput);
    setLastSuggestedGuide(foundGuide);

    const status = currentAssets.length > 0 
      ? `Synthesis OS provádí analýzu dat pro agenta ${agent.name}` 
      : `Synthesis OS provádí neurální analýzu dotazu`;
    setLoadingStatus(status);

    const updatedUser = { ...user, assets: [...(user.assets || []), ...currentAssets] };
    db.update('users', user.id, updatedUser);
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: currentInput, 
      timestamp: new Date(),
      attachments: currentAssets.map(a => a.id)
    }]);
    setIsLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const promptParts: any[] = [];
      if (currentInput) promptParts.push({ text: currentInput });
      currentAssets.forEach(asset => {
        promptParts.push({ inlineData: { mimeType: asset.mimeType, data: asset.data } });
      });
      const stream = gemini.streamMessage(agent, history, promptParts, lang);
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);
      let fullText = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text.replace(/\*?⚠️.*?dosáhlo limitu.*?okruh.*?\*?/gi, "");
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1].text = fullText;
            return next;
          });
        }
      }
    } catch (err) {
      console.error("Synthesis Core Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] overflow-hidden animate-synthesis-in w-full relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-40">
        {messages.map((m, i) => (
          <MemoizedMessage 
            key={`${i}-${m.timestamp.getTime()}`} 
            m={m} 
            user={user} 
            showStamp={i > 0 && isStructuredDocument(m.text)}
            suggestedGuide={i === messages.length - 1 && m.role === 'model' ? lastSuggestedGuide : null}
            onOpenGuide={onOpenGuide}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 px-4 animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full [animation-delay:0.4s]"></div>
            </div>
            <p className="font-black text-[9px] uppercase tracking-widest text-black/40">{loadingStatus}...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <footer className="p-4 border-t border-black/5 bg-white pb-8 shrink-0">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {pendingAssets.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {pendingAssets.map((asset, idx) => (
                <div key={idx} className="relative group bg-[#F2F2F7] p-2 rounded-2xl border border-black/5 flex items-center gap-3 animate-synthesis-in">
                  {asset.type === 'IMAGE' ? (
                    <img src={`data:${asset.mimeType};base64,${asset.data}`} className="w-10 h-10 object-cover rounded-lg" alt="" />
                  ) : (
                    <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center text-xl">📄</div>
                  )}
                  <span className="text-[9px] font-black uppercase truncate max-w-[100px]">{asset.name}</span>
                  <button onClick={() => setPendingAssets(prev => prev.filter((_, i) => i !== idx))} className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] absolute -top-1.5 -right-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 w-full">
            <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center text-xl hover:bg-black/10 transition-colors shrink-0">📎</button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
            <div className="flex-1 bg-[#F2F2F7] rounded-full px-6 py-4 overflow-hidden flex items-center shadow-inner">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder={`Zeptejte se ${agent.name}...`} className="w-full bg-transparent outline-none font-medium text-sm" />
            </div>
            <button onClick={handleSendMessage} disabled={(!input.trim() && pendingAssets.length === 0) || isLoading} className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-20 transition-all shrink-0"><span className="text-xl">↑</span></button>
          </div>
        </div>
      </footer>
    </div>
  );
};