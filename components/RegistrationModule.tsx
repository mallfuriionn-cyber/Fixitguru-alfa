
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types.ts';
import { COPYRIGHT } from '../constants.tsx';

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

const generateSecretId = () => {
  const parts = [
    Math.random().toString(36).substring(2, 7),
    Math.random().toString(36).substring(2, 7),
    Math.random().toString(36).substring(2, 7)
  ];
  return parts.join('-').toUpperCase();
};

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({ onLogin, onRegisterClick }) => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'gateway' | 'id_entry' | 'register'>('gateway');
  const [isScanning, setIsScanning] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const startBiometric = () => {
    setIsScanning(true);
    // Simulace plynulého plnění a přechodu do Dashboardu
    setTimeout(() => {
      setIsScanning(false);
      setIsDissolving(true);
      setTimeout(() => {
        finalizeLogin('sarji@seznam.cz'); // Default login via Biometric for demo
      }, 800);
    }, 2800);
  };

  const finalizeLogin = (idInput: string) => {
    const isAdmin = idInput === 'sarji@seznam.cz' || idInput === 'admin@synthesis.cz' || idInput.includes('ADMIN');
    const isOwner = idInput === 'sarji@seznam.cz' || idInput.includes('MALLFURION');
    const secretId = idInput.toUpperCase().startsWith('SID-') ? idInput.toUpperCase() : generateSecretId();

    onLogin({
      id: isAdmin ? 'admin-001' : 'u-' + Math.random().toString(36).substr(2, 9),
      secretId: secretId,
      virtualHash: generateVirtualHash(secretId),
      email: idInput.includes('@') ? idInput : 'user@synthesis.id',
      username: idInput.split('@')[0],
      name: isOwner ? 'Mallfurion' : (idInput.split('@')[0] || 'Synthesis Guru'),
      role: isOwner ? UserRole.ADMINISTRATOR : (isAdmin ? UserRole.ADMINISTRATOR : UserRole.SUBSCRIBER),
      level: isOwner ? 99 : (isAdmin ? 50 : 1),
      avatar: isOwner ? '✦' : (isAdmin ? '🛡️' : '👤'),
      bio: isOwner ? 'Zakladatel Studio Synthesis a hlavní vizionář systému FixIt Guru.' : '',
      specialization: isOwner ? ['Core Dev', 'Synthesis Overlord'] : [],
      equipment: isOwner ? ['Všechna oprávnění', 'Root Access'] : ['Základní diagnostika'],
      isAdmin: isAdmin,
      isOwner: isOwner,
      registrationDate: isOwner ? '01.01.2025' : new Date().toLocaleDateString(),
      lastLogin: 'Právě teď',
      stats: {
        repairs: isOwner ? 150 : 0,
        growing: isOwner ? 45 : 0,
        success: '100%',
        publishedPosts: isOwner ? 25 : 0
      },
      biometricsLinked: {
        face: true,
        fingerprint: true,
        verified: true,
        safeEnvironmentEnabled: false,
        accessLogs: [{ date: new Date().toLocaleString(), type: 'Biometric Portal', status: 'Authorized' }]
      }
    });
  };

  if (step === 'gateway') {
    return (
      <div className={`flex-1 bg-white flex flex-col items-center justify-center transition-all duration-1000 ${isDissolving ? 'portal-dissolve' : 'animate-synthesis-in'}`}>
        <div 
          onClick={!isScanning ? startBiometric : undefined}
          className={`relative w-48 h-48 flex items-center justify-center cursor-pointer group ${isScanning ? 'scanning' : ''}`}
        >
          {/* Minimalist Fingerprint SVG */}
          <svg className="fingerprint-svg w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.5 2 7.3 3.1 5.8 4.8M12 2C14.5 2 16.7 3.1 18.2 4.8M5.8 4.8C4.6 6.1 4 7.9 4 10V14M18.2 4.8C19.4 6.1 20 7.9 20 10V14M4 14C4 18.4 7.6 22 12 22C16.4 22 20 18.4 20 14M12 6C9.8 6 8 7.8 8 10V14M12 6C14.2 6 16 7.8 16 10V14M8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14M12 10V14" 
              stroke={isScanning ? "#007AFF" : "#E5E5EA"} 
              strokeWidth="0.8" 
              strokeLinecap="round" 
              className="fingerprint-path transition-colors duration-500"
            />
          </svg>
          
          <div className={`absolute inset-0 rounded-full border-2 border-[#007AFF]/10 transition-all duration-1000 ${isScanning ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}></div>
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border border-[#007AFF]/20 rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-500 ${isScanning ? 'text-[#007AFF] animate-pulse' : 'text-black/20'}`}>
            {isScanning ? 'Autorizace Synthesis ID...' : 'Přiložte prst pro vstup'}
          </p>
          {!isScanning && (
            <button 
              onClick={() => setStep('id_entry')}
              className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest hover:underline pt-4 block mx-auto"
            >
              Použít Synthesis ID klíč
            </button>
          )}
        </div>
        
        <footer className="absolute bottom-10">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/5 italic">{COPYRIGHT}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FBFBFD] text-[#1D1D1F] flex flex-col items-center justify-center px-8 animate-synthesis-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#007AFF]/5 blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-[420px] space-y-12 relative z-10">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-5xl font-black shadow-2xl glass border border-black/5 pulse-aura">S</div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">Synthesis ID</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF]/60">Manual Authentication Core</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <input
              type="text"
              value={identifier}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && finalizeLogin(identifier)}
              placeholder="Synthesis ID (SID-...) nebo E-mail"
              className="w-full h-[72px] bg-white border border-black/5 rounded-[28px] px-8 focus:ring-4 ring-[#007AFF]/10 focus:border-[#007AFF]/20 outline-none text-base font-bold text-[#1D1D1F] shadow-sm"
            />
          </div>
          <button 
            onClick={() => finalizeLogin(identifier)}
            className="w-full h-[72px] bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl"
          >
            Vstoupit do terminálu
          </button>
          <button 
            onClick={() => setStep('gateway')}
            className="w-full text-[10px] font-black text-black/20 uppercase tracking-widest text-center"
          >
            Zpět k Biometrice
          </button>
        </div>
      </div>
    </div>
  );
};
