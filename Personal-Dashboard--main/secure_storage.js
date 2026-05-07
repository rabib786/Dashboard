/**
 * SecureStorage Utility
 * Provides encrypted storage for sensitive data like API keys
 * Uses sessionStorage + basic obfuscation as interim solution
 * Future enhancement: Web Crypto API for proper encryption
 */

const SecureStorage = {
    // Storage keys for different types of sensitive data
    STORAGE_KEYS: {
        TORN_API_KEY: 'secure_torn_api_key',
        WEATHER_API_KEY: 'secure_weather_api_key',
        USER_CREDENTIALS: 'secure_user_credentials'
    },

    /**
     * Obfuscate a string using base64 encoding
     * Note: This is NOT encryption, just basic obfuscation
     * For production, implement proper encryption with Web Crypto API
     */
    _obfuscate(value) {
        if (!value) return '';
        try {
            // Double encode to make it less obvious
            return btoa(unescape(encodeURIComponent(`salt_${value}_${Date.now()}`)));
        } catch (e) {
            console.warn('Obfuscation failed:', e);
            return value;
        }
    },

    /**
     * Deobfuscate a string
     */
    _deobfuscate(obfuscated) {
        if (!obfuscated) return '';
        try {
            const decoded = decodeURIComponent(escape(atob(obfuscated)));
            // Remove the salt and timestamp added during obfuscation
            return decoded.replace(/^salt_(.*)_\d+$/, '$1');
        } catch (e) {
            console.warn('Deobfuscation failed:', e);
            return obfuscated;
        }
    },

    /**
     * Store sensitive data securely
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     * @param {boolean} useSession - Use sessionStorage (true) or localStorage (false)
     */
    setItem(key, value, useSession = true) {
        if (!key || value === undefined || value === null) {
            console.warn('Invalid storage parameters');
            return false;
        }

        try {
            const obfuscated = this._obfuscate(value);
            const storage = useSession ? sessionStorage : localStorage;
            storage.setItem(key, obfuscated);
            return true;
        } catch (e) {
            console.error('Failed to store secure item:', e);
            return false;
        }
    },

    /**
     * Retrieve sensitive data
     * @param {string} key - Storage key
     * @param {boolean} useSession - Use sessionStorage (true) or localStorage (false)
     * @returns {string} - Decrypted value or empty string
     */
    getItem(key, useSession = true) {
        if (!key) return '';

        try {
            const storage = useSession ? sessionStorage : localStorage;
            const obfuscated = storage.getItem(key);
            return obfuscated ? this._deobfuscate(obfuscated) : '';
        } catch (e) {
            console.error('Failed to retrieve secure item:', e);
            return '';
        }
    },

    /**
     * Remove sensitive data
     * @param {string} key - Storage key
     * @param {boolean} useSession - Use sessionStorage (true) or localStorage (false)
     */
    removeItem(key, useSession = true) {
        try {
            const storage = useSession ? sessionStorage : localStorage;
            storage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove secure item:', e);
            return false;
        }
    },

    /**
     * Store Torn API key securely
     * @param {string} apiKey - Torn API key
     */
    setTornApiKey(apiKey) {
        return this.setItem(this.STORAGE_KEYS.TORN_API_KEY, apiKey, true);
    },

    /**
     * Get Torn API key
     * @returns {string} - Torn API key or empty string
     */
    getTornApiKey() {
        return this.getItem(this.STORAGE_KEYS.TORN_API_KEY, true);
    },

    /**
     * Clear all secure storage
     */
    clearAll() {
        try {
            // Clear from both session and local storage
            Object.values(this.STORAGE_KEYS).forEach(key => {
                sessionStorage.removeItem(key);
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Failed to clear secure storage:', e);
            return false;
        }
    },

    /**
     * Migrate existing localStorage API keys to secure storage
     * Call this during application initialization
     */
    migrateLegacyKeys() {
        try {
            // Migrate Torn API key from localStorage to secure storage
            const legacyTornConfig = localStorage.getItem('nexus_torn_config');
            if (legacyTornConfig) {
                try {
                    const config = JSON.parse(legacyTornConfig);
                    if (config.apiKey && config.apiKey.trim()) {
                        this.setTornApiKey(config.apiKey);
                        console.log('Migrated Torn API key to secure storage');
                    }
                } catch (e) {
                    console.warn('Failed to parse legacy Torn config:', e);
                }
            }

            // Migrate dashboardTornTracker
            const legacyDashboardTorn = localStorage.getItem('dashboardTornTracker');
            if (legacyDashboardTorn) {
                try {
                    const config = JSON.parse(legacyDashboardTorn);
                    if (config.key && config.key.trim()) {
                        this.setTornApiKey(config.key);
                        console.log('Migrated dashboard Torn API key to secure storage');
                    }
                } catch (e) {
                    console.warn('Failed to parse legacy dashboard Torn config:', e);
                }
            }

            return true;
        } catch (e) {
            console.error('Migration failed:', e);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureStorage };
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.SecureStorage = SecureStorage;
}