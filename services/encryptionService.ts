
/**
 * Synthesis Encryption Engine (SEE)
 * Zajišťuje šifrování dat na straně klienta pomocí Web Crypto API.
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
}

export class EncryptionService {
  private async getMasterKey(secretId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretId);
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('synthesis_salt_v1'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(text: string, secretId: string): Promise<EncryptedData> {
    const key = await this.getMasterKey(secretId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(text);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
      iv: btoa(String.fromCharCode(...iv))
    };
  }

  async decrypt(encrypted: EncryptedData, secretId: string): Promise<string> {
    try {
      const key = await this.getMasterKey(secretId);
      const iv = new Uint8Array(atob(encrypted.iv).split('').map(c => c.charCodeAt(0)));
      const ciphertext = new Uint8Array(atob(encrypted.ciphertext).split('').map(c => c.charCodeAt(0)));

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      console.error("SEE Decryption failed:", e);
      return "[DECRYPTION_ERROR]";
    }
  }

  /**
   * Šifruje celý objekt ExtractedPersonalData
   */
  async encryptVault(data: any, secretId: string): Promise<Record<string, EncryptedData>> {
    const encryptedVault: Record<string, EncryptedData> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string') {
        encryptedVault[key] = await this.encrypt(value, secretId);
      }
    }
    return encryptedVault;
  }
}

export const see = new EncryptionService();
