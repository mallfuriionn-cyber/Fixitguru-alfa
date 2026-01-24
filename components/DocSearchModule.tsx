
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { COPYRIGHT } from '../constants.tsx';
import { getBrowserLanguage, getFullLanguageName } from '../utils/locale.ts';

interface DocSearchModuleProps {
  onBack: () => void;
}

interface SearchResult {
  title: string;
  url: string;
  source: string;
  language?: string;
}

export const DocSearchModule: React.FC<DocSearchModuleProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [labelPhoto, setLabelPhoto] = useState<string | null>(null);
  const [translationText, setTranslationText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locale = getBrowserLanguage();

  const handleSearch = async () => {
    if (!query.trim() && !labelPhoto) return;
    setIsLoading(true);
    setTranslationText(null);

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
      }

      // Vylepšený dotaz pro vyhledávání s preferencí jazyka
      const langHint = locale === 'cs' ? 'český návod, příručka, manual CZ' : 'manual, user guide';
      const searchPrompt = `Najdi oficiální technickou dokumentaci, servisní manuály a schémata pro: ${finalQuery}. 
      Hledej primárně v jazyce: ${getFullLanguageName(locale)}. 
      Pokud nenajdeš kvalitní zdroje v tomto jazyce, hledej v angličtině nebo němčině. 
      Vrať seznam relevantních odkazů.`;

      const searchResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = (searchResponse as any).candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const formattedResults: SearchResult[] = chunks
        .filter((c: any) => c.web)
        .map((c: any) => {
          const title = c.web.title || 'Dokumentace';
          // Jednoduchá heuristika pro detekci jazyka v titulu
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
      alert("Došlo k chybě při vyhledávání dokumentace.");
    } finally {
      setIsLoading(false);
    }
  };

  const translateWithAI = async (res: SearchResult) => {
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Uživatel našel tento technický dokument: ${res.title} (${res.url}). 
      Dokument je pravděpodobně v cizím jazyce. 
      Na základě tvých znalostí o tomto zařízení (${query}) a informací z webu, poskytni stručný přehled nejdůležitějších technických specifikací a bezpečnostních pokynů v češtině. 
      Pokud je to možné, uveď i klíčové kroky pro základní údržbu.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      setTranslationText(response.text || "Nepodařilo se vygenerovat překlad.");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationText("Chyba při komunikaci s AI jádrem pro překlad.");
    } finally {
      setIsTranslating(false);
    }
  };

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
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-10 animate-synthesis-in bg-[#FBFBFD] no-scrollbar">
      <header className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center text-4xl shadow-2xl">📂</div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter italic leading-none text-[#1D1D1F]">Manual Search</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#007AFF] mt-2">Multi-Lang Doc Engine</p>
          </div>
        </div>
      </header>

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
                placeholder="Např. STIHL MS 211, Sony WH-1000XM4..." 
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
            {isLoading ? 'Vyhledávám v Kernelu...' : 'Najít Dokumentaci'}
          </button>
        </div>
      </section>

      {translationText && (
        <section className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] space-y-4 animate-synthesis-in">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">AI Asistence: Překlad & Souhrn</h4>
              <button onClick={() => setTranslationText(null)} className="text-xs font-bold text-[#007AFF]/40">Zavřít</button>
           </div>
           <div className="text-sm font-medium leading-relaxed text-black/70 prose-synthesis">
              {translationText}
           </div>
        </section>
      )}

      {results.length > 0 && (
        <section className="space-y-4 animate-synthesis-in">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Nalezené zdroje</h3>
            {locale === 'cs' && <span className="text-[8px] font-black text-[#007AFF] uppercase">Hledáno: CZ ➔ EN ➔ DE</span>}
          </div>
          <div className="grid gap-3">
            {results.map((res, i) => (
              <div 
                key={i} 
                className="p-6 bg-white border border-black/5 rounded-[32px] flex flex-col gap-4 hover:border-[#007AFF]/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#007AFF]/5 rounded-xl flex items-center justify-center text-xl">
                      {res.language === locale ? '🇨🇿' : '🌐'}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black italic text-base leading-tight group-hover:text-[#007AFF] transition-colors truncate max-w-[200px] md:max-w-md">{res.title}</h4>
                      <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">{res.source}</p>
                    </div>
                  </div>
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">↗</a>
                </div>
                
                {res.language !== locale && (
                  <button 
                    onClick={() => translateWithAI(res)}
                    disabled={isTranslating}
                    className="w-full h-10 bg-[#007AFF]/5 text-[#007AFF] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#007AFF] hover:text-white transition-all disabled:opacity-30"
                  >
                    {isTranslating ? 'Překládám...' : 'Přeložit AI Asistentem'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="p-10 border border-dashed border-black/10 rounded-[48px] text-center space-y-4 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synthesis Intelligence Bridge</p>
        <p className="text-[8px] font-medium leading-relaxed italic">Pokud není návod v češtině, náš model jej analyzuje v původním jazyce a extrahuje pro vás klíčová data.</p>
      </div>

      <button onClick={onBack} className="w-full py-8 glass rounded-[36px] font-black text-xs uppercase tracking-[0.3em] text-black/20 hover:text-black transition-all active:scale-95 shadow-sm">
        Zpět k Terminálu
      </button>

      <footer className="pt-12 text-center pb-20 opacity-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-black">{COPYRIGHT}</p>
      </footer>
    </div>
  );
};
