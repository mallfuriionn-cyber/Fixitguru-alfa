
export type Language = 'cs' | 'en';

export enum AgentId {
  KAJA = 'kaja',
  LUCKA = 'lucka',
  DASA = 'dasa',
  FRANTA = 'franta',
  JUDY = 'judy'
}

export enum UserRole {
  ARCHITECT = 'architekt', // Jiří "Mallfurion" Šár
  GURU = 'guru',           // System Specialist
  OPERATOR = 'operator',   // Processor
  SUBJECT = 'subjekt',     // Standard User
  HOST = 'host',           // Guest
  ADMINISTRATOR = 'administrator',
  SUBSCRIBER = 'subscriber',
  CONTRIBUTOR = 'contributor'
}

export interface Agent {
  id: AgentId;
  name: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  color: string;
  systemInstruction: Record<Language, string>;
  warning: Record<Language, string>;
  specializations: Record<Language, string[]>;
}

export interface MenuItem {
  id: string;
  label: Record<Language, string>;
  icon: string;
  description: Record<Language, string>;
  category: 'info' | 'advanced' | 'social' | 'workflow' | 'messages' | 'cloud' | 'memory' | 'admin' | 'legal' | 'identity';
  enabled?: boolean;
}

export interface ExtractedPersonalData {
  firstName?: string;
  lastName?: string;
  titles?: string;
  fullName?: string;
  address?: string;
  email?: string;
  phone?: string;
  jurisdiction?: string;
  idNumber?: string;
  birthDate?: string;
  vendorName?: string;
  vendorAddress?: string;
  vendorICO?: string;
  productName?: string;
  price?: string;
  orderNumber?: string;
  purchaseDate?: string;
}

/**
 * Rozšířené rozhraní pro uživatele včetně oprávnění a trezoru dat.
 */
export interface User {
  id: string; 
  secretId: string; 
  virtualHash: string; 
  hardwareId: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  level: number;
  avatar: string;
  bio?: string;
  registrationDate: string;
  lastLogin: string;
  jurisdiction?: string;
  privacyDelay?: boolean; // True = Data jsou v trezoru, ale JUDY generuje [...]
  functionalLocks?: string[];
  warningPoints?: number;
  stats: {
    repairs: number;
    growing: number;
    success: string;
    publishedPosts: number;
  };
  disputes?: LegalDispute[];
  virtualDocument?: VirtualDocument;
  security: {
    method: 'PASSWORD' | 'GOOGLE' | 'PASSKEY_HARDWARE';
    level: 'Základní' | 'Vysoká' | 'Maximální';
    hardwareHandshake: boolean;
    biometricStatus: 'ACTIVE' | 'INACTIVE';
    lastAuthAt: string;
    encryptionType: string;
    integrityScore?: number;
  };
  equipment: string[];
  auditLogs?: AuditLog[];
  pass?: SynthesisPassData;
  permissions?: {
    canPublishWithoutApproval: boolean;
    hasExpertManuals: boolean;
    isAgeVerified: boolean;
    isModerator: boolean;
  };
  vaultData?: Record<string, any>;
  activeAssistantId?: AgentId;
  guruLevelLabel?: string;
  mandateAccepted?: boolean;
  walletAddress?: string;
  specialization?: string[];
}

export interface VirtualDocument {
  id: string;
  docType: 'ID_CARD' | 'PASSPORT';
  data: Record<string, any>;
  isVerified: boolean;
  createdAt: string;
}

/**
 * Právní spor s historií odeslání.
 */
export interface LegalDispute {
  id: string;
  title: string;
  date: string;
  status: 'Otevřeno' | 'Probíhá' | 'Vyřešeno' | 'Zamítnuto';
  attachments: { name: string; url: string; type: string }[];
  chatTranscript: any[];
  extractedData?: ExtractedPersonalData;
  dispatches?: DispatchLog[];
}

/**
 * Systémový audit log s volitelným jménem aktéra.
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName?: string;
  category: 'SECURITY' | 'DATA' | 'SYSTEM' | 'LEGAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SynthesisPassData {
  issueDate: string;
  expiryDate: string;
  serialNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  visualTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'INFINITY';
}

export type InteractionType = 'TEXT' | 'KUDOS' | 'PROJECT_SHARE';

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: any[];
}

export interface SavedConversation {
  id: string;
  title: string;
  agentId: AgentId;
  messages: Message[];
  date: string;
}

export interface WorkshopReport {
  id: string;
  deviceName: string;
  initialState: string;
  steps: string;
  conclusion: string;
  date: string;
  status: string;
}

export interface SavedManual {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: string;
  originalText: string;
  translatedText: string;
  sourceUrl: string;
  dateAdded: string;
}

export interface CloudFile {
  id: string;
  url: string;
  agentId: AgentId;
  type: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  agentId: AgentId;
  lastUpdate: string;
  description: string;
}

/**
 * Příspěvek na sociální síti.
 */
export interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  type: string;
  title: string;
  description: string;
  image: string;
  tools: string[];
  date: string;
}

/**
 * Vlákno přímé zprávy.
 */
export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
}

/**
 * Přímá zpráva mezi uživateli.
 */
export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type: InteractionType;
  payload?: any;
}

/**
 * Šifrovaná data v trezoru.
 */
export interface EncryptedVaultData {
  [key: string]: {
    ciphertext: string;
    iv: string;
  };
}

/**
 * Systémová úloha na pozadí.
 */
export interface SystemTask {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  targetUserId?: string;
  initiatorAgentId?: AgentId;
  createdAt: string;
}

/**
 * Odkaz pro uzemnění informací (Google Search).
 */
export interface GroundingLink {
  title: string;
  uri: string;
}

/**
 * Záznam o odeslání dokumentu.
 */
export interface DispatchLog {
  dispatchId: string;
  timestamp: string;
  status: string;
}

export interface DatabaseSchema {
  users: User[];
  posts: SocialPost[];
  projects: Project[];
  manuals: SavedManual[];
  reports: WorkshopReport[];
  conversations: SavedConversation[];
  cloudFiles: CloudFile[];
  tasks: SystemTask[];
  globalAudit: AuditLog[];
}

export type TableName = keyof DatabaseSchema;
export type ViewState = 'REGISTRATION' | 'DETAILED_REGISTRATION' | 'HUB' | 'CHAT' | 'PROFILE' | 'SOCIAL' | 'MEMORY' | 'CLOUD' | 'ADMIN' | 'MESSAGES' | 'LEGAL_SHIELD' | 'LEGAL_ASSISTANT_CHAT' | 'LUCIE_WORKSHOP' | 'DOC_SEARCH' | 'CLAIM_GUIDE' | 'PRESENTATION';
