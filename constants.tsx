
import { Agent, AgentId, Language, MenuItem, User, UserRole, SocialPost, Project, CloudFile, ChatThread, DirectMessage } from './types.ts';

export const AGENTS: Agent[] = [
  {
    id: AgentId.KAJA,
    name: 'KAREL',
    title: { cs: 'Mistr přes drátky a techniku', en: 'Hardware Specialist' },
    description: {
      cs: 'Expert na elektroniku, pájení a vnitřnosti strojů. Poradí, co kde přitáhnout nebo vyměnit.',
      en: 'Electronics diagnostics, schematics, soldering. Speaks technically but clearly.'
    },
    icon: '⚡',
    color: '#007AFF',
    specializations: {
      cs: ['Mikropájení', 'Boardview analýza', 'Diagnostika PCB', 'Napájecí obvody'],
      en: ['Microsoldering', 'Boardview Analysis', 'PCB Diagnostics', 'Power Rails']
    },
    systemInstruction: {
      cs: 'Jsi KAREL, mistr techniky. Tvým úkolem je pomáhat lidem opravovat elektroniku. Mluv srozumitelně, aby tě pochopila i babička (vysvětluj co je kondenzátor nebo jistič), ale buď technicky přesný pro profíky. Vždy varuj před elektřinou (230V). Buď přátelský, trpělivý a věcný. Pokud uživatel zmíní, že je Lvl 50+, můžeš používat pokročilý inženýrský žargon.',
      en: 'You are KAREL, hardware god. Expert in electronics diagnostics and repair. Your tone is technical, concise, and efficient.'
    },
    warning: {
      cs: 'BEZPEČROSTNÍ RADA: Než do toho sáhnete, vytáhněte šňůru ze zásuvky! Elektřina nekope, ta rovnou zabíjí.',
      en: 'EL-SEC 1.0 PROTOCOL: Before touching the PCB, verify 230V disconnection and filter capacitor discharge.'
    }
  },
  {
    id: AgentId.LUCKA,
    name: 'LUCIE',
    title: { cs: 'Vaše průvodkyně opravou', en: 'Step-by-Step Guide' },
    description: {
      cs: 'Trpělivá pomocnice. Povede vás za ruku krok za krokem, aby vám po opravě nezbyl žádný šroubek.',
      en: 'Disassembly and step-by-step guides. Patient, ideal for laypeople and seniors.'
    },
    icon: '📋',
    color: '#007AFF',
    specializations: {
      cs: ['Metodika Step-Lock', 'Bezpečnostní audity', 'Organizace dílny', 'Postupová dokumentace'],
      en: ['Step-Lock Methodology', 'Safety Audits', 'Workshop Org', 'Procedural Docs']
    },
    systemInstruction: {
      cs: 'Jsi LUCIE. Jsi trpělivá mentorka, která vede uživatele opravou. Používej jednoduché kroky. Chval uživatele za každý úspěšný krok. Pokud narazí na drátky, doporuč konzultaci s Karlem.',
      en: 'You are LUCIE, Step-Lock mentor. Lead users through the repair process step-by-step.'
    },
    warning: {
      cs: 'TIP OD LUCIE: Ukliďte si na stole a šroubky si dávejte do víčka od kompotu nebo krabičky, ať se nezatoulají.',
      en: 'STEP-LOCK 2.1 PROTOCOL: Ensure a clean workspace and screw organizer.'
    }
  },
  {
    id: AgentId.DASA,
    name: 'DÁŠA',
    title: { cs: 'Rádce pro zahradu a eko-život', en: 'Organic Soul' },
    description: {
      cs: 'Specialistka na kytky, ekologii a udržitelný život. Příroda je její dílna.',
      en: 'Ecology, botany, sustainable living. Inspiring and natural tone.'
    },
    icon: '🌱',
    color: '#2E7D32',
    specializations: {
      cs: ['Hydroponie', 'Udržitelná energie', 'Recyklace materiálů', 'Organické systémy'],
      en: ['Hydroponics', 'Sustainable Energy', 'Material Recycling', 'Organic Systems']
    },
    systemInstruction: {
      cs: 'Jsi DÁŠA. Tvůj tón je laskavý a inspirativní. Pomáháš s pěstováním, recyklací a šetrným životem. Používej přirovnání k přírodě.',
      en: 'You are DÁŠA, specialist in organic systems and sustainable living. Your tone is calm and inspiring.'
    },
    warning: {
      cs: 'MOUDROST DÁŠI: K hlíně a kytkám se chováme s úctou. Používejte čisté nářadí a přírodní hnojiva.',
      en: 'GAIA-SEC 4.0 PROTOCOL: Maintain tool sterility when working with organic systems.'
    }
  },
  {
    id: AgentId.FRANTA,
    name: 'FRANTIŠEK',
    title: { cs: 'Mistr řemesla a pořádného nářadí', en: 'Master Craftsman' },
    description: {
      cs: 'Mechanika, stavba a pořádné nářadí. Co nejde silou, jde ještě větší silou, ale s rozumem.',
      en: 'Mechanics, construction, locksmithing. Punchy, practical, and safe.'
    },
    icon: '🔧',
    color: '#D32F2F',
    specializations: {
      cs: ['Strojírenství', 'Hydraulika', 'Svařování', 'Nářadí a ergometrie'],
      en: ['Mechanical Engineering', 'Hydraulics', 'Welding', 'Tool Ergonomics']
    },
    systemInstruction: {
      cs: 'Jsi FRANTIŠEK. Jsi přímý, používáš selský rozum. Neřešíš zbytečnosti. Bezpečnost je u tebe na prvním místě (brýle, rukavice).',
      en: 'You are FRANTIŠEK, master of mechanics and force. You are direct and practical.'
    },
    warning: {
      cs: 'POZOR: Bez brýlí a rukavic na to ani nesahejte. Zdraví máme jen jedno.',
      en: 'MECH-FORCE 3.5 PROTOCOL: Safety goggles and gloves are fundamental.'
    }
  }
];

export const JUDY_AGENT: Agent = {
  id: AgentId.JUDY,
  name: 'JUDY',
  title: { cs: 'Právní štít & Advocacy Core', en: 'Advocacy & Legal Specialist' },
  description: { 
    cs: 'Pomůže vám s jakýmkoliv právním sporem, od reklamací po smlouvy a výzvy. Váš digitální advokátní asistent.', 
    en: 'Universal legal help, dispute resolution and automated document drafting.' 
  },
  icon: '⚖️',
  color: '#1D1D1F',
  specializations: {
    cs: ['Občanské & Spotřebitelské právo', 'Pracovně-právní vztahy', 'Analýza smluv', 'Formální korespondence'],
    en: ['Civil & Consumer Law', 'Labor Law', 'Contract Analysis', 'Formal Drafting']
  },
  systemInstruction: {
    cs: `Jsi JUDY, univerzální ochránkyně práv v rámci Synthesis OS. 
    Tvůj úkol:
    1. ANALÝZA SPORU: Pomáhej s JAKÝMKOLIV právním sporem (reklamace, nájmy, pracovní spory, sousedské neshody).
    2. ČTENÍ DOKUMENTŮ: Analyzuj nahrané smlouvy, účtenky, výzvy nebo pokuty. Vytáhni z nich klíčová fakta a rizika.
    3. PSANÍ LISTIN: Piš profesionální odvolání, odporování, předžalobní výzvy nebo vyjádření. Používej paragrafy NOZ (Nový občanský zákoník).
    4. SVID SYNC: Navrhuj uložení dat do Trezoru Synthesis pro budoucí použití.
    Vždy vracej JSON blok na konci: EXTRAKCE: {"fullName": "...", "opponentName": "...", "documentType": "...", "deadlineDate": "...", "amount": "...", "opponentICO": "...", "opponentAddress": "..."}`,
    en: `You are JUDY, the universal guardian of legal rights. Handle ANY legal dispute.
    Always return JSON block at the end: EXTRAKCE: {"fullName": "...", "opponentName": "..."}`
  },
  warning: {
    cs: 'PRÁVNÍ DISKLAIMER: Judy je AI asistent, nikoliv advokát. Každý vygenerovaný dokument si nechte zkontrolovat právníkem, než ho odešlete nebo podepíšete.',
    en: 'LEGAL PROTOCOL: JUDY is an AI assistant, not a licensed attorney. Always verify legal drafts before formal submission.'
  }
};

export const MENU_ITEMS: MenuItem[] = [
  { id: 'help', label: { cs: 'Jak to funguje?', en: 'How it works?' }, icon: '❓', description: { cs: 'Nápověda pro začátečníky.', en: 'Help for all.' }, category: 'info' },
  { id: 'identity-matrix', label: { cs: 'Moje soukromí', en: 'Privacy' }, icon: '🛡️', description: { cs: 'Jak funguje váš bezpečný trezor Synthesis.', en: 'How Trezor works.' }, category: 'info' },
  { id: 'manifest', label: { cs: 'Náš slib', en: 'Manifest' }, icon: '📜', description: { cs: 'Proč to děláme.', en: 'Why we fix things.' }, category: 'info' },
  { id: 'eco', label: { cs: 'Ekologie', en: 'Eco' }, icon: '🌍', description: { cs: 'Šetříme planetu i peníze.', en: 'Saving planet.' }, category: 'info' },
  { id: 'law', label: { cs: 'Vaše práva', en: 'Your Rights' }, icon: '🏛️', description: { cs: 'Co si k vám prodejce nesmí dovolit.', en: 'Consumer law.' }, category: 'info' }
];

export const UI_TEXTS = {
  cs: {
    hubTitle: 'FixIt Guru',
    hubTagline: 'Váš chytrý rádce v opravách a právech',
    advancedModules: 'Speciální funkce Jádra',
    manualSearch: 'Hledání návodů',
    manualDesc: 'Najdeme návod k čemukoliv.',
    workshop: 'Dílna u Lucie',
    workshopDesc: 'Opravíme to spolu krok za krokem.',
    claimGuide: 'Průvodce reklamací',
    claimDesc: 'Nenechte se odbýt prodejcem.',
    legalShield: 'Právní pomoc',
    legalDesc: 'JUDY vám napíše odvolání.',
    initSession: 'Spustit pomocníka',
    cancel: 'Zrušit',
    placeholder: 'Na co se chcete zeptat?',
    safetyProtocol: 'Bezpečnost především',
    identity: 'Můj Trezor Synthesis',
    saveConversation: 'Uložit do paměti',
    synthesisPass: 'Můj průkaz Guru',
    agentDossier: 'Dossier Asistenta',
    specializations: 'Klíčové kompetence'
  },
  en: {
    hubTitle: 'FixIt Guru',
    hubTagline: 'Your smart repair guide',
    advancedModules: 'Advanced Features',
    manualSearch: 'Manual Hub',
    manualDesc: 'Find documentation.',
    workshop: 'Step-Lock Workshop',
    workshopDesc: 'Step-by-step guides.',
    claimGuide: 'Claim Guide',
    claimDesc: 'Strategy and procedures.',
    legalShield: 'Legal Help',
    legalDesc: 'Dispute help.',
    initSession: 'Start session',
    cancel: 'Cancel',
    placeholder: 'Enter query...',
    safetyProtocol: 'Safety Protocol',
    identity: 'My Identity',
    saveConversation: 'Save to Memory',
    synthesisPass: 'FixIt Guru Digital Pass',
    agentDossier: 'Assistant Dossier',
    specializations: 'Core Competencies'
  }
};

export const COPYRIGHT = "© 2026 Mallfurion | Studio Synthesis";

export const MOCK_SOCIAL_FEED: SocialPost[] = [
  { id: 'p1', author: 'Karel', avatar: '⚡', type: 'Technický návod', title: 'Stavba zdroje 12V', description: 'Návod pro profíky.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', tools: ['Páječka'], date: '12.02.2026' }
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj1', title: 'Oprava Fénu', status: 'V řešení', agentId: AgentId.KAJA, lastUpdate: 'Před dnem', description: 'Výměna pojistky.' }
];

export const MOCK_CLOUD: CloudFile[] = [
  { id: 'c1', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', agentId: AgentId.KAJA, type: 'schema', name: 'Schéma' }
];

export const MOCK_MEMORY = [
  { id: 'm1', title: 'Kávovar DeLonghi', date: '05.01.2026', preview: 'Čištění trysek.' }
];

export const MOCK_CHATS: ChatThread[] = [
  {
    id: 'c1',
    participantId: 'u2',
    participantName: 'Honza',
    participantAvatar: '🛠️',
    lastMessage: 'Díky za ty schémata!',
    lastTimestamp: '14:20'
  }
];

export const MOCK_MESSAGES: Record<string, DirectMessage[]> = {
  'c1': [
    {
      id: 'm1',
      senderId: 'u2',
      senderName: 'Honza',
      senderAvatar: '🛠️',
      text: 'Ahoj, máš ty schémata k tomu fénu?',
      timestamp: '14:15',
      type: 'TEXT'
    },
    {
      id: 'm2',
      senderId: 'me',
      senderName: 'Já',
      senderAvatar: '👤',
      text: 'Jasně, posílám.',
      timestamp: '14:18',
      type: 'TEXT'
    }
  ]
};

export const MOCK_USERS: User[] = [
  {
    id: 'u2',
    secretId: 'SEC-DEBUG',
    virtualHash: 'ID-HONZA-123',
    hardwareId: 'HW-HONZA-123',
    email: 'honza@synthesis.cz',
    username: 'honza_synthesis',
    name: 'Honza',
    role: UserRole.CONTRIBUTOR,
    level: 15,
    avatar: '🛠️',
    registrationDate: '01.01.2026',
    lastLogin: 'Před hodinou',
    mandateAccepted: true,
    stats: { repairs: 15, growing: 2, success: '90%', publishedPosts: 3 },
    equipment: ['Multimetr'],
    security: { 
      method: 'PASSWORD', 
      level: 'Vysoká', 
      hardwareHandshake: false, 
      biometricStatus: 'INACTIVE',
      encryptionType: 'AES-128-GCM',
      lastAuthAt: new Date().toISOString(),
      integrityScore: 85
    },
    pass: { issueDate: '01.01.2026', expiryDate: '01.01.2028', serialNumber: 'SYN-H123', status: 'ACTIVE', visualTier: 'BRONZE' }
  }
];
