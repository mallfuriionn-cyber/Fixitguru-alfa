import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI, Type } from "@google/genai";
import { COPYRIGHT } from '../constants.tsx';
import { SavedManual } from '../types.ts';
import { db } from '../services/storageService.ts';
import { getBrowserLanguage, getFullLanguageName } from '../utils/locale.ts';

interface SearchResult {
  title: string;
  url: string;
  source: string;
  language?: string;
}

interface DocSearchModuleProps {
  onBack: () => void;
}

type SearchTab = 'SEARCH' | 'ARCHIVE';

const SynthesisStamp = () => {
  const handleOpenInfo = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    window.dispatchEvent(new CustomEvent('synthesis:open-info', { detail: 'verification-info' }));
  };

  return (
    <button 
      onClick={handleOpenInfo}
      className="synthesis-stamp-ui flex items-center gap-3 py-6 mt-8 border-t border-black/5 opacity-40 select-none scale-90 origin-left hover:opacity-100 transition-all group text-left cursor-pointer"
    >
      <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center font-black italic text-sm shadow-lg group-hover:scale-110 transition-transform">S</div>
      <div className="flex flex-col">
         <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Verified Logic</span>
         <span className="text-[7px] font-bold uppercase tracking-widest text-[#007AFF] mt-1">Synthesis Workshop Core v2.6 // Info</span>
      </div>
    </button>
  );
};

export const DocSearchModule: React.FC<DocSearchModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<SearchTab>('SEARCH');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [labelPhoto, setLabelPhoto] = useState<string | null>(null);
  const [translationData, setTranslationData] = useState<{ translated: string; original: string; brand?: string; model?: string; category?: string; url?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'translated' | 'original'>('translated');
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedManuals, setSavedManuals] = useState<SavedManual[]>(db.getAll('manuals'));
  const [selectedArchiveManual, setSelectedArchiveManual] = useState<SavedManual | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locale = getBrowserLanguage();

  useEffect(() => {
    const handleUpdate = () => setSavedManuals(db.getAll('manuals'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const haptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handleSearch = async () => {
    if (!query.trim() && !labelPhoto) return;
    haptic(15);
    setIsLoading(true);
    setTranslationData(null);
    setSelectedArchiveManual(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let finalQuery = query;

      if (labelPhoto) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: labelPhoto.split(',')[1] } },
              { text: "Identifikuj zařízení z tohoto štítku. Vrať pouze značku a přesný model pro vyhledávání servisního manuálu. Nic jiného." }
            ]
          }
        });
        finalQuery = response.text || query;
        setQuery(finalQuery);
        
        window.dispatchEvent(new CustomEvent('synthesis:CONTEXT_UPDATE', { 
          detail: { activeDeviceName: finalQuery, activeDeviceId: 'dev-' + Date.now() } 
        }));
      }

      const langHint = locale === 'cs' ? 'český návod, příručka, manual CZ' : 'manual, user guide';
      const searchPrompt = `Najdi oficiální technickou dokumentaci, servisní manuály a schémata pro: ${finalQuery}. 
      Hledej primárně v jazyce: ${getFullLanguageName(locale)}. 
      Vrať seznam relevantních odkazů.`;

      const searchResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = ((searchResponse as any).candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];
      const formattedResults: SearchResult[] = chunks
        .filter((c: any) => c && c.web)
        .map((c: any) => {
          const title = c.web.title || 'Dokumentace';
          const isLocal = title.toLowerCase().includes('český') || title.toLowerCase().includes('návod') || title.toLowerCase().includes('příručka');
          return {
            title,
            url: c.web.uri,
            source: new URL(c.web.uri).hostname,
            language: isLocal ? locale : 'en'
          };
        });

      setResults(formattedResults.length > 0 ? formattedResults : [
        { title: `Hledat ${finalQuery} na Google`, url: `https://www.google.com/search?q=${encodeURIComponent(finalQuery + " " + langHint + " pdf")}`, source: 'External Search' }
      ]);

    } catch (error) {
      console.error("Doc Search Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const translateWithAI = async (res: SearchResult) => {
    haptic(10);
    setIsTranslating(true);
    setTranslationData(null);
    setViewMode('translated');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Uživatel našel tento technický dokument: ${res.title} (${res.url}). 
      Analyzuj tento zdroj a poskytni technický souhrn. 
      Vrať odpověď v JSON formátu s těmito klíči:
      - "brand": Značka zařízení
      - "model": Přesný model zařízení
      - "category": Kategorie (např. Zahradní technika, Elektronika, Domácí spotřebiče, Audio/Video, Ostatní)
      - "original": Technický souhrn v původním jazyce dokumentu.
      - "translated": Přesný překlad do češtiny.
      Obě textové verze musí být IDENTICKY formátované pomocí markdownu.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              model: { type: Type.STRING },
              category: { type: Type.STRING },
              original: { type: Type.STRING },
              translated: { type: Type.STRING }
            },
            required: ["original", "translated", "category", "brand", "model"]
          }
        }
      });
      
      const responseText = response.text || "{}";
      const data = JSON.parse(responseText);
      setTranslationData({ ...data, url: res.url });
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveToArchive = () => {
    if (!translationData) return;
    haptic([10, 30, 10]);
    
    const newManual: SavedManual = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${translationData.brand} ${translationData.model}`,
      brand: translationData.brand || 'Neznámá značka',
      model: translationData.model || 'Neznámý model',
      category: translationData.category || 'Ostatní',
      originalText: translationData.original,
      translatedText: translationData.translated,
      sourceUrl: translationData.url || '',
      dateAdded: new Date().toLocaleDateString('cs-CZ')
    };

    db.insert('manuals', newManual);
    setTranslationData(null);
    setActiveTab('ARCHIVE');
  };

  const handleDeleteFromArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Opravdu chcete tento manuál odstranit z archivu?")) return;
    db.delete('manuals', id);
    if (selectedArchiveManual?.id === id) setSelectedArchiveManual(null);
    haptic(20);
  };

  const getGroupedManuals = (): Record<string, SavedManual[]> => {
    const groups: Record<string, SavedManual[]> = {};
    savedManuals.forEach(m => {
      const cat = m.category || 'Ostatní';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(m);
    });
    return groups;
  };

  const groupedManuals = getGroupedManuals();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabelPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-10 animate-synthesis-in no-scrollbar">
        <nav className="flex bg-black/5 p-1 rounded-3xl w-full">
          <button 
            onClick={() => { setActiveTab('SEARCH'); setSelectedArchiveManual(null); }}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SEARCH' ? 'bg-white text-black shadow-md' : 'text-black/30 hover:text-black'}`}
          >
            🔍 Vyhledávač
          </button>
          <button 
            onClick={() => { setActiveTab('ARCHIVE'); setSelectedArchiveManual(null); }}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ARCHIVE' ? 'bg-white text-black shadow-md' : 'text-black/30 hover:text-black'}`}
          >
            📚 Archiv ({savedManuals.length})
          </button>
        </nav>

        {activeTab === 'SEARCH' ? (
          <>
            <section className="space-y-6">
              <div className="bg-white border border-black/5 rounded-[48px] p-8 shadow-sm space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30 px-4">Model nebo foto štítku</p>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="STIHL MS 211, Sony WH-1000XM4..." 
                      className="flex-1 h-16 bg-[#FBFBFD] border border-black/5 rounded-2xl px-6 outline-none font-bold text-lg"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${labelPhoto ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40'}`}
                    >
                      {labelPhoto ? '📸' : '📷'}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full h-16 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-20"
                >
                  {isLoading ? 'Vyhledávám...' : 'Najít Dokumentaci'}
                </button>
              </div>
            </section>

            {isTranslating && (
              <div className="p-10 bg-blue-50 border border-blue-100 rounded-[40px] animate-pulse flex flex-col items-center justify-center gap-4">
                 <div className="w-10 h-10 border-4 border-[#007AFF]/20 border-t-[#007AFF] rounded-full animate-spin"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">Analýza Synthesis AI...</p>
              </div>
            )}

            {translationData && (
              <section className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] space-y-6 animate-synthesis-in relative overflow-hidden shadow-lg">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse"></span>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">AI Asistence: {translationData.brand} {translationData.model}</h4>
                    </div>
                    
                    <div className="flex bg-black/5 p-1 rounded-2xl shrink-0">
                       <button onClick={() => setViewMode('translated')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'translated' ? 'bg-[#007AFF] text-white shadow-md' : 'text-black/30'}`}>🇨🇿 CZ</button>
                       <button onClick={() => setViewMode('original')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'original' ? 'bg-[#1D1D1F] text-white shadow-md' : 'text-black/30'}`}>🌐 ORIG</button>
                    </div>
                 </div>

                 <div className="prose-synthesis relative z-10 text-sm font-medium p-6 bg-white/70 backdrop-blur rounded-[32px] border border-white shadow-inner max-h-[500px] overflow-y-auto no-scrollbar">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {viewMode === 'translated' ? translationData.translated : translationData.original}
                    </ReactMarkdown>
                 </div>

                 <div className="pt-6 relative z-10 flex gap-4">
                    <button 
                      onClick={handleSaveToArchive}
                      className="flex-1 h-14 bg-[#007AFF] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      Uložit do Archivu
                    </button>
                    <button onClick={() => setTranslationData(null)} className="h-14 px-8 glass rounded-2xl text-[9px] font-black uppercase tracking-widest text-black/30">Zavřít</button>
                 </div>
              </section>
            )}

            {results.length > 0 && (
              <section className="space-y-4 animate-synthesis-in">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 px-4">Výsledky hledání</h3>
                <div className="grid gap-3">
                  {results.map((res, i) => (
                    <div key={i} className="p-6 bg-white border border-black/5 rounded-[32px] flex flex-col gap-4 hover:border-[#007AFF]/30 transition-all group shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-xl">
                            {res.language === locale ? '🇨🇿' : '🌐'}
                          </div>
                          <div>
                            <h4 className="font-black italic text-base leading-tight truncate max-w-[200px]">{res.title}</h4>
                            <p className="text-[9px] font-bold text-black/30 uppercase mt-1">{res.source}</p>
                          </div>
                        </div>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">↗</a>
                      </div>
                      <button onClick={() => translateWithAI(res)} disabled={isTranslating} className="w-full h-10 bg-[#007AFF]/5 text-[#007AFF] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#007AFF] hover:text-white transition-all">
                        Analyzovat AI
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="space-y-12 animate-synthesis-in">
            {selectedArchiveManual ? (
              <div className="space-y-8 animate-synthesis-in">
                 <button onClick={() => setSelectedArchiveManual(null)} className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] flex items-center gap-2">← Zpět do archivu</button>
                 
                 <div className="p-10 bg-white border border-black/5 rounded-[56px] space-y-8 shadow-sm relative overflow-hidden">
                    <header className="space-y-4 relative z-10 border-b border-black/5 pb-8">
                       <div className="flex items-center justify-between">
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedArchiveManual.brand === 'Vlastní' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-black/5 text-black/40'}`}>
                             {selectedArchiveManual.category}
                          </span>
                          <div className="flex bg-black/5 p-1 rounded-2xl">
                             <button onClick={() => setViewMode('translated')} className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'translated' ? 'bg-[#007AFF] text-white shadow-md' : 'text-black/30'}`}>CZ</button>
                             <button onClick={() => setViewMode('original')} className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'original' ? 'bg-black text-white shadow-md' : 'text-black/30'}`}>ORIG</button>
                          </div>
                       </div>
                       <h3 className="text-3xl font-black italic tracking-tighter">
                          {selectedArchiveManual.brand !== 'Vlastní' && selectedArchiveManual.brand} {selectedArchiveManual.model}
                       </h3>
                    </header>

                    <div className="prose-synthesis relative z-10 text-sm leading-relaxed max-h-[60vh] overflow-y-auto no-scrollbar">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {viewMode === 'translated' ? selectedArchiveManual.translatedText : selectedArchiveManual.originalText}
                       </ReactMarkdown>
                       {selectedArchiveManual.brand === 'Vlastní' && <SynthesisStamp />}
                    </div>

                    <footer className="pt-8 border-t border-black/5 relative z-10 flex justify-between items-center">
                       {selectedArchiveManual.sourceUrl !== 'Synthesis Workshop' ? (
                          <a href={selectedArchiveManual.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] hover:underline">Původní zdroj ↗</a>
                       ) : (
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 italic">Vytováno v Synthesis Workshop</p>
                       )}
                       <button onClick={(e) => handleDeleteFromArchive(selectedArchiveManual.id, e)} className="text-[9px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500">Smazat</button>
                    </footer>
                 </div>
              </div>
            ) : (
              <>
                {Object.keys(groupedManuals).length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed border-black/5 rounded-[56px] space-y-4">
                    <span className="text-6xl grayscale opacity-20">📚</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Archiv je prázdný.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {Object.entries(groupedManuals).map(([category, manuals]) => (
                      <div key={category} className="space-y-6">
                        <div className="flex items-center gap-4 px-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 whitespace-nowrap">{category}</h4>
                          <div className="h-px bg-black/5 w-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {manuals.map(manual => (
                            <button 
                              key={manual.id}
                              onClick={() => setSelectedArchiveManual(manual)}
                              className={`p-8 bg-white border rounded-[44px] text-left hover:shadow-xl transition-all group flex flex-col justify-between h-48 relative shadow-sm ${manual.brand === 'Vlastní' ? 'border-emerald-500/20' : 'border-black/5'}`}
                            >
                              {manual.brand === 'Vlastní' && (
                                <div className="absolute top-0 right-0 p-6">
                                   <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 rounded">Vlastní postup</span>
                                </div>
                              )}
                              <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-black/20">{manual.brand}</p>
                                <h5 className={`text-xl font-black italic tracking-tighter ${manual.brand === 'Vlastní' ? 'text-emerald-700' : 'group-hover:text-[#007AFF]'}`}>{manual.model}</h5>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-black/30 uppercase">{manual.dateAdded}</span>
                                <span className="text-xs font-black">ČÍST →</span>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteFromArchive(manual.id, e)}
                                className="absolute bottom-6 right-8 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500/30 hover:text-red-500"
                              >✕</button>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <footer className="pt-12 text-center pb-20 opacity-10">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-black">{COPYRIGHT}</p>
        </footer>
    </div>
  );
};