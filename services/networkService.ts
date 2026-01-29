
/**
 * Synthesis Network Intelligence
 * Simuluje detekci důvěryhodného prostředí (Safe Environment).
 */

export const networkService = {
  /**
   * Generuje unikátní otisk aktuální sítě.
   * V reálném prostředí by kombinoval IP, gateway a další metadata.
   */
  getNetworkSignature: async (): Promise<string> => {
    // Pro alfa verzi simulujeme statický otisk založený na platformě a parametrech připojení
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const signature = `SIG-${navigator.platform}-${conn?.type || 'wifi'}-${conn?.downlink || 'unknown'}`;
    return btoa(signature).slice(0, 12);
  },

  /**
   * Prověří, zda je aktuální signatura sítě v seznamu důvěryhodných uzlů uživatele.
   */
  isTrustedEnvironment: async (user: any): Promise<boolean> => {
    if (!user || !user.vaultData?.trustedNetworks) return false;
    const currentSig = await networkService.getNetworkSignature();
    return user.vaultData.trustedNetworks.includes(currentSig);
  }
};
