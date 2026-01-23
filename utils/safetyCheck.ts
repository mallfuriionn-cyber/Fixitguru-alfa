
/**
 * Utility pro bezpečnostní kontrolu.
 * Vyčleněno jako samostatná funkce pro modularitu.
 */
export const getSafetyWarning = (topic: string): string | null => {
  const dangerousKeywords = ['230v', 'elektřina', 'napětí', 'zásuvka', 'jistič', 'plyn', 'kotel', 'brzdy', 'výškový'];
  const lowercaseTopic = topic.toLowerCase();
  
  if (dangerousKeywords.some(key => lowercaseTopic.includes(key))) {
    return "⚠️ VAROVÁNÍ: Detekováno zvýšené riziko. Před zahájením práce se ujistěte, že je zařízení odpojeno od sítě (230V), plyn je uzavřen nebo jsou zajištěny odpovídající bezpečnostní prvky. Pokud si nejste jisti, kontaktujte odborníka.";
  }
  
  return null;
};
