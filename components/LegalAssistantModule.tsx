
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ExtractedPersonalData, LegalDispute } from '../types.ts';
import { gemini } from '../services/geminiService.ts';

interface LegalAssistantModuleProps {
  agent: Agent;
  onBack: () => void;
  onSaveDispute: (dispute: LegalDispute) => void;
}

export const LegalAssistantModule: React.FC<LegalAssistantModuleProps> = ({ agent, onBack, onSaveDispute }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPersonalData | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{
      role: 'model',
      text: `### Dobrý den, jsem JUDY.
Vaše digitální asistentka pro ochranu spotřebitelských práv. ⚖️

Můžeme začít analýzou vašeho problému. Máte k dispozici **reklamační protokol**, **účtenku** nebo **fakturu**? Můžete je nahrát pomocí ikony sponky.

*Poznámka: Pokud mi udělíte souhlas, mohu z dokumentů automaticky vyčíst vaše osobní údaje a připravit kompletní podklady pro reklamaci.*`,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const currentInput = input;
    const currentAttachments = [...attachments];
    const attachmentNames = currentAttachments.map(f => f.name).join(', ');
    const userMessage = currentInput + (attachmentNames ? `\n\n[Přílohy: ${attachmentNames}]` : '');

    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMessage, 
      timestamp: new Date(),
      attachments: currentAttachments.map(f => URL.createObjectURL(f))
    }]);
    
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const botMsg: Message = { role: 'model', text: '', timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      const systemPrompt = hasConsent 
        ? `${agent.systemInstruction}\nUživatel udělil SOUHLAS se zpracováním osobních údajů. Pokud v textu nebo dokumentech najdeš jméno, adresu, email, telefon, číslo objednávky, prodejce nebo cenu, vypiš je na KONCI své odpovědi v tomto formátu (mimo markdown blok pro model, ale viditelné jako text): EXTRAKCE: {"fullName": "...", "address": "...", "email": "...", "phone": "...", "orderNumber": "...", "purchaseDate": "...", "vendorName": "...", "productName": "...", "price": "..."}`
        : agent.systemInstruction;

      const stream = gemini.streamMessage({ ...agent, systemInstruction: systemPrompt }, history, userMessage);
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1].text = fullText;
          return next;
        });
      }

      // Pokus o extrakci dat z textu odpovědi
      if (hasConsent && fullText.includes('EXTRAKCE:')) {
        try {
          const jsonStr = fullText.split('EXTRAKCE:')[1].trim();
          const data = JSON.parse(jsonStr);
          setExtractedData(prev => ({ ...prev, ...data }));
        } catch (e) {
          console.warn("Chyba při parsování extrahovaných dat", e);
        }
      }

    } catch (error) {
      console.error("Legal Assistant Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeAndSave = () => {
    const newDispute: LegalDispute = {
      id: 'claim-' + Math.random().toString(36).substr(2, 9),
      title: extractedData?.productName ? `Reklamace: ${extractedData.productName}` : 'Právní případ - ' + new Date().toLocaleDateString(),
      date: new Date().toLocaleDateString(),
      status: 'Probíhá',
      attachments: attachments.map(f => ({ name: f.name, url: URL.createObjectURL(f), type: f.type })),
      chatTranscript: messages,
      extractedData: extractedData || undefined,
      consentGiven: hasConsent
    };
    onSaveDispute(newDispute);
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFD] animate-synthesis-in max-w-5xl mx-auto w-full px-4">
      <header className="py-6 border-b border-black/5 flex justify-between items-center bg-[#FBFBFD]/80 backdrop-blur-xl shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-lg active:scale-90 transition-transform">←</button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-[#1D1D1F] text-white">⚖️</div>
            <div>
              <h3 className="text-lg font-black italic leading-none">JUDY Advocate</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] mt-1">Digital Rights Core</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {messages.length > 1 && (
            <button 
              onClick={finalizeAndSave}
              className="h-10 px-6 bg-[#007AFF] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Uložit reklamaci
            </button>
          )}
        </div>
      </header>

      {!hasConsent && (
        <div className="mx-4 my-4 p-6 bg-yellow-50 border border-yellow-100 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🔐</span>
            <p className="text-[10px] font-bold text-yellow-800 leading-tight uppercase tracking-wider">
               Povolte JUDY přístup k osobním údajům pro automatické vyplnění podkladů.
            </p>
          </div>
          <button 
            onClick={() => setHasConsent(true)} 
            className="px-6 py-3 bg-yellow-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all"
          >
            Udělit souhlas
          </button>
        </div>
      )}

      {extractedData && hasConsent && (
        <div className="mx-4 mb-4 p-6 bg-green-50 border border-green-100 rounded-[32px] space-y-3">
          <div className="flex justify-between items-center border-b border-green-200 pb-2">
            <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Extrahovaná data z dokumentů</p>
            <span className="text-xs">✅</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {extractedData.fullName && (
              <div>
                <p className="text-[8px] font-bold text-green-800/40 uppercase">Klient</p>
                <p className="text-[10px] font-black text-green-900">{extractedData.fullName}</p>
              </div>
            )}
            {extractedData.vendorName && (
              <div>
                <p className="text-[8px] font-bold text-green-800/40 uppercase">Prodejce</p>
                <p className="text-[10px] font-black text-green-900">{extractedData.vendorName}</p>
              </div>
            )}
            {extractedData.orderNumber && (
              <div>
                <p className="text-[8px] font-bold text-green-800/40 uppercase">ID Objednávky</p>
                <p className="text-[10px] font-black text-green-900">{extractedData.orderNumber}</p>
              </div>
            )}
            {extractedData.price && (
              <div>
                <p className="text-[8px] font-bold text-green-800/40 uppercase">Částka</p>
                <p className="text-[10px] font-black text-green-900">{extractedData.price}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-8 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[32px] ${m.role === 'user' ? 'bg-[#007AFF] text-white shadow-xl' : 'bg-white border border-black/5 shadow-sm'}`}>
              <div className="prose-synthesis">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text.split('EXTRAKCE:')[0]}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-black/5 px-6 py-3 rounded-full animate-pulse italic text-[11px] font-bold text-black/30">Zpracovávám dokumenty...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-[#FBFBFD] border-t border-black/5 shrink-0 pb-10">
        <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
          <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center text-xl active:scale-90 transition-all">📎</button>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Popište váš právní problém nebo nahrajte účtenku..." 
            className="flex-1 bg-white border border-black/10 rounded-full px-8 py-5 focus:outline-none focus:ring-4 ring-black/5 text-base font-medium shadow-sm transition-all" 
          />
          <button onClick={handleSendMessage} disabled={isLoading} className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-2xl active:scale-90 transition-all">↑</button>
        </div>
      </div>
    </div>
  );
};
