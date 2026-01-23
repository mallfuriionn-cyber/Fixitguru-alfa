
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-white/80 leading-relaxed">
          {children}
        </div>
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-white/40 uppercase tracking-widest">
          {COPYRIGHT}
        </div>
      </div>
    </div>
  );
};
