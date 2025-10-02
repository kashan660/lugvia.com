/**
 * Environment Configuration Module
 * Handles secure loading of environment variables and API configurations
 */

class EnvironmentConfig {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        // In a real Node.js environment, you would use process.env
        // For browser environment, we'll use a secure configuration approach
        const config = {
            openai: {
                apiKey: this.getSecureValue('OPENAI_API_KEY'),
                model: this.getSecureValue('OPENAI_MODEL', 'gpt-3.5-turbo'),
                maxTokens: parseInt(this.getSecureValue('OPENAI_MAX_TOKENS', '1000')),
                apiUrl: 'https://api.openai.com/v1/chat/completions'
            },
            server: {
                port: parseInt(this.getSecureValue('PORT', '8000')),
                environment: this.getSecureValue('NODE_ENV', 'development')
            },
            security: {
                rateLimit: parseInt(this.getSecureValue('API_RATE_LIMIT', '100')),
                timeout: parseInt(this.getSecureValue('API_TIMEOUT', '30000'))
            }
        };

        return config;
    }

    getSecureValue(key, defaultValue = null) {
        // In browser environment, check for secure storage or configuration
        if (typeof window !== 'undefined') {
            // Check for configuration in secure storage or environment
            const stored = localStorage.getItem(`secure_${key}`);
            if (stored) {
                return stored;
            }
        }
        
        // In Node.js environment, use process.env
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || defaultValue;
        }
        
        return defaultValue;
    }

    setSecureValue(key, value) {
        if (typeof window !== 'undefined') {
            // Store in secure local storage (in production, use more secure methods)
            localStorage.setItem(`secure_${key}`, value);
        }
    }

    getOpenAIConfig() {
        return this.config.openai;
    }

    getServerConfig() {
        return this.config.server;
    }

    getSecurityConfig() {
        return this.config.security;
    }

    isConfigured() {
        return this.config.openai.apiKey && this.config.openai.apiKey !== 'your_openai_api_key_here';
    }

    validateConfig() {
        const errors = [];
        
        if (!this.config.openai.apiKey) {
            errors.push('OpenAI API key is required');
        }
        
        if (this.config.openai.apiKey === 'your_openai_api_key_here') {
            errors.push('Please set a valid OpenAI API key');
        }
        
        if (!this.config.openai.model) {
            errors.push('OpenAI model is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentConfig;
} else if (typeof window !== 'undefined') {
    window.EnvironmentConfig = EnvironmentConfig;
}