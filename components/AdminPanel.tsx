
import React, { useState, useEffect } from 'react';
import { Agent, User, UserRole, AuditLog, TableName, SocialPost, Project, SavedManual, WorkshopReport } from '../types.ts';
import { RBAC_CONFIG } from '../core/rbacConfig.ts';
import { db } from '../services/storageService.ts';
import { hasPermission } from '../utils/permissionUtils.ts';
import { fetchLogs, LogEntry } from '../services/logService.ts';

interface AdminPanelProps {
  user: User | null;
  agents: Agent[];
  onUpdateAgents: (agents: Agent[]) => void;
  onBack: () => void;
}

type AdminTab = 'OVERVIEW' | 'MATRIX' | 'MODULES' | 'FS' | 'JOURNAL' | 'KERNEL';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  user,
  agents, 
  onUpdateAgents, 
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeCrudTable, setActiveCrudTable] = useState<TableName>('posts');
  
  const [data, setData] = useState({
    users: db.getAll('users'),
    tasks: db.getAll('tasks'),
    audit: db.getAll('globalAudit'),
    posts: db.getAll('posts'),
    projects: db.getAll('projects'),
    manuals: db.getAll('manuals'),
    reports: db.getAll('reports')
  });

  useEffect(() => {
    fetchLogs().then(entries => setLogs(entries.sort((a, b) => b.id - a.id)));
    const refresh = () => setData({
      users: db.getAll('users'),
      tasks: db.getAll('tasks'),
      audit: db.getAll('globalAudit'),
      posts: db.getAll('posts'),
      projects: db.getAll('projects'),
      manuals: db.getAll('manuals'),
      reports: db.getAll('reports')
    });
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const haptic = (p: number | number[] = 10) => { if ('vibrate' in navigator) navigator.vibrate(p); };

  const handleUpdateUser = (updated: User) => {
    db.update('users', updated.id, updated);
    setSelectedUser(updated);
    haptic(10);
    logAction(`USER_UPDATE: ${updated.username}`);
  };

  const logAction = (action: string) => {
    db.insert('globalAudit', {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      actorId: user?.id || 'sys',
      actorName: user?.username,
      category: 'SYSTEM',
      severity: 'LOW'
    });
  };

  const handleDeleteItem = (table: TableName, id: string) => {
    if (confirm(`Opravdu chcete odstranit záznam z tabulky ${table}?`)) {
      db.delete(table, id);
      haptic([20, 50]);
      logAction(`DELETE_ITEM: ${table} -> ${id}`);
    }
  };

  if (!user || !hasPermission(user, 'ACCESS_KERNEL')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#000814] p-10 text-center h-full">
        <h2 className="text-white font-black italic text-2xl uppercase tracking-tighter">Access Denied</h2>
        <button onClick={onBack} className="mt-8 px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Return</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FBFBFD] animate-synthesis-in font-sans relative">
      
      {/* USER EDITOR OVERLAY */}
      {selectedUser && (
        <div className="fixed inset-0 z-[1000] bg-white animate-fluent-in flex flex-col overflow-y-auto no-scrollbar pb-40">
           <header className="px-6 h-20 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-50">
              <div className="flex items-center gap-4">
                 <span className="text-3xl">{selectedUser.avatar}</span>
                 <div>
                   <h3 className="text-sm font-black italic uppercase leading-none">{selectedUser.name}</h3>
                   <p className="text-[7px] font-black uppercase text-[#007AFF] mt-1.5 tracking-widest">Role: {selectedUser.role}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">✕</button>
           </header>

           <div className="p-6 space-y-10 max-w-xl mx-auto w-full">
              <section className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30 px-2">Role Management</h4>
                <div className="grid grid-cols-1 gap-2">
                   {Object.values(RBAC_CONFIG).filter(r => r.role !== UserRole.HOST).map(role => (
                     <button 
                       key={role.role}
                       onClick={() => handleUpdateUser({...selectedUser, role: role.role})}
                       className={`p-5 rounded-3xl border flex justify-between items-center transition-all ${selectedUser.role === role.role ? 'bg-black text-white shadow-xl' : 'bg-[#FBFBFD] border-black/5 text-black/40 hover:bg-black/5'}`}
                     >
                        <div className="flex items-center gap-4">
                           <span className="text-xl">{role.icon}</span>
                           <div className="text-left">
                             <p className="text-[10px] font-black uppercase tracking-widest">{role.label}</p>
                             <p className="text-[7px] font-bold opacity-50 uppercase mt-0.5">{role.description}</p>
                           </div>
                        </div>
                        {selectedUser.role === role.role && <span className="text-[10px]">✓</span>}
                     </button>
                   ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30 px-2">Bezpečnostní Status</h4>
                <div className="p-8 bg-black text-white rounded-[40px] space-y-6">
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Integrity Score</p>
                      <p className="text-2xl font-black italic text-[#007AFF]">{selectedUser.security.integrityScore}%</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Hardware Binding</p>
                      <p className="text-[10px] font-bold text-green-400">AKTIVNÍ</p>
                   </div>
                </div>
              </section>

              <footer className="pt-10 flex gap-4">
                 <button onClick={() => { if(confirm('Smazat uživatele?')) { db.delete('users', selectedUser.id); setSelectedUser(null); logAction(`USER_DELETE: ${selectedUser.username}`); } }} className="flex-1 h-14 bg-red-600 text-white rounded-3xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Smazat Subjekt</button>
                 <button onClick={() => setSelectedUser(null)} className="flex-1 h-14 bg-black/5 text-black/40 rounded-3xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Zavřít</button>
              </footer>
           </div>
        </div>
      )}

      {/* ADMIN HEADER */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black">S</div>
          <div>
            <h2 className="text-xs font-black italic uppercase tracking-tighter">{activeTab}</h2>
            <p className="text-[7px] font-black text-[#007AFF] uppercase tracking-widest mt-0.5">Kernel Master v5.8</p>
          </div>
        </div>
        <button onClick={onBack} className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center text-sm hover:bg-black hover:text-white transition-all">✕</button>
      </header>

      {/* MAIN SURFACE */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-40">
        <div className="p-6 space-y-10 max-w-4xl mx-auto w-full">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-10 animate-synthesis-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { l: 'Uživatelé', v: data.users.length, i: '👥' },
                   { l: 'Projekty', v: data.projects.length, i: '📁' },
                   { l: 'Feed Posts', v: data.posts.length, i: '📱' },
                   { l: 'Audit Log', v: data.audit.length, i: '📝' }
                 ].map(s => (
                   <div key={s.l} className="p-6 bg-white border border-black/5 rounded-[32px] h-36 flex flex-col justify-between shadow-sm group hover:shadow-xl transition-all">
                     <div className="text-2xl opacity-40 group-hover:scale-110 transition-transform">{s.i}</div>
                     <div>
                       <p className="text-[8px] font-black uppercase text-black/20 tracking-widest">{s.l}</p>
                       <p className="text-3xl font-black italic leading-none mt-1">{s.v}</p>
                     </div>
                   </div>
                 ))}
              </div>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 px-2 italic">Aktivní Úkoly Jádra</h3>
                <div className="bg-white border border-black/5 rounded-[40px] overflow-hidden">
                   {data.tasks.slice(0, 5).map((task: any) => (
                     <div key={task.id} className="p-6 border-b border-black/[0.03] last:border-0 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-[#007AFF] animate-pulse'}`}></div>
                           <span className="text-[10px] font-black italic">{task.type}</span>
                        </div>
                        <span className="text-[8px] font-black uppercase text-black/20 tracking-widest">{task.createdAt}</span>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'MATRIX' && (
            <div className="space-y-6 animate-synthesis-in">
              <div className="relative">
                <input 
                  placeholder="Hledat identifier v Matrixu..." 
                  className="w-full h-16 bg-white border border-black/5 rounded-3xl px-8 outline-none font-bold text-base shadow-sm focus:ring-4 ring-[#007AFF]/5 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-20">🔍</span>
              </div>
              <div className="grid gap-3">
                {data.users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                  <button key={u.id} onClick={() => setSelectedUser(u)} className="p-6 bg-white border border-black/5 rounded-[36px] flex items-center justify-between text-left group hover:shadow-xl hover:translate-y-[-2px] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#F2F2F7] rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-black/5">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="text-base font-black italic leading-none">{u.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[8px] font-black uppercase text-[#007AFF] tracking-widest">{u.role}</span>
                           <span className="text-[8px] font-black text-black/20 tracking-widest">• Lvl {u.level}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-black/10 group-hover:text-black transition-colors font-black text-xs uppercase tracking-widest">Editovat →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'MODULES' && (
            <div className="space-y-8 animate-synthesis-in">
               <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {[
                    { id: 'posts', label: 'Feed' },
                    { id: 'projects', label: 'Projekty' },
                    { id: 'manuals', label: 'Návody' },
                    { id: 'reports', label: 'Protokoly' }
                  ].map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => { setActiveCrudTable(t.id as TableName); haptic(5); }}
                      className={`px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCrudTable === t.id ? 'bg-black text-white shadow-lg' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                    >
                      {t.label}
                    </button>
                  ))}
               </nav>

               <div className="space-y-3">
                  {(data[activeCrudTable] as any[]).map((item: any) => (
                    <div key={item.id} className="p-6 bg-white border border-black/5 rounded-[32px] flex items-center justify-between shadow-sm group hover:border-[#007AFF]/20 transition-all">
                       <div className="flex-1 overflow-hidden pr-4">
                          <h4 className="font-black italic text-sm truncate leading-none">{item.title || item.deviceName || item.author}</h4>
                          <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1.5">{item.date || item.lastUpdate || 'Permanent'}</p>
                       </div>
                       <div className="flex gap-2 shrink-0">
                          <button onClick={() => alert('Detailní editace modulu připravována v v5.9')} className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white">✎</button>
                          <button onClick={() => handleDeleteItem(activeCrudTable, item.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">✕</button>
                       </div>
                    </div>
                  ))}
                  {(data[activeCrudTable] as any[]).length === 0 && (
                    <div className="p-20 text-center border-2 border-dashed border-black/5 rounded-[48px] text-[10px] font-black uppercase text-black/10 tracking-[0.4em]">Tabulka prázdná</div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'JOURNAL' && (
            <div className="space-y-6 animate-synthesis-in">
               <header className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-black italic tracking-tighter">Audit Log</h3>
                  <button onClick={() => { db.importRaw(JSON.stringify({...data, audit: []})); logAction('AUDIT_LOG_CLEAR'); }} className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline">Smazat historii</button>
               </header>
               <div className="relative pl-10 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-black/[0.05]">
                {data.audit.map((log: AuditLog) => (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 border-[#FBFBFD] shadow-md z-10 transition-all group-hover:scale-125 ${log.severity === 'HIGH' ? 'bg-red-500' : 'bg-[#007AFF]'}`}></div>
                    <div className="bg-white border border-black/5 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start">
                          <p className="text-[8px] font-black text-[#007AFF] uppercase tracking-widest">{log.category} • {log.timestamp}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase ${log.severity === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{log.severity}</span>
                        </div>
                        <h4 className="text-sm font-black italic leading-tight text-black/80">{log.action}</h4>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest italic">Actor: {log.actorName || 'System Kernel'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'KERNEL' && (
            <div className="space-y-8 animate-synthesis-in max-w-2xl mx-auto">
               <div className="p-12 bg-black text-white rounded-[56px] space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/20 blur-[100px]"></div>
                  <div className="space-y-2 relative z-10">
                     <h3 className="text-4xl font-black italic tracking-tighter">Kernel Config</h3>
                     <p className="text-sm text-white/40 uppercase tracking-widest font-black">Synthesis Alpha v5.8.2-B</p>
                  </div>
                  
                  <div className="grid gap-4 relative z-10">
                     {[
                       { id: 'MAINTENANCE', label: 'Maintenance Mode', status: 'INACTIVE' },
                       { id: 'PUBLIC_REG', label: 'Public Registration', status: 'ACTIVE' },
                       { id: 'OCR_CORE', label: 'Advanced OCR Neural', status: 'ACTIVE' },
                       { id: 'DEBUG_LOGS', label: 'Verbose Debugging', status: 'INACTIVE' }
                     ].map(cfg => (
                       <button key={cfg.id} className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{cfg.label}</span>
                          <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${cfg.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'}`}>{cfg.status}</span>
                       </button>
                     ))}
                  </div>
               </div>
               
               <div className="p-10 border-2 border-dashed border-black/5 rounded-[48px] bg-amber-50/30 text-center space-y-4">
                  <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest italic leading-relaxed">
                    Změny v Kernelu vyžadují restart Jádra skrze Synthesis Architect Handshake.
                  </p>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* DOCK NAVIGATION */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-black/95 backdrop-blur-3xl rounded-[36px] border border-white/10 flex items-center justify-around px-4 shadow-2xl z-[1200]">
        {[
          { id: 'OVERVIEW', i: '📊' },
          { id: 'MATRIX', i: '👥' },
          { id: 'MODULES', i: '📦' },
          { id: 'FS', i: '📂' },
          { id: 'JOURNAL', i: '📝' },
          { id: 'KERNEL', i: '⚙️' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setActiveTab(t.id as AdminTab); haptic(5); }}
            className={`w-11 h-11 rounded-2xl transition-all relative flex items-center justify-center ${activeTab === t.id ? 'bg-white text-black scale-110 shadow-xl' : 'text-white/20 hover:text-white/50'}`}
          >
            <span className="text-xl">{t.i}</span>
            {activeTab === t.id && (
              <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
