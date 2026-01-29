export type Language = 'cs' | 'en';

export enum AgentId {
  KAJA = 'KAJA',
  LUCKA = 'LUCKA',
  DASA = 'DASA',
  FRANTA = 'FRANTA',
  JUDY = 'JUDY'
}

export interface Agent {
  id: AgentId;
  name: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  color: string;
  specializations: Record<Language, string[]>;
  systemInstruction: Record<Language, string>;
  warning: Record<Language, string>;
}

export enum UserRole {
  ARCHITECT = 'ARCHITECT',
  GURU = 'GURU',
  OPERATOR = 'OPERATOR',
  SUBJECT = 'SUBJECT',
  HOST = 'HOST',
  ADMINISTRATOR = 'ADMINISTRATOR',
  SUBSCRIBER = 'SUBSCRIBER',
  CONTRIBUTOR = 'CONTRIBUTOR'
}

export interface UserStats {
  repairs: number;
  growing: number;
  success: string;
  publishedPosts: number;
}

export interface UserSecurity {
  method: string;
  level: string;
  hardwareHandshake: boolean;
  biometricStatus: string;
  encryptionType: string;
  lastAuthAt: string;
  integrityScore?: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: string[];
}

/**
 * Interface for user-uploaded or generated assets (images, documents).
 */
export interface UserAsset {
  id: string;
  name: string;
  type: 'IMAGE' | 'DOCUMENT';
  mimeType: string;
  data: string; // base64 encoded string
  createdAt: string;
  sourceAgent: string;
}

/**
 * Data extracted from documents by JUDY or OCR.
 */
export interface ExtractedPersonalData {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  idNumber?: string;
  birthDate?: string;
  docExpiry?: string;
  docAuthority?: string;
  productName?: string;
  vendorName?: string;
  opponentName?: string;
  opponentAddress?: string;
  documentType?: string;
}

export interface LegalDispute {
  id: string;
  title: string;
  date: string;
  status: string;
  attachments: string[];
  chatTranscript: Message[];
  extractedData?: ExtractedPersonalData;
}

/**
 * Encrypted data structure for Trezor storage.
 */
export type EncryptedVaultData = Record<string, { ciphertext: string; iv: string }>;

/**
 * Digital document verification wrapper.
 */
export interface VirtualDocument {
  id: string;
  docType: 'ID_CARD' | 'PASSPORT';
  data: Record<string, any>; // Stores EncryptedVaultData values
  isVerified: boolean;
  createdAt: string;
}

/**
 * Data structure for the Synthesis Pass visualization.
 */
export interface SynthesisPassData {
  issueDate: string;
  expiryDate: string;
  serialNumber: string;
  status: 'ACTIVE' | 'REVOKED';
  visualTier: 'GOLD' | 'SILVER' | 'BRONZE' | 'INFINITY';
}

/**
 * System audit logging.
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName?: string;
  category: 'SECURITY' | 'SYSTEM' | 'USER_ACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface User {
  id: string;
  secretId?: string;
  virtualHash: string;
  hardwareId: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  level: number;
  avatar: string;
  registrationDate: string;
  lastLogin: string;
  mandateAccepted: boolean;
  stats: UserStats;
  equipment: string[];
  security: UserSecurity;
  bio?: string;
  specialization?: string[];
  assets?: UserAsset[];
  disputes?: LegalDispute[];
  privacyDelay?: boolean;
  vaultData?: EncryptedVaultData;
  virtualDocument?: VirtualDocument;
  pass?: SynthesisPassData;
  activeAssistantId?: AgentId;
  permissions?: Record<string, boolean>;
  guruLevelLabel?: string;
  jurisdiction?: string;
  walletAddress?: string;
  auditLogs?: AuditLog[];
}

export interface PublicGuide {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  deviceName: string;
  rating?: number;
  diagnosis: string;
  procedure: string;
  conclusion: string;
  category: string;
}

export interface VerificationResult {
  isValid: boolean;
  type: 'OFFICIAL' | 'COMMUNITY' | 'INVALID';
  score: number;
  hash?: string;
  timestamp: string;
  details: string;
}

export type AppView = 'TERMINAL' | 'MANUALS' | 'WORKSHOP' | 'LEGAL_HUB' | 'JUDY_CHAT' | 'ADMIN' | 'PROFILE' | 'SOCIAL' | 'AGENT_CHAT' | 'MESSAGES' | 'CLAIM_GUIDE' | 'PUBLIC_GUIDES' | 'VERIFIER' | 'PRESENTATION';

/**
 * Menu item configuration.
 */
export interface MenuItem {
  id: string;
  label: Record<Language, string>;
  icon: string;
  description: Record<Language, string>;
  category: string;
}

/**
 * Social feed post structure.
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
 * Ongoing repair or technical project.
 */
export interface Project {
  id: string;
  title: string;
  status: string;
  agentId: AgentId;
  lastUpdate: string;
  description: string;
}

/**
 * Cloud storage file reference.
 */
export interface CloudFile {
  id: string;
  url: string;
  agentId: AgentId;
  type: string;
  name: string;
}

/**
 * Conversation thread metadata.
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
 * Supported message interaction types.
 */
export type InteractionType = 'TEXT' | 'KUDOS' | 'PROJECT_SHARE';

/**
 * Individual message in a direct chat.
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
 * Persistence structure for saved AI conversations.
 */
export interface SavedConversation {
  id: string;
  title: string;
  date: string;
  preview: string;
  agentId: AgentId;
  messages: Message[];
}

/**
 * Structured report from a workshop session.
 */
export interface WorkshopReport {
  id: string;
  deviceName: string;
  initialState: string;
  steps: string;
  conclusion: string;
  date: string;
  status: string;
}

/**
 * Technical manual saved to the user's archive.
 */
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

/**
 * Internal system background task.
 */
export interface SystemTask {
  id: string;
  type: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

/**
 * Database schema for LocalStorage persistence.
 */
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
  publicGuides: PublicGuide[];
}

/**
 * Valid table names within the Synthesis Database.
 */
export type TableName = keyof DatabaseSchema;