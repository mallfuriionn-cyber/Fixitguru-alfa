
import React, { useState } from 'react';
import { Agent, MenuItem, User, UserRole } from '../types.ts';
import { UserDetailPanel } from './UserDetailPanel.tsx';
import { COPYRIGHT } from '../constants.tsx';

interface AdminPanelProps {
  agents: Agent[];
  menuItems: MenuItem[];
  onUpdateAgents: (agents: Agent[]) => void;
  onUpdateMenu: (items: MenuItem[]) => void;
  onBack: () => void;
}

type AdminTab = 'PERSONS' | 'MODULES' | 'CONTENT' | 'GURUS' | 'KERNEL';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  agents, 
  menuItems, 
  onUpdateAgents, 
  onUpdateMenu, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('PERSONS');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [usersList, setUsersList] = useState<User[]>([
    { 
      id: 'admin-1', 
      secretId: 'HIDDEN-ENCRYPTED',
      virtualHash: 'SID-E88A22B4',
      email: 'sarji@seznam.cz',
      username: 'mallfurion',
      name: 'Mallfurion', 
      role: UserRole.ADMINISTRATOR, 
      lastLogin: 'Právě teď', 
      level: 99, 
      avatar: '✦',
      isOwner: true,
      equipment: ['Synthesis Core', 'Neural Link', 'Apex Terminal'],
      registrationDate: '01.01.2025',
      stats: { repairs: 150, growing: 45, success: '100%', publishedPosts: 25 },
      guruLevelLabel: 'Synthesis Architect'
    }
  ]);

  const handleUpdateUser = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setViewingUser(updatedUser);
  };

  const handleToggleModule = (id: string) => {
    onUpdateMenu(menuItems.map(item => 
      item.id === id ? { ...item, enabled: item.enabled === false } : item
    ));
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#FBFBFD] animate-synthesis-in h-full relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#007AFF]/5 blur-[150px] -z-10"></div>
      
      {viewingUser && (
        <UserDetailPanel 
          user={viewingUser} 
          onClose={() => setViewingUser(null)} 
          onUpdateUser={handleUpdateUser} 
        />
      )}

      {/* Header Adminu */}
      <header className="px-8 pt-12 pb-6 flex justify-between items-end border-b border-black/5 shrink-0 bg-white/80 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#007AFF] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,122,255,0.3)]"></span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#007AFF]">Synthesis Control Center</p>
          </div>
          <h2 className="text-4xl font-black tracking-tighter italic leading-none text-[#1D1D1F]">Kernel Admin v2.1</h2>
        </div>
        <button 
          onClick={onBack} 
          className="h-12 px-10 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-black/90"
        >
          Exit Console
        </button>
      </header>

      {/* Hlavní navigace adminu */}
      <nav className="flex px-8 h-[72px] border-b border-black/5 gap-1 overflow-x-auto no-scrollbar shrink-0 items-center bg-white/50 backdrop-blur-md">
        {[
          { id: 'PERSONS', label: 'Persony', icon: '🤖' },
          { id: 'MODULES', label: 'Moduly', icon: '⚙️' },
          { id: 'CONTENT', label: 'Obsah', icon: '📜' },
          { id: 'GURUS', label: 'Gurus', icon: '👤' },
          { id: 'KERNEL', label: 'Jádro', icon: '📡' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as AdminTab); setEditingAgent(null); }}
            className={`h-[44px] px-8 rounded-2xl flex items-center gap-4 transition-all whitespace-nowrap text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:bg-black/5'}`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Dynamický obsah adminu */}
      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-12 no-scrollbar pb-32">
        
        {activeTab === 'GURUS' && (
          <div className="space-y-8 max-w-4xl mx-auto animate-synthesis-in">
             <div className="flex justify-between items-center px-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30 text-black">Databáze Gurů (Synthesis Virtual Identity)</h3>
                <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest">Aktivních: {usersList.length}</span>
             </div>
             <div className="bg-white border border-black/5 rounded-[48px] overflow-hidden divide-y divide-black/5 shadow-sm">
                {usersList.map(u => (
                  <button 
                    key={u.id} 
                    onClick={() => setViewingUser(u)} 
                    className="w-full p-10 flex items-center justify-between hover:bg-black/[0.02] transition-all text-left group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-18 h-18 bg-black/5 border border-black/5 rounded-[28px] flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                        {u.avatar}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black leading-none text-[#1D1D1F] italic">{u.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] mt-3">{u.virtualHash}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                       <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Synthesis Role</p>
                       <p className="text-base font-black text-black/80 italic">{u.role}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'PERSONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-synthesis-in max-w-5xl mx-auto">
            {agents.map(agent => (
              <button 
                key={agent.id} 
                onClick={() => setEditingAgent(agent)}
                className="p-10 glass rounded-[48px] text-left border border-black/5 flex items-center justify-between group hover:border-[#007AFF]/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-white border border-black/5 rounded-[32px] flex items-center justify-center text-4xl shadow-sm" style={{ color: agent.color }}>
                    {agent.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-[#1D1D1F] italic leading-none">{agent.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] mt-2 opacity-40">{agent.title}</p>
                  </div>
                </div>
                <span className="text-black/10 group-hover:text-black transition-colors text-2xl">→</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'KERNEL' && (
          <div className="space-y-10 max-w-4xl mx-auto animate-synthesis-in">
             <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-12 rounded-[56px] text-center space-y-4 shadow-sm">
                   <p className="text-[11px] font-black uppercase opacity-30 tracking-widest">Node Uptime</p>
                   <p className="text-3xl font-black text-black italic">14d 6h 22m</p>
                </div>
                <div className="glass p-12 rounded-[56px] text-center space-y-4 shadow-sm">
                   <p className="text-[11px] font-black uppercase opacity-30 tracking-widest">Gurus Online</p>
                   <p className="text-3xl font-black text-[#007AFF] italic">12 Nodes</p>
                </div>
                <div className="glass p-12 rounded-[56px] text-center space-y-4 shadow-sm">
                   <p className="text-[11px] font-black uppercase opacity-30 tracking-widest">Kernel Latency</p>
                   <p className="text-3xl font-black text-green-600 italic">8ms</p>
                </div>
             </section>
          </div>
        )}
      </div>

      <footer className="px-8 py-10 border-t border-black/5 bg-white text-center shrink-0">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/15 italic">{COPYRIGHT}</p>
      </footer>
    </div>
  );
};
