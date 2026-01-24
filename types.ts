
export enum AgentId {
  KAJA = 'kaja',
  LUCKA = 'lucka',
  DASA = 'dasa',
  FRANTA = 'franta'
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
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
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

export interface User {
  id: string; // Interní ID systému
  secretId: string; // Unikátní tajné ID (Nikdy nezveřejňovat)
  virtualHash: string; // Veřejný hash viditelný pro adminy
  email: string;
  username: string;
  name: string;
  role: UserRole;
  level: number;
  avatar: string;
  bio?: string;
  specialization?: string[];
  equipment: string[];
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
  // Admin & Center Metadata
  guruLevelLabel?: string;
  activeAssistantId?: AgentId;
  hardwareLog?: string[];
  adminNotes?: {
    queryLogs: string[];
    errorReports: { topic: string; date: string; resolved: boolean }[];
    savedProcedures: string[];
  };
  permissions?: {
    canPublishWithoutApproval: boolean;
    hasExpertManuals: boolean;
    isAgeVerified: boolean;
    isModerator: boolean;
  };
}

export interface Project {
  id: string;
  title: string;
  status: 'Příjem' | 'Diagnostika' | 'Práce' | 'Hotovo';
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
  type: 'photo' | 'schema';
  url: string;
  ownerId: string;
  agentId?: AgentId;
  isPublic?: boolean;
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  title: string;
  type: 'oprava' | 'pěstování' | 'konstrukce';
  image: string;
  description: string;
  tools: string[];
  status: 'draft' | 'pending' | 'published';
  comments?: { id: string; user: string; text: string; date: string }[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'submodule' | 'info' | 'user';
  enabled?: boolean;
  minRole?: UserRole;
  config?: Record<string, any>;
}

export type ViewState = 'REGISTRATION' | 'DETAILED_REGISTRATION' | 'HUB' | 'CHAT' | 'PROFILE' | 'SOCIAL' | 'WORKFLOW' | 'MEMORY' | 'CLOUD' | 'ADMIN' | 'MESSAGES';
