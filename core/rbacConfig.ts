
import { UserRole } from '../types.ts';

export type Permission = 
  | 'ACCESS_KERNEL'           // Přístup do Admin Panelu
  | 'EDIT_SYSTEM_CONFIG'     // Úprava agentů a systémových parametrů
  | 'MANAGE_USERS'           // Změna rolí a oprávnění jiných uživatelů
  | 'BYPASS_ENCRYPTION'      // Přístup k dešifrovaným datům v Trezoru
  | 'EDIT_ALL_MATRICES'      // Úprava matric ostatních subjektů
  | 'EDIT_OWN_MATRIX'        // Úprava vlastních dat
  | 'START_LEGAL_PROCESS'    // Spouštění JUDY Advocacy protokolu
  | 'VIEW_AUDIT_LOGS'        // Prohlížení systémových logů
  | 'EXECUTE_CODE_UPDATE';   // Možnost měnit algoritmy (pouze Architekt)

export interface RoleConfig {
  role: UserRole;
  label: string;
  icon: string;
  color: string;
  minLevel: number;
  maxLevel: number;
  permissions: Permission[];
  description: string;
}

export const RBAC_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.ARCHITECT]: {
    role: UserRole.ARCHITECT,
    label: 'Architekt',
    icon: '∞',
    color: 'from-purple-600 to-indigo-600',
    minLevel: 99,
    maxLevel: 999,
    permissions: [
      'ACCESS_KERNEL', 'EDIT_SYSTEM_CONFIG', 'MANAGE_USERS', 
      'BYPASS_ENCRYPTION', 'EDIT_ALL_MATRICES', 'EDIT_OWN_MATRIX', 
      'START_LEGAL_PROCESS', 'VIEW_AUDIT_LOGS', 'EXECUTE_CODE_UPDATE'
    ],
    description: 'Nejvyšší autorita. Plná kontrola nad Jádrem a Matrixem.'
  },
  [UserRole.GURU]: {
    role: UserRole.GURU,
    label: 'Guru Specialist',
    icon: '⚡',
    color: 'from-[#007AFF] to-blue-500',
    minLevel: 50,
    maxLevel: 99,
    permissions: [
      'ACCESS_KERNEL', 'EDIT_SYSTEM_CONFIG', 'EDIT_ALL_MATRICES', 
      'EDIT_OWN_MATRIX', 'START_LEGAL_PROCESS', 'VIEW_AUDIT_LOGS'
    ],
    description: 'Systémový expert. Správa procesů a validace dat v Matrixu.'
  },
  [UserRole.OPERATOR]: {
    role: UserRole.OPERATOR,
    label: 'Operátor',
    icon: '⚙️',
    color: 'from-orange-500 to-amber-500',
    minLevel: 10,
    maxLevel: 49,
    permissions: [
      'EDIT_OWN_MATRIX', 'START_LEGAL_PROCESS', 'VIEW_AUDIT_LOGS'
    ],
    description: 'Procesor dat. Provádí rutinní úkony a kontrolu kvality.'
  },
  [UserRole.SUBJECT]: {
    role: UserRole.SUBJECT,
    label: 'Subjekt',
    icon: '👤',
    color: 'from-slate-700 to-slate-900',
    minLevel: 1,
    maxLevel: 9,
    permissions: [
      'EDIT_OWN_MATRIX', 'START_LEGAL_PROCESS'
    ],
    description: 'Standardní uživatel systému Synthesis OS.'
  },
  [UserRole.HOST]: {
    role: UserRole.HOST,
    label: 'Host',
    icon: '👀',
    color: 'from-gray-300 to-gray-400',
    minLevel: 0,
    maxLevel: 0,
    permissions: [],
    description: 'Pozorovatel. Omezený přístup k veřejným modulům.'
  },
  /* Zpětná kompatibilita */
  [UserRole.ADMINISTRATOR]: {
    role: UserRole.ADMINISTRATOR,
    label: 'Admin (Legacy)',
    icon: '🛡️',
    color: 'from-red-600 to-red-800',
    minLevel: 99,
    maxLevel: 99,
    permissions: ['ACCESS_KERNEL', 'EDIT_SYSTEM_CONFIG', 'MANAGE_USERS', 'EDIT_OWN_MATRIX'],
    description: 'Legacy administrátorský přístup.'
  },
  [UserRole.SUBSCRIBER]: {
    role: UserRole.SUBSCRIBER,
    label: 'Uživatel',
    icon: '👤',
    color: 'from-slate-500 to-slate-600',
    minLevel: 1,
    maxLevel: 10,
    permissions: ['EDIT_OWN_MATRIX'],
    description: 'Základní uživatelský profil.'
  },
  [UserRole.CONTRIBUTOR]: {
    role: UserRole.CONTRIBUTOR,
    label: 'Přispěvatel',
    icon: '🛠️',
    color: 'from-green-600 to-teal-600',
    minLevel: 5,
    maxLevel: 20,
    permissions: ['EDIT_OWN_MATRIX'],
    description: 'Uživatel s aktivním přínosem pro komunitu.'
  }
};
