import React, { useEffect, useState } from 'react';
import { fetchLogs, LogEntry } from '../services/logService.ts';
import { fetchCatalog, CatalogData } from '../services/catalogService.ts';

export const TechnicalLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'catalog'>('journal');

  useEffect(() => {
    fetchLogs().then(setLogs);
    fetchCatalog().then(setCatalog);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'journal' ? 'bg-blue-600' : 'hover:bg-white/5'}`}
        >
          Technický deník
        </button>
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-blue-600' : 'hover:bg-white/5'}`}
        >
          Katalog souborů
        </button>
      </div>

      {activeTab === 'journal' ? (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-4 glass rounded-2xl border-white/5 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-400">Požadavek #{log.id}</span>
                <span className="text-[10px] opacity-40">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="mb-3">
                <p className="text-white/40 uppercase text-[9px] tracking-widest mb-1">Uživatel</p>
                <p className="italic">"{log.userRequest}"</p>
              </div>
              <div className="mb-3">
                <p className="text-white/40 uppercase text-[9px] tracking-widest mb-1">Implementace</p>
                <p>{log.implementation}</p>
              </div>
              <div>
                <p className="text-white/40 uppercase text-[9px] tracking-widest mb-1">Změněné soubory</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {log.filesChanged.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-white/5 rounded-md text-[10px]">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {catalog?.files.map((file) => (
            <div key={file.path} className="flex justify-between p-3 glass rounded-xl border-white/5 hover:bg-white/10 transition-colors">
              <code className="text-blue-300 text-xs">{file.path}</code>
              <span className="text-xs text-white/60">{file.description}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-white/10 text-right opacity-40 text-[10px]">
            Verze: {catalog?.version}
          </div>
        </div>
      )}
    </div>
  );
};