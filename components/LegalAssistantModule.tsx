import React, { useState, useRef, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, Message, ExtractedPersonalData, LegalDispute, Language, User, UserRole, UserAsset } from '../types.ts';
import { gemini } from '../services/geminiService.ts';
import { db } from '../services/storageService.ts';

interface LegalAssistantModuleProps {
  agent: Agent; lang: Language; onBack: () => void;
  onSaveDispute: (dispute: LegalDispute) => void;
  onUpdateVault: (data: any) => void;
  onShowBio: () => void;
  user: User; initialMessages?: Message[]; activeDispute?: LegalDispute | null;
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

const MemoizedMessage = memo(({ m, user, isLatest, docText, actions, onAction, showVaultConfirmation, onSaveVault, onPreview, onSaveSystem, isSaved }: { 
  m: Message, 
  user: User, 
  isLatest: boolean,
  docText: string | null,
  actions: string[],
  onAction: (text: string) => void,
  showVaultConfirmation: boolean,
  onSaveVault: () => void,
  onPreview: (content: string) => void,
  onSaveSystem: () => void,
  isSaved: boolean
}) => {
  const sanitizeNeuralOutput = (text: string) => {
    if (!text) return "";
    let clean = text.replace(/\[DOKUMENT_START\]/gi, "").replace(/\[DOKUMENT_END\]/gi, "");
    clean = clean.replace(/AKCE\s*:\s*\[.*?\]/gis, "");
    clean = clean.replace(/\*?⚠️.*?dosáhlo limitu.*?okruh.*?\*?/gi, "");
    clean = clean.split(/EXTRAKCE\s*:/i)[0];
    clean = clean.replace(/```json[\s\S]*?```/gi, "").replace(/```markdown/gi, "").replace(/```/gi, "");
    const lines = clean.split('\n');
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const looksLikeHeader = (line.length > 5 && line === line.toUpperCase() && !line.match(/[a-z]/));
      const isFirstSection = line.startsWith('I. ') || line.startsWith('Odesílatel:') || line.startsWith('Adresát:');
      if (looksLikeHeader || isFirstSection) { startIdx = i; break; }
    }
    const finalLines = startIdx === -1 ? lines : lines.slice(startIdx);
    return finalLines.join('\n').replace(/#{1,6}\s/g, "").trim();
  };

  return (
    <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div className={`p-6 rounded-[32px] max-w-[90%] shadow-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white border border-black/5 text-black'}`}>
        <div className="prose-synthesis text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitizeNeuralOutput(m.text)}</ReactMarkdown>
        </div>
        {m.role === 'model' && !!docText && <SynthesisStamp />}
        
        {m.attachments && m.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {m.attachments.map(id => {
              const asset = user.assets?.find(a => a.id === id);
              return asset ? (
                <div key={id} className="px-3 py-1.5 bg-black/10 rounded-xl text-[9px] font-bold border border-black/5 flex items-center gap-2">
                  <span>{asset.type === 'IMAGE' ? '🖼️' : '📄'}</span>
                  <span className="truncate max-w-[120px]">{asset.name}</span>
                </div>
              ) : null;
            })}
          </div>
        )}

        {m.role === 'model' && !isLatest && (
          <div className="mt-8 pt-6 border-t border-black/5 flex flex-col gap-4">
            {docText ? (
              <div className="space-y-3">
                <button onClick={() => onPreview(docText)} className="w-full h-14 bg-[#007AFF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"><span>📄</span> Vygenerovat k tisku</button>
                <button onClick={onSaveSystem} className={`w-full h-11 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40'}`}>{isSaved ? '✓ Uloženo v Jádru' : '📂 Uložit rozpracovaný případ'}</button>
              </div>
            ) : actions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {actions.map((action, idx) => (
                  <button key={idx} onClick={() => onAction(action)} className="px-6 py-4 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#007AFF] transition-all active:scale-95 shadow-md border border-white/10">{action}</button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {m.role === 'model' && isLatest && showVaultConfirmation && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl animate-slide-up space-y-4">
             <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <p className="text-[10px] font-black uppercase text-blue-700 tracking-widest leading-none">Detekována osobní data</p>
             </div>
             <p className="text-[11px] font-bold text-blue-900/60 leading-tight">JUDY extrahovala údaje. Chcete je trvale uložit do svého SVID Trezoru pro budoucí dokumenty?</p>
             <button onClick={onSaveVault} className="w-full h-11 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Uložit do Trezoru</button>
          </div>
        )}
      </div>
    </div>
  );
});

export const LegalAssistantModule: React.FC<LegalAssistantModuleProps> = ({ 
  agent, lang, onBack, onSaveDispute, onUpdateVault, user, activeDispute
}) => {
  const [messages, setMessages] = useState<Message[]>(activeDispute?.chatTranscript || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Synthesis OS provádí neurální analýzu');
  const [isSealing, setIsSealing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [pendingAssets, setPendingAssets] = useState<UserAsset[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedPersonalData | null>(activeDispute?.extractedData || null);
  const [isSaved, setIsSaved] = useState(!!activeDispute);
  const [showVaultConfirmation, setShowVaultConfirmation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        text: `### Dobrý den, jsem JUDY. ⚖️\nJsem vaše digitální advocacy jádro. Vyberte si úkon nebo popište svůj právní spor.`, 
        timestamp: new Date() 
      }]);
    }
  }, [activeDispute]);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const haptic = (p: number | number[] = 15) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const quickActions = [
    { icon: '📦', label: 'Nová Reklamace', prompt: 'Chci uplatnit reklamaci na vadné zboží.' },
    { icon: '🏠', label: 'Sousedský Spor', prompt: 'Mám spor se sousedem ohledně imisí/hluku.' },
    { icon: '📄', label: 'Kontrola SMLOUVY', prompt: 'Potřebuji analyzovat smlouvu a najít rizika.' },
    { icon: '⚖️', label: 'Předžalobní Výzva', prompt: 'Chci sestavit poslední výzvu před žalobou.' }
  ];

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
          sourceAgent: 'JUDY'
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    haptic(10);
  };

  const detectDocumentContent = (text: string): string | null => {
    const match = text.match(/\[DOKUMENT_START\]([\s\S]*?)\[DOKUMENT_END\]/i);
    if (match) return match[1].trim();
    if (text.includes('I.') && text.includes('§') && text.length > 500) return text;
    return null;
  };

  const detectActions = (text: string): string[] => {
    const match = text.match(/AKCE\s*:\s*(\[.*?\])/is);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e) { return []; }
    }
    return [];
  };

  const handleSendMessage = async (forcedText?: string) => {
    const currentInput = forcedText || input;
    const currentAssets = [...pendingAssets];
    if ((!currentInput.trim() && currentAssets.length === 0) || isLoading) return;
    
    setInput('');
    setPendingAssets([]);
    haptic(15);
    
    const status = currentAssets.length > 0 
      ? 'Synthesis OS provádí: Analýzu nahrávky/dokumentu' 
      : forcedText 
        ? `Synthesis OS provádí: ${forcedText}` 
        : 'Synthesis OS provádí: Neurální analýzu dotazu';
    setLoadingStatus(status);

    if (currentAssets.length > 0) {
      const updatedUser = { ...user, assets: [...(user.assets || []), ...currentAssets] };
      db.update('users', user.id, updatedUser);
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      text: currentInput, 
      timestamp: new Date(),
      attachments: currentAssets.map(a => a.id)
    }]);
    
    setIsLoading(true);
    setShowVaultConfirmation(false);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const promptParts: any[] = [];
      if (currentInput) promptParts.push({ text: currentInput });
      currentAssets.forEach(asset => {
        promptParts.push({ inlineData: { mimeType: asset.mimeType, data: asset.data } });
      });

      const stream = gemini.streamMessage(agent, history, promptParts, lang, [{ googleSearch: {} }]);
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
      
      setIsSaved(false); 
      const extraction = fullText.match(/EXTRAKCE\s*:\s*(\{.*\})/is);
      if (extraction) {
        try { 
          const parsed = JSON.parse(extraction[1]);
          setExtractedData(prev => ({...prev, ...parsed})); 
          setShowVaultConfirmation(true);
        } catch(e) { console.warn("Extraction failed."); }
      }
    } catch (err) {
      console.error("Judy Kernel Error:", err);
    } finally { setIsLoading(false); }
  };

  const handleSaveToVault = () => {
    if (extractedData) {
      onUpdateVault(extractedData);
      setShowVaultConfirmation(false);
      haptic([10, 50]);
    }
  };

  const handleSaveToSystem = () => {
    const disputeId = activeDispute?.id || 'disp-' + Date.now();
    const dispute: LegalDispute = {
      id: disputeId,
      title: extractedData?.documentType || (extractedData?.productName ? `Reklamace: ${extractedData.productName}` : 'Právní případ'),
      date: activeDispute?.date || new Date().toLocaleDateString('cs-CZ'),
      status: 'Aktivní',
      attachments: [],
      chatTranscript: messages,
      extractedData: extractedData || undefined
    };
    onSaveDispute(dispute);
    setIsSaved(true);
    haptic(10);
  };

  const generateLuxuryPDF = async (rawContent: string) => {
    const cleanContent = rawContent.replace(/\[DOKUMENT_START\]/gi, "").replace(/\[DOKUMENT_END\]/gi, "").trim();
    if (!cleanContent) return;
    haptic([15, 60, 15]);
    setIsSealing(true);
    setLoadingStatus('Synthesis OS provádí: Generování Luxury PDF');
    handleSaveToSystem();
    const matrice = document.getElementById('print-matrice');
    if (!matrice) return;
    const isVerified = user?.role === UserRole.ARCHITECT || (user?.virtualDocument?.isVerified && !user?.privacyDelay);
    const lines = cleanContent.split('\n').filter(l => l.trim());
    const docTitle = lines[0]?.toUpperCase() || "PRÁVNÍ LISTINA";
    const paragraphs = lines.slice(1).map(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[IVX]+\./)) return `<h2 style="font-family: 'Inter', sans-serif; font-weight: 900; text-transform: uppercase; margin-top: 30pt; margin-bottom: 15pt; font-size: 12pt; border-bottom: 1pt solid #000; padding-bottom: 5pt;">${trimmed}</h2>`;
      if (trimmed.includes('§')) return `<div style="margin: 15pt 30pt; padding: 15pt 25pt; border-left: 3pt solid #007AFF; font-style: italic; background: #f9f9f9; font-size: 11pt;">${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      return `<p style="margin-bottom: 1.5em; text-align: justify; text-indent: 15pt;">${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }).join('');
    matrice.innerHTML = `
      <div style="padding: 25mm; min-height: 297mm; display: flex; flex-direction: column; background: white; font-family: 'Libre Baskerville', serif;">
        <header class="legal-header-block">
          <div style="max-width: 45%;">
            <p style="font-weight: 900; text-transform: uppercase; color: #007AFF; margin-bottom: 4pt; letter-spacing: 1.2pt;">Odesílatel</p>
            <p style="font-weight: 800; font-size: 11pt; margin: 0;">${user?.name || 'Subjekt Synthesis'}</p>
            <p style="margin: 2pt 0; opacity: 0.8;">${extractedData?.address || user?.email || ''}</p>
          </div>
          <div style="text-align: right; max-width: 45%;">
            <p style="font-weight: 900; text-transform: uppercase; color: #111; margin-bottom: 4pt; letter-spacing: 1.2pt;">Adresát</p>
            <p style="font-weight: 800; font-size: 11pt; margin: 0;">${extractedData?.opponentName || '[Jméno adresáta]'}</p>
            <p style="margin: 2pt 0; opacity: 0.8;">${extractedData?.opponentAddress || '[Adresa adresáta]'}</p>
          </div>
        </header>
        <div style="text-align: right; margin-bottom: 40pt; font-family: 'Inter', sans-serif; font-size: 10pt; font-weight: 600;">Dne ${new Date().toLocaleDateString('cs-CZ')}</div>
        <div class="legal-matrice-header"><h1>${docTitle}</h1></div>
        <main class="legal-body" style="flex: 1; line-height: 1.8;">${paragraphs}</main>
        <div class="signature-section"><div class="signature-line">Vlastnoruční podpis</div></div>
        <footer style="margin-top: 50pt; padding-top: 20pt; border-top: 0.5pt solid #ddd; display: flex; justify-content: space-between; align-items: flex-end;">
           <div style="font-family: 'Inter', sans-serif; font-size: 7.5pt; color: #666; font-style: italic;">Vygenerováno systémem JUDY Core Alpha.</div>
           ${isVerified ? `<div class="synthesis-seal-v9"><div class="synthesis-seal-inner"><span class="seal-main-char">S</span><span class="seal-sub-text">Verified</span></div></div>` : ''}
        </footer>
      </div>
    `;
    setTimeout(() => { window.print(); setIsSealing(false); matrice.innerHTML = ""; }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] overflow-hidden animate-synthesis-in w-full relative">
      <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
        <p className="text-[8px] font-mono opacity-[0.15] uppercase tracking-widest">ADVOCACY_JUDY // ID-03</p>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-3xl flex flex-col items-center animate-fluent-in">
           <header className="w-full h-20 px-8 flex items-center justify-between bg-white/10 shrink-0">
              <h4 className="text-white font-black italic uppercase">System Preview</h4>
              <div className="flex gap-3">
                 <button onClick={() => { setIsPreviewOpen(false); generateLuxuryPDF(previewContent); }} className="h-10 px-6 bg-[#007AFF] text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">Tisknout PDF</button>
                 <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">✕</button>
              </div>
           </header>
           <div className="flex-1 w-full overflow-y-auto p-10 no-scrollbar">
              <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-20 min-h-[297mm]">
                 <div className="prose-synthesis whitespace-pre-wrap font-serif" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    {previewContent.replace(/\[DOKUMENT_START\]/gi, "").replace(/\[DOKUMENT_END\]/gi, "").trim()}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {messages.map((m, i) => {
          const docText = detectDocumentContent(m.text);
          const actions = detectActions(m.text);
          
          return (
            <MemoizedMessage 
              key={`${i}-${m.timestamp.getTime()}`}
              m={m}
              user={user}
              isLatest={i === messages.length - 1}
              docText={docText}
              actions={actions}
              onAction={(action) => handleSendMessage(action)}
              showVaultConfirmation={showVaultConfirmation}
              onSaveVault={handleSaveToVault}
              onPreview={(content) => { setPreviewContent(content); setIsPreviewOpen(true); haptic(5); }}
              onSaveSystem={handleSaveToSystem}
              isSaved={isSaved}
            />
          );
        })}

        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 animate-synthesis-in">
            {quickActions.map(action => (
              <button 
                key={action.label} 
                onClick={() => handleSendMessage(action.prompt)}
                className="p-5 bg-white border border-black/5 rounded-[24px] flex items-center gap-4 hover:bg-black hover:text-white transition-all text-left group shadow-sm"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-40 group-hover:opacity-60">JUDY: Action</p>
                  <p className="text-xs font-black italic tracking-tight">{action.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-[#007AFF] rounded-full"></div>
              <div className="w-2 h-2 bg-[#007AFF] rounded-full [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-[#007AFF] rounded-full [animation-delay:0.4s]"></div>
            </div>
            <p className="font-black text-[10px] uppercase text-[#007AFF] tracking-widest">{loadingStatus}...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-black/5 bg-white pb-8 shrink-0">
        <div className="max-w-3xl mx-auto w-full space-y-3">
          {pendingAssets.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {pendingAssets.map((asset, idx) => (
                <div key={idx} className="bg-[#F2F2F7] px-3 py-2.5 rounded-xl text-[10px] font-black border border-black/5 flex items-center gap-3 shadow-sm">
                  <span>{asset.type === 'IMAGE' ? '🖼️' : '📄'}</span>
                  <span className="truncate max-w-[120px]">{asset.name}</span>
                  <button onClick={() => setPendingAssets(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-sm">✕</button>
                </div>
              ))}
              <button onClick={() => handleSendMessage("Prosím proveď analýzu těchto dokumentů.")} className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">Spustit Analýzu</button>
            </div>
          )}
          <div className="flex gap-2">
             <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center text-xl hover:bg-black/10 transition-colors active:scale-90">📎</button>
             <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
             <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Popište situaci nebo nahrajte důkaz..." className="flex-1 h-14 bg-[#F2F2F7] rounded-full px-6 outline-none font-bold text-sm shadow-inner" />
             <button onClick={() => handleSendMessage()} disabled={(!input.trim() && pendingAssets.length === 0) || isLoading} className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-20 transition-all shrink-0"><span className="text-xl">↑</span></button>
          </div>
        </div>
      </footer>
      {isSealing && <div className="fixed inset-0 z-[10000] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-6 animate-fluent-in"><div className="w-20 h-20 border-[6px] border-black/5 border-t-[#007AFF] rounded-full animate-spin"></div><p className="font-black text-xs uppercase tracking-[0.5em] animate-pulse text-[#007AFF]">{loadingStatus}...</p></div>}
    </div>
  );
};