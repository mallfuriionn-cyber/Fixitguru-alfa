
import React from 'react';

interface VoiceControlProps {
  isActive: boolean;
  onToggle: () => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ isActive, onToggle }) => {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onToggle}
        className={`relative w-14 h-14 flex items-center justify-center rounded-[20px] transition-all active:scale-90 shadow-sm ${
          isActive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-black/5 hover:bg-black/10 text-black/40'
        }`}
        title="Vocal Link Control"
      >
        {isActive && (
          <span className="absolute inset-0 rounded-[20px] bg-red-500/10 animate-ping"></span>
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>
      
      {isActive && (
        <div className="flex gap-1.5 items-center px-5 py-2.5 bg-red-50 border border-red-100 rounded-full animate-synthesis-in">
          <div className="w-1 h-3 bg-red-500 rounded-full animate-[pulse_1s_infinite]"></div>
          <div className="w-1 h-5 bg-red-500 rounded-full animate-[pulse_1.2s_infinite]"></div>
          <div className="w-1 h-2 bg-red-500 rounded-full animate-[pulse_0.8s_infinite]"></div>
          <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-red-600">Vocal Link Active</span>
        </div>
      )}
    </div>
  );
};
