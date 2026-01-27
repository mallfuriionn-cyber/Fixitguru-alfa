
import React, { useState, useRef } from 'react';
import { User, UserRole, VirtualDocument, EncryptedVaultData } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { see } from '../services/encryptionService.ts';

interface DetailedRegistrationProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
}

type DocumentType = 'ID_CARD' | 'PASSPORT';
type EntryMode = 'SCAN' | 'MANUAL' | 'ANONYMOUS';

export const DetailedRegistration: React.FC<DetailedRegistrationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('ID_CARD');
  const [entryMode, setEntryMode] = useState<EntryMode>('SCAN');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [scans, setScans] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    titles: '',
    username: '',
    email: '',
    phone: '',
    jurisdiction: 'Česká republika (NOZ 2026)',
    specialization: '',
    wallet: '0x' + Math.random().toString(16).substr(2, 40),
    avatar: '👤',
    mandateAccepted: false,
    idCardLinked: false,
    idNumber: '',
    birthDate: '',
    address: '',
    docExpiry: '',
    docAuthority: ''
  });

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const haptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handleNext = () => {
    haptic(5);
    setStep(s => s + 1);
  };
  
  const handleBack = () => {
    haptic(5);
    setStep(s => s - 1);
  };

  const handleFileUpload = (side: 'front' | 'back', file: File) => {
    haptic(10);
    const reader = new FileReader();
    reader.onload = () => {
      setScans(prev => ({ ...prev, [side]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const processDocument = async () => {
    if (docType === 'ID_CARD' && (!scans.front || !scans.back)) return;
    if (docType === 'PASSPORT' && !scans.front) return;

    haptic([10, 50]);
    setIsOCRProcessing(true);

    try {
      const parts: any[] = [];
      if (scans.front) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: scans.front.split(',')[1] } });
      }
      if (scans.back && docType === 'ID_CARD') {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: scans.back.split(',')[1] } });
      }

      parts.push({ 
        text: `Analyzuj tento ${docType === 'ID_CARD' ? 'občanský průkaz' : 'cestovní pas'}. 
        Extrahuje data a vrať ČISTÝ JSON. Pole: firstName, lastName, idNumber, birthDate, address, docExpiry, docAuthority. 
        Jména piš s diakritikou.` 
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              idNumber: { type: Type.STRING },
              birthDate: { type: Type.STRING },
              address: { type: Type.STRING },
              docExpiry: { type: Type.STRING },
              docAuthority: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      setFormData(prev => ({
        ...prev,
        firstName: result.firstName || prev.firstName,
        lastName: result.lastName || prev.lastName,
        idNumber: result.idNumber || '',
        birthDate: result.birthDate || '',
        address: result.address || '',
        docExpiry: result.docExpiry || '',
        docAuthority: result.docAuthority || '',
        idCardLinked: true
      }));

      haptic([20, 10, 20]);
    } catch (error) {
      console.error("AI OCR Error:", error);
      alert("Analýza dokladu selhala.");
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const finalize = async () => {
    haptic([10, 60, 10]);
    setIsOCRProcessing(true);

    const secretId = 'SID-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const hID = 'HW-' + Math.random().toString(36).substr(2, 12).toUpperCase();
    
    const isAnon = entryMode === 'ANONYMOUS';

    const fullDocData = isAnon ? {} : {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      idNumber: formData.idNumber,
      birthDate: formData.birthDate,
      docExpiry: formData.docExpiry,
      docAuthority: formData.docAuthority,
      docType: docType,
      verificationType: entryMode === 'SCAN' ? 'NEURAL_OCR' : 'MANUAL_DECLARED'
    };

    const encryptedDocData = !isAnon ? await see.encryptVault(fullDocData, secretId) : {};
    
    const virtualDoc: VirtualDocument = {
      id: 'SVID-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      docType: docType,
      data: encryptedDocData as any,
      isVerified: !isAnon,
      createdAt: new Date().toISOString()
    };

    onComplete({
      id: 'u-' + Date.now(),
      secretId: secretId,
      virtualHash: 'HASH-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      hardwareId: hID,
      email: formData.email || (isAnon ? 'anonymous@synthesis.os' : ''),
      username: formData.username || (formData.lastName ? formData.lastName.toLowerCase() : 'guru_' + Math.floor(Math.random()*1000)),
      name: isAnon ? 'Anonymní Guru' : `${formData.firstName} ${formData.lastName}`,
      role: UserRole.SUBJECT,
      level: 1,
      avatar: isAnon ? '🕶️' : formData.avatar,
      registrationDate: new Date().toLocaleDateString(),
      lastLogin: 'Právě teď',
      mandateAccepted: formData.mandateAccepted,
      jurisdiction: formData.jurisdiction,
      walletAddress: formData.wallet,
      security: {
        method: 'PASSKEY_HARDWARE',
        level: isAnon ? 'Základní' : 'Vysoká',
        hardwareHandshake: true,
        biometricStatus: isAnon ? 'INACTIVE' : 'ACTIVE',
        lastAuthAt: new Date().toISOString(),
        encryptionType: 'AES-256-GCM',
        integrityScore: isAnon ? 0 : (entryMode === 'SCAN' ? 95 : 80)
      },
      stats: { repairs: 0, growing: 0, success: '0%', publishedPosts: 0 },
      equipment: [],
      specialization: formData.specialization.split(',').map(s => s.trim()).filter(Boolean),
      virtualDocument: virtualDoc,
      vaultData: encryptedDocData as any,
      auditLogs: [{ id: 'a1', timestamp: new Date().toISOString(), action: `SVID Created via ${entryMode}`, actorId: 'SYSTEM', category: 'SECURITY', severity: 'LOW' }]
    });
  };

  const isFormValid = () => {
    if (entryMode === 'ANONYMOUS') return true;
    if (step === 1 && entryMode === 'MANUAL') {
        return formData.firstName && formData.lastName && formData.idNumber && formData.docExpiry;
    }
    return true;
  };

  const toggleHandshake = () => {
    haptic(10);
    setFormData(prev => ({ ...prev, mandateAccepted: !prev.mandateAccepted }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FBFBFD] overflow-y-auto px-6 py-12 animate-synthesis-in no-scrollbar pb-32 relative">
      {/* SVID INFO OVERLAY */}
      {showInfo && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6 animate-synthesis-in">
          <div className="max-w-md w-full bg-white rounded-[56px] shadow-2xl border border-black/5 overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-10 border-b border-black/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Protokol Bezpečnosti</p>
                <h3 className="text-3xl font-black italic tracking-tighter">Proč SVID?</h3>
              </div>
              <button onClick={() => setShowInfo(false)} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">✕</button>
            </header>
            <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🛡️</div>
                <h4 className="text-lg font-black italic">Absolutní Soukromí</h4>
                <p className="text-sm text-black/50 leading-relaxed font-medium">
                  Nemusíte se bát odcizení dokladů. Vaše data <strong>nejsou uložena na žádném centrálním serveru</strong> v čitelné podobě. Vše je šifrováno přímo na vašem zařízení.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                <h4 className="text-lg font-black italic">Anonymní Režim</h4>
                <p className="text-sm text-black/50 leading-relaxed font-medium">
                  Pokud údaje neuvedete, JUDY ponechá v dokumentech prázdná místa `[...]`, která dopíšete propiskou. Dokument však neponese modrou pečeť Synthesis.
                </p>
              </div>
            </div>
            <footer className="p-8 bg-[#FBFBFD] border-t border-black/5">
              <button onClick={() => setShowInfo(false)} className="w-full h-14 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Rozumím</button>
            </footer>
          </div>
        </div>
      )}

      <header className="max-w-xl mx-auto w-full mb-12 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black text-xs">S</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">SVID Protocol v4.5</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowInfo(true); haptic(5); }} className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] hover:underline">Informace o SVID</button>
            <button onClick={onCancel} className="text-black/20 hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest">Zrušit</button>
          </div>
        </div>
        <h2 className="text-5xl font-black tracking-tighter italic text-[#1D1D1F]">Virtuální Identita</h2>
        
        <div className="flex bg-black/5 p-1 rounded-2xl w-full">
           <button 
            onClick={() => { setEntryMode('SCAN'); haptic(5); }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${entryMode === 'SCAN' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}
           >
            Neurální Sken
           </button>
           <button 
            onClick={() => { setEntryMode('MANUAL'); haptic(5); }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${entryMode === 'MANUAL' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}
           >
            Ruční Zadání
           </button>
           <button 
            onClick={() => { setEntryMode('ANONYMOUS'); haptic(5); }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${entryMode === 'ANONYMOUS' ? 'bg-[#007AFF] text-white shadow-sm' : 'text-black/30'}`}
           >
            Anonym
           </button>
        </div>

        <div className="flex gap-2 pt-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-black/5'}`} />
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-8 animate-synthesis-in">
            {entryMode === 'SCAN' && (
              <>
                <div className="flex bg-black/5 p-1 rounded-2xl w-full">
                  <button onClick={() => setDocType('ID_CARD')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'ID_CARD' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}>Občanský Průkaz</button>
                  <button onClick={() => setDocType('PASSPORT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docType === 'PASSPORT' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}>Cestovní Pas</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative p-1 bg-white border border-black/5 rounded-[40px] shadow-sm overflow-hidden group min-h-[220px]">
                    {scans.front ? (
                      <img src={scans.front} className="w-full h-full object-cover rounded-[36px]" alt="front" />
                    ) : (
                      <button onClick={() => fileInputFrontRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center space-y-4 hover:bg-black/[0.02] transition-colors rounded-[36px]">
                          <div className="w-16 h-16 bg-[#F2F2F7] rounded-[24px] flex items-center justify-center text-3xl shadow-inner border border-black/5">📸</div>
                          <h4 className="text-sm font-black italic">{docType === 'ID_CARD' ? 'Přední strana' : 'Stránka s údaji'}</h4>
                      </button>
                    )}
                    <input type="file" ref={fileInputFrontRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])} />
                  </div>

                  {docType === 'ID_CARD' && (
                    <div className="relative p-1 bg-white border border-black/5 rounded-[40px] shadow-sm overflow-hidden group min-h-[220px]">
                      {scans.back ? (
                        <img src={scans.back} className="w-full h-full object-cover rounded-[36px]" alt="back" />
                      ) : (
                        <button onClick={() => fileInputBackRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center space-y-4 hover:bg-black/[0.02] transition-colors rounded-[36px]">
                            <div className="w-16 h-16 bg-[#F2F2F7] rounded-[24px] flex items-center justify-center text-3xl shadow-inner border border-black/5">📸</div>
                            <h4 className="text-sm font-black italic">Zadní strana</h4>
                        </button>
                      )}
                      <input type="file" ref={fileInputBackRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])} />
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {!formData.idCardLinked && (
                    <button onClick={processDocument} disabled={isOCRProcessing || (docType === 'ID_CARD' && (!scans.front || !scans.back))} className="w-full h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                      {isOCRProcessing ? 'Neurální analýza...' : 'Skenovat a Analyzovat'}
                    </button>
                  )}
                </div>
              </>
            )}

            {entryMode === 'ANONYMOUS' && (
              <div className="p-10 bg-white border-2 border-dashed border-[#007AFF]/20 rounded-[48px] space-y-8 animate-synthesis-in">
                 <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl shadow-sm">🛡️</div>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black italic tracking-tighter">Protokol Soukromí</h3>
                    <p className="text-sm text-black/50 leading-relaxed font-medium">
                       Rozhodli jste se nesdílet své dokumenty ani osobní údaje. 
                    </p>
                    <ul className="space-y-3">
                       <li className="flex items-center gap-3 text-[10px] font-bold text-black/60 uppercase italic">
                          <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></span>
                          Žádná data v Matrixu
                       </li>
                       <li className="flex items-center gap-3 text-[10px] font-bold text-black/60 uppercase italic">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Šablony k ručnímu dopsání
                       </li>
                       <li className="flex items-center gap-3 text-[10px] font-bold text-black/60 uppercase italic">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Bez Synthesis razítka integrity
                       </li>
                    </ul>
                 </div>
              </div>
            )}

            {entryMode !== 'ANONYMOUS' && (
              <div className="p-10 bg-white border border-black/5 rounded-[48px] shadow-sm space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Identifikační Matrice</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Křestní jméno</label>
                      <input type="text" value={formData.firstName} onChange={e => setFormData(prev => ({...prev, firstName: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="Jan" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Příjmení</label>
                      <input type="text" value={formData.lastName} onChange={e => setFormData(prev => ({...prev, lastName: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="Novák" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Číslo dokladu</label>
                      <input type="text" value={formData.idNumber} onChange={e => setFormData(prev => ({...prev, idNumber: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="123456789" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Platnost do</label>
                      <input type="text" value={formData.docExpiry} onChange={e => setFormData(prev => ({...prev, docExpiry: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="01.01.2030" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Bydliště</label>
                    <input type="text" value={formData.address} onChange={e => setFormData(prev => ({...prev, address: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="Ulice 123, Město" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="p-10 bg-white border border-black/5 rounded-[48px] shadow-sm space-y-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Právní Matrice</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Jurisdikce</label>
                  <select value={formData.jurisdiction} onChange={e => setFormData(prev => ({...prev, jurisdiction: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold appearance-none cursor-pointer">
                    <option>Česká republika (NOZ 2026)</option>
                    <option>Slovensko (OZ 2026)</option>
                    <option>EU General Protocol</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Pseudonym v Síti</label>
                  <input type="text" value={formData.username} onChange={e => setFormData(prev => ({...prev, username: e.target.value}))} className="w-full h-14 bg-[#F2F2F7] rounded-2xl px-6 outline-none font-bold" placeholder="fixit_pioneer" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="p-10 bg-white border border-black/5 rounded-[48px] shadow-sm space-y-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Specializace</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-4">Dovednosti (oddělte čárkou)</label>
                  <textarea value={formData.specialization} onChange={e => setFormData(prev => ({...prev, specialization: e.target.value}))} className="w-full h-32 bg-[#F2F2F7] rounded-3xl p-6 outline-none font-medium" placeholder="Mikropájení, Autoelektrika..." />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="p-12 bg-black text-white rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[#007AFF]/10 to-transparent"></div>
              <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[40px] flex items-center justify-center text-6xl shadow-inner border border-white/10 mb-8 relative z-10">
                {entryMode === 'ANONYMOUS' ? '🔒' : '🛡️'}
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter relative z-10">SVID Handshake</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-sm relative z-10 mt-4">
                {entryMode === 'ANONYMOUS' 
                  ? 'Vaše identita zůstane anonymní. Přístup bude potvrzen hardwarem bez osobních dat.' 
                  : 'Váš virtuální doklad byl vygenerován. Pouze vy k němu máte přístup skrze Hardware Handshake.'}
              </p>
              
              <button 
                type="button"
                onClick={toggleHandshake} 
                className={`mt-10 w-full p-8 rounded-[36px] flex items-center gap-6 transition-all border cursor-pointer select-none relative z-20 ${formData.mandateAccepted ? 'bg-white/10 border-white/20' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${formData.mandateAccepted ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'border-white/10'}`}>
                  {formData.mandateAccepted && '✓'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black italic">Aktivovat SVID Handshake</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Potvrzení identity hardwarem</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-10 left-0 right-0 px-6 z-[100] print:hidden">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (<button onClick={handleBack} className="w-20 h-16 bg-white border border-black/5 rounded-3xl flex items-center justify-center text-xl shadow-xl active:scale-95 transition-all">←</button>)}
          <button 
            onClick={step < 4 ? handleNext : finalize} 
            disabled={(step === 4 && !formData.mandateAccepted) || !isFormValid()} 
            className={`flex-1 h-16 bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all ${((step === 4 && !formData.mandateAccepted) || !isFormValid()) ? 'opacity-20 pointer-events-none' : 'active:scale-95 hover:bg-[#007AFF]'}`}
          >
            {step < 4 ? 'Pokračovat' : 'Inicializovat Jádro'}
          </button>
        </div>
      </footer>
    </div>
  );
};
