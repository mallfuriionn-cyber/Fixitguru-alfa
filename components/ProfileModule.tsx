import React, { useState, useEffect } from 'react';
import { User, LegalDispute, SavedConversation, UserRole, UserAsset } from '../types.ts';
import { db } from '../services/storageService.ts';
import { SynthesisPass } from './SynthesisPass.tsx';
import { getRoleMeta } from '../utils/permissionUtils.ts';
import { see } from '../services/encryptionService.ts';
import { networkService } from '../services/networkService.ts';

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
  user, onUpdateUser, onBack, onLogout, onLoadConversation, onContinueDispute
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'IDENTITY' | 'CLAIMS' | 'MEDIA' | 'SVID' | 'SECURITY'>('DASHBOARD');
  const [isEditing, setIsEditing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedDoc, setDecryptedDoc] = useState<any>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [currentNetSig, setCurrentNetSig] = useState('');
  const [isCurrentNetTrusted, setIsCurrentNetTrusted] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetEditName, setAssetEditName] = useState('');

  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editSpecs, setEditSpecs] = useState(user?.specialization?.join(', ') || "");

  useEffect(() => {
    const loadNet = async () => {
      const sig = await networkService.getNetworkSignature();
      setCurrentNetSig(sig);
      if (user) {
        const trusted = await networkService.isTrustedEnvironment(user);
        setIsCurrentNetTrusted(trusted);
      }
    };
    loadNet();
  }, [user]);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleDeleteAsset = (id: string) => {
    if (!user || !confirm('Opravdu smazat tento soubor z trezoru?')) return;
    const updatedAssets = user.assets?.filter(a => a.id !== id);
    onUpdateUser({ ...user, assets: updatedAssets });
    haptic(20);
  };

  const handleEditAsset = (asset: UserAsset) => {
    setEditingAssetId(asset.id);
    setAssetEditName(asset.name);
  };

  const saveAssetEdit = () => {
    if (!user || !editingAssetId) return;
    const updatedAssets = user.assets?.map(a => a.id === editingAssetId ? { ...a, name: assetEditName } : a);
    onUpdateUser({ ...user, assets: updatedAssets });
    setEditingAssetId(null);
    haptic(10);
  };

  const handleExportAsset = (asset: UserAsset) => {
    const link = document.createElement('a');
    link.href = `data:${asset.mimeType};base64,${asset.data}`;
    link.download = asset.name;
    link.click();
    haptic(15);
  };

  const handleShareAsset = (asset: UserAsset) => {
    haptic(5);
    if (navigator.share) {
      navigator.share({
        title: asset.name,
        text: `Synthesis OS Asset: ${asset.name} (${asset.sourceAgent})`,
        url: window.location.href
      }).catch(() => alert('Sdílení nebylo dokončeno.'));
    } else {
      alert(`Odkaz pro sdílení "${asset.name}" byl vygenerován (v alfa verzi simulováno).`);
    }
  };

  const handleSaveIdentity = () => {
    if (!user) return;
    haptic([20, 10]);
    onUpdateUser({ ...user, bio: editBio, specialization: editSpecs.split(',').map(s => s.trim()).filter(Boolean) });
    setIsEditing(false);
  };

  const handleRevealDoc = async () => {
    if (!user?.secretId || !user?.virtualDocument) return;
    haptic([10, 60, 10]);
    if (isRevealed) { setIsRevealed(false); setDecryptedDoc(null); return; }
    const decrypted: any = {};
    for (const [key, val] of Object.entries(user.virtualDocument.data)) {
      decrypted[key] = await see.decrypt(val as any, user.secretId);
    }
    setDecryptedDoc(decrypted);
    setIsRevealed(true);
  };

  if (!user) return <div className="p-20 text-center font-black text-black/10">Identifikujte se...</div>;
  const isAnonymous = user.role !== UserRole.ARCHITECT && (!user.virtualDocument?.isVerified || user.privacyDelay);

  return (
    <div className="px-6 py-10 space-y-12 animate-synthesis-in no-scrollbar relative">
      <section className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 flex flex-col items-center lg:items-start space-y-8">
           <div className="relative group cursor-pointer" onClick={() => setActiveTab('SVID')}>
              <div className={`w-48 h-48 bg-white border border-black/5 rounded-[56px] flex items-center justify-center text-8xl shadow-2xl transition-all duration-700 hover:rotate-3 group-hover:scale-105 ${isAnonymous ? 'grayscale' : ''}`}>
                {isAnonymous ? '🕶️' : user.avatar}
              </div>
              <div className="absolute -bottom-4 -right-4 scale-125"><RoleBadge role={user.role} /></div>
           </div>
           <div className="text-center lg:text-left space-y-3">
              <h2 className="text-5xl font-black tracking-tighter italic leading-none">{user.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">{user.role} // LVL {user.level}</p>
           </div>
           <button onClick={onLogout} className="w-full h-12 bg-red-50 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Opustit Jádro</button>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <nav className="flex gap-8 overflow-x-auto no-scrollbar border-b border-black/[0.04]">
            {[
              { id: 'DASHBOARD', label: 'Nástěnka' },
              { id: 'IDENTITY', label: 'Profil' },
              { id: 'CLAIMS', label: 'Spory' },
              { id: 'MEDIA', label: 'Asset Vault' },
              { id: 'SVID', label: 'SVID' },
              { id: 'SECURITY', label: 'Bezpečí' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as any); haptic(5); }}
                className={`pb-4 border-b-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-[#007AFF] text-[#007AFF]' : 'border-transparent text-black/20 hover:text-black/40'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="animate-synthesis-in min-h-[400px]">
            {activeTab === 'DASHBOARD' && (
              <div className="space-y-6">
                <div className="p-10 bg-white border border-black/5 rounded-[48px] shadow-sm relative overflow-hidden">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Aktivita</h3>
                  <p className="text-lg italic text-black/60">"{user.bio || "Váš digitální inženýrský otisk."}"</p>
                </div>
              </div>
            )}

            {activeTab === 'MEDIA' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Nahrané Přílohy</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Kapacita: {user.assets?.length || 0} / ∞</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(user.assets && user.assets.length > 0) ? user.assets.map(asset => (
                    <div key={asset.id} className="bg-white border border-black/5 rounded-[32px] p-6 flex flex-col gap-4 shadow-sm group hover:shadow-xl transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                          {asset.type === 'IMAGE' ? <img src={`data:${asset.mimeType};base64,${asset.data}`} className="w-full h-full object-cover" alt="" /> : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingAssetId === asset.id ? (
                            <div className="flex gap-2">
                              <input value={assetEditName} onChange={e => setAssetEditName(e.target.value)} className="bg-black/5 rounded-lg px-2 py-1 text-xs font-bold outline-none w-full" autoFocus onBlur={saveAssetEdit} onKeyDown={e => e.key === 'Enter' && saveAssetEdit()} />
                              <button onClick={saveAssetEdit} className="text-green-500 font-black text-xs">✓</button>
                            </div>
                          ) : (
                            <h4 className="font-black italic text-base truncate cursor-pointer hover:text-[#007AFF]" onClick={() => handleEditAsset(asset)} title="Klikněte pro přejmenování">{asset.name}</h4>
                          )}
                          <p className="text-[8px] font-black uppercase text-black/20 mt-1">{new Date(asset.createdAt).toLocaleDateString()} // {asset.sourceAgent}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-black/5">
                        <button onClick={() => handleExportAsset(asset)} className="flex-1 h-10 bg-black text-white rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-[#007AFF] transition-all">Exportovat</button>
                        <button onClick={() => handleShareAsset(asset)} className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-xs hover:bg-blue-50 hover:text-[#007AFF] transition-all" title="Sdílet">🔗</button>
                        <button onClick={() => handleEditAsset(asset)} className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-xs hover:bg-black/10 transition-all" title="Editovat název">✏️</button>
                        <button onClick={() => handleDeleteAsset(asset.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all" title="Smazat">✕</button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full p-20 text-center border-2 border-dashed border-black/5 rounded-[48px] opacity-20">
                      <p className="font-black uppercase tracking-widest text-[10px]">Struktura médií je prázdná</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'IDENTITY' && (
              <div className="p-10 bg-white border border-black/5 rounded-[48px] space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">Editor Identity</h3>
                 <div className="space-y-6">
                    <textarea className="w-full bg-black/5 rounded-3xl p-6 font-medium italic outline-none min-h-[150px]" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Napište něco o sobě..." />
                    <button onClick={handleSaveIdentity} className="w-full h-14 bg-black text-white rounded-full font-black text-[9px] uppercase tracking-widest">Uložit Profil</button>
                 </div>
              </div>
            )}

            {activeTab === 'CLAIMS' && (
              <div className="space-y-4">
                {user.disputes?.map(d => (
                  <div key={d.id} className="bg-white border border-black/5 rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-xl">⚖️</div>
                      <div>
                        <h4 className="font-black italic text-lg">{d.title}</h4>
                        <p className="text-[9px] font-bold opacity-20 uppercase">{d.date}</p>
                      </div>
                    </div>
                    <button onClick={() => onContinueDispute?.(d)} className="px-6 h-10 bg-black text-white rounded-xl text-[9px] font-black uppercase">Otevřít</button>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'SVID' && (
              <div className="flex flex-col items-center py-10">
                <SynthesisPass user={user} lang="cs" />
                <div className="w-full max-w-md mt-10 p-8 bg-white border border-black/5 rounded-[40px] shadow-sm">
                  <h3 className="text-xl font-black italic mb-4">Hardwarový Handshake</h3>
                  <button onClick={handleRevealDoc} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{isRevealed ? 'Uzamknout Trezor' : 'Odemknout SVID'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};