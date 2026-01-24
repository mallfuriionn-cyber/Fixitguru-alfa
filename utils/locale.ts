
/**
 * Detekce jazyka zařízení a mapování na podporované lokality Synthesis OS.
 */
export type SupportedLocale = 'cs' | 'en';

export const getBrowserLanguage = (): SupportedLocale => {
  const lang = navigator.language || (navigator as any).userLanguage || 'cs';
  const shortLang = lang.split('-')[0].toLowerCase();
  
  // Podporujeme primárně CS a EN. Pokud je jazyk jiný, AI dostane instrukci pro daný jazyk, 
  // ale UI zůstane v EN jako globálním standardu.
  if (shortLang === 'cs' || shortLang === 'sk') return 'cs';
  return 'en';
};

export const getFullLanguageName = (locale: SupportedLocale): string => {
  const names = {
    cs: 'Czech (Čeština)',
    en: 'English'
  };
  return names[locale] || 'English';
};
