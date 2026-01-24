
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';

interface DetailedRegistrationProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
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

export const DetailedRegistration: React.FC<DetailedRegistrationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '👤',
    bio: '',
    specialization: '',
    equipment: '',
  });

  const avatars = ['👤', '🛠️', '⚡', '🌿', '🔧', '🔬', '🎨', '🚀'];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const finalize = () => {
    const secretId = generateSecretId();
    onComplete({
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      secretId: secretId,
      virtualHash: generateVirtualHash(secretId),
      email: formData.email || 'new_user@synthesis.cz',
      username: formData.name.toLowerCase().replace(/\s/g, '_'),
      name: formData.name || 'Nový Guru',
      role: UserRole.SUBSCRIBER,
      level: 1,
      avatar: formData.avatar,
      bio: formData.bio,
      specialization: formData.specialization.split(',').map(s => s.trim()).filter(Boolean),
      equipment: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
      registrationDate: new Date().toLocaleDateString(),
      lastLogin: 'Právě teď',
      stats: {
        repairs: 0,
        growing: 0,
        success: '0%',
        publishedPosts: 0
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto px-6 py-12 animate-synthesis-in overscroll-contain pb-32">
      <header className="max-w-xl mx-auto w-full mb-12 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007AFF]">Synthesis ID Creation</p>
          <button onClick={onCancel} className="text-black/20 hover:text-black transition-colors">✕</button>
        </div>
        <h2 className="text-4xl font-black tracking-tighter italic">Nové Synthesis ID</h2>
        <div className="flex gap-2 pt-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-black' : 'bg-black/5'}`} />
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto w-full flex-1">
        {step === 1 && (
          <div className="space-y-10 animate-synthesis-in">
            <section className="space-y-6 text-center">
              <div className="flex flex-wrap justify-center gap-4">
                {avatars.map(a => (
                  <button 
                    key={a} 
                    onClick={() => setFormData({...formData, avatar: a})}
                    className={`w-16 h-16 rounded-[24px] text-3xl flex items-center justify-center transition-all ${formData.avatar === a ? 'bg-black text-white scale-110 shadow-xl' : 'bg-[#F2F2F7] hover:bg-black/5'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase opacity-30 tracking-widest">Vyberte svou digitální entitu</p>
            </section>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Jméno nebo Přezdívka</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Jak vám máme říkat?"
                  className="w-full bg-[#F2F2F7] border-none rounded-[22px] px-6 py-5 focus:ring-2 ring-black/5 outline-none text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Kontaktní E-mail</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="pro ověření identity"
                  className="w-full bg-[#F2F2F7] border-none rounded-[22px] px-6 py-5 outline-none text-lg font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Biografie Synthesis</label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Krátce o vašich zkušenostech..."
                className="w-full bg-[#F2F2F7] border-none rounded-[32px] px-6 py-5 h-48 resize-none outline-none font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Specializace (oddělené čárkou)</label>
              <input 
                type="text"
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
                placeholder="např. Mikropájení, Botanika, LEGO modely"
                className="w-full bg-[#F2F2F7] border-none rounded-[22px] px-6 py-5 outline-none font-bold"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-synthesis-in">
            <div className="space-y-4">
              <p className="text-xl font-bold tracking-tight px-2">Vybavení Vaší Dílny</p>
              <p className="text-sm text-black/40 leading-relaxed px-2">Tyto informace pomohou asistentům lépe přizpůsobit návody vašemu nářadí.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Seznam Nářadí</label>
              <textarea 
                value={formData.equipment}
                onChange={e => setFormData({...formData, equipment: e.target.value})}
                placeholder="Pájecí stanice, 3D tiskárna, Sada šroubováků..."
                className="w-full bg-[#F2F2F7] border-none rounded-[32px] px-6 py-5 h-48 resize-none outline-none font-bold"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-synthesis-in py-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-black text-white rounded-[40px] flex items-center justify-center text-5xl mx-auto shadow-2xl">
                {formData.avatar}
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">{formData.name || 'Guru bez jména'}</h3>
                <p className="text-xs text-black/40 font-bold uppercase tracking-widest italic">Předpokládaná role: Subscriber</p>
              </div>
            </div>

            <div className="bg-[#FBFBFD] border border-black/5 rounded-[40px] p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] shrink-0 mt-1">✓</div>
                <p className="text-sm font-medium leading-relaxed">Souhlasím s Manifestem Synthesis a zavazuji se k podpoře opravitelnosti a udržitelnosti.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] shrink-0 mt-1">✓</div>
                <p className="text-sm font-medium leading-relaxed">Rozumím, že FixIt Guru je experimentální alfa verze a veškeré opravy provádím na vlastní riziko.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-10 left-0 right-0 px-6">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="flex-1 py-5 bg-[#F2F2F7] text-black rounded-[24px] font-bold text-lg active:scale-95 transition-all"
            >
              Zpět
            </button>
          )}
          <button 
            onClick={step < 4 ? handleNext : finalize}
            className={`flex-[2] py-5 text-white rounded-[24px] font-bold text-lg active:scale-95 transition-all shadow-2xl ${formData.name || step > 1 ? 'bg-black shadow-black/20' : 'bg-black/10 text-black/20 pointer-events-none'}`}
          >
            {step < 4 ? 'Pokračovat' : 'Inicializovat Synthesis ID'}
          </button>
        </div>
      </footer>
    </div>
  );
};
