import React from 'react';
import { COPYRIGHT } from '../constants';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative acrylic w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fluent">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-fluent hover:bg-white/10 transition-colors reveal-focus"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-white/80 leading-relaxed text-sm">
          {children}
        </div>
        <div className="p-3 border-t border-white/10 text-center text-[9px] text-white/30 uppercase tracking-[0.2em]">
          {COPYRIGHT}
        </div>
      </div>
    </div>
  );
};