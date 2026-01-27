
import { DatabaseSchema, TableName, User, SocialPost, Project, SavedManual, WorkshopReport, SavedConversation, CloudFile, SystemTask, AuditLog, UserRole } from '../types.ts';
import { MOCK_SOCIAL_FEED, MOCK_PROJECTS, MOCK_CLOUD } from '../constants.tsx';

const DB_KEY = 'synthesis_core_db';

class StorageService {
  private data: DatabaseSchema;

  constructor() {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
      if (!this.data.tasks) this.data.tasks = [];
      if (!this.data.globalAudit) this.data.globalAudit = [];
      if (!this.data.users) this.data.users = [];
    } else {
      // HLAVNÍ ADMIN ÚČET - ARCHITEKT
      const architect: User = {
        id: 'u-mallfurion',
        secretId: 'SID-MALLFURION-ROOT',
        virtualHash: 'HASH-ARCHITECT-001',
        hardwareId: 'HW-STATION-MASTER-01',
        email: 'sarji@seznam.cz',
        username: 'mallfurion',
        name: 'Jiří "Mallfurion" Šár',
        role: UserRole.ARCHITECT,
        level: 999,
        avatar: '✦',
        registrationDate: '01.01.2026',
        lastLogin: new Date().toLocaleString(),
        mandateAccepted: true,
        privacyDelay: false,
        stats: { repairs: 500, growing: 100, success: '100%', publishedPosts: 24 },
        equipment: ['Synthesis Kernel Prime', 'Neural Link V3', 'Logic Analyzer 500MHz'],
        security: {
          method: 'PASSKEY_HARDWARE',
          level: 'Maximální',
          hardwareHandshake: true,
          biometricStatus: 'ACTIVE',
          lastAuthAt: new Date().toISOString(),
          encryptionType: 'AES-256-GCM',
          integrityScore: 100
        },
        auditLogs: [
          { id: 'aud-0', timestamp: new Date().toLocaleString(), action: 'ARCHITECT_INITIAL_HANDSHAKE', actorId: 'SYSTEM', category: 'SECURITY', severity: 'CRITICAL' }
        ]
      };

      this.data = {
        users: [architect],
        posts: MOCK_SOCIAL_FEED,
        projects: MOCK_PROJECTS,
        manuals: [],
        reports: [],
        conversations: [],
        cloudFiles: MOCK_CLOUD,
        tasks: [
          { id: 't1', type: 'KERNEL_READY', status: 'COMPLETED', createdAt: new Date().toLocaleString() }
        ],
        globalAudit: [
          { id: 'a1', timestamp: new Date().toLocaleString(), action: 'KERNEL_INITIALIZATION', actorId: 'SYSTEM', actorName: 'Synthesis Core', category: 'SYSTEM', severity: 'LOW' }
        ]
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    window.dispatchEvent(new CustomEvent('db-update', { detail: this.data }));
  }

  public getAll<T extends TableName>(table: T): DatabaseSchema[T] {
    return this.data[table];
  }

  public getById<T extends TableName>(table: T, id: string): any {
    return (this.data[table] as any[]).find((item: any) => item.id === id);
  }

  public insert<T extends TableName>(table: T, item: any) {
    if (!this.data[table]) this.data[table] = [] as any;
    (this.data[table] as any[]).unshift(item);
    this.save();
    return item;
  }

  public update<T extends TableName>(table: T, id: string, updates: any) {
    const tableData = this.data[table] as any[];
    const index = tableData.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      tableData[index] = { ...tableData[index], ...updates };
      this.save();
      return tableData[index];
    }
    return null;
  }

  public delete<T extends TableName>(table: T, id: string) {
    this.data[table] = (this.data[table] as any[]).filter((item: any) => item.id !== id) as any;
    this.save();
  }

  public exportRaw(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importRaw(json: string) {
    try {
      this.data = JSON.parse(json);
      this.save();
      return true;
    } catch (e) {
      console.error("Database import failed", e);
      return false;
    }
  }

  public reset() {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
}

export const db = new StorageService();
