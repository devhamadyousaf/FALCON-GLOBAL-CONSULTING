/**
 * Safe localStorage/sessionStorage utility with automatic error recovery
 * Prevents white screen issues from corrupted storage data
 */

const MAX_RETRIES = 3;
const CORRUPTION_ERROR_CODES = ['QuotaExceededError', 'NS_ERROR_FILE_CORRUPTED'];

class SafeStorage {
  /**
   * Safely get an item from storage with automatic corruption handling
   * @param {string} key - Storage key
   * @param {Storage} storage - localStorage or sessionStorage (default: localStorage)
   * @param {*} defaultValue - Default value if item doesn't exist or is corrupted
   * @returns {*} Parsed value or defaultValue
   */
  static getItem(key, storage = typeof window !== 'undefined' ? localStorage : null, defaultValue = null) {
    if (typeof window === 'undefined' || !storage) {
      return defaultValue;
    }

    try {
      const item = storage.getItem(key);

      if (item === null || item === undefined) {
        return defaultValue;
      }

      // Try to parse JSON
      try {
        return JSON.parse(item);
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse storage item "${key}":`, parseError.message);

        // If it's not JSON, it might be a plain string - return as is
        if (typeof item === 'string' && item.trim() !== '') {
          return item;
        }

        // Otherwise, clear corrupted data and return default
        this.removeItem(key, storage);
        return defaultValue;
      }
    } catch (error) {
      console.error(`❌ Error reading from storage key "${key}":`, error);

      // If storage is corrupted, try to recover
      if (this.isStorageCorrupted(error)) {
        this.attemptStorageRecovery(storage);
      }

      return defaultValue;
    }
  }

  /**
   * Safely set an item in storage with automatic error handling
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @param {Storage} storage - localStorage or sessionStorage (default: localStorage)
   * @returns {boolean} Success status
   */
  static setItem(key, value, storage = typeof window !== 'undefined' ? localStorage : null) {
    if (typeof window === 'undefined' || !storage) {
      return false;
    }

    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        storage.setItem(key, stringValue);
        return true;
      } catch (error) {
        console.error(`❌ Error writing to storage key "${key}" (attempt ${retries + 1}/${MAX_RETRIES}):`, error);

        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
          console.warn('📦 Storage quota exceeded, attempting to clear old data...');
          this.clearOldestItems(storage, 5);
          retries++;
          continue;
        }

        // Handle corruption
        if (this.isStorageCorrupted(error)) {
          this.attemptStorageRecovery(storage);
          retries++;
          continue;
        }

        // Other errors - fail immediately
        return false;
      }
    }

    return false;
  }

  /**
   * Safely remove an item from storage
   * @param {string} key - Storage key
   * @param {Storage} storage - localStorage or sessionStorage (default: localStorage)
   * @returns {boolean} Success status
   */
  static removeItem(key, storage = typeof window !== 'undefined' ? localStorage : null) {
    if (typeof window === 'undefined' || !storage) {
      return false;
    }

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`❌ Error removing storage key "${key}":`, error);

      if (this.isStorageCorrupted(error)) {
        this.attemptStorageRecovery(storage);
      }

      return false;
    }
  }

  /**
   * Clear all items from storage
   * @param {Storage} storage - localStorage or sessionStorage (default: localStorage)
   * @returns {boolean} Success status
   */
  static clear(storage = typeof window !== 'undefined' ? localStorage : null) {
    if (typeof window === 'undefined' || !storage) {
      return false;
    }

    try {
      storage.clear();
      console.log('✅ Storage cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Check if an error indicates storage corruption
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  static isStorageCorrupted(error) {
    return CORRUPTION_ERROR_CODES.some(code =>
      error.name === code || error.message?.includes(code)
    );
  }

  /**
   * Attempt to recover from storage corruption
   * @param {Storage} storage - localStorage or sessionStorage
   */
  static attemptStorageRecovery(storage) {
    console.warn('🔧 Attempting storage recovery...');

    try {
      // Check if we've already attempted recovery recently to prevent reload loops
      const recoveryKey = '__storage_recovery_attempt__';
      const lastRecovery = sessionStorage.getItem(recoveryKey);
      const now = Date.now();

      // If recovery was attempted in the last 30 seconds, don't reload
      if (lastRecovery && (now - parseInt(lastRecovery)) < 30000) {
        console.warn('⚠️ Recent recovery attempt detected - skipping reload to prevent loop');
        return;
      }

      // Mark recovery attempt
      try {
        sessionStorage.setItem(recoveryKey, now.toString());
      } catch (e) {
        // If we can't even set this, just continue
      }

      // Try to clear corrupted storage
      storage.clear();
      console.log('✅ Storage recovered successfully');

      // Only reload if we're not already in a recovery loop
      if (typeof window !== 'undefined' && !window.location.hash.includes('recovery')) {
        console.log('🔄 Reloading page to reinitialize...');
        // Add a hash to track recovery reload
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = 'recovery';
        setTimeout(() => {
          window.location.href = currentUrl.href;
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Storage recovery failed:', error);
      console.warn('⚠️ Manual storage clearance may be required');
    }
  }

  /**
   * Clear oldest items from storage to free up space
   * @param {Storage} storage - localStorage or sessionStorage
   * @param {number} count - Number of items to remove
   */
  static clearOldestItems(storage, count = 5) {
    try {
      const keys = Object.keys(storage);

      if (keys.length === 0) return;

      // Sort keys and remove oldest ones (simple approach)
      const keysToRemove = keys.slice(0, Math.min(count, keys.length));

      keysToRemove.forEach(key => {
        try {
          storage.removeItem(key);
          console.log(`🗑️ Removed old storage item: ${key}`);
        } catch (e) {
          console.error(`Failed to remove ${key}:`, e);
        }
      });

      console.log(`✅ Cleared ${keysToRemove.length} old items from storage`);
    } catch (error) {
      console.error('Error clearing old items:', error);
    }
  }

  /**
   * Get storage size estimate in bytes
   * @param {Storage} storage - localStorage or sessionStorage
   * @returns {number} Size in bytes
   */
  static getStorageSize(storage = typeof window !== 'undefined' ? localStorage : null) {
    if (typeof window === 'undefined' || !storage) {
      return 0;
    }

    let size = 0;
    try {
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += storage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return size;
  }

  /**
   * Check if storage is available and working
   * @param {Storage} storage - localStorage or sessionStorage
   * @returns {boolean}
   */
  static isStorageAvailable(storage = typeof window !== 'undefined' ? localStorage : null) {
    if (typeof window === 'undefined' || !storage) {
      return false;
    }

    try {
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('⚠️ Storage not available:', error);
      return false;
    }
  }
}

// Convenience methods for localStorage
export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => SafeStorage.getItem(key, localStorage, defaultValue),
  setItem: (key, value) => SafeStorage.setItem(key, value, localStorage),
  removeItem: (key) => SafeStorage.removeItem(key, localStorage),
  clear: () => SafeStorage.clear(localStorage),
};

// Convenience methods for sessionStorage
export const safeSessionStorage = {
  getItem: (key, defaultValue = null) => SafeStorage.getItem(key, sessionStorage, defaultValue),
  setItem: (key, value) => SafeStorage.setItem(key, value, sessionStorage),
  removeItem: (key) => SafeStorage.removeItem(key, sessionStorage),
  clear: () => SafeStorage.clear(sessionStorage),
};

export default SafeStorage;
