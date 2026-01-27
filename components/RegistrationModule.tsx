
import React, { useState, useEffect } from 'react';
import { User, UserRole, SynthesisPassData } from '../types.ts';
import { db } from '../services/storageService.ts';
import { cookies } from '../utils/cookieManager.ts';
import { SynthesisPass } from './SynthesisPass.tsx';
import { COPYRIGHT } from '../constants.tsx';

interface RegistrationModuleProps {
  onLogin: (user: User | null) => void;
  onRegisterClick: () => void;
  onShowTerms: () => void;
  onShowSvidInfo?: () => void;
}

const REMEMBER_EMAIL_KEY = 'synthesis_remember_email';

const generatePass = (level: number): SynthesisPassData => {
  const now = new Date();
  const expiry = new Date(); expiry.setFullYear(now.getFullYear() + 2);
  return {
    issueDate: now.toLocaleDateString(),
    expiryDate: expiry.toLocaleDateString(),
    serialNumber: `SYN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    status: 'ACTIVE',
    visualTier: level >= 90 ? 'INFINITY' : level >= 50 ? 'GOLD' : 'BRONZE'
  };
};

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({ onLogin, onRegisterClick, onShowTerms, onShowSvidInfo }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginInput, setLoginInput] = useState(cookies.get(REMEMBER_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [storedUser, setStoredUser] = useState<User | null>(null);
  const [isRecognized, setIsRecognized] = useState(false);

  useEffect(() => {
    const lastUserStr = localStorage.getItem('synthesis_last_user');
    if (lastUserStr) {
      try {
        const u = JSON.parse(lastUserStr);
        const dbUser = db.getById('users', u.id);
        if (dbUser) { 
          setStoredUser(dbUser); 
          setIsRecognized(true); 
        }
      } catch (e) { 
        console.error("Stored user parse error"); 
      }
    }
  }, []);

  const haptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handleFastPass = () => {
    haptic([10, 60]);
    setIsProcessing(true);
    
    // Priorita 1: Poslední přihlášený uživatel
    if (storedUser) {
      setTimeout(() => onLogin(storedUser), 400);
      return;
    }

    // Priorita 2: Hardcoded Architect (Mallfurion)
    const architect = db.getById('users', 'u-mallfurion');
    if (architect) {
      setTimeout(() => onLogin(architect), 400);
      return;
    }

    setIsRecognized(false);
    setIsProcessing(false);
  };

  const handleGuestLogin = () => {
    haptic([20, 10]);
    setIsProcessing(true);
    setTimeout(() => {
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        secretId: 'GUEST-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        virtualHash: 'HASH-GUEST-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        hardwareId: 'HW-GUEST',
        email: 'guest@synthesis.os',
        username: 'guest',
        name: 'Návštěvník',
        role: UserRole.HOST,
        level: 0,
        avatar: '👤',
        registrationDate: new Date().toLocaleDateString(),
        lastLogin: 'Právě teď',
        stats: { repairs: 0, growing: 0, success: '0%', publishedPosts: 0 },
        equipment: [],
        security: {
          method: 'PASSWORD',
          level: 'Základní',
          hardwareHandshake: false,
          biometricStatus: 'INACTIVE',
          encryptionType: 'NONE',
          lastAuthAt: new Date().toISOString()
        },
        mandateAccepted: false,
        pass: generatePass(0)
      };
      onLogin(guestUser);
    }, 800);
  };

  const handleSynthesisLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !password.trim()) return;
    
    haptic([10, 30]);
    setIsProcessing(true);
    
    cookies.set(REMEMBER_EMAIL_KEY, loginInput, 90);
    
    const isOwner = loginInput.toLowerCase() === 'sarji@seznam.cz' || 
                    loginInput.toLowerCase() === 'mallfuriionn@gmail.com' ||
                    loginInput.toLowerCase() === 'mallfurion';

    setTimeout(() => {
      const allUsers = db.getAll('users');
      const existingUser = allUsers.find(u => 
        u.email?.toLowerCase() === loginInput.toLowerCase() || 
        u.username?.toLowerCase() === loginInput.toLowerCase() ||
        u.secretId?.toLowerCase() === loginInput.toLowerCase() ||
        u.virtualHash?.toLowerCase() === loginInput.toLowerCase()
      );

      if (existingUser) {
        if (isOwner) {
            existingUser.role = UserRole.ARCHITECT;
            existingUser.level = 999;
            db.update('users', existingUser.id, existingUser);
        }
        localStorage.setItem('synthesis_last_user', JSON.stringify(existingUser));
        onLogin(existingUser);
        return;
      }

      if (isOwner) {
        const arch = db.getById('users', 'u-mallfurion');
        if (arch) { onLogin(arch); return; }
      }

      setIsProcessing(false);
      alert("Identita nenalezena. Prosím registrujte se.");
    }, 1200);
  };

  if (isRecognized && storedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 animate-synthesis-in bg-[#FBFBFD] overflow-y-auto no-scrollbar">
        <div className="text-center space-y-12 w-full max-w-sm">
          <div className="space-y-4">
             <div className="w-16 h-16 bg-black text-white rounded-[20px] flex items-center justify-center text-3xl shadow-xl mx-auto italic mb-6 font-black">S</div>
             <h1 className="text-4xl font-black italic tracking-tighter text-[#1D1D1F]">Vítejte zpět, {storedUser.name}</h1>
             <p className="text-[10px] font-black uppercase text-black/20 tracking-widest leading-relaxed">Synthesis Identity Recovery Protokol aktivní.</p>
          </div>
          
          <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => { haptic(5); onLogin(storedUser); }}>
            <SynthesisPass user={storedUser} lang="cs" />
          </div>
          
          <div className="space-y-3">
            <button onClick={() => onLogin(storedUser)} className="w-full h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Vstoupit do Jádra</button>
            <button onClick={() => { haptic(5); localStorage.removeItem('synthesis_last_user'); setIsRecognized(false); setStoredUser(null); }} className="w-full h-12 text-[9px] font-black uppercase text-black/30 hover:text-black transition-colors">Použít jinou Identitu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-synthesis-in bg-[#FBFBFD] overflow-y-auto no-scrollbar relative">
      <button 
        onClick={handleFastPass}
        className="fixed top-8 right-8 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-lg shadow-xl active:scale-90 transition-all z-[100] group"
        title="Synthesis FastPass"
      >
        <span className="group-hover:animate-pulse">✦</span>
      </button>

      <div className="flex flex-col items-center space-y-10 w-full max-w-sm">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#007AFF]/20 blur-2xl rounded-full scale-150 group-hover:bg-[#007AFF]/40 transition-all duration-700"></div>
          <div className="w-20 h-20 bg-black text-white rounded-[28px] flex items-center justify-center text-5xl shadow-2xl border border-black/5 italic relative z-10 font-black">S</div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter text-[#1D1D1F]">FixIt Guru</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#007AFF]">Synthesis OS v5.8 Alpha</p>
        </div>

        <form onSubmit={handleSynthesisLogin} className="space-y-6 w-full">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end px-4">
                <label className="text-[8px] font-black uppercase tracking-widest text-black/20">Vstupní Identita</label>
                {(loginInput.toLowerCase() === 'mallfurion' || loginInput.toLowerCase() === 'sarji@seznam.cz') && (
                  <span className="text-[7px] font-black uppercase text-[#007AFF] animate-pulse">Architect Detected</span>
                )}
              </div>
              <input 
                type="text" 
                autoFocus
                value={loginInput} 
                onChange={e => setLoginInput(e.target.value)} 
                placeholder="E-mail / SID-XXXXXX" 
                className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 outline-none font-bold text-sm shadow-sm focus:ring-4 ring-[#007AFF]/5 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-4">
                <label className="text-[8px] font-black uppercase tracking-widest text-black/20">Bezpečnostní Klíč</label>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••••••" 
                className="w-full h-14 bg-white border border-black/5 rounded-2xl px-6 outline-none font-bold text-sm shadow-sm focus:ring-4 ring-[#007AFF]/5 transition-all" 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={isProcessing || !loginInput || !password} 
              className="w-full h-16 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-20"
            >
              {isProcessing ? 'Verifikace v Matrixu...' : 'Ověřit Identitu'}
            </button>
            <button 
              type="button"
              onClick={handleGuestLogin}
              disabled={isProcessing}
              className="w-full h-14 bg-white border border-black/5 text-black/60 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm active:scale-95 transition-all hover:bg-black/5"
            >
              Vstoupit jako Host (Anonym)
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-4 w-full pt-8 border-t border-black/5">
           <button onClick={() => { haptic(5); onRegisterClick(); }} className="w-full h-14 bg-white border border-black/10 text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-black hover:text-white transition-all">Nová Registrace SVID</button>
           <button onClick={() => { haptic(5); onShowTerms(); }} className="text-[9px] font-black uppercase tracking-widest text-[#007AFF] hover:underline mx-auto">Podmínky služby</button>
        </div>

        <footer className="pt-8 space-y-4 text-center">
          <p className="text-[7px] font-black uppercase tracking-[0.4em] italic text-black/10">{COPYRIGHT}</p>
        </footer>
      </div>
    </div>
  );
};
