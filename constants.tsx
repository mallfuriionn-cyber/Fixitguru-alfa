import { Agent, AgentId, Language, MenuItem, User, UserRole, SocialPost, Project, CloudFile, ChatThread, DirectMessage } from './types.ts';

export const AGENTS: Agent[] = [
  {
    id: AgentId.KAJA,
    name: 'KAREL',
    title: { cs: 'Vládce hardwaru', en: 'Hardware Specialist' },
    description: {
      cs: 'Expert na elektroniku, pájení a vnitřnosti strojů.',
      en: 'Electronics diagnostics, schematics, soldering.'
    },
    icon: '⚡',
    color: '#007AFF', // Blue
    specializations: {
      cs: ['Mikropájení', 'PCB Diagnostika'],
      en: ['Microsoldering', 'PCB Diagnostics']
    },
    systemInstruction: {
      cs: 'Jsi KAREL, mistr techniky v rámci Synthesis OS. Tvým úkolem je pomáhat lidem opravovat elektroniku. Mluv srozumitelně. Na konci zprávy VŽDY nabídni kroky ve formátu AKCE: ["Změřit napětí", "Zkontrolovat pojistku"].',
      en: 'You are KAREL, hardware god. Always offer actions at the end in AKCE: ["Action 1", "Action 2"] format.'
    },
    warning: {
      cs: 'POZOR: Elektřina nezpůsobuje jen modřiny. Odpojte zařízení.',
      en: 'Verify 230V disconnection before touching.'
    }
  },
  {
    id: AgentId.LUCKA,
    name: 'LUCIE',
    title: { cs: 'Mentor bezpečnosti', en: 'Safety Mentor' },
    description: {
      cs: 'Trpělivá pomocnice. Povede vás za ruku krok za krokem.',
      en: 'Step-by-step guides. Patient mentor.'
    },
    icon: '🛡️',
    color: '#FFD700', // Yellow/Gold
    specializations: {
      cs: ['Metodika Step-Lock', 'Bezpečnost'],
      en: ['Step-Lock Methodology', 'Safety']
    },
    systemInstruction: {
      cs: 'Jsi LUCIE, integrální mentor Synthesis OS. Jsi trpělivá mentorka. Na konci zprávy VŽDY nabídni další logický krok ve formátu AKCE: ["Další krok", "Potřebuji nářadí"].',
      en: 'You are LUCIE, Step-Lock mentor.'
    },
    warning: {
      cs: 'TIP: Ukliďte si na stole, pořádek v dílně je základ úspěchu.',
      en: 'Ensure a clean workspace.'
    }
  },
  {
    id: AgentId.DASA,
    name: 'DÁŠA',
    title: { cs: 'Mistryně bylin', en: 'Herbal Master' },
    description: {
      cs: 'Specialistka na kytky, ekologii a udržitelný život.',
      en: 'Ecology, botany, sustainable living.'
    },
    icon: '🌱',
    color: '#34C759', // Green
    specializations: {
      cs: ['Hydroponie', 'Organické systémy'],
      en: ['Hydroponics', 'Organic Systems']
    },
    systemInstruction: {
      cs: 'Jsi DÁŠA. Tvůj tón je laskavý a inspirativní. Na konci zprávy VŽDY nabídni AKCE: ["Jak zalévat", "Typ hnojiva"].',
      en: 'You are DÁŠA. Always offer actions at the end in AKCE: ["Gardening Tip", "Eco Rule"] format.'
    },
    warning: {
      cs: 'MOUDROST: K hlíně a kytkám se chováme s úctou.',
      en: 'Respect organic systems.'
    }
  },
  {
    id: AgentId.FRANTA,
    name: 'FRANTIŠEK',
    title: { cs: 'Mistr dílny', en: 'Workshop Master' },
    description: {
      cs: 'Mechanika, stavba a pořádné nářadí.',
      en: 'Mechanics, construction, tools.'
    },
    icon: '🔨',
    color: '#FF9500', // Orange
    specializations: {
      cs: ['Strojírenství', 'Nářadí'],
      en: ['Mechanical Engineering', 'Tools']
    },
    systemInstruction: {
      cs: 'Jsi FRANTIŠEK, mechanické jádro Synthesis. Jsi přímý, používáš selský rozum. Na konci zprávy VŽDY nabídni AKCE: ["Jaké nářadí", "Bezpečnostní tip"].',
      en: 'You are FRANTIŠEK. Always offer actions at the end in AKCE: ["Tools Needed", "Safety Manual"] format.'
    },
    warning: {
      cs: 'POZOR: Bez brýlí na to ani nesahejte.',
      en: 'Safety goggles are fundamental.'
    }
  }
];

export const JUDY_AGENT: Agent = {
  id: AgentId.JUDY,
  name: 'EDA (LEGAL & RIGHTS)',
  title: { cs: 'Právní navigátor', en: 'Legal Navigator' },
  description: { 
    cs: 'Expertní analýza sporů a ochrana práv.', 
    en: 'Universal legal help and dispute resolution.' 
  },
  icon: '⚖️',
  color: '#AF52DE', // Purple
  specializations: {
    cs: ['Reklamace', 'Sousedské spory'],
    en: ['Consumer Law', 'Labor Law']
  },
  systemInstruction: {
    cs: `Jsi EDA, právní navigátor Synthesis OS. Pomáháš se spory. VŽDY na konec každé své zprávy přidej blok AKCE: ["Text tlačítka 1", "Text tlačítka 2"].`,
    en: `You are EDA, legal shield. Always offer contextual action buttons at the end in AKCE: ["Action 1", "Action 2"] format.`
  },
  warning: {
    cs: 'Judy (Eda) is AI asistent. Každý dokument si nechte zkontrolovat právníkem.',
    en: 'LEGAL PROTOCOL: EDA is an AI assistant.'
  }
};

export const MENU_ITEMS: MenuItem[] = [
  // SYSTÉMOVÉ MODULY
  { id: 'MANUALS', label: { cs: 'Manual Hub', en: 'Manual Hub' }, icon: '📂', description: { cs: 'Databáze technických návodů.', en: 'Technical manuals database.' }, category: 'core' },
  { id: 'WORKSHOP', label: { cs: 'Dílna Lucie', en: 'Workshop' }, icon: '🛠️', description: { cs: 'Step-Lock navigace opravy.', en: 'Step-Lock repair navigation.' }, category: 'core' },
  { id: 'PUBLIC_GUIDES', label: { cs: 'Znalostní Jádro', en: 'Knowledge Base' }, icon: '📚', description: { cs: 'Komunitní inženýrské blueprinty.', en: 'Community engineering blueprints.' }, category: 'core' },
  { id: 'SOCIAL', label: { cs: 'Social Feed', en: 'Social' }, icon: '🌍', description: { cs: 'Inspirace a postupy komunity.', en: 'Community inspiration and posts.' }, category: 'core' },
  
  // PRÁVNÍ NÁSTROJE
  { id: 'LEGAL_HUB', label: { cs: 'Právní Štít', en: 'Legal Shield' }, icon: '⚖️', description: { cs: 'Ochrana práv a JUDY Advocacy.', en: 'Rights protection and JUDY.' }, category: 'legal' },
  { id: 'CLAIM_GUIDE', label: { cs: 'Průvodce Reklamací', en: 'Claim Guide' }, icon: '📋', description: { cs: 'Strategie pro reklamace zboží.', en: 'Claim strategies and templates.' }, category: 'legal' },
  { id: 'VERIFIER', label: { cs: 'Verifier Kernel', en: 'Verifier' }, icon: '🛡️', description: { cs: 'Audit a verifikace listin.', en: 'Document audit and verification.' }, category: 'legal' },

  // IDENTITA A SVID
  { id: 'id-system', label: { cs: 'ID CORE', en: 'ID System' }, icon: '🆔', description: { cs: 'Základy vaší identity v2.1.', en: 'Identity core v2.1.' }, category: 'identity' },
  { id: 'security', label: { cs: 'Security Kernel', en: 'Security' }, icon: '🔒', description: { cs: 'Biometrika a ochrana dat.', en: 'Biometrics and data protection.' }, category: 'identity' },
  { id: 'svid-info', label: { cs: 'Protokol SVID', en: 'SVID Protocol' }, icon: '🪪', description: { cs: 'Jak funguje virtuální identita.', en: 'How virtual identity works.' }, category: 'identity' },
  { id: 'identity-matrix', label: { cs: 'Správa Dat', en: 'Data Management' }, icon: '🧬', description: { cs: 'Princip Souhlas nebo Zapomnění.', en: 'Consent or Forget principles.' }, category: 'identity' },

  // INFORMAČNÍ PROTOKOLY
  { id: 'help', label: { cs: 'Nápověda', en: 'Help' }, icon: '❓', description: { cs: 'Operační manuál Jádra.', en: 'Kernel operation manual.' }, category: 'info' },
  { id: 'manifest', label: { cs: 'Náš Slib', en: 'Our Promise' }, icon: '📜', description: { cs: 'Manifest inženýrské svobody.', en: 'Engineering freedom manifest.' }, category: 'info' },
  { id: 'lp-05', label: { cs: 'Mandát Integrity', en: 'Integrity Mandate' }, icon: '🤝', description: { cs: 'Protokol LP-05 a odpovědnost.', en: 'LP-05 Protocol and liability.' }, category: 'info' },
  { id: 'eco', label: { cs: 'Synthesis Green', en: 'Eco Protocol' }, icon: '🌱', description: { cs: 'Udržitelnost a Urban Mining.', en: 'Sustainability and eco protocol.' }, category: 'info' },

  // BUDOUCNOST
  { id: 'backlog', label: { cs: 'Roadmap 2026+', en: 'Roadmap' }, icon: '🚀', description: { cs: 'Plán budoucích aktualizací.', en: 'Future update roadmap.' }, category: 'future' },
  { id: 'expert', label: { cs: 'Kernel Info', en: 'Kernel' }, icon: '🧠', description: { cs: 'Technické detaily AI jader.', en: 'Technical details of AI cores.' }, category: 'future' }
];

export const UI_TEXTS = {
  cs: {
    hubTitle: 'Synthesis Hub',
    hubTagline: 'OPERATIONAL CORE V2.2',
    advancedModules: 'SYNTHESIS TOOLBOX',
    primaryAgents: 'PRIMÁRNÍ ASISTENTI'
  },
  en: {
    hubTitle: 'Synthesis Hub',
    hubTagline: 'OPERATIONAL CORE V2.2',
    advancedModules: 'SYNTHESIS TOOLBOX',
    primaryAgents: 'PRIMARY ASSISTANTS'
  }
};

export const COPYRIGHT = "© 2026 Studio Synthesis";
export const MOCK_SOCIAL_FEED: SocialPost[] = [];
export const MOCK_PROJECTS: Project[] = [];
export const MOCK_CLOUD: CloudFile[] = [];
export const MOCK_MEMORY = [];
export const MOCK_CHATS: ChatThread[] = [];
export const MOCK_MESSAGES: Record<string, DirectMessage[]> = {};
export const MOCK_USERS: User[] = [];