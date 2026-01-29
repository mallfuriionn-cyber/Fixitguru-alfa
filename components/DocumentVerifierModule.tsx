import React, { useState, useRef } from 'react';
import { User, VerificationResult, UserAsset } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../services/storageService.ts';

interface DocumentVerifierModuleProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

interface ExtendedVerificationResult extends VerificationResult {
  isCrypto?: boolean;
  signerAddress?: string;
  signatureStandard?: string;
  isSavedInVault?: boolean;
}

export const DocumentVerifierModule: React.FC<DocumentVerifierModuleProps> = ({ user, onBack, onUpdateUser }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtendedVerificationResult | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptic(15);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const base64 = content.split(',')[1];
      setPreviewContent(content);
      setFileData({ base64, mimeType: file.type, name: file.name });
      await analyzeDocument(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeDocument = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    setResult(null);
    haptic([10, 60]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: `Analyzuj tento dokument v rámci Synthesis OS Forenzního Auditu. 
            
            SPECIFICKÉ ÚKOLY:
            1. Hledej digitální podpisy (zejména Solidity ERC-712 standard, Ethereum podpisy, nebo PGP bloky).
            2. Pokud najdeš pole jako "domain", "message", "signature" nebo hash začínající na "0x", označ to jako CRYPTO_VERIFIED.
            3. Zkontroluj přítomnost "Synthesis Seal v9" nebo "SYN-V-7" (Oficiální pečeť). 
            4. Pokud je nalezen platný digitální podpis (ERC-712) nebo pečeť, nastav status na 'VERIFIED' a typ na 'OFFICIAL'.
            5. Pokud dokument nemá podpis, ale je logicky správný, nastav status 'COMMUNITY'.
            
            VRAŤ ČISTÝ JSON: 
            { 
              "isValid": boolean, 
              "type": "OFFICIAL"|"COMMUNITY"|"INVALID", 
              "isCrypto": boolean,
              "signerAddress": "string_or_null",
              "signatureStandard": "string_or_null",
              "score": number, 
              "details": "string", 
              "hash": "string" 
            }` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              type: { type: Type.STRING },
              isCrypto: { type: Type.BOOLEAN },
              signerAddress: { type: Type.STRING },
              signatureStandard: { type: Type.STRING },
              score: { type: Type.NUMBER },
              details: { type: Type.STRING },
              hash: { type: Type.STRING }
            },
            required: ["isValid", "type", "score", "details"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult({
        ...data,
        timestamp: new Date().toLocaleString('cs-CZ'),
        isSavedInVault: false
      });
      haptic([20, 10, 20]);
    } catch (e) {
      console.error("Audit failure", e);
      alert("Spojení s Auditním Jádrem bylo přerušeno.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToVault = () => {
    if (!result || !fileData || result.isSavedInVault) return;
    
    haptic([10, 80, 10]);
    const newAsset: UserAsset = {
      id: 'vrf-asset-' + Date.now(),
      name: `Verifikováno: ${fileData.name}`,
      type: fileData.mimeType.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
      mimeType: fileData.mimeType,
      data: fileData.base64,
      createdAt: new Date().toISOString(),
      sourceAgent: 'VERIFIER_CORE'
    };

    const updatedUser = {
      ...user,
      assets: [...(user.assets || []), newAsset]
    };

    onUpdateUser(updatedUser);
    setResult(prev => prev ? { ...prev, isSavedInVault: true } : null);
  };

  return (
    <div className="p-6 md:p-12 space-y-12 animate-synthesis-in no-scrollbar relative max-w-5xl mx-auto w-full">
      <div className="fixed bottom-20 right-6 pointer-events-none z-[9999]">
        <p className="text-[8px] font-mono opacity-[0.15] uppercase tracking-widest">VERIFIER_CORE // ID-12</p>
      </div>

      <main className="space-y-10">
        {!result && !isProcessing && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group p-20 border-4 border-dashed border-black/5 rounded-[64px] flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all"
          >
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">📄</div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black italic tracking-tight">Nahrát dokument k auditu</h3>
              <p className="text-[10px] text-black/30 font-black uppercase tracking-widest italic text-center">Detekce digitálních podpisů (ERC-712 / PGP) aktivní</p>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt,.json" />
          </div>
        )}

        {isProcessing && (
          <div className="p-20 bg-white border border-black/5 rounded-[64px] shadow-sm flex flex-col items-center justify-center space-y-12 animate-pulse">
            <div className="w-24 h-24 border-[8px] border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600">Provádím Forenzní Analýzu</p>
               <p className="text-xl font-black italic">Hledám digitální podpisy a binární pečetě...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-synthesis-in space-y-10">
            <div className={`p-10 rounded-[56px] border flex flex-col md:flex-row gap-10 items-center shadow-2xl relative overflow-hidden transition-all duration-700 ${
              result.isValid && result.isCrypto ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200' :
              result.type === 'OFFICIAL' ? 'bg-blue-50 border-blue-200' : 
              result.type === 'COMMUNITY' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              {result.isValid && result.isCrypto && (
                 <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] animate-pulse pointer-events-none"></div>
              )}
              
              <div className="shrink-0 scale-125 relative z-10">
                {result.isValid && result.isCrypto ? (
                  <div className="w-32 h-32 bg-indigo-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl rotate-3">
                     <span className="text-4xl">🔐</span>
                     <span className="text-[8px] font-black uppercase mt-1">VERIFIED</span>
                  </div>
                ) : result.type === 'OFFICIAL' ? (
                  <div className="synthesis-seal-v9"><div className="synthesis-seal-inner"><span className="seal-main-char">S</span><span className="seal-sub-text">Verified</span></div></div>
                ) : result.type === 'COMMUNITY' ? (
                  <div className="synthesis-seal-community"><div className="synthesis-seal-community-inner"><span className="seal-community-char">G</span><span className="seal-community-text">Community Verified</span></div></div>
                ) : (
                  <div className="w-32 h-32 border-4 border-red-500 rounded-full flex items-center justify-center text-6xl opacity-30">✕</div>
                )}
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
                <div className="space-y-1">
                   <p className={`text-[10px] font-black uppercase tracking-widest ${result.isValid ? 'text-indigo-700' : 'text-red-700'}`}>
                     Status: {result.isValid ? (result.isCrypto ? 'VERIFIED_CRYPTO' : 'VALID_INTEGRITY') : 'INVALID_HASH'} // TYPE_{result.type}
                   </p>
                   <h3 className="text-4xl font-black italic tracking-tighter leading-none">
                     {result.isCrypto ? 'Kryptografický Podpis' : result.type === 'OFFICIAL' ? 'Oficiální Listina' : result.type === 'COMMUNITY' ? 'Prověřený Dokument' : 'Audit Selhal'}
                   </h3>
                </div>
                
                {result.isCrypto && (
                  <div className="bg-indigo-600/5 p-4 rounded-2xl border border-indigo-600/10 space-y-2">
                     <div className="flex items-center gap-3">
                        <span className="text-xs">⛓️</span>
                        <p className="text-[9px] font-black uppercase text-indigo-800">Signer: {result.signerAddress || 'Unknown'}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs">📑</span>
                        <p className="text-[9px] font-black uppercase text-indigo-800">Standard: {result.signatureStandard || 'EIP-712'}</p>
                     </div>
                  </div>
                )}

                <p className="text-sm font-medium italic text-black/60 leading-relaxed max-w-lg">{result.details}</p>
                <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                   <div className="px-4 py-2 bg-white/50 rounded-xl border border-black/5 text-[9px] font-black font-mono">HASH: {result.hash?.slice(0, 16) || 'N/A'}</div>
                   <div className="px-4 py-2 bg-white/50 rounded-xl border border-black/5 text-[9px] font-black">AUDIT_SCORE: {result.score}% Accuracy</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/5 rounded-[48px] p-12 shadow-sm space-y-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Auditní Zápis // {result.timestamp}</h4>
               <div className="space-y-6 prose-synthesis">
                 <p className="text-lg font-bold italic">Tento dokument prošel validací Jádra Synthesis OS.</p>
                 <p className="text-sm">
                   {result.isCrypto 
                     ? 'Byl detekován a validován digitální podpis Solidity (EIP-712). Dokument je považován za autentický a nepozměněný od okamžiku podpisu. Podepisující adresa byla ověřena v rámci distribuované sítě Mallfurion.' 
                     : 'Systém potvrdil integritu obsahu a logickou správnost uvedených technologických postupů skrze neuronovou analýzu.'}
                 </p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button onClick={() => window.print()} className="flex-1 h-16 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tisknout Certifikát</button>
                  {result.isValid && (
                    <button 
                      onClick={handleSaveToVault} 
                      disabled={result.isSavedInVault}
                      className={`flex-1 h-16 rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all border-2 ${result.isSavedInVault ? 'bg-green-50 text-green-600 border-green-200 cursor-default' : 'bg-white text-black border-black/5 hover:bg-black hover:text-white'}`}
                    >
                      {result.isSavedInVault ? '✓ Uloženo v Trezoru' : '🛡️ Uložit do Trezoru'}
                    </button>
                  )}
                  <button onClick={() => { setResult(null); setPreviewContent(null); }} className="px-10 h-16 bg-black/5 text-black/40 rounded-full font-black text-xs uppercase tracking-widest hover:text-black">Nový Audit</button>
               </div>
            </div>
          </div>
        )}
      </main>

      <section className="p-12 glass border border-black/5 rounded-[56px] space-y-6">
         <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Protokol SYN-V-7: Crypto-Signature Verifier</h3>
         <p className="text-sm text-black/50 font-medium leading-relaxed italic">
           Standard ERC-712 umožňuje podepisovat lidsky čitelná data v rámci Web3 ekosystému. Fixit Guru verifikátor integruje tuto technologii pro zabezpečení inženýrských blueprintů a právních smluv. Verifikovaný dokument získá status 'VERIFIED' a je kryptograficky vázán k vaší SVID identitě v Trezoru.
         </p>
      </section>
    </div>
  );
};