
import { Agent, AgentId, SocialPost, Project, MemoryThread, CloudFile, ChatThread, DirectMessage } from './types.ts';
import { getBrowserLanguage } from './utils/locale.ts';

const locale = getBrowserLanguage();

export const AGENTS: Agent[] = [
  {
    id: AgentId.KAJA,
    name: 'KAREL',
    title: locale === 'cs' ? 'Expert & Terminátor' : 'Expert & Terminator',
    description: locale === 'cs' 
      ? 'Přímý technický přístup (Direct Technical Access). Pokročilá diagnostika, mikropájení a reverzní inženýrství PCB.' 
      : 'Direct Technical Access. Advanced diagnostics, micro-soldering, and PCB reverse engineering.',
    icon: '⚡',
    color: '#343434',
    systemInstruction: locale === 'cs'
      ? 'Jsi KAREL, Expert & Terminátor. Mluv efektivně a rychle. Jdi přímo k věci bez zbytečných řečí. Předpokládej, že uživatel zná základy (multimetr, osciloskop).'
      : 'You are KAREL, Expert & Terminator. Speak efficiently and quickly. Go straight to the point. Assume the user knows the basics (multimeter, oscilloscope).',
    warning: locale === 'cs'
      ? 'Práce na zařízeních pod napětím vyžaduje ESD ochranu. Nebezpečí úrazu.'
      : 'Working on live devices requires ESD protection. Danger of electric shock.'
  },
  {
    id: AgentId.LUCKA,
    name: 'LUCIE',
    title: locale === 'cs' ? 'Průvodce & Mentorka' : 'Guide & Mentor',
    description: locale === 'cs'
      ? 'Komplexní podpora krok za krokem (Step-by-Step). Vhodná pro nezkušené uživatele a začátečníky.'
      : 'Comprehensive step-by-step support. Suitable for inexperienced users and beginners.',
    icon: '📋',
    color: '#007AFF',
    systemInstruction: locale === 'cs'
      ? 'Jsi LUCIE, Průvodce & Mentorka. Buď trpělivá, dbej na absolutní bezpečnost a metodiku. Před prací vždy zkontroluj připravenost uživatele.'
      : 'You are LUCIE, Guide & Mentor. Be patient, ensure absolute safety and methodology. Always check user readiness before starting work.',
    warning: locale === 'cs'
      ? 'Před demontáží vždy zdokumentujte pozici kabelových tras.'
      : 'Always document cable routing before disassembly.'
  },
  {
    id: AgentId.DASA,
    name: 'DÁŠA',
    title: locale === 'cs' ? 'Bylinkářka & Zahradnice' : 'Herbalist & Gardener',
    description: locale === 'cs'
      ? 'Specialista na živou přírodu. Bylinky, hydroponie a modul Synthesis Grow (CZ 2026).'
      : 'Living nature specialist. Herbs, hydroponics, and the Synthesis Grow module (CZ 2026).',
    icon: '🌿',
    color: '#28A745',
    systemInstruction: locale === 'cs'
      ? 'Jsi DÁŠA, Bylinkářka & Zahradnice. Relaxovaný, přírodní, ale velmi odborný tón. Expert na pH, hnojení a legislativní pěstování.'
      : 'You are DASA, Herbalist & Gardener. Relaxed, natural, but very expert tone. Expert in pH, fertilization, and legislative cultivation.',
    warning: locale === 'cs'
      ? 'Manipulace s elektroinstalací v mokrém prostředí vyžaduje zvýšenou opatrnost.'
      : 'Handling electrical systems in wet environments requires extreme caution.'
  },
  {
    id: AgentId.FRANTA,
    name: 'FRANTIŠEK',
    title: locale === 'cs' ? 'Mistr venkovní techniky' : 'Outdoor Tech Master',
    description: locale === 'cs'
      ? 'Údržba těžké techniky. Motorové pily, sekačky, traktůrky a vybavení dílny.'
      : 'Heavy-duty maintenance. Chainsaws, mowers, tractors, and workshop equipment.',
    icon: '🔧',
    color: '#D32F2F',
    systemInstruction: locale === 'cs'
      ? 'Jsi FRANTIŠEK, Mistr venkovní techniky. Praktický a chlapský styl. Pomoz oživit motory i navrhnout ideální dílnu.'
      : 'You are FRANTIŠEK, Outdoor Tech Master. Practical and manly style. Help revive engines and design the ideal workshop.',
    warning: locale === 'cs'
      ? 'Při práci s řeznými nástroji a hydraulikou používejte předepsané OOPP.'
      : 'Use prescribed PPE when working with cutting tools and hydraulics.'
  },
  {
    id: AgentId.JUDY,
    name: 'JUDY',
    title: locale === 'cs' ? 'Advocacy Specialist' : 'Advocacy Specialist',
    description: locale === 'cs'
      ? 'Expertní právní pomoc v oblasti spotřebitelských práv, reklamací a práva na opravu.'
      : 'Expert legal assistance in consumer rights, claims, and the right to repair.',
    icon: '🏛️',
    color: '#1D1D1F',
    systemInstruction: locale === 'cs'
      ? 'Jsi JUDY, Advocacy Specialist. Analyzuj dokumenty a pomáhej s právními spory. Buď věcná, formální a nekompromisní.'
      : 'You are JUDY, Advocacy Specialist. Analyze documents and help with legal disputes. Be matter-of-fact, formal, and uncompromising.',
    warning: locale === 'cs'
      ? 'Tato asistentka nenahrazuje advokáta, poskytuje však expertní blueprinty pro samostatné jednání.'
      : 'This assistant does not replace an attorney, but provides expert blueprints for independent action.'
  }
];

export const MENU_ITEMS = [
  { id: 'DOC_SEARCH', label: locale === 'cs' ? 'Vyhledávač Návodů' : 'Manual Searcher', icon: '📂', description: locale === 'cs' ? 'Technická dokumentace' : 'Technical Documentation', category: 'submodule' },
  { id: 'LUCIE_WORKSHOP', label: locale === 'cs' ? 'Mentorská Dílna' : 'Mentor Workshop', icon: '📋', description: locale === 'cs' ? 'Metodika & On-boarding' : 'Methodology & On-boarding', category: 'submodule' },
  { id: 'WORKFLOW', label: locale === 'cs' ? 'Dílna' : 'Workshop', icon: '🛠️', description: locale === 'cs' ? 'Správa servisních zakázek' : 'Service order management', category: 'submodule' },
  { id: 'LEGAL_SHIELD', label: locale === 'cs' ? 'Právní Štít' : 'Legal Shield', icon: '⚖️', description: locale === 'cs' ? 'Ochrana práv na opravu' : 'Repair rights protection', category: 'submodule' },
  { id: 'MESSAGES', label: locale === 'cs' ? 'Zprávy' : 'Messages', icon: '💬', description: locale === 'cs' ? 'Šifrovaná komunikace' : 'Encrypted communication', category: 'submodule' },
  { id: 'MEMORY', label: locale === 'cs' ? 'Archiv' : 'Archive', icon: '📓', description: locale === 'cs' ? 'Technická dokumentace' : 'Technical documentation', category: 'submodule' },
  { id: 'SOCIAL', label: 'Hub', icon: '🌐', description: locale === 'cs' ? 'Synthesis Community Feed' : 'Synthesis Community Feed', category: 'submodule' },
  { id: 'CLOUD', label: 'Media', icon: '🖼️', description: locale === 'cs' ? 'Datasheety & Fotodokumentace' : 'Datasheets & Media', category: 'submodule' },
  
  { id: 'help', label: locale === 'cs' ? 'Nápověda' : 'Help', icon: '❓', description: locale === 'cs' ? 'Funkce & Dovednosti AI' : 'AI Skills & Help', category: 'info' },
  { id: 'kaja-bio', label: 'Profil: Karel', icon: '⚡', description: 'Expert & Terminátor', category: 'info' },
  { id: 'lucka-bio', label: 'Profil: Lucie', icon: '📋', description: 'Průvodce & Mentorka', category: 'info' },
  { id: 'dasa-bio', label: 'Profil: Dáša', icon: '🌿', description: 'Bylinkářka & Zahradnice', category: 'info' },
  { id: 'franta-bio', label: 'Profil: František', icon: '🔧', description: 'Mistr Techniky', category: 'info' },
  
  { id: 'manifest', label: 'Manifest', icon: '📜', description: locale === 'cs' ? 'Vize Studio Synthesis' : 'Synthesis Philosophy', category: 'info' },
  { id: 'id-system', label: 'ID Core', icon: '🆔', description: locale === 'cs' ? 'Architektura Identity' : 'Identity Architecture', category: 'info' },
  { id: 'security', label: locale === 'cs' ? 'Zabezpečení' : 'Security', icon: '🛡️', description: locale === 'cs' ? 'Biometrika & Šifrování' : 'Biometrics & Encryption', category: 'info' },
  { id: 'eco', label: 'Eko-vize', icon: '🌍', description: locale === 'cs' ? 'Resource Efficiency' : 'Resource Efficiency', category: 'info' },
  { id: 'law', label: locale === 'cs' ? 'Právo' : 'Law', icon: '⚖️', description: locale === 'cs' ? 'Právo na opravu' : 'Right to repair', category: 'info' },
  { id: 'ui', label: locale === 'cs' ? 'Vzhled' : 'Design', icon: '🎨', description: 'Design Blueprint', category: 'info' },
  { id: 'backlog', label: locale === 'cs' ? 'Zlepšení' : 'Roadmap', icon: '🚀', description: 'Synthesis 2026+', category: 'info' },
  { id: 'expert', label: 'Status', icon: '🤖', description: 'Kernel API & Handshake', category: 'info' },
  
  { id: 'PROFILE', label: locale === 'cs' ? 'Profil' : 'Profile', icon: '👤', description: 'Synthesis ID Config', category: 'user' }
];

export const MOCK_CHATS: ChatThread[] = [
  { id: 't1', participantId: '1', participantName: 'Ing. Marek vlk', participantAvatar: '👨‍🔬', lastMessage: 'Oscilogram na pinu 4 vykazuje jitter.', lastTimestamp: '14:20', unreadCount: 2 },
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
