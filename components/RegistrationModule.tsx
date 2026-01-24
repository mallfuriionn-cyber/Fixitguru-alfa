
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { COPYRIGHT } from '../constants.tsx';
import { biometricService } from '../services/biometricService.ts';

interface RegistrationModuleProps {
  onLogin: (user: User | null) => void;
  onRegisterClick?: () => void;
}

const generateVirtualHash = (secret: string) => {
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    hash = ((hash << 5) - hash) + secret.charCodeAt(i);
    hash |= 0;
  }
  return 'SID-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({ onLogin, onRegisterClick }) => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'gateway' | 'id_entry'>('gateway');
  const [isScanning, setIsScanning] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);

  const handleBiometricLogin = async () => {
    if (isScanning) return;
    setIsScanning(true);
    
    if ('vibrate' in navigator) navigator.vibrate(15);

    const success = await biometricService.authenticate();
    
    if (success) {
      setIsDissolving(true);
      setTimeout(() => {
        finalizeLogin('sarji@seznam.cz', 'PASSKEY_HARDWARE'); 
      }, 800);
    } else {
      setIsScanning(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsScanning(true);
    setTimeout(async () => {
       const success = await biometricService.authenticate();
       if (success) {
         setIsDissolving(true);
         setTimeout(() => finalizeLogin('google-user@gmail.com', 'GOOGLE'), 800);
       } else {
         setIsScanning(false);
       }
    }, 1200);
  };

  const finalizeLogin = (idInput: string, method: 'PASSWORD' | 'GOOGLE' | 'PASSKEY_HARDWARE') => {
    // Definice majitele a administrátora
    const isOwner = idInput === 'sarji@seznam.cz';
    const isAdmin = isOwner || idInput === 'admin@synthesis.cz';
    
    onLogin({
      id: isOwner ? 'owner-001' : (isAdmin ? 'admin-001' : 'u-' + Math.random().toString(36).substr(2, 9)),
      secretId: 'SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      virtualHash: generateVirtualHash(idInput),
      email: idInput,
      username: isOwner ? 'mallfurion' : idInput.split('@')[0],
      name: isOwner ? 'Mallfurion' : 'Synthesis Guru',
      role: isOwner ? UserRole.ADMINISTRATOR : (isAdmin ? UserRole.ADMINISTRATOR : UserRole.SUBSCRIBER),
      level: isOwner ? 99 : 1,
      avatar: isOwner ? '✦' : '👤',
      isAdmin: isAdmin,
      isOwner: isOwner,
      registrationDate: isOwner ? '01.01.2025' : new Date().toLocaleDateString(),
      lastLogin: 'Právě teď',
      security: {
        method: method,
        level: method === 'PASSKEY_HARDWARE' ? 'Maximální' : 'Vysoká',
        hardwareHandshake: true,
        lastAuthAt: new Date().toISOString()
      },
      stats: { repairs: isOwner ? 150 : 0, growing: isOwner ? 45 : 0, success: '100%', publishedPosts: isOwner ? 25 : 0 },
      equipment: isOwner ? ['Synthesis Core', 'Neural Link', 'Apex Terminal'] : [],
      biometricsLinked: {
        face: true,
        fingerprint: true,
        verified: true,
        safeEnvironmentEnabled: false,
        accessLogs: [{ date: new Date().toLocaleString(), type: `Hardware Login (${method})`, status: 'Authorized' }]
      }
    });
  };

  if (step === 'gateway') {
    return (
      <div className={`flex-1 bg-white flex flex-col items-center justify-center transition-all duration-1000 relative ${isDissolving ? 'portal-dissolve' : 'animate-synthesis-in'}`}>
        <div className="flex flex-col items-center space-y-10 mb-20">
          <div className="w-24 h-24 glass rounded-[40px] flex items-center justify-center text-5xl font-black shadow-2xl pulse-aura">S</div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F]">Synthesis ID</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]/60">Identity Core v2.1</p>
          </div>
        </div>

        {!isScanning && (
          <div className="space-y-4 px-8 w-full max-w-sm">
            <button 
              onClick={handleGoogleLogin}
              className="w-full h-16 bg-white border border-black/10 rounded-2xl flex items-center justify-center gap-4 hover:bg-black/5 transition-all shadow-sm active:scale-95 group"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
              <span className="text-[11px] font-black uppercase tracking-widest text-black/60">Google Handshake</span>
            </button>
            <button 
              onClick={() => setStep('id_entry')}
              className="w-full h-16 glass rounded-2xl text-[10px] font-black text-[#007AFF] uppercase tracking-widest hover:bg-[#007AFF] hover:text-white transition-all active:scale-95"
            >
              Synthesis Key Entry
            </button>
            <div className="pt-8 text-center" onClick={handleBiometricLogin}>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 hover:text-[#007AFF] transition-colors cursor-pointer">
                Klepněte pro Hardware Scan
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div 
            className="fixed inset-0 z-[500] flex flex-col items-center justify-center pointer-events-none animate-fade-in"
            style={{ 
              background: 'radial-gradient(circle at 50% 85%, rgba(0, 122, 255, 0.15) 0%, transparent 40%)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="absolute top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
              <div 
                onClick={handleBiometricLogin}
                className="relative w-32 h-32 flex items-center justify-center cursor-pointer scanning"
              >
                <svg className="fingerprint-svg w-24 h-24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 2C9.5 2 7.3 3.1 5.8 4.8M12 2C14.5 2 16.7 3.1 18.2 4.8M5.8 4.8C4.6 6.1 4 7.9 4 10V14M18.2 4.8C19.4 6.1 20 7.9 20 10V14M4 14C4 18.4 7.6 22 12 22C16.4 22 20 18.4 20 14M12 6C9.8 6 8 7.8 8 10V14M12 6C14.2 6 16 7.8 16 10V14M8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14M12 10V14" 
                    stroke="#007AFF" 
                    strokeWidth="0.8" 
                    strokeLinecap="round" 
                    className="fingerprint-path biometric-pulse"
                  />
                </svg>
                <div className="scanning-line"></div>
                <div className="absolute inset-0 border-2 border-[#007AFF]/20 rounded-full animate-ping"></div>
              </div>
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] text-[#007AFF] animate-pulse">
                Přiložte palec na senzor
              </p>
            </div>
          </div>
        )}
        <footer className="absolute bottom-10 opacity-10"><p className="text-[8px] font-black uppercase tracking-[0.5em] text-black italic">{COPYRIGHT}</p></footer>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FBFBFD] flex flex-col items-center justify-center px-8 animate-synthesis-in relative">
      <div className="w-full max-w-[420px] space-y-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center text-4xl font-black shadow-2xl glass border border-black/5 pulse-aura">S</div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">Manual Mode</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF]/60">Access Secret Key</p>
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && finalizeLogin(identifier, 'PASSWORD')}
            placeholder="Synthesis ID nebo E-mail"
            className="w-full h-[72px] bg-white border border-black/5 rounded-[28px] px-8 outline-none text-base font-bold shadow-sm"
          />
          <button onClick={() => finalizeLogin(identifier, 'PASSWORD')} className="w-full h-[72px] bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl">Vstoupit</button>
          <button onClick={() => setStep('gateway')} className="w-full py-4 text-[10px] font-black text-black/20 uppercase tracking-widest text-center hover:text-black">← Zpět k Biometrice</button>
        </div>
      </div>
    </div>
  );
};
