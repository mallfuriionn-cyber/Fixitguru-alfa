import React from 'react';
import { COPYRIGHT } from '../constants.tsx';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-fluent-in">
      {/* Header Modal */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <h2 className="text-xl font-bold tracking-tight text-black">{title}</h2>
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 border border-black/5 active:scale-90 transition-transform"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 text-black/70 leading-relaxed font-medium">
        {children}
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-black/5 text-center bg-[#FBFBFD]">
        <p className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-bold">
          {COPYRIGHT}
        </p>
        <div className="h-6" /> {/* Space for home indicator */}
      </div>
    </div>
  );
};