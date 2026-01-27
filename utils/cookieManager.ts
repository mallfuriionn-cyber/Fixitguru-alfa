
/**
 * Utility pro správu cookies v Synthesis OS.
 */

export const cookies = {
  /**
   * Nastaví cookie s daným názvem, hodnotou a expirací ve dnech.
   */
  set: (name: string, value: string, days: number = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
  },

  /**
   * Získá hodnotu cookie podle názvu.
   */
  get: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * Odstraní cookie podle názvu.
   */
  remove: (name: string) => {
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
  }
};
