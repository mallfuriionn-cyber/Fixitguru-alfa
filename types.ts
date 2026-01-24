
export enum AgentId {
  KAJA = 'kaja',
  LUCKA = 'lucka',
  DASA = 'dasa',
  FRANTA = 'franta',
  JUDY = 'judy'
}

export enum UserRole {
  ADMINISTRATOR = 'administrator',
  EDITOR = 'editor',
  AUTHOR = 'author',
  CONTRIBUTOR = 'contributor',
  SUBSCRIBER = 'subscriber'
}

export interface Agent {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  icon: string;
  systemInstruction: string;
  color: string;
  warning: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: string[];
}

export interface ExtractedPersonalData {
  fullName?: string;
  address?: string;
  email?: string;
  phone?: string;
  orderNumber?: string;
  purchaseDate?: string;
  vendorName?: string;
  productName?: string;
  price?: string;
}

export interface LegalDispute {
  id: string;
  title: string;
  date: string;
  status: 'Otevřeno' | 'Probíhá' | 'Vyřešeno' | 'Zamítnuto';
  attachments: { name: string; url: string; type: string }[];
  chatTranscript: Message[];
  extractedData?: ExtractedPersonalData;
  consentGiven: boolean;
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  title: string;
  type: string;
  image: string;
  description: string;
  tools: string[];
  status: string;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  agentId: AgentId;
  lastUpdate: string;
}

export interface MemoryThread {
  id: string;
  title: string;
  agentId: AgentId;
  preview: string;
  date: string;
}

export interface CloudFile {
  id: string;
  type: 'schema' | 'photo';
  url: string;
  ownerId: string;
  agentId: AgentId;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string; 
  secretId: string; 
  virtualHash: string; 
  email: string;
  username: string;
  name: string;
  role: UserRole;
  level: number;
  avatar: string;
  bio?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  registrationDate: string;
  lastLogin: string;
  stats: {
    repairs: number;
    growing: number;
    success: string;
    publishedPosts: number;
  };
  disputes?: LegalDispute[];
  security: {
    method: 'PASSWORD' | 'GOOGLE' | 'PASSKEY_HARDWARE';
    level: 'Základní' | 'Vysoká' | 'Maximální';
    hardwareHandshake: boolean;
    lastAuthAt: string;
  };
  biometricsLinked?: {
    face: boolean;
    fingerprint: boolean;
    verified: boolean;
    safeEnvironmentEnabled: boolean;
    accessLogs: { date: string; type: string; status: string }[];
  };
  equipment: string[];
  specialization?: string[];
  permissions?: {
    canPublishWithoutApproval: boolean;
    hasExpertManuals: boolean;
    isAgeVerified: boolean;
    isModerator: boolean;
  };
  activeAssistantId?: AgentId;
  guruLevelLabel?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'submodule' | 'info' | 'user';
  enabled?: boolean;
}

export type ViewState = 'REGISTRATION' | 'DETAILED_REGISTRATION' | 'HUB' | 'CHAT' | 'PROFILE' | 'SOCIAL' | 'WORKFLOW' | 'MEMORY' | 'CLOUD' | 'ADMIN' | 'MESSAGES' | 'LEGAL_SHIELD' | 'LEGAL_ASSISTANT_CHAT' | 'LUCIE_WORKSHOP' | 'DOC_SEARCH';
