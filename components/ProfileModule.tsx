
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types.ts';

interface ProfileModuleProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLoginClick?: () => void;
  onRegisterDetailedClick?: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  user, 
  onUpdateUser, 
  onBack, 
  onLoginClick, 
  onRegisterDetailedClick 
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isScanning && biometricType === 'face' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Kamera nedostupná:", err));
    }
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, biometricType]);

  const startLinking = (type: 'face' | 'fingerprint') => {
    setBiometricType(type);
    setIsScanning(true);
    
    setTimeout(() => {
      if (user) {
        const updatedUser: User = {
          ...user,
          biometricsLinked: {
            face: type === 'face' ? true : (user.biometricsLinked?.face || false),
            fingerprint: type === 'fingerprint' ? true : (user.biometricsLinked?.fingerprint || false),
            verified: true,
            safeEnvironmentEnabled: user.biometricsLinked?.safeEnvironmentEnabled || false,
            accessLogs: [
              { date: new Date().toLocaleString(), type: `Link ${type}`, status: 'Verified' },
              ...(user.biometricsLinked?.accessLogs || [])
            ]
          }
        };
        onUpdateUser(updatedUser);
      }
      setIsScanning(false);
      setBiometricType(null);
    }, 2800);
  };

  const toggleSafeEnvironment = () => {
    if (!user) return;
    onUpdateUser({
      ...user,
      biometricsLinked: {
        ...(user.biometricsLinked || { face: false, fingerprint: false, verified: false, safeEnvironmentEnabled: false, accessLogs: [] }),
        safeEnvironmentEnabled: !user.biometricsLinked?.safeEnvironmentEnabled
      }
    });
  };

  if (!user) return <div className="p-20 text-center">Identifikujte se v terminálu.</div>;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12 space-y-10 animate-synthesis-in pb-32 bg-[#FBFBFD] no-scrollbar">
      {/* Identity Card */}
      <header className="relative p-10 glass rounded-[56px] border border-black/5 pulse-aura overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           {user.biometricsLinked?.verified && (
             <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-full border border-green-500/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[8px] font-black uppercase tracking-widest">Verified Biometrics</span>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-5xl shadow-2xl border border-black/10">
            {user.avatar}
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">{user.name}</h2>
            <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.4em]">{user.virtualHash}</p>
          </div>
        </div>
      </header>

      {/* Security & Biometrics Section */}
      <section className="space-y-6">
        <div className="px-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Zabezpečení & Biometrika</h3>
          <p className="text-[9px] font-bold text-black/20 uppercase italic mt-1">Správa otisků a autorizace Synthesis Core.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-8 glass rounded-[40px] border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">☝️</span>
              <h4 className="font-black italic text-sm uppercase">Touch ID</h4>
            </div>
            {user.biometricsLinked?.fingerprint ? (
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Aktivní</span>
            ) : (
              <button onClick={() => startLinking('fingerprint')} className="h-10 px-6 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Aktivovat</button>
            )}
          </div>

          <div className="p-8 glass rounded-[40px] border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📸</span>
              <h4 className="font-black italic text-sm uppercase">Face ID</h4>
            </div>
            {user.biometricsLinked?.face ? (
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Aktivní</span>
            ) : (
              <button onClick={() => startLinking('face')} className="h-10 px-6 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Aktivovat</button>
            )}
          </div>
        </div>

        {/* Workshop Mode */}
        <div className="p-10 glass border border-black/5 rounded-[48px] flex items-center justify-between shadow-sm">
           <div className="space-y-1">
              <h4 className="font-black italic text-base uppercase">Dílenský Režim (Safe Env)</h4>
              <p className="text-[10px] font-bold text-black/30 uppercase leading-none">Dočasné odemknutí v bezpečném prostředí (Domácí Wi-Fi).</p>
           </div>
           <button 
             onClick={toggleSafeEnvironment}
             className={`w-14 h-8 rounded-full transition-all relative ${user.biometricsLinked?.safeEnvironmentEnabled ? 'bg-[#007AFF]' : 'bg-black/10'}`}
           >
             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${user.biometricsLinked?.safeEnvironmentEnabled ? 'right-1' : 'left-1'}`}></div>
           </button>
        </div>

        {/* Access History */}
        <div className="bg-white border border-black/5 rounded-[48px] p-10 space-y-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Historie přístupů</h4>
           <div className="space-y-3">
              {(user.biometricsLinked?.accessLogs || []).slice(0, 5).map((log, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'Authorized' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <span className="text-xs font-bold">{log.type}</span>
                   </div>
                   <span className="text-[10px] font-mono text-black/30">{log.date}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      <button onClick={onBack} className="w-full py-6 glass rounded-[28px] font-black text-xs uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all">Zpět k Hubu</button>
      
      {isScanning && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-synthesis-in">
           <div className="w-32 h-32 flex items-center justify-center scanning">
              <svg className="fingerprint-svg w-24 h-24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9.5 2 7.3 3.1 5.8 4.8M12 2C14.5 2 16.7 3.1 18.2 4.8M5.8 4.8C4.6 6.1 4 7.9 4 10V14M18.2 4.8C19.4 6.1 20 7.9 20 10V14M4 14C4 18.4 7.6 22 12 22C16.4 22 20 18.4 20 14M12 6C9.8 6 8 7.8 8 10V14M12 6C14.2 6 16 7.8 16 10V14M8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14M12 10V14" 
                  stroke="#007AFF" strokeWidth="0.8" strokeLinecap="round" className="fingerprint-path"
                />
              </svg>
              <div className="scanning-line"></div>
           </div>
           <p className="mt-8 text-[10px] font-black text-[#007AFF] uppercase tracking-widest animate-pulse">Konfigurace Biometriky...</p>
        </div>
      )}
    </div>
  );
};
