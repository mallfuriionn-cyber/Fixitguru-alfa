
import { User, UserRole } from '../types.ts';
import { RBAC_CONFIG, Permission } from '../core/rbacConfig.ts';

/**
 * Zkontroluje, zda má uživatel dané oprávnění na základě jeho role.
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  const config = RBAC_CONFIG[user.role];
  if (!config) return false;
  return config.permissions.includes(permission);
};

/**
 * Zkontroluje, zda může uživatel přistoupit ke konkrétnímu modulu.
 */
export const canAccessModule = (user: User | null, moduleId: string): boolean => {
  if (!user) return false;
  
  // Moduly vyžadující kernel access
  const adminModules = ['ADMIN', 'TECHNICAL_LOG', 'SYSTEM_DEBUG'];
  if (adminModules.includes(moduleId)) {
    return hasPermission(user, 'ACCESS_KERNEL');
  }

  // Ostatní moduly jsou zatím přístupné pro všechny registrované
  return user.role !== UserRole.HOST;
};

/**
 * Vrátí konfigurační objekt role pro vizuální účely.
 */
export const getRoleMeta = (role: UserRole) => {
  return RBAC_CONFIG[role] || RBAC_CONFIG[UserRole.HOST];
};
