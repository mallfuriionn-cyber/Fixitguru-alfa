
import React, { useState, useEffect } from 'react';
import { User, LegalDispute, SavedConversation, UserRole } from '../types.ts';
import { db } from '../services/storageService.ts';
import { SynthesisPass } from './SynthesisPass.tsx';
import { getRoleMeta } from '../utils/permissionUtils.ts';
import { see } from '../services/encryptionService.ts';

interface ProfileModuleProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLogout: () => void;
  onAddSVID?: () => void;
  onLoadConversation: (convo: SavedConversation) => void;
  onContinueDispute?: (dispute: LegalDispute) => void;
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const meta = getRoleMeta(role);
  return (
    <div className={`px-4 py-1.5 bg-gradient-to-br ${meta.color} text-white rounded-full flex items-center gap-2 shadow-lg`}>
      <span className="text-[10px] font-black">{meta.icon}</span>
      <span className="text-[8px] font-black uppercase tracking-widest">{meta.label}</span>
    </div>
  );
};

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  user, 
  onUpdateUser, 
  onBack,
  onLogout,
  onAddSVID,
  onLoadConversation,
  onContinueDispute
}) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'SVID' | 'CLAIMS' | 'LOGS' | 'PASS'>('IDENTITY');
  const [history, setHistory] = useState<SavedConversation[]>(db.getAll('conversations'));
  const [isEditing, setIsEditing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedDoc, setDecryptedDoc] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Lokální stavy pro editaci
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editSpecs, setEditSpecs] = useState(user?.specialization?.join(', ') || "");

  useEffect(() => {
    const handleUpdate = () => setHistory(db.getAll('conversations'));
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  useEffect(() => {
    if (user) {
      setEditBio(user.bio || "");
      setEditSpecs(user.specialization?.join(', ') || "");
    }
  }, [user]);

  const haptic = (pattern: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(pattern); };

  const handleRevealDoc = async () => {
    if (!user?.secretId || !user?.virtualDocument) return;
    haptic([10, 60, 10]);
    
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedDoc(null);
      return;
    }

    const decrypted: any = {};
    const entries = Object.entries(user.virtualDocument.data);
    
    for (const [key, val] of entries) {
      decrypted[key] = await see.decrypt(val as any, user.secretId);
    }
    
    setDecryptedDoc(decrypted);
    setIsRevealed(true);
  };

  const handleSaveIdentity = () => {
    if (!user) return;
    haptic([20, 10]);
    const updatedUser: User = {
      ...user,
      bio: editBio,
      specialization: editSpecs.split(',').map(s => s.trim()).filter(Boolean)
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
    
    // Log do audit logu
    db.insert('globalAudit', {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action: `IDENTITY_SYNC: ${user.username}`,
      actorId: user.id,
      actorName: user.username,
      category: 'DATA',
      severity: 'LOW'
    });
  };

  const handleFinalUpgrade = (fullAccess: boolean) => {
    if (!user) return;
    haptic([10, 50, 10]);
    
    const updatedUser: User = {
      ...user,
      privacyDelay: !fullAccess,
      security: {
        ...user.security,
        integrityScore: fullAccess ? 95 : 50,
        level: fullAccess ? 'Vysoká' : 'Základní'
      },
      virtualDocument: user.virtualDocument ? {
        ...user.virtualDocument,
        isVerified: true
      } : undefined
    };
    
    onUpdateUser(updatedUser);
    setShowUpgradeModal(false);
    
    if (fullAccess) {
      alert("✅ Plná SVID Identita aktivována!");
    } else {
      alert("🛡️ Aktivován Odklad pro Judy.");
    }
  };

  if (!user) return <div className="p-20 text-center font-black text-black/10">Identifikujte se...</div>;

  // FIX: Architekt je privilegovaný subjekt, není nikdy anonymní proxy
  const isAnonymous = user.role !== UserRole.ARCHITECT && (!user.virtualDocument?.isVerified || user.privacyDelay);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 animate-synthesis-in pb-32 bg-[#FBFBFD] no-scrollbar relative">
      
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6">
           <div className="max-w-md w-full bg-white rounded-[56px] shadow-2xl border border-black/5 overflow-hidden animate-synthesis-in">
              <div className="p-10 text-center space-y-6">
                 <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-sm">🚀</div>
                 <div className="space-y-3">
                    <h3 className="text-3xl font-black italic tracking-tighter leading-tight text-[#1D1D1F]">Aktivovat Plné Jádro?</h3>
                    <p className="text-sm text-black/60 font-medium leading-relaxed">
                       Detekovali jsme rozpracovaný SVID profil. Chcete nyní přejít na plnou integraci, nebo ponechat **Odklad pro Judy**?
                    </p>
                 </div>
              </div>
              <footer className="p-8 bg-[#FBFBFD] border-t border-black/5 grid gap-3">
                 <button onClick={() => handleFinalUpgrade(true)} className="w-full h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">Aktivovat Plnou Identitu</button>
                 <button onClick={() => handleFinalUpgrade(false)} className="w-full p-6 border border-black/5 text-black/40 rounded-[32px] font-black text-[10px] uppercase tracking-widest active:scale-95 text-center leading-tight">Zůstat Anonymní</button>
              </footer>
           </div>
        </div>
      )}

      <header className={`relative p-12 text-white rounded-[64px] shadow-2xl overflow-hidden group transition-all duration-700 ${isAnonymous ? 'bg-slate-900 border border-white/5' : 'bg-[#000814]'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full group-hover:opacity-100 transition-all duration-1000 ${isAnonymous ? 'bg-amber-500/5 opacity-40' : 'bg-[#007AFF]/10 opacity-60'}`}></div>
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative cursor-pointer" onClick={() => setActiveTab('PASS')}>
            <div className={`w-40 h-40 bg-white/5 backdrop-blur-3xl rounded-[48px] flex items-center justify-center text-8xl shadow-inner border border-white/10 group-hover:scale-[1.02] transition-transform ${isAnonymous ? 'grayscale' : ''}`}>
              {isAnonymous ? '🕶️' : user.avatar}
            </div>
            <div className="absolute -bottom-4 -right-4">
              <RoleBadge role={user.role} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${isAnonymous ? 'text-amber-500' : 'text-[#007AFF]'}`}>
                {isAnonymous ? 'Anonymous Proxy' : 'Synthesis Virtual ID'}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h2 className="text-6xl font-black tracking-tighter italic leading-none">{user.name}</h2>
                {user.privacyDelay && user.role !== UserRole.ARCHITECT && <span className="bg-amber-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-2">Privacy Delay</span>}
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Level:</span>
                 <span className={`text-sm font-black italic ${isAnonymous ? 'text-amber-500' : 'text-[#007AFF]'}`}>{user.level}</span>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">hID:</span>
                 <span className="text-[9px] font-mono font-bold text-white/60">{user.hardwareId}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex px-4 gap-10 overflow-x-auto no-scrollbar border-b border-black/[0.04] sticky top-0 bg-[#FBFBFD]/90 backdrop-blur-2xl z-20">
        {[
          { id: 'IDENTITY', label: 'Profil Gurua' },
          { id: 'SVID', label: 'Virtuální Doklad' },
          { id: 'CLAIMS', label: 'Moje Případy' },
          { id: 'LOGS', label: 'Audit Jádra' },
          { id: 'PASS', label: 'Synthesis Pass' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); haptic(5); setIsEditing(false); }}
            className={`pb-5 border-b-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-black/20 hover:text-black/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="min-h-[600px]">
        {activeTab === 'IDENTITY' && (
          <div className="space-y-8 animate-synthesis-in">
             <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="p-12 bg-white border border-black/5 rounded-[56px] shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/5 blur-[100px] rounded-full"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">Inženýrská Bio</h3>
                        {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] hover:underline">Editovat</button>}
                    </div>
                    {isEditing ? (
                        <textarea 
                          className="w-full bg-black/5 rounded-3xl p-6 font-medium italic text-lg outline-none min-h-[150px] border border-black/5"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Popište svou inženýrskou cestu..."
                        />
                    ) : (
                        <p className="text-2xl text-black/70 font-medium italic leading-relaxed relative z-10">"{user.bio || "Inženýrská entita Synthesis."}"</p>
                    )}
                  </div>

                  <div className="p-12 bg-white border border-black/5 rounded-[56px] shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="flex justify-between items-center relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">Technické Kompetence</h3>
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                           <p className="text-[9px] font-black uppercase tracking-widest text-black/20 px-2">Dovednosti (oddělte čárkou)</p>
                           <input 
                            type="text"
                            className="w-full h-16 bg-black/5 rounded-2xl px-6 font-bold text-sm outline-none border border-black/5"
                            value={editSpecs}
                            onChange={(e) => setEditSpecs(e.target.value)}
                            placeholder="Mikropájení, PCB Design, Autoelektrika..."
                           />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 relative z-10">
                          {user.specialization && user.specialization.length > 0 ? user.specialization.map(s => (
                            <span key={s} className="px-5 py-2.5 bg-[#F2F2F7] rounded-full text-[10px] font-black uppercase tracking-widest text-black/50 border border-black/[0.03]">{s}</span>
                          )) : (
                            <p className="text-sm italic text-black/20">Žádné kompetence nedefinovány.</p>
                          )}
                        </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleSaveIdentity} className="flex-1 h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Uložit Změny</button>
                      <button onClick={() => setIsEditing(false)} className="px-10 h-16 bg-black/5 text-black/40 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95">Zrušit</button>
                    </div>
                  )}
                </div>

                <div className="p-10 bg-white border border-black/5 rounded-[56px] shadow-sm space-y-8 h-fit">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">Status Matrix</h3>
                   <div className="space-y-4">
                      <div className="p-6 bg-[#FBFBFD] rounded-3xl border border-black/5 space-y-2">
                        <p className="text-[9px] font-black uppercase text-black/20">Identifikátor</p>
                        <p className="text-lg font-black italic text-[#007AFF]">{user.virtualHash}</p>
                      </div>
                      {isAnonymous && (
                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-2 animate-pulse">
                           <p className="text-[9px] font-black uppercase text-amber-600/50">Privacy Note</p>
                           <p className="text-[10px] font-bold italic text-amber-900/60 leading-tight">Aktivní režim anonymity. Dokumenty jsou generovány k ručnímu dopsání.</p>
                        </div>
                      )}
                      {!isAnonymous && (
                        <div className="p-6 bg-green-50 rounded-3xl border border-green-100 space-y-2">
                           <p className="text-[9px] font-black uppercase text-green-600/50">Integrity Check</p>
                           <p className="text-[10px] font-bold italic text-green-900/60 leading-tight">Plná Synthesis Integrity aktivní. Modrá pečeť je k dispozici.</p>
                        </div>
                      )}
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'SVID' && (
          <div className="space-y-10 animate-synthesis-in flex flex-col items-center">
            {(user.virtualDocument?.data && Object.keys(user.virtualDocument.data).length > 0) || user.role === UserRole.ARCHITECT ? (
              <div className="w-full max-w-2xl space-y-8">
                <div className={`relative w-full aspect-[1.6/1] bg-gradient-to-br from-slate-900 to-black rounded-[48px] p-10 text-white shadow-2xl overflow-hidden border border-white/10 transition-all duration-700 ${isRevealed ? 'rotate-y-0 scale-100' : 'rotate-y-180 scale-95 opacity-80 blur-sm'}`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <header className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#007AFF]">Synthesis Virtual Document</p>
                          <h4 className="text-2xl font-black italic tracking-tighter uppercase">{user.virtualDocument?.docType === 'ID_CARD' ? 'Občanský Průkaz' : 'Cestovní Pas'}</h4>
                       </div>
                       <div className="w-10 h-10 bg-white text-black font-black rounded-lg flex items-center justify-center text-sm shadow-xl">S</div>
                    </header>
                    <div className="grid grid-cols-2 gap-8 pt-6">
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30">Jméno / Name</p>
                            <p className="text-lg font-black italic">{decryptedDoc?.firstName || (user.role === UserRole.ARCHITECT ? user.name.split(' ')[0] : '••••••••')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30">Příjmení / Surname</p>
                            <p className="text-lg font-black italic">{decryptedDoc?.lastName || (user.role === UserRole.ARCHITECT ? user.name.split(' ')[1] : '••••••••')}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30">Číslo Dokladu / Doc No.</p>
                            <p className="text-sm font-mono font-bold">{decryptedDoc?.idNumber || (user.role === UserRole.ARCHITECT ? 'ROOT-001' : '••••••••')}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                  {!isRevealed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-20 cursor-pointer" onClick={handleRevealDoc}>
                       <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-2xl backdrop-blur-xl border border-white/20">🔒</div>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Hardware Unlock Required</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4 items-center w-full">
                  <button onClick={handleRevealDoc} className={`w-full max-w-sm h-16 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${isRevealed ? 'bg-black text-white' : 'bg-[#007AFF] text-white hover:scale-105'}`}>
                    {isRevealed ? 'Skrýt údaje' : 'Dešifrovat Doklad (Hardware Handshake)'}
                  </button>
                  {isAnonymous && (
                    <button onClick={() => setShowUpgradeModal(true)} className="w-full max-w-sm h-14 bg-green-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl animate-pulse active:scale-95 transition-all">
                      🚀 Aktivovat Plné Funkce SVID
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-black/10 rounded-[64px] space-y-8 bg-amber-50/30">
                 <div className="text-6xl opacity-20 grayscale">🕶️</div>
                 <button onClick={() => { onAddSVID?.(); }} className="px-12 h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#007AFF] transition-all active:scale-95">Párovat Doklad (SVID)</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'PASS' && (
          <div className="flex flex-col items-center py-10 animate-synthesis-in">
             <SynthesisPass user={user} lang="cs" />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="space-y-8 animate-synthesis-in">
             <div className="bg-white border border-black/5 rounded-[56px] shadow-sm overflow-hidden">
                <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                   {(user.auditLogs && user.auditLogs.length > 0) ? user.auditLogs.map((log) => (
                     <div key={log.id} className="p-6 border-l-4 border-black/5 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="space-y-1">
                              <p className="text-xs font-black italic text-black/80">{log.action}</p>
                              <p className="text-[8px] font-black uppercase text-black/20 tracking-widest">{log.timestamp}</p>
                           </div>
                        </div>
                     </div>
                   )) : (
                     <p className="text-center p-20 text-black/10">Log je prázdný.</p>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'CLAIMS' && (
          <div className="space-y-8 animate-synthesis-in">
             {(user.disputes && user.disputes.length > 0) ? (
               <div className="grid gap-4">
                 {user.disputes.map(d => (
                   <button key={d.id} onClick={() => onContinueDispute?.(d)} className="p-8 bg-white border border-black/5 rounded-[44px] shadow-sm hover:shadow-xl transition-all text-left flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">⚖️</div>
                         <div>
                            <h4 className="text-xl font-black italic tracking-tight">{d.title}</h4>
                            <p className="text-[9px] font-black uppercase text-black/20 mt-2">{d.date} | {d.status}</p>
                         </div>
                      </div>
                      <span className="text-black/10 text-2xl group-hover:translate-x-2 transition-transform">→</span>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="p-32 text-center border-2 border-dashed border-black/5 rounded-[64px] opacity-20 grayscale">
                  <p className="text-[10px] font-black uppercase tracking-widest">Žádné spory v Matrixu.</p>
               </div>
             )}
          </div>
        )}
      </main>

      <div className="pt-20 flex flex-col items-center gap-6">
        <button onClick={onBack} className="w-full max-w-sm py-7 bg-white border border-black/5 rounded-[36px] shadow-2xl font-black text-[12px] uppercase tracking-[0.4em] text-[#1D1D1F] hover:scale-[1.02] active:scale-95 transition-all">Terminál Synthesis</button>
        <button onClick={onLogout} className="w-full max-w-sm py-5 bg-red-50 text-red-500 border border-red-100 rounded-[32px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm">Opustit Jádra</button>
      </div>
    </div>
  );
};
