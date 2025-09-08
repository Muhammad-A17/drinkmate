// Secure local storage wrapper to prevent tampering and enhance security

/**
 * SecureStorage: A wrapper around localStorage with encryption and signature verification
 * to prevent client-side data tampering.
 */
class SecureStorage {
  private prefix: string;
  private encryptionKey: string;
  
  constructor(prefix = 'drinkmate_', encryptionKey = '') {
    this.prefix = prefix;
    // In a production environment, this should be a strong, unique key
    // For this demo, we're using a simple approach
    this.encryptionKey = encryptionKey || this.generateSimpleKey();
  }
  
  /**
   * Generates a simple key based on user agent and domain
   * This is not cryptographically secure, but better than nothing
   */
  private generateSimpleKey(): string {
    if (typeof window === 'undefined') return 'server-side';
    
    const domain = window.location.hostname;
    const browserInfo = navigator.userAgent;
    return btoa(`${domain}-${browserInfo}`).substring(0, 32);
  }
  
  /**
   * Simple encryption for stored values
   * For a production app, use a proper encryption library
   */
  private encrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    
    try {
      // Simple XOR encryption with the key
      const encrypted = data.split('').map((char, i) => {
        return String.fromCharCode(
          char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }).join('');
      
      return btoa(encrypted);
    } catch (e) {
      console.error('Encryption failed:', e);
      return data;
    }
  }
  
  /**
   * Simple decryption for stored values
   * For a production app, use a proper decryption library
   */
  private decrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    
    try {
      const decoded = atob(data);
      
      // Simple XOR decryption with the key
      return decoded.split('').map((char, i) => {
        return String.fromCharCode(
          char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }).join('');
    } catch (e) {
      console.error('Decryption failed:', e);
      return data;
    }
  }
  
  /**
   * Create a simple signature for data integrity verification
   */
  private sign(data: string): string {
    if (typeof window === 'undefined') return '';
    
    // Simple HMAC-like signature
    const signatureBase = data + this.encryptionKey;
    let signature = 0;
    
    // Simple hash function
    for (let i = 0; i < signatureBase.length; i++) {
      signature = ((signature << 5) - signature) + signatureBase.charCodeAt(i);
      signature = signature & signature; // Convert to 32bit integer
    }
    
    return signature.toString(36);
  }
  
  /**
   * Verify the signature of stored data
   */
  private verifySignature(data: string, signature: string): boolean {
    return this.sign(data) === signature;
  }
  
  /**
   * Set an item in secure storage
   */
  setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const jsonValue = JSON.stringify(value);
      const encryptedValue = this.encrypt(jsonValue);
      const signature = this.sign(jsonValue);
      
      const secureData = {
        data: encryptedValue,
        signature,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(secureData));
    } catch (e) {
      console.error('SecureStorage.setItem failed:', e);
    }
  }
  
  /**
   * Get an item from secure storage
   */
  getItem<T>(key: string, defaultValue: T = null as unknown as T): T {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const storedData = localStorage.getItem(`${this.prefix}${key}`);
      if (!storedData) return defaultValue;
      
      const secureData = JSON.parse(storedData);
      const decryptedValue = this.decrypt(secureData.data);
      
      // Verify data integrity
      if (!this.verifySignature(decryptedValue, secureData.signature)) {
        console.warn('Data integrity check failed for key:', key);
        this.removeItem(key);
        return defaultValue;
      }
      
      return JSON.parse(decryptedValue) as T;
    } catch (e) {
      console.error('SecureStorage.getItem failed:', e);
      return defaultValue;
    }
  }
  
  /**
   * Remove an item from secure storage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (e) {
      console.error('SecureStorage.removeItem failed:', e);
    }
  }
  
  /**
   * Clear all items from secure storage that match the prefix
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('SecureStorage.clear failed:', e);
    }
  }
  
  /**
   * Check if a key exists in secure storage
   */
  hasItem(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem(`${this.prefix}${key}`) !== null;
  }
}

// Export a singleton instance for use throughout the app
export const secureStorage = new SecureStorage();

// Export the class for custom instances if needed
export default SecureStorage;
