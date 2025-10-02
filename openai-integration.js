/**
 * OpenAI API Integration Module
 * Handles secure communication with OpenAI API for real AI responses
 */

class OpenAIIntegration {
    constructor() {
        this.config = new EnvironmentConfig();
        this.openaiConfig = this.config.getOpenAIConfig();
        this.securityConfig = this.config.getSecurityConfig();
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }

    async generateResponse(userMessage, context = {}) {
        try {
            // Validate configuration
            const validation = this.config.validateConfig();
            if (!validation.isValid) {
                throw new Error(`Configuration error: ${validation.errors.join(', ')}`);
            }

            // Rate limiting
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded. Please wait before making another request.');
            }

            // Prepare the request
            const messages = this.prepareMessages(userMessage, context);
            const requestBody = {
                model: this.openaiConfig.model,
                messages: messages,
                max_tokens: this.openaiConfig.maxTokens,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            };

            // Make API request
            const response = await this.makeAPIRequest(requestBody);
            
            // Update rate limiting
            this.updateRateLimit();
            
            return this.processResponse(response);
        } catch (error) {
            console.error('OpenAI API Error:', error);
            return this.handleError(error);
        }
    }

    prepareMessages(userMessage, context) {
        const systemPrompt = this.getSystemPrompt(context);
        
        return [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userMessage
            }
        ];
    }

    getSystemPrompt(context) {
        return `You are Lugvia AI, a helpful and knowledgeable moving assistant. You specialize in:

1. Moving cost estimation and budgeting
2. Packing tips and strategies
3. Moving timeline planning
4. Insurance and protection advice
5. Storage solutions
6. International moving guidance
7. Pet and plant relocation
8. Specialty item handling
9. Weather considerations
10. Utility setup and legal requirements

Provide helpful, accurate, and practical advice. Keep responses concise but informative. If you need more information to provide a better answer, ask clarifying questions.

Context: ${JSON.stringify(context)}

Always maintain a friendly, professional tone and focus on being genuinely helpful to people planning their move.`;
    }

    async makeAPIRequest(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.securityConfig.timeout);

        try {
            const response = await fetch(this.openaiConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    processResponse(response) {
        if (!response.choices || response.choices.length === 0) {
            throw new Error('No response generated');
        }

        const message = response.choices[0].message;
        if (!message || !message.content) {
            throw new Error('Invalid response format');
        }

        return {
            content: message.content.trim(),
            usage: response.usage,
            model: response.model,
            timestamp: new Date().toISOString()
        };
    }

    handleError(error) {
        let fallbackMessage = "I'm sorry, I'm having trouble connecting to my AI services right now. ";
        
        if (error.message.includes('Rate limit')) {
            fallbackMessage += "Please wait a moment before trying again.";
        } else if (error.message.includes('Configuration error')) {
            fallbackMessage += "There seems to be a configuration issue. Please contact support.";
        } else if (error.message.includes('API request failed')) {
            fallbackMessage += "There was an issue with the AI service. Please try again later.";
        } else {
            fallbackMessage += "Please try again or contact support if the issue persists.";
        }

        return {
            content: fallbackMessage,
            error: true,
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        };
    }

    checkRateLimit() {
        const now = Date.now();
        const timeDiff = now - this.lastRequestTime;
        
        // Reset counter if more than 1 minute has passed
        if (timeDiff > 60000) {
            this.requestCount = 0;
        }
        
        return this.requestCount < this.securityConfig.rateLimit;
    }

    updateRateLimit() {
        this.requestCount++;
        this.lastRequestTime = Date.now();
    }

    // Method to set API key securely (for initial setup)
    setAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('Invalid API key');
        }
        
        this.config.setSecureValue('OPENAI_API_KEY', apiKey);
        this.openaiConfig = this.config.getOpenAIConfig();
    }

    // Method to test API connection
    async testConnection() {
        try {
            const response = await this.generateResponse('Hello, this is a test message.');
            return {
                success: !response.error,
                message: response.error ? response.errorMessage : 'Connection successful',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                response: null
            };
        }
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIIntegration;
} else if (typeof window !== 'undefined') {
    window.OpenAIIntegration = OpenAIIntegration;
}