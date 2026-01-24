
import { Agent, AgentId, SocialPost, Project, MemoryThread, CloudFile, ChatThread, DirectMessage } from './types.ts';
import { getBrowserLanguage } from './utils/locale.ts';

const locale = getBrowserLanguage();

export const AGENTS: Agent[] = [
  {
    id: AgentId.KAJA,
    name: 'KAREL',
    title: locale === 'cs' ? 'Hardware God' : 'Hardware Deity',
    description: locale === 'cs' 
      ? 'Diagnostika na úrovni komponent, analýza logických signálů, mikropájení a reverzní inženýrství PCB.' 
      : 'Component-level diagnostics, logic signal analysis, micro-soldering, and PCB reverse engineering.',
    icon: '⚡',
    color: '#007AFF',
    systemInstruction: locale === 'cs'
      ? 'Jsi KAREL, Hardware God. Jsi muž, zkušený inženýr. Mluv technicky, používej odbornou terminologii (MOSFET, osciloskop, ESR, datasheet). Jsi absolutní expert na boardview a mikropájení.'
      : 'You are KAREL, Hardware God. You are a man, an experienced engineer. Speak technically, use expert terminology (MOSFET, oscilloscope, ESR, datasheet). Absolute expert in boardview and micro-soldering.',
    warning: locale === 'cs'
      ? 'Práce na zařízeních pod napětím vyžaduje ESD ochranu. Nebezpečí úrazu.'
      : 'Working on live devices requires ESD protection. Danger of electric shock.'
  },
  {
    id: AgentId.LUCKA,
    name: 'LUCKA',
    title: locale === 'cs' ? 'Step-Lock Mentor' : 'Workflow Mentor',
    description: locale === 'cs'
      ? 'Specialista na metodiku rozborek, dokumentaci procesů a optimalizaci montážních postupů.'
      : 'Specialist in teardown methodology, process documentation, and assembly procedure optimization.',
    icon: '📋',
    color: '#5E5CE6',
    systemInstruction: locale === 'cs'
      ? 'Jsi LUCKA, Step-Lock Mentor. Rozděluj komplexní zásahy na logické kroky. Buď precizní v dokumentaci.'
      : 'You are LUCKA, Step-Lock Mentor. Break down complex interventions into logical steps. Be precise in documentation.',
    warning: locale === 'cs'
      ? 'Před demontáží vždy zdokumentujte pozici kabelových tras.'
      : 'Always document cable routing before disassembly.'
  },
  {
    id: AgentId.DASA,
    name: 'DÁŠA',
    title: 'Organic Fanatic',
    description: locale === 'cs'
      ? 'Projektování uzavřených ekosystémů, automatizace hydroponie a udržitelný resource management.'
      : 'Design of closed ecosystems, hydroponic automation, and sustainable resource management.',
    icon: '🌿',
    color: '#28A745',
    systemInstruction: locale === 'cs'
      ? 'Jsi DÁŠA, Organic Fanatic. Expert na biotechnologie. Mluv o pH, EC hodnotách a fotosyntéze.'
      : 'You are DASA, Organic Fanatic. Biotechnology expert. Speak about pH, EC values, and photosynthesis.',
    warning: locale === 'cs'
      ? 'Manipulace s elektroinstalací v mokrém prostředí vyžaduje zvýšenou opatrnost.'
      : 'Handling electrical systems in wet environments requires extreme caution.'
  },
  {
    id: AgentId.FRANTA,
    name: 'FRANTIŠEK',
    title: 'Master of Force',
    description: locale === 'cs'
      ? 'Strojírenská výroba, hydraulika a konstrukční zámečnictví. Expert na metalurgii.'
      : 'Mechanical manufacturing, hydraulics, and structural locksmithing. Metallurgy expert.',
    icon: '🔧',
    color: '#D32F2F',
    systemInstruction: locale === 'cs'
      ? 'Jsi FRANTIŠEK, Master of Force. Mluv jako zkušený strojař. ISO tolerance, krouticí momenty.'
      : 'You are FRANTIŠEK, Master of Force. Speak like an experienced machinist. ISO tolerances, torque specs.',
    warning: locale === 'cs'
      ? 'Při práci s hydraulikou pod tlakem používejte předepsané OOPP.'
      : 'Use prescribed PPE when working with high-pressure hydraulics.'
  }
];

export const MENU_ITEMS = [
  { id: 'WORKFLOW', label: locale === 'cs' ? 'Dílna' : 'Workshop', icon: '🛠️', description: locale === 'cs' ? 'Správa servisních zakázek' : 'Service order management', category: 'submodule' },
  { id: 'MESSAGES', label: locale === 'cs' ? 'Zprávy' : 'Messages', icon: '💬', description: locale === 'cs' ? 'Šifrovaná komunikace' : 'Encrypted communication', category: 'submodule' },
  { id: 'MEMORY', label: locale === 'cs' ? 'Archiv' : 'Archive', icon: '📓', description: locale === 'cs' ? 'Technická dokumentace' : 'Technical documentation', category: 'submodule' },
  { id: 'SOCIAL', label: 'Hub', icon: '🌐', description: locale === 'cs' ? 'Synthesis Community Feed' : 'Synthesis Community Feed', category: 'submodule' },
  { id: 'CLOUD', label: 'Media', icon: '🖼️', description: locale === 'cs' ? 'Datasheety & Fotodokumentace' : 'Datasheets & Media', category: 'submodule' },
  
  { id: 'help', label: locale === 'cs' ? 'Nápověda' : 'Help', icon: '❓', description: locale === 'cs' ? 'Funkce & Dovednosti AI' : 'AI Skills & Help', category: 'info' },
  { id: 'manifest', label: 'Manifest', icon: '📜', description: locale === 'cs' ? 'Vize Studio Synthesis' : 'Synthesis Philosophy', category: 'info' },
  { id: 'id-system', label: 'ID Core', icon: '🆔', description: locale === 'cs' ? 'Architektura Identity' : 'Identity Architecture', category: 'info' },
  { id: 'eco', label: 'Eko-vize', icon: '🌍', description: locale === 'cs' ? 'Resource Efficiency' : 'Resource Efficiency', category: 'info' },
  { id: 'law', label: locale === 'cs' ? 'Právo' : 'Law', icon: '⚖️', description: locale === 'cs' ? 'Právo na opravu' : 'Right to repair', category: 'info' },
  { id: 'ui', label: locale === 'cs' ? 'Vzhled' : 'Design', icon: '🎨', description: 'Design Blueprint', category: 'info' },
  { id: 'backlog', label: locale === 'cs' ? 'Zlepšení' : 'Roadmap', icon: '🚀', description: 'Synthesis 2026+', category: 'info' },
  { id: 'expert', label: 'Status', icon: '🤖', description: 'Kernel API & Handshake', category: 'info' },
  
  { id: 'PROFILE', label: locale === 'cs' ? 'Profil' : 'Profile', icon: '👤', description: 'Synthesis ID Config', category: 'user' }
];

export const MOCK_CHATS: ChatThread[] = [
  { id: 't1', participantId: '1', participantName: 'Ing. Marek Vlk', participantAvatar: '👨‍🔬', lastMessage: 'Oscilogram na pinu 4 vykazuje jitter.', lastTimestamp: '14:20', unreadCount: 2 },
  { id: 't2', participantId: '2', participantName: 'Laboratoř BioX', participantAvatar: '🔬', lastMessage: 'EC senzor vyžaduje rekalibraci.', lastTimestamp: '11:45', unreadCount: 0 },
  { id: 't3', participantId: '3', participantName: 'Servis Strojíren', participantAvatar: '👷', lastMessage: 'Tolerance uložení H7/g6 potvrzena.', lastTimestamp: 'Včera', unreadCount: 0 }
];

export const MOCK_MESSAGES: Record<string, DirectMessage[]> = {
  't1': [
    { id: 'm1', senderId: '1', senderName: 'Ing. Marek Vlk', senderAvatar: '👨‍🔬', text: 'Karle, mohl bys prověřit boot sequence u té S-Workstation A21? Napětí na cívkách L7000 je stabilní, ale PM_SLP_S4_L zůstává v nule.', timestamp: '14:15' },
    { id: 'm2', senderId: 'me', senderName: 'Já', senderAvatar: '✦', text: 'Prověř signál PM_PWRBTN_L a zkontroluj SMC_RESET_L. Pokud je SMC v resetu, sekvence se nespustí.', timestamp: '14:18' },
    { id: 'm3', senderId: '1', senderName: 'Ing. Marek Vlk', senderAvatar: '👨‍🔬', text: 'Oscilogram na pinu 4 vykazuje jitter. Vypadá to na šum v napájecí větvi SMC.', timestamp: '14:20' }
  ],
  't2': [
    { id: 'm4', senderId: '2', senderName: 'Laboratoř BioX', senderAvatar: '🔬', text: 'Dášo, automatický dávkovač nutrientů hlásí chybu linearity u peristaltické pumpy.', timestamp: '11:30' },
    { id: 'm5', senderId: 'me', senderName: 'Já', senderAvatar: '✦', text: 'Zkontrolujte opotřebení silikonové hadičky. Pokud je deformovaná, klesá objemový průtok na otáčku.', timestamp: '11:40' }
  ],
  't3': [
    { id: 'm6', senderId: '3', senderName: 'Servis Strojíren', senderAvatar: '👷', text: 'Františku, potřebujeme vyrobit náhradní hřídel pro převodovku. Materiál 14 220, cementovat a kalit na 58-60 HRC.', timestamp: 'Včera 09:00' },
    { id: 'm7', senderId: 'me', senderName: 'Já', senderAvatar: '✦', text: 'Rozumím. Tolerance uložení ložisek nechte na g6. Výkresovou dokumentaci mám v cloudu.', timestamp: 'Včera 09:15' }
  ]
};

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: locale === 'cs' ? 'Diagnostika PPBUS_G3H - Pracovní stanice S1' : 'PPBUS_G3H - S1 Workstation Diagnostics', status: 'Diagnostika', agentId: AgentId.KAJA, lastUpdate: '1h' },
  { id: 'p2', title: locale === 'cs' ? 'Repase hydraulického čerpadla' : 'Hydraulic Pump Rebuild', status: 'Práce', agentId: AgentId.FRANTA, lastUpdate: '4h' },
  { id: 'p3', title: locale === 'cs' ? 'Konfigurace CO2 systému' : 'CO2 System Configuration', status: 'Hotovo', agentId: AgentId.DASA, lastUpdate: '2d' }
];

export const MOCK_MEMORY: MemoryThread[] = [
  { id: 'm1', title: 'Pinout JTAG S-Core Nexus', agentId: AgentId.KAJA, preview: 'Mapování TDO, TDI, TMS signálů pro debugování jádra...', date: '15. Feb' },
  { id: 'm2', title: 'Torque Specs - Alloy 7075', agentId: AgentId.FRANTA, preview: 'DIN 912 specification for aerospace alloys...', date: '12. Feb' }
];

export const MOCK_CLOUD: CloudFile[] = [
  { id: 'c1', type: 'schema', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', ownerId: 'admin-001', agentId: AgentId.KAJA },
  { id: 'c2', type: 'photo', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400', ownerId: 'admin-001', agentId: AgentId.FRANTA }
];

export const MOCK_SOCIAL_FEED: SocialPost[] = [
  {
    id: '1',
    authorId: 'u-1',
    author: 'Mallfurion',
    avatar: '✦',
    title: locale === 'cs' ? 'Optimalizace GaN měničů' : 'GaN Converter Optimization',
    type: 'oprava',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400',
    description: locale === 'cs' ? 'Analýza efektivity odvodu tepla u nových GaN tranzistorů.' : 'Heat dissipation efficiency analysis for new GaN transistors.',
    tools: ['Oscilloscope', 'Thermal Cam'],
    status: 'published'
  }
];

export const COPYRIGHT = "© 2026 Mallfurion | Studio Synthesis";
