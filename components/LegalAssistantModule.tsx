
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ExtractedPersonalData, LegalDispute, Language, User, UserRole } from '../types.ts';
import { gemini } from '../services/geminiService.ts';

interface LegalAssistantModuleProps {
  agent: Agent; lang: Language; onBack: () => void;
  onSaveDispute: (dispute: LegalDispute) => void;
  onUpdateVault: (data: any) => void;
  onShowBio: () => void;
  user?: User; initialMessages?: Message[]; activeDispute?: LegalDispute | null;
}

export const LegalAssistantModule: React.FC<LegalAssistantModuleProps> = ({ 
  agent, lang, onBack, onSaveDispute, onUpdateVault, user, initialMessages, activeDispute
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPersonalData | null>(activeDispute?.extractedData || null);
  const [lastDraft, setLastDraft] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(!!activeDispute);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: `### Dobrý den, jsem JUDY. ⚖️\nPomůžu vám s jakýmkoliv **právním sporem**. Nahrajte dokument nebo popište problém.`, timestamp: new Date() }]);
    }
  }, []);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // Vyčistí text od technických bloků pro export na papír
  const cleanTextForPrint = (text: string) => {
    if (!text) return "";
    return text
      .split(/EXTRAKCE\s*:/i)[0] // Odstraní JSON extrakci na konci
      .replace(/```json[\s\S]*?```/gi, "") // Odstraní JSON bloky
      .replace(/```markdown/gi, "")
      .replace(/```/gi, "")
      .replace(/#/g, "") // Odstraní hash značky pro tisk (čistý text)
      .trim();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: currentInput, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = gemini.streamMessage(agent, history, [{ text: currentInput }], lang, [{ googleSearch: {} }]);
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
      
      // Pokud je odpověď dlouhá, pravděpodobně jde o draft dokumentu
      if (fullText.length > 250) { 
        setLastDraft(fullText); 
        setIsSaved(false); 
      }
      
      const extraction = fullText.match(/EXTRAKCE\s*:\s*(\{.*\})/is);
      if (extraction) {
        try { 
          const parsed = JSON.parse(extraction[1]);
          setExtractedData(parsed); 
          onUpdateVault(parsed);
        } catch(e) { console.warn("Extrakce selhala"); }
      }
    } catch (err) {
      console.error("Judy Kernel Error:", err);
    } finally { setIsLoading(false); }
  };

  const handlePrint = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    window.print();
  };

  const handleSave = () => {
    const dispute: LegalDispute = {
      id: activeDispute?.id || 'disp-' + Date.now(),
      title: extractedData?.documentType || 'Právní případ',
      date: new Date().toLocaleDateString(),
      status: 'Probíhá',
      attachments: [],
      chatTranscript: messages,
      extractedData: extractedData || undefined
    };
    onSaveDispute(dispute);
    setIsSaved(true);
    if ('vibrate' in navigator) navigator.vibrate([10, 30]);
  };

  const isIntegrityVerified = user?.role === UserRole.ARCHITECT || (user?.virtualDocument?.isVerified && !user?.privacyDelay);
  const printPortal = document.getElementById('print-portal');
  const docToPrint = cleanTextForPrint(lastDraft || (messages.length > 0 ? messages[messages.length - 1].text : ""));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFBFD] overflow-hidden animate-synthesis-in max-w-5xl mx-auto w-full relative">
      
      {/* EXPORT MATRICE (PORTAL) */}
      {printPortal && createPortal(
        <div className="legal-paper-preview">
          <header style={{ borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>Právní Listina</h1>
              <p style={{ margin: 0, fontSize: '8pt', opacity: 0.5, letterSpacing: '2px', fontWeight: 900 }}>SYNT-ADVOCACY PROTOCOL v5.8</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '10pt', fontWeight: 700 }}>DATUM: {new Date().toLocaleDateString()}</p>
              <p style={{ margin: 0, fontSize: '7pt', opacity: 0.4 }}>SID: {user?.virtualHash || 'ANONYMOUS-HANDSHAKE'}</p>
            </div>
          </header>

          <div style={{ fontSize: '12pt', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
            {docToPrint}
          </div>

          <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ fontSize: '7pt', opacity: 0.4, maxWidth: '300px' }}>
               Dokument vygenerován systémem FixIt Guru Alpha. Ověřeno Synthesis Integrity Enginem. Tento dokument má doporučující charakter.
             </div>
             <div className="synthesis-seal">
               <span style={{ fontSize: '18pt', fontWeight: 900, fontStyle: 'italic' }}>S</span>
               <span style={{ fontSize: '5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified</span>
             </div>
          </footer>
        </div>,
        printPortal
      )}

      <header className="h-16 px-6 border-b border-black/5 flex justify-between items-center bg-white/80 backdrop-blur-xl shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-sm font-bold active:scale-90 transition-transform">←</button>
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-lg">⚖️</div>
          <h3 className="font-black italic text-sm uppercase tracking-widest">JUDY</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black uppercase text-black/30">
             {isIntegrityVerified ? 'SVID INTEGRITY' : 'ANONYM MODE'}
           </span>
           <div className={`w-1.5 h-1.5 rounded-full ${isIntegrityVerified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-40">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-6 rounded-[32px] max-w-[90%] shadow-sm ${m.role === 'user' ? 'bubble-user' : 'bubble-model bg-white border border-black/5'}`}>
              <div className="prose-synthesis text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              </div>
              
              {m.role === 'model' && i > 0 && m.text.length > 200 && (
                <div className="mt-8 pt-8 border-t border-black/5 flex flex-col gap-3">
                   <button 
                    onClick={handlePrint} 
                    className="w-full h-14 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                   >
                    <span>🖨️</span> EXPORTOVAT DO PDF
                   </button>
                   <button 
                    onClick={handleSave} 
                    className={`w-full h-12 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                   >
                    {isSaved ? '✓ ULOŽENO VE SPISECH MATRIXU' : '💾 SYNCHRONIZOVAT SE SPISY'}
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-[9px] font-black uppercase text-black/20 tracking-widest italic">Judy analyzuje Matrix...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-black/5 bg-white pb-8 shrink-0 sticky bottom-0">
        <div className="flex gap-2 max-w-3xl mx-auto w-full">
           <div className="flex-1 bg-[#F2F2F7] rounded-full px-5 py-3 overflow-hidden flex items-center shadow-inner">
             <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
              placeholder="Zadejte dotaz nebo popište spor..." 
              className="w-full bg-transparent outline-none font-medium text-sm" 
             />
           </div>
           <button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all disabled:opacity-20"
           >
            <span className="text-xl">↑</span>
           </button>
        </div>
      </footer>
    </div>
  );
};
