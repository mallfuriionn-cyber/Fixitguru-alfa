
import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'password' | 'register'>('email');
  const [isFocused, setIsFocused] = useState(false);

  const handleContinue = () => {
    if (email === 'sarji@seznam.cz' || email === 'admin@synthesis.cz') {
      setStep('password');
    } else if (email.includes('@')) {
      setStep('register');
    }
  };

  const handleGuest = () => {
    onLogin(null);
  };

  const finalizeLogin = () => {
    const isAdmin = email === 'sarji@seznam.cz' || email === 'admin@synthesis.cz';
    const isOwner = email === 'sarji@seznam.cz';
    const secretId = generateSecretId();

    onLogin({
      id: isAdmin ? 'admin-001' : 'u-' + Math.random().toString(36).substr(2, 9),
      secretId: secretId,
      virtualHash: generateVirtualHash(secretId),
      email: email,
      username: email.split('@')[0],
      name: isOwner ? 'Mallfurion' : email.split('@')[0],
      role: isOwner ? UserRole.ADMINISTRATOR : (isAdmin ? UserRole.ADMINISTRATOR : UserRole.SUBSCRIBER),
      level: isOwner ? 99 : (isAdmin ? 50 : 1),
      avatar: isOwner ? '✦' : (isAdmin ? '🛡️' : '👤'),
      bio: isOwner ? 'Zakladatel Studio Synthesis a hlavní vizionář systému FixIt Guru.' : '',
      specialization: isOwner ? ['Core Dev', 'Synthesis Overlord'] : [],
      equipment: isOwner ? ['Všechna oprávnění', 'Root Access'] : ['Kladivo', 'Multimetr'],
      isAdmin: isAdmin,
      isOwner: isOwner,
      registrationDate: isOwner ? '01.01.2025' : new Date().toLocaleDateString(),
      lastLogin: 'Právě teď',
      stats: {
        repairs: isOwner ? 150 : 0,
        growing: isOwner ? 45 : 0,
        success: '100%',
        publishedPosts: isOwner ? 25 : 0
      }
    });
  };

  return (
    <div className="flex-1 bg-[#FBFBFD] text-[#1D1D1F] flex flex-col items-center justify-center px-8 animate-synthesis-in relative overflow-hidden">
      {/* Background Auras */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#007AFF]/5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-[420px] space-y-12 relative z-10">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative group">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-5xl font-black shadow-2xl glass border border-black/5 group-hover:border-black/10 transition-all duration-500 pulse-aura">
              S
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#007AFF] rounded-full border-4 border-[#FBFBFD] flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-black text-white">ID</span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#1D1D1F] leading-none">Synthesis Terminal</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#007AFF]/60">Identity Core v2.1 Alpha</p>
          </div>
        </div>

        <div className="space-y-6">
          {step === 'email' && (
            <div className="space-y-4 animate-synthesis-in">
              <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  placeholder="Synthesis ID nebo E-mail"
                  className="w-full h-[72px] bg-white border border-black/5 rounded-[28px] px-8 focus:ring-4 ring-[#007AFF]/10 focus:border-[#007AFF]/20 transition-all outline-none text-base font-bold text-[#1D1D1F] placeholder:text-black/20 shadow-sm"
                />
              </div>
              <button 
                onClick={handleContinue}
                disabled={!email.includes('@') && email.length < 3}
                className="w-full h-[72px] bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl disabled:opacity-20 disabled:pointer-events-none hover:bg-black/90"
              >
                Inicializovat Vstup
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-black/5 flex-1"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-black/20">nebo</span>
                <div className="h-px bg-black/5 flex-1"></div>
              </div>
              
              <button 
                onClick={onRegisterClick}
                className="w-full h-[72px] glass text-black rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-black/5 hover:bg-white"
              >
                Vytvořit Synthesis ID
              </button>
            </div>
          )}

          {(step === 'password' || step === 'register') && (
            <div className="space-y-6 animate-synthesis-in">
              <div className="p-6 glass rounded-[32px] text-center border border-black/5">
                <p className="text-[9px] font-black text-[#007AFF] uppercase tracking-[0.3em] mb-1">Identita Rozpoznána</p>
                <p className="text-sm font-bold text-[#1D1D1F]/80">{email}</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type={step === 'password' ? 'password' : 'text'}
                  placeholder={step === 'password' ? 'Heslo Jádra' : 'Zadejte své jméno'}
                  className="w-full h-[72px] bg-white border border-black/5 rounded-[28px] px-8 outline-none text-base font-bold focus:ring-4 ring-[#007AFF]/10 text-[#1D1D1F] placeholder:text-black/20 shadow-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && finalizeLogin()}
                />
                <button 
                  onClick={finalizeLogin}
                  className="w-full h-[72px] bg-[#007AFF] text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                >
                  {step === 'password' ? 'Odemknout Uzel' : 'Potvrdit Registraci'}
                </button>
              </div>
              
              <button 
                onClick={() => setStep('email')} 
                className="w-full text-[9px] font-black text-black/20 uppercase tracking-[0.3em] hover:text-black/40 transition-colors"
              >
                ← Změnit Přístupové Údaje
              </button>
            </div>
          )}
        </div>

        <div className="pt-10 border-t border-black/5 flex flex-col items-center gap-6">
          <button 
            onClick={handleGuest}
            className="text-[10px] font-black text-black/30 hover:text-black transition-colors uppercase tracking-[0.3em] py-5 glass w-full rounded-[24px]"
          >
            Vstoupit jako Host (Anonymous)
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]"></div>
            <span className="text-[9px] font-black text-green-600/60 uppercase tracking-widest">Synthesis Node: Active</span>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-10 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/10 italic">{COPYRIGHT}</p>
      </footer>
    </div>
  );
};
