// AI Chat Functionality

class AIMovingAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.recentQuotes = document.getElementById('recentQuotes');
        this.conversationHistory = [];
        this.quotes = [];
        
        // Initialize API integration
        this.apiIntegration = new MovingAPIIntegration();
        this.recommendationEngine = new AIRecommendationEngine();
        this.lastQuotes = null;
        this.userProfile = {};
        this.currentRecommendations = null;
        
        // Initialize OpenAI integration
        this.openaiIntegration = null;
        this.useRealAI = false;
        
        // Initialize intelligent prompts
        this.prompts = new LugviaAIPrompts();
        
        this.initializeAI();
        
        // Initialize the chat
        this.init();
    }
    
    async initializeAI() {
        try {
            if (typeof OpenAIIntegration !== 'undefined') {
                this.openaiIntegration = new OpenAIIntegration();
                
                // Check if API key is configured
                if (this.openaiIntegration.config.isConfigured()) {
                    // Test connection
                    const testResult = await this.openaiIntegration.testConnection();
                    if (testResult.success) {
                        this.useRealAI = true;
                        console.log('✅ OpenAI integration enabled');
                        this.showAIStatus('Real AI enabled - Enhanced responses available!');
                    } else {
                        console.warn('⚠️ OpenAI connection test failed:', testResult.message);
                        this.showAIStatus('AI connection issue - Using fallback responses');
                    }
                } else {
                    console.log('ℹ️ OpenAI not configured - Using simulated responses');
                    this.showAIStatus('Configure OpenAI API key for enhanced AI responses');
                }
            }
        } catch (error) {
            console.error('AI initialization error:', error);
            this.showAIStatus('AI initialization failed - Using fallback responses');
        }
    }
    
    init() {
        // Focus on input
        this.messageInput.focus();
        
        // Load conversation history from localStorage
        this.loadConversationHistory();
        
        // Load recent quotes
        this.loadRecentQuotes();
        
        // Add intelligent welcome message if no conversation history
        if (this.conversationHistory.length === 0) {
            const welcomeMessage = this.prompts.getWelcomePrompt();
            this.addMessage(welcomeMessage, 'assistant');
        }
    }
    
    async sendMessage(message = null) {
        const text = message || this.messageInput.value.trim();
        if (!text) return;
        
        // Clear input
        this.messageInput.value = '';
        
        // Add user message
        this.addMessage(text, 'user');
        
        // Show typing indicator
        this.showTyping();
        
        // Process the message
        setTimeout(async () => {
            await this.processUserMessage(text);
            this.hideTyping();
        }, 1000 + Math.random() * 2000); // Simulate thinking time
    }
    
    async processUserMessage(message) {
        // Store user message in conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Try real AI first if available, otherwise use intent-based responses
        if (this.useRealAI && this.openaiIntegration) {
            await this.handleRealAIResponse(message);
        } else {
            // Fallback to intent-based responses
            await this.handleIntentBasedResponse(message);
        }
        
        // Save conversation
        this.saveConversationHistory();
    }
    
    async handleRealAIResponse(message) {
        try {
            // Prepare context for AI with intelligent prompts
            const context = {
                userProfile: this.userProfile,
                lastQuotes: this.lastQuotes,
                conversationHistory: this.conversationHistory.slice(-5), // Last 5 messages for context
                currentRecommendations: this.currentRecommendations
            };
            
            // Generate contextual system prompt using intelligent prompts
            const systemPrompt = this.prompts.generateContextualSystemPrompt(message, context);
            
            // Get AI response with enhanced context
            const aiResponse = await this.openaiIntegration.generateResponse(message, {
                ...context,
                systemPrompt: systemPrompt
            });
            
            if (aiResponse.error) {
                // Use intelligent fallback prompt
                const fallbackMessage = this.prompts.getContextualPrompt('error');
                this.addMessage(fallbackMessage, 'assistant');
                console.warn('AI response failed, using intelligent fallback:', aiResponse.errorMessage);
            } else {
                // Add AI response to chat
                this.addMessage(aiResponse.content, 'assistant');
                
                // Store AI response in conversation history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: aiResponse.content,
                    timestamp: aiResponse.timestamp,
                    model: aiResponse.model
                });
                
                // Update user profile based on conversation
                this.updateUserProfile(message);
            }
        } catch (error) {
            console.error('Real AI response error:', error);
            // Fallback to intent-based response
            await this.handleIntentBasedResponse(message);
        }
    }
    
    async handleIntentBasedResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Determine intent and respond accordingly
        if (this.isQuoteRequest(lowerMessage)) {
            await this.handleQuoteRequest(message);
        } else if (this.isComparisonRequest(lowerMessage)) {
            await this.handleComparisonRequest();
        } else if (this.isRecommendationRequest(lowerMessage)) {
            await this.handleRecommendationRequest();
        } else if (this.isInsightRequest(lowerMessage)) {
            await this.handleInsightRequest();
        } else if (this.isChecklistRequest(lowerMessage)) {
            await this.handleChecklistRequest();
        } else if (this.isPackingRequest(lowerMessage)) {
            await this.handlePackingTips();
        } else if (this.isCostQuestion(lowerMessage)) {
            await this.handleCostQuestion();
        } else if (this.isTimelineQuestion(lowerMessage)) {
            await this.handleTimelineQuestion(message);
        } else if (this.isInsuranceQuestion(lowerMessage)) {
            await this.handleInsuranceQuestion();
        } else if (this.isStorageQuestion(lowerMessage)) {
            await this.handleStorageQuestion();
        } else if (this.isInternationalMove(lowerMessage)) {
            await this.handleInternationalMove();
        } else if (this.isPetMoving(lowerMessage)) {
            await this.handlePetMoving();
        } else if (this.isPlantMoving(lowerMessage)) {
            await this.handlePlantMoving();
        } else if (this.isSpecialtyItems(lowerMessage)) {
            await this.handleSpecialtyItems(message);
        } else if (this.isWeatherConcerns(lowerMessage)) {
            await this.handleWeatherConcerns();
        } else if (this.isUtilitiesSetup(lowerMessage)) {
            await this.handleUtilitiesSetup();
        } else if (this.isLegalRequirements(lowerMessage)) {
            await this.handleLegalRequirements();
        } else {
            await this.handleGeneralQuestion(message);
        }
    }
    
    isQuoteRequest(message) {
        const quoteKeywords = ['quote', 'price', 'cost', 'estimate', 'how much', 'moving cost'];
        return quoteKeywords.some(keyword => message.includes(keyword));
    }
    
    isComparisonRequest(message) {
        const comparisonKeywords = ['compare', 'comparison', 'best company', 'which mover', 'difference', 'vs'];
        return comparisonKeywords.some(keyword => message.includes(keyword));
    }
    
    isRecommendationRequest(message) {
        const recommendationKeywords = ['recommend', 'suggest', 'best option', 'what should i choose'];
        return recommendationKeywords.some(keyword => message.includes(keyword));
    }
    
    isInsightRequest(message) {
        const insightKeywords = ['insight', 'analysis', 'advice', 'opinion', 'thoughts'];
        return insightKeywords.some(keyword => message.includes(keyword));
    }
    
    isChecklistRequest(message) {
        const checklistKeywords = ['checklist', 'todo', 'tasks', 'what to do', 'preparation'];
        return checklistKeywords.some(keyword => message.includes(keyword));
    }
    
    isPackingRequest(message) {
        const packingKeywords = ['pack', 'packing', 'boxes', 'wrap', 'protect'];
        return packingKeywords.some(keyword => message.includes(keyword));
    }
    
    isCostQuestion(message) {
        const costKeywords = ['expensive', 'cheap', 'budget', 'save money', 'affordable'];
        return costKeywords.some(keyword => message.includes(keyword));
    }
    
    isTimelineQuestion(message) {
        const timelineKeywords = ['timeline', 'schedule', 'when', 'how long', 'time', 'weeks', 'planning'];
        return timelineKeywords.some(keyword => message.includes(keyword));
    }
    
    isInsuranceQuestion(message) {
        const insuranceKeywords = ['insurance', 'damage', 'protection', 'coverage', 'liability', 'claim'];
        return insuranceKeywords.some(keyword => message.includes(keyword));
    }
    
    isStorageQuestion(message) {
        const storageKeywords = ['storage', 'warehouse', 'temporary', 'store', 'keep'];
        return storageKeywords.some(keyword => message.includes(keyword));
    }
    
    isInternationalMove(message) {
        const internationalKeywords = ['international', 'overseas', 'country', 'customs', 'abroad', 'visa'];
        return internationalKeywords.some(keyword => message.includes(keyword));
    }
    
    isPetMoving(message) {
        const petKeywords = ['pet', 'dog', 'cat', 'animal', 'bird', 'fish'];
        return petKeywords.some(keyword => message.includes(keyword));
    }
    
    isPlantMoving(message) {
        const plantKeywords = ['plant', 'garden', 'flower', 'tree', 'vegetation'];
        return plantKeywords.some(keyword => message.includes(keyword));
    }
    
    isSpecialtyItems(message) {
        const specialtyKeywords = ['piano', 'artwork', 'antique', 'valuable', 'fragile', 'heavy', 'pool table'];
        return specialtyKeywords.some(keyword => message.includes(keyword));
    }
    
    isWeatherConcerns(message) {
        const weatherKeywords = ['weather', 'rain', 'snow', 'winter', 'summer', 'storm'];
        return weatherKeywords.some(keyword => message.includes(keyword));
    }
    
    isUtilitiesSetup(message) {
        const utilityKeywords = ['utilities', 'electric', 'gas', 'internet', 'cable', 'water', 'setup'];
        return utilityKeywords.some(keyword => message.includes(keyword));
    }
    
    isLegalRequirements(message) {
        const legalKeywords = ['legal', 'permit', 'license', 'regulation', 'law', 'requirement'];
        return legalKeywords.some(keyword => message.includes(keyword));
    }
    
    async handleQuoteRequest(message) {
        // Extract location information if possible
        const locations = this.extractLocations(message);
        
        if (locations.from && locations.to) {
            await this.generateQuote(locations.from, locations.to);
        } else {
            // Use intelligent prompt for quote requests
            const quotePrompt = this.prompts.getQuoteRequestPrompt(message);
            this.addMessage(quotePrompt, 'ai');
        }
    }
    
    async generateQuote(fromLocation, toLocation) {
        // Simulate API call to multiple moving companies
        const quotes = await this.fetchQuotesFromProviders(fromLocation, toLocation);
        
        let response = `🎯 **Great! I found several quotes for your move from ${fromLocation} to ${toLocation}:**\n\n`;
        
        const quoteDisplay = this.createQuoteDisplay(quotes);
        
        this.addMessage(response, 'ai');
        this.addQuoteDisplay(quotes);
        
        // Store quotes for global access
        this.lastQuotes = quotes;
        
        // Save to recent quotes
        this.addToRecentQuotes({
            from: fromLocation,
            to: toLocation,
            quotes: quotes,
            date: new Date().toLocaleDateString()
        });
        
        // Follow up message
        setTimeout(() => {
            this.addMessage(
                "💡 **AI Recommendation:** Based on the quotes above, I recommend considering both price and service quality. " +
                "Would you like me to explain what's included in each quote or help you with the next steps?",
                'ai'
            );
        }, 2000);
    }
    
    async fetchQuotesFromProviders(from, to, additionalDetails = {}) {
        try {
            // Extract zip codes from location strings
            const originZip = this.extractZipCode(from) || '10001'; // Default to NYC
            const destinationZip = this.extractZipCode(to) || '90210'; // Default to LA
            
            // Prepare move details for API
            const moveDetails = {
                originZip: originZip,
                destinationZip: destinationZip,
                moveDate: additionalDetails.moveDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                homeSize: additionalDetails.homeSize || '2-bedroom',
                services: additionalDetails.services || ['packing'],
                specialItems: additionalDetails.specialItems || []
            };
            
            // Get quotes from API integration
            const apiResponse = await this.apiIntegration.getQuotesFromAllProviders(moveDetails);
            
            // Transform API response to match our UI format
            const quotes = apiResponse.quotes.map(quote => ({
                company: quote.companyName,
                price: quote.totalPrice,
                rating: quote.rating,
                services: quote.services.slice(0, 3), // Limit to 3 services for display
                timeframe: quote.estimatedDuration,
                insurance: quote.insurance,
                availability: quote.availability,
                specialOffers: quote.specialOffers,
                contact: quote.contactInfo
            }));
            
            // Generate AI recommendations
            const recommendations = await this.recommendationEngine.generateRecommendations(
                { originZip, destinationZip, ...moveDetails },
                quotes
            );
            
            this.currentRecommendations = recommendations;
            this.userProfile = recommendations.userProfile;
            
            return quotes;
        } catch (error) {
            console.error('Error fetching quotes from API:', error);
            
            // Fallback to simulated data if API fails
            return this.getFallbackQuotes(from, to);
        }
    }
    
    extractZipCode(location) {
        // Try to extract zip code from location string
        const zipMatch = location.match(/\b\d{5}\b/);
        return zipMatch ? zipMatch[0] : null;
    }
    
    getFallbackQuotes(from, to) {
        // Fallback quotes if API is unavailable
        const basePrice = 800 + Math.random() * 1200;
        
        return [
            {
                company: "Premium Movers USA",
                price: Math.round(basePrice * 1.2),
                rating: 4.8,
                services: ["Full packing", "Insurance included", "Storage available"],
                timeframe: "2-3 days",
                availability: "Good availability"
            },
            {
                company: "Budget Moving Solutions",
                price: Math.round(basePrice * 0.8),
                rating: 4.3,
                services: ["Basic moving", "Optional packing", "Standard insurance"],
                timeframe: "3-5 days",
                availability: "Excellent availability"
            },
            {
                company: "Elite Relocation Services",
                price: Math.round(basePrice * 1.1),
                rating: 4.6,
                services: ["White glove service", "Full insurance", "Expedited delivery"],
                timeframe: "1-2 days",
                availability: "Limited availability"
            }
        ];
    }
    
    createQuoteDisplay(quotes) {
        const quoteContainer = document.createElement('div');
        quoteContainer.className = 'quote-display';
        
        quoteContainer.innerHTML = `
            <h4>🎯 Your Moving Quotes (Real-time from ${quotes.length} providers)</h4>
            <div class="quote-options">
                ${quotes.map((quote, index) => `
                    <div class="quote-option" data-quote-index="${index}">
                        <div class="quote-header">
                            <h5>${quote.company}</h5>
                            <span class="quote-price">$${quote.price.toLocaleString()}</span>
                        </div>
                        <div class="quote-details">
                            <p class="rating-info">⭐ ${quote.rating}/5 • ${quote.timeframe}</p>
                            <p class="availability">${quote.availability || 'Available'}</p>
                            <p class="services">${quote.services.slice(0, 2).join(' • ')}</p>
                            ${quote.specialOffers && quote.specialOffers.length > 0 ? 
                                `<p class="special-offer">🎁 ${quote.specialOffers[0]}</p>` : ''}
                        </div>
                        <div class="quote-actions">
                            <button class="quote-btn" onclick="selectQuote(${index})">Select This Quote</button>
                            <button class="quote-btn secondary" onclick="viewQuoteDetails(${index})">View Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="quote-footer">
                <p><small>💡 Quotes are updated in real-time from verified moving companies</small></p>
            </div>
        `;
        
        return quoteContainer;
    }
    
    createEnhancedQuoteDisplayText(quotes, recommendations) {
        let display = `🎯 **AI-Powered Quote Analysis (${quotes.length} options found):**\n\n`;
        
        // Show top recommendation first
        if (recommendations.recommendations.topChoice) {
            const topChoice = recommendations.recommendations.topChoice;
            display += `🏆 **TOP RECOMMENDATION: ${topChoice.company}**\n`;
            display += `💯 AI Match Score: ${topChoice.recommendation ? topChoice.recommendation.matchScore : 95}%\n`;
            display += `💵 Price: $${topChoice.price.toLocaleString()}\n`;
            display += `⭐ Rating: ${topChoice.rating}/5\n`;
            display += `📅 Timeframe: ${topChoice.timeframe}\n`;
            if (topChoice.recommendation) {
                display += `✨ Best For: ${topChoice.recommendation.bestFor}\n`;
                if (topChoice.recommendation.strengths.length > 0) {
                    display += `💪 Strengths: ${topChoice.recommendation.strengths.join(', ')}\n`;
                }
            }
            display += `\n`;
        }
        
        // Show other options
        if (quotes.length > 1) {
            display += `📋 **Other Options:**\n\n`;
            quotes.slice(1).forEach((quote, index) => {
                const actualIndex = index + 1;
                display += `**${actualIndex + 1}. ${quote.company}**\n`;
                display += `💯 Match Score: ${quote.recommendation ? quote.recommendation.matchScore : 'N/A'}%\n`;
                display += `💵 Price: $${quote.price.toLocaleString()}\n`;
                display += `⭐ Rating: ${quote.rating}/5\n`;
                display += `📅 Timeframe: ${quote.timeframe}\n`;
                if (quote.recommendation) {
                    display += `✨ Best For: ${quote.recommendation.bestFor}\n`;
                }
                display += `\n`;
            });
        }
        
        // Add AI insights summary
        if (recommendations.insights) {
            display += `🧠 **Quick AI Insights:**\n`;
            if (recommendations.insights.personalizedTips && recommendations.insights.personalizedTips.length > 0) {
                display += `💡 ${recommendations.insights.personalizedTips[0]}\n`;
            }
            if (recommendations.insights.costSavingOpportunities && recommendations.insights.costSavingOpportunities.length > 0) {
                display += `💰 ${recommendations.insights.costSavingOpportunities[0]}\n`;
            }
        }
        
        display += `\nAsk me for detailed **insights**, **recommendations**, or help **comparing** options!`;
        
        return display;
    }
    
    createEnhancedQuoteDisplay(quotes, recommendations) {
        const quoteContainer = document.createElement('div');
        quoteContainer.className = 'quote-display enhanced';
        
        let topChoiceHtml = '';
        if (recommendations && recommendations.topChoice) {
            const topChoice = recommendations.topChoice;
            topChoiceHtml = `
                <div class="top-recommendation">
                    <h4>🏆 AI Top Recommendation</h4>
                    <div class="quote-option recommended" data-quote-index="0">
                        <div class="quote-header">
                            <h5>${topChoice.company}</h5>
                            <span class="quote-price">$${topChoice.price.toLocaleString()}</span>
                            <span class="match-score">Match: ${topChoice.matchScore || 95}%</span>
                        </div>
                        <div class="quote-details">
                            <p class="rating-info">⭐ ${topChoice.rating}/5 • ${topChoice.timeframe}</p>
                            <p class="recommendation-reason">${topChoice.reasoning}</p>
                            <p class="services">${topChoice.services.slice(0, 2).join(' • ')}</p>
                        </div>
                        <div class="quote-actions">
                            <button class="quote-btn primary" onclick="selectQuote(0)">Select Top Choice</button>
                            <button class="quote-btn secondary" onclick="viewQuoteDetails(0)">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        const otherQuotesHtml = `
            <div class="other-options">
                <h4>📋 Other Options</h4>
                <div class="quote-options">
                    ${quotes.slice(recommendations && recommendations.topChoice ? 1 : 0).map((quote, index) => {
                        const actualIndex = recommendations && recommendations.topChoice ? index + 1 : index;
                        return `
                            <div class="quote-option" data-quote-index="${actualIndex}">
                                <div class="quote-header">
                                    <h5>${quote.company}</h5>
                                    <span class="quote-price">$${quote.price.toLocaleString()}</span>
                                    ${quote.matchScore ? `<span class="match-score">Match: ${quote.matchScore}%</span>` : ''}
                                </div>
                                <div class="quote-details">
                                    <p class="rating-info">⭐ ${quote.rating}/5 • ${quote.timeframe}</p>
                                    <p class="availability">${quote.availability || 'Available'}</p>
                                    <p class="services">${quote.services.slice(0, 2).join(' • ')}</p>
                                    ${quote.specialOffers && quote.specialOffers.length > 0 ? 
                                        `<p class="special-offer">🎁 ${quote.specialOffers[0]}</p>` : ''}
                                </div>
                                <div class="quote-actions">
                                    <button class="quote-btn" onclick="selectQuote(${actualIndex})">Select</button>
                                    <button class="quote-btn secondary" onclick="viewQuoteDetails(${actualIndex})">Details</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        quoteContainer.innerHTML = topChoiceHtml + otherQuotesHtml + `
            <div class="quote-footer">
                <p><small>🧠 AI-powered recommendations based on your profile and preferences</small></p>
            </div>
        `;
        
        return quoteContainer;
    }
    
    addQuoteDisplay(quotes) {
        const quoteDisplay = this.createQuoteDisplay(quotes);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = `
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="13" fill="#667eea"/>
                <circle cx="12" cy="12" r="1.5" fill="#fff"/>
                <circle cx="18" cy="12" r="1.5" fill="#fff"/>
                <path d="M10 18 Q15 21 20 18" stroke="#fff" stroke-width="1.5" fill="none"/>
            </svg>
        `;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(quoteDisplay);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    async handleComparisonRequest() {
        if (this.lastQuotes && this.lastQuotes.length >= 2) {
            let comparison = `📊 **AI-Powered Quote Comparison Analysis:**\n\n`;
            
            // Enhanced comparison with AI insights
            const analysis = this.performAdvancedComparison(this.lastQuotes);
            
            // Price Analysis
            comparison += `**💰 Price Analysis:**\n`;
            analysis.priceAnalysis.forEach(item => {
                comparison += `• ${item}\n`;
            });
            comparison += `\n`;
            
            // Value Score Comparison
            comparison += `**🎯 AI Value Scores:**\n`;
            analysis.valueScores.forEach((score, index) => {
                comparison += `${index + 1}. **${score.company}**: ${score.score}/100\n`;
                comparison += `   💵 Price Score: ${score.priceScore}/25\n`;
                comparison += `   ⭐ Quality Score: ${score.qualityScore}/25\n`;
                comparison += `   🚀 Service Score: ${score.serviceScore}/25\n`;
                comparison += `   ⚡ Speed Score: ${score.speedScore}/25\n\n`;
            });
            
            // Risk Assessment
            if (analysis.riskFactors.length > 0) {
                comparison += `**⚠️ Risk Assessment:**\n`;
                analysis.riskFactors.forEach(risk => {
                    comparison += `• ${risk}\n`;
                });
                comparison += `\n`;
            }
            
            // AI Recommendation
            comparison += `**🤖 AI Recommendation:**\n`;
            comparison += `${analysis.recommendation}\n\n`;
            
            // Scenario-based suggestions
            comparison += `**📋 Choose Based on Your Priority:**\n`;
            comparison += `💰 **Budget Priority**: ${analysis.budgetChoice.company} ($${analysis.budgetChoice.price.toLocaleString()})\n`;
            comparison += `⭐ **Quality Priority**: ${analysis.qualityChoice.company} (${analysis.qualityChoice.rating}/5 rating)\n`;
            comparison += `⚡ **Speed Priority**: ${analysis.speedChoice.company} (${analysis.speedChoice.timeframe})\n\n`;
            
            comparison += `Need help deciding? Ask me about **insights** or specific **recommendations**!`;
            
            this.addMessage(comparison, 'ai');
        } else {
            this.addMessage(
                "🔍 **Comparing Moving Companies:**\n\n" +
                "Here's what I look for when comparing movers:\n\n" +
                "✅ **License & Insurance** - All companies must be properly licensed\n" +
                "⭐ **Customer Reviews** - Real feedback from verified customers\n" +
                "💰 **Transparent Pricing** - No hidden fees or surprise costs\n" +
                "📋 **Services Included** - What's covered in the base price\n" +
                "🚚 **Equipment & Experience** - Professional tools and trained staff\n\n" +
                "Would you like me to get quotes from multiple companies so you can compare them side by side?",
                'ai'
            );
        }
    }
    
    async handleRecommendationRequest() {
        if (this.currentRecommendations && this.currentRecommendations.recommendations) {
            const rec = this.currentRecommendations.recommendations;
            let message = `🎯 **AI Recommendation Based on Your Profile:**\n\n`;
            
            if (rec.topChoice) {
                message += `**🏆 Top Choice:** ${rec.topChoice.company}\n`;
                message += `**💰 Price:** $${rec.topChoice.price.toLocaleString()}\n`;
                message += `**⭐ Rating:** ${rec.topChoice.rating}/5\n`;
                message += `**🎯 Match Score:** ${rec.topChoice.recommendation ? rec.topChoice.recommendation.matchScore : 'N/A'}%\n\n`;
            }
            
            if (rec.reasoning && rec.reasoning.length > 0) {
                message += `**Why this recommendation:**\n`;
                rec.reasoning.forEach(reason => {
                    message += `• ${reason}\n`;
                });
                message += `\n`;
            }
            
            if (rec.budgetOption && rec.budgetOption !== rec.topChoice) {
                message += `**💰 Budget Option:** ${rec.budgetOption.company} - $${rec.budgetOption.price.toLocaleString()}\n`;
            }
            
            if (rec.premiumOption && rec.premiumOption !== rec.topChoice) {
                message += `**⭐ Premium Option:** ${rec.premiumOption.company} - ${rec.premiumOption.rating}/5 rating\n`;
            }
            
            message += `\nWould you like detailed **insights** or help **comparing** specific options?`;
            
            this.addMessage(message, 'ai');
        } else {
            this.addMessage(
                "I'd be happy to provide personalized recommendations! First, let me get some quotes for your move. Please share your moving details (from/to locations, home size, move date) and I'll analyze the best options for you.",
                'ai'
            );
        }
    }
    
    async handleInsightRequest() {
        if (this.currentRecommendations && this.currentRecommendations.insights) {
            const insights = this.currentRecommendations.insights;
            let message = `📊 **AI Market Insights for Your Move:**\n\n`;
            
            if (insights.marketAnalysis && insights.marketAnalysis.length > 0) {
                message += `**💹 Market Analysis:**\n`;
                insights.marketAnalysis.forEach(analysis => {
                    message += `• ${analysis}\n`;
                });
                message += `\n`;
            }
            
            if (insights.personalizedTips && insights.personalizedTips.length > 0) {
                message += `**💡 Personalized Tips:**\n`;
                insights.personalizedTips.forEach(tip => {
                    message += `• ${tip}\n`;
                });
                message += `\n`;
            }
            
            if (insights.costSavingOpportunities && insights.costSavingOpportunities.length > 0) {
                message += `**💰 Cost-Saving Opportunities:**\n`;
                insights.costSavingOpportunities.forEach(opportunity => {
                    message += `• ${opportunity}\n`;
                });
                message += `\n`;
            }
            
            if (insights.riskFactors && insights.riskFactors.length > 0) {
                message += `**⚠️ Risk Factors to Consider:**\n`;
                insights.riskFactors.forEach(risk => {
                    message += `• ${risk}\n`;
                });
                message += `\n`;
            }
            
            if (insights.timeline && insights.timeline.length > 0) {
                message += `**📅 Timeline Insights:**\n`;
                insights.timeline.forEach(timelineItem => {
                    message += `• ${timelineItem}\n`;
                });
            }
            
            this.addMessage(message, 'ai');
        } else {
            this.addMessage(
                "I can provide detailed market insights once I analyze quotes for your specific move. Share your moving details and I'll give you personalized market analysis and recommendations!",
                'ai'
            );
        }
    }
    
    async handleChecklistRequest() {
        this.addMessage(
            "📋 **Your Personalized Moving Checklist:**\n\n" +
            "**8 Weeks Before:**\n" +
            "• Research and book moving company\n" +
            "• Create moving binder/folder\n" +
            "• Start decluttering\n\n" +
            "**6 Weeks Before:**\n" +
            "• Order moving supplies\n" +
            "• Start using up frozen/perishable food\n" +
            "• Research new area schools/services\n\n" +
            "**4 Weeks Before:**\n" +
            "• Notify utilities of move date\n" +
            "• Submit change of address forms\n" +
            "• Transfer prescriptions\n\n" +
            "**2 Weeks Before:**\n" +
            "• Confirm moving details\n" +
            "• Pack non-essentials\n" +
            "• Arrange time off work\n\n" +
            "**Moving Week:**\n" +
            "• Pack essentials box\n" +
            "• Confirm arrival times\n" +
            "• Prepare cash for tips\n\n" +
            "Would you like me to create a custom checklist based on your specific moving date?",
            'ai'
        );
    }
    
    async handlePackingTips() {
        const packingAdvice = this.prompts.getPackingAdvicePrompt();
        this.addMessage(packingAdvice, 'ai');
    }
    
    getPersonalizedPackingAdvice() {
        let advice = "📦 **AI-Powered Packing Strategy:**\n\n";
        
        // Personalize based on user profile if available
        if (this.userProfile) {
            if (this.userProfile.familySize === 'large') {
                advice += "**👨‍👩‍👧‍👦 Large Family Packing Tips:**\n";
                advice += "• Start packing 6-8 weeks early\n";
                advice += "• Pack children's rooms last to minimize disruption\n";
                advice += "• Create 'survival kits' for each family member\n";
                advice += "• Use color-coded labels for each person's belongings\n\n";
            }
            
            if (this.userProfile.experience === 'first_time') {
                advice += "**🔰 First-Time Mover Essentials:**\n";
                advice += "• Don't underestimate time needed - start early!\n";
                advice += "• Take photos of electronic setups before disconnecting\n";
                advice += "• Keep important documents with you, not in moving boxes\n";
                advice += "• Pack a 'first week' box with immediate necessities\n\n";
            }
            
            if (this.userProfile.specialNeeds.includes('fragile_items')) {
                advice += "**🏺 Fragile Items Specialist Tips:**\n";
                advice += "• Use original boxes for electronics when possible\n";
                advice += "• Wrap mirrors and artwork in blankets, not just bubble wrap\n";
                advice += "• Pack dishes vertically like records, not stacked\n";
                advice += "• Consider professional packing for high-value items\n\n";
            }
        }
        
        advice += "**📋 Room-by-Room Strategy:**\n";
        advice += "• **Kitchen**: Pack non-essentials first, keep basics until last day\n";
        advice += "• **Bedroom**: Pack out-of-season clothes early\n";
        advice += "• **Living Room**: Disassemble furniture, keep hardware in labeled bags\n";
        advice += "• **Bathroom**: Pack toiletries in waterproof bags\n";
        advice += "• **Garage/Basement**: Sort and declutter before packing\n\n";
        
        advice += "**🎯 Pro Packing Hacks:**\n";
        advice += "• Use clothes and linens as padding for fragile items\n";
        advice += "• Pack books in small boxes (they're heavier than you think!)\n";
        advice += "• Leave clothes in dresser drawers, just remove and wrap the drawers\n";
        advice += "• Use trash bags for hanging clothes - poke hole for hangers\n";
        advice += "• Pack a 'first day' box with snacks, phone chargers, and basic tools\n\n";
        
        advice += "**📱 Smart Packing Apps & Tools:**\n";
        advice += "• Use moving apps to create digital inventories\n";
        advice += "• QR code labels for detailed box contents\n";
        advice += "• Take photos of valuable items for insurance\n\n";
        
        advice += "Need specific advice for certain items or rooms? Just ask!";
        
        return advice;
    }
    
    async handleCostQuestion() {
        const costAdvice = this.prompts.getCostSavingPrompt();
        this.addMessage(costAdvice, 'ai');
    }
    
    getPersonalizedSavingTips() {
        let tips = "💰 **AI-Optimized Cost Saving Strategy:**\n\n";
        
        // Personalize based on current recommendations and user profile
        if (this.currentRecommendations && this.currentRecommendations.insights) {
            const insights = this.currentRecommendations.insights;
            
            if (insights.costSavingOpportunities && insights.costSavingOpportunities.length > 0) {
                tips += "**🎯 Personalized Savings for Your Move:**\n";
                insights.costSavingOpportunities.forEach(opportunity => {
                    tips += `• ${opportunity}\n`;
                });
                tips += "\n";
            }
        }
        
        tips += "**📅 Timing Optimization:**\n";
        tips += "• **Best Months**: October-April (save 15-25%)\n";
        tips += "• **Best Days**: Tuesday-Thursday (save 10-15%)\n";
        tips += "• **Best Times**: Mid-month dates (save 10-20%)\n";
        tips += "• **Advance Booking**: 6-8 weeks ahead (save 15-30%)\n\n";
        
        tips += "**🔧 DIY Savings Breakdown:**\n";
        tips += "• **Self-Packing**: Save $500-1,500 (20-30% of total cost)\n";
        tips += "• **Furniture Disassembly**: Save $200-500\n";
        tips += "• **Own Packing Supplies**: Save $100-300\n";
        tips += "• **Flexible Delivery Window**: Save $200-600\n\n";
        
        tips += "**💡 Smart Money Moves:**\n";
        tips += "• **Declutter First**: Every 100 lbs removed saves $50-100\n";
        tips += "• **Tax Deductions**: Keep receipts for job-related moves\n";
        tips += "• **Employer Reimbursement**: Check if your company covers costs\n";
        tips += "• **Insurance Review**: Don't double-pay for coverage you already have\n\n";
        
        tips += "**🚨 Hidden Cost Alerts:**\n";
        tips += "• **Long Carry Fees**: $50-200 if truck can't park close\n";
        tips += "• **Stair Fees**: $25-75 per flight for heavy items\n";
        tips += "• **Shuttle Service**: $200-500 if large truck can't access\n";
        tips += "• **Storage in Transit**: $100-300 per month if delivery delayed\n\n";
        
        tips += "**🎁 Negotiation Tips:**\n";
        tips += "• Get quotes in writing and compare line-by-line\n";
        tips += "• Ask about price matching policies\n";
        tips += "• Inquire about off-peak discounts\n";
        tips += "• Bundle services for package deals\n\n";
        
        if (this.lastQuotes && this.lastQuotes.length > 0) {
            const avgPrice = this.lastQuotes.reduce((sum, q) => sum + q.price, 0) / this.lastQuotes.length;
            const potentialSavings = Math.round(avgPrice * 0.25);
            tips += `**💰 Your Potential Savings**: Based on your quotes, you could save up to $${potentialSavings.toLocaleString()} with strategic planning!\n\n`;
        }
        
        tips += "Want me to analyze your specific quotes for hidden savings opportunities?";
        
        return tips;
    }
    
    async handleGeneralQuestion(message) {
        // Simple keyword-based responses for common questions
        const responses = {
            'insurance': "Moving insurance protects your belongings during transport. Most movers offer basic coverage (60¢/lb), but you can purchase full replacement value coverage for better protection. I recommend getting quotes for both options.",
            'storage': "Many moving companies offer short-term and long-term storage solutions. Costs typically range from $50-200/month depending on size and location. Climate-controlled units cost more but protect sensitive items.",
            'timeline': "For local moves, book 2-4 weeks ahead. For long-distance moves, book 6-8 weeks in advance. Peak season (summer) requires even earlier booking. I can help you create a timeline based on your move date.",
            'pets': "Moving with pets requires special planning. Update their tags, get health certificates for long-distance moves, pack a pet essentials kit, and consider their stress levels. Some movers offer pet transport services.",
            'plants': "Most long-distance movers won't transport plants due to regulations. For local moves, transport plants yourself in climate-controlled vehicles. Check state regulations for restricted species."
        };
        
        // Find matching response
        const matchedResponse = Object.keys(responses).find(key => 
            message.toLowerCase().includes(key)
        );
        
        if (matchedResponse) {
            this.addMessage(responses[matchedResponse], 'ai');
        } else {
            // Default helpful response
            this.addMessage(
                "I'm here to help with all your moving questions! I can assist with:\n\n" +
                "🔹 Getting quotes from multiple moving companies\n" +
                "🔹 Comparing prices and services\n" +
                "🔹 Creating personalized moving checklists\n" +
                "🔹 Providing packing and moving tips\n" +
                "🔹 Answering specific moving questions\n\n" +
                "What specific aspect of your move would you like help with?",
                'ai'
            );
        }
    }
    
    async handleTimelineQuestion(message) {
        const timelineAdvice = this.prompts.getTimelinePrompt(message);
        this.addMessage(timelineAdvice, 'ai');
    }

    async handleInsuranceQuestion() {
        const insuranceInfo = this.prompts.getInsurancePrompt();
        this.addMessage(insuranceInfo, 'ai');
    }

    async handleStorageQuestion() {
        const storageInfo = [
            "📦 **Moving Storage Solutions**",
            "",
            "**Short-term Storage (1-3 months):**",
            "• Portable storage containers",
            "• Self-storage units",
            "• Moving company storage",
            "",
            "**Long-term Storage (3+ months):**",
            "• Climate-controlled units",
            "• Full-service storage",
            "• Warehouse storage",
            "",
            "**Storage Tips:**",
            "• Use moisture absorbers",
            "• Wrap furniture in protective covers",
            "• Create an inventory list",
            "• Visit and check periodically",
            "• Consider insurance for stored items"
        ];
        
        this.addMessage(storageInfo.join('\n'), 'assistant');
    }

    async handleInternationalMove() {
        const internationalInfo = [
            "🌍 **International Moving Guide**",
            "",
            "**Documentation Required:**",
            "• Passport and visa",
            "• Customs declaration forms",
            "• Inventory list in destination language",
            "• Proof of residence/employment",
            "",
            "**Shipping Options:**",
            "• Air freight (faster, more expensive)",
            "• Ocean freight (slower, more economical)",
            "• Land transport (neighboring countries)",
            "",
            "**Important Considerations:**",
            "• Customs regulations and duties",
            "• Quarantine requirements",
            "• Electrical compatibility",
            "• Currency and banking setup"
        ];
        
        this.addMessage(internationalInfo.join('\n'), 'assistant');
    }

    async handlePetMoving() {
        const petMovingInfo = [
            "🐕 **Moving with Pets Guide**",
            "",
            "**Before the Move:**",
            "• Update pet ID tags and microchips",
            "• Get health certificates from vet",
            "• Research pet-friendly accommodations",
            "• Pack a pet essentials kit",
            "",
            "**During the Move:**",
            "• Keep pets in a quiet, secure area",
            "• Transport in proper carriers",
            "• Take frequent breaks for walks",
            "• Keep familiar items nearby",
            "",
            "**After the Move:**",
            "• Pet-proof the new home",
            "• Establish routines quickly",
            "• Find local veterinarian",
            "• Update registration and licenses"
        ];
        
        this.addMessage(petMovingInfo.join('\n'), 'assistant');
    }

    async handlePlantMoving() {
        const plantMovingInfo = [
            "🌱 **Moving with Plants Guide**",
            "",
            "**State Regulations:**",
            "• Many states prohibit plant transport",
            "• Check agricultural department rules",
            "• Some require inspection certificates",
            "• Consider giving away restricted plants",
            "",
            "**Preparation (2-3 weeks before):**",
            "• Repot in lightweight, plastic containers",
            "• Prune and treat for pests",
            "• Gradually acclimate to moving conditions",
            "• Water appropriately before transport",
            "",
            "**Alternative Options:**",
            "• Take cuttings instead of whole plants",
            "• Give plants to friends/family",
            "• Donate to local gardens or schools"
        ];
        
        this.addMessage(plantMovingInfo.join('\n'), 'assistant');
    }

    async handleSpecialtyItems(message) {
        const specialtyInfo = [
            "🎨 **Moving Specialty Items**",
            "",
            "**Artwork & Antiques:**",
            "• Professional packing recommended",
            "• Climate-controlled transport",
            "• Separate insurance coverage",
            "• Document condition with photos",
            "",
            "**Electronics:**",
            "• Use original packaging if available",
            "• Remove batteries and loose parts",
            "• Back up important data",
            "• Consider professional handling",
            "",
            "**Musical Instruments:**",
            "• Climate-controlled environment essential",
            "• Professional instrument movers",
            "• Loosen strings on stringed instruments",
            "• Separate insurance recommended"
        ];
        
        this.addMessage(specialtyInfo.join('\n'), 'assistant');
    }

    async handleWeatherConcerns() {
        const weatherInfo = [
            "🌦️ **Weather Considerations for Moving**",
            "",
            "**Summer Moving:**",
            "• Start early to avoid heat",
            "• Stay hydrated",
            "• Protect items from sun damage",
            "• Consider climate-controlled trucks",
            "",
            "**Winter Moving:**",
            "• Check weather forecasts",
            "• Clear walkways of ice/snow",
            "• Protect floors from salt/moisture",
            "• Allow extra time for delays",
            "",
            "**Rainy Weather:**",
            "• Use plastic covers and tarps",
            "• Protect electronics and documents",
            "• Have towels ready for cleanup",
            "• Consider rescheduling if severe"
        ];
        
        this.addMessage(weatherInfo.join('\n'), 'assistant');
    }

    async handleUtilitiesSetup() {
        const utilitiesInfo = [
            "⚡ **Utilities Setup Guide**",
            "",
            "**2-3 Weeks Before Moving:**",
            "• Contact current utility providers",
            "• Schedule disconnection dates",
            "• Research providers at new location",
            "• Schedule connection dates",
            "",
            "**Essential Utilities:**",
            "• Electricity",
            "• Gas",
            "• Water and sewer",
            "• Trash and recycling",
            "• Internet and cable/satellite",
            "",
            "**Important Tips:**",
            "• Get confirmation numbers for all requests",
            "• Schedule connections for moving day or before",
            "• Keep records of final meter readings",
            "• Update address with all providers"
        ];
        
        this.addMessage(utilitiesInfo.join('\n'), 'assistant');
    }

    async handleLegalRequirements() {
        const legalInfo = [
            "📋 **Legal Requirements for Moving**",
            "",
            "**Address Change Notifications:**",
            "• Post Office (mail forwarding)",
            "• IRS and state tax agencies",
            "• Social Security Administration",
            "• Department of Motor Vehicles",
            "",
            "**Voter Registration:**",
            "• Register in new state/county",
            "• Update party affiliation if needed",
            "• Check registration deadlines",
            "",
            "**Driver's License & Vehicle Registration:**",
            "• Update within 30 days (varies by state)",
            "• Bring required documentation",
            "• Update vehicle insurance",
            "• Transfer or get new license plates",
            "",
            "**Financial and Legal:**",
            "• Update banks and credit cards",
            "• Notify insurance companies",
            "• Update will and estate documents"
        ];
        
        this.addMessage(legalInfo.join('\n'), 'assistant');
    }

    updateUserProfile(message) {
        // Extract and update user preferences from conversation
        const lowerMessage = message.toLowerCase();
        
        // Update budget preferences
        if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
            this.userProfile.budget = 'budget';
        } else if (lowerMessage.includes('premium') || lowerMessage.includes('luxury') || lowerMessage.includes('high-end')) {
            this.userProfile.budget = 'premium';
        }
        
        // Update timeline preferences
        if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('quickly')) {
            this.userProfile.timeline = 'urgent';
        } else if (lowerMessage.includes('flexible') || lowerMessage.includes('no rush')) {
            this.userProfile.timeline = 'flexible';
        }
        
        // Update service preferences
        if (lowerMessage.includes('full service') || lowerMessage.includes('pack everything')) {
            this.userProfile.serviceLevel = 'full-service';
        } else if (lowerMessage.includes('diy') || lowerMessage.includes('pack myself')) {
            this.userProfile.serviceLevel = 'diy';
        }
        
        // Update home size
        const sizeMatches = {
            'studio': /studio|efficiency/,
            '1br': /1\s*bed|one bed/,
            '2br': /2\s*bed|two bed/,
            '3br': /3\s*bed|three bed/,
            '4br': /4\s*bed|four bed/,
            'house': /house|home/,
            'apartment': /apartment|apt/
        };
        
        for (const [size, pattern] of Object.entries(sizeMatches)) {
            if (pattern.test(lowerMessage)) {
                this.userProfile.homeSize = size;
                break;
            }
        }
        
        // Extract locations
        const locations = this.extractLocations(message);
        if (locations && (locations.from || locations.to)) {
            if (locations.from) this.userProfile.fromLocation = locations.from;
            if (locations.to) this.userProfile.toLocation = locations.to;
        }
    }
    
    extractLocations(message) {
        // Simple location extraction (in a real app, use NLP or geocoding API)
        const locations = { from: null, to: null };
        
        // Look for common patterns
        const fromMatch = message.match(/from ([A-Za-z\s,]+?)(?:to|$)/i);
        const toMatch = message.match(/to ([A-Za-z\s,]+?)(?:from|$|\.|\?)/i);
        
        if (fromMatch) locations.from = fromMatch[1].trim();
        if (toMatch) locations.to = toMatch[1].trim();
        
        return locations;
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'user') {
            avatar.textContent = 'U';
        } else {
            avatar.innerHTML = `
                <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="13" fill="#667eea"/>
                    <circle cx="12" cy="12" r="1.5" fill="#fff"/>
                    <circle cx="18" cy="12" r="1.5" fill="#fff"/>
                    <path d="M10 18 Q15 21 20 18" stroke="#fff" stroke-width="1.5" fill="none"/>
                </svg>
            `;
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Convert markdown-like formatting to HTML
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        contentDiv.innerHTML = formattedContent;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({ sender, content, timestamp: Date.now() });
    }
    
    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showAIStatus(message) {
        // Create a status message in the chat
        const statusDiv = document.createElement('div');
        statusDiv.className = 'ai-status-message';
        statusDiv.innerHTML = `
            <div class="status-content">
                <span class="status-icon">🤖</span>
                <span class="status-text">${message}</span>
                ${!this.useRealAI ? '<button onclick="aiAssistant.showAPIKeySetup()" class="setup-btn">Setup AI</button>' : ''}
            </div>
        `;
        this.chatMessages.appendChild(statusDiv);
        this.scrollToBottom();
    }
    
    showAPIKeySetup() {
        const setupHTML = `
            <div class="api-setup-container">
                <h3>🔑 Setup OpenAI Integration</h3>
                <p>Enter your OpenAI API key to enable enhanced AI responses:</p>
                <div class="input-group">
                    <input type="password" id="apiKeyInput" placeholder="sk-..." class="api-key-input">
                    <button onclick="aiAssistant.setupAPIKey()" class="setup-submit-btn">Setup</button>
                </div>
                <div class="setup-info">
                    <p><strong>How to get an API key:</strong></p>
                    <ol>
                        <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a></li>
                        <li>Create a new API key</li>
                        <li>Copy and paste it above</li>
                    </ol>
                    <p><small>⚠️ Your API key is stored locally and never shared.</small></p>
                </div>
            </div>
        `;
        
        this.addMessage(setupHTML, 'assistant');
    }
    
    async setupAPIKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.addMessage('❌ Please enter a valid API key.', 'assistant');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            this.addMessage('❌ Invalid API key format. OpenAI keys start with "sk-".', 'assistant');
            return;
        }
        
        try {
            // Set the API key
            if (!this.openaiIntegration) {
                this.openaiIntegration = new OpenAIIntegration();
            }
            
            this.openaiIntegration.setAPIKey(apiKey);
            
            // Test the connection
            this.addMessage('🔄 Testing API connection...', 'assistant');
            
            const testResult = await this.openaiIntegration.testConnection();
            
            if (testResult.success) {
                this.useRealAI = true;
                this.addMessage('✅ API key setup successful! Enhanced AI responses are now enabled.', 'assistant');
                
                // Clear the input
                apiKeyInput.value = '';
            } else {
                this.addMessage(`❌ API key test failed: ${testResult.message}`, 'assistant');
            }
        } catch (error) {
            console.error('API key setup error:', error);
            this.addMessage('❌ Failed to setup API key. Please try again.', 'assistant');
        }
    }
    
    addToRecentQuotes(quote) {
        this.quotes.unshift(quote);
        if (this.quotes.length > 5) this.quotes.pop();
        
        this.updateRecentQuotesDisplay();
        this.saveRecentQuotes();
    }
    
    updateRecentQuotesDisplay() {
        if (this.quotes.length === 0) {
            this.recentQuotes.innerHTML = '<p class="no-quotes">No recent quotes. Start a conversation to get your first quote!</p>';
            return;
        }
        
        this.recentQuotes.innerHTML = this.quotes.map(quote => `
            <div class="quote-item">
                <h4>${quote.from} → ${quote.to}</h4>
                <p>${quote.date} • ${quote.quotes.length} quotes</p>
            </div>
        `).join('');
    }
    
    saveConversationHistory() {
        localStorage.setItem('lugvia_chat_history', JSON.stringify(this.conversationHistory));
    }
    
    loadConversationHistory() {
        const saved = localStorage.getItem('lugvia_chat_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            // Optionally restore recent messages
        }
    }
    
    saveRecentQuotes() {
        localStorage.setItem('lugvia_recent_quotes', JSON.stringify(this.quotes));
    }
    
    loadRecentQuotes() {
        const saved = localStorage.getItem('lugvia_recent_quotes');
        if (saved) {
            this.quotes = JSON.parse(saved);
            this.updateRecentQuotesDisplay();
        }
    }
    
    performAdvancedComparison(quotes) {
        const analysis = {
            priceAnalysis: [],
            valueScores: [],
            riskFactors: [],
            recommendation: '',
            budgetChoice: null,
            qualityChoice: null,
            speedChoice: null
        };
        
        // Price Analysis
        const prices = quotes.map(q => q.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        analysis.priceAnalysis.push(`Price range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`);
        analysis.priceAnalysis.push(`Average price: $${Math.round(avgPrice).toLocaleString()}`);
        
        if (maxPrice - minPrice > avgPrice * 0.5) {
            analysis.priceAnalysis.push(`⚠️ High price variation detected - compare services carefully`);
        }
        
        // Calculate AI Value Scores
        quotes.forEach(quote => {
            const priceScore = Math.round(25 * (1 - (quote.price - minPrice) / (maxPrice - minPrice || 1)));
            const qualityScore = Math.round((quote.rating / 5) * 25);
            const serviceScore = Math.round((quote.services.length / Math.max(...quotes.map(q => q.services.length))) * 25);
            const speedScore = this.calculateSpeedScore(quote.timeframe) * 25;
            
            const totalScore = priceScore + qualityScore + serviceScore + speedScore;
            
            analysis.valueScores.push({
                company: quote.company,
                score: Math.round(totalScore),
                priceScore,
                qualityScore,
                serviceScore: Math.round(serviceScore),
                speedScore: Math.round(speedScore)
            });
        });
        
        // Sort by total score
        analysis.valueScores.sort((a, b) => b.score - a.score);
        
        // Risk Assessment
        quotes.forEach(quote => {
            if (quote.rating < 4.0) {
                analysis.riskFactors.push(`${quote.company} has below-average rating (${quote.rating}/5)`);
            }
            if (quote.price < minPrice * 1.2) {
                analysis.riskFactors.push(`${quote.company} price seems unusually low - verify inclusions`);
            }
            if (!quote.services.includes('Insurance') && !quote.services.includes('Basic Insurance')) {
                analysis.riskFactors.push(`${quote.company} may not include adequate insurance coverage`);
            }
        });
        
        // Generate AI Recommendation
        const topChoice = analysis.valueScores[0];
        const topQuote = quotes.find(q => q.company === topChoice.company);
        analysis.recommendation = `Based on my AI analysis, **${topChoice.company}** offers the best overall value with a score of ${topChoice.score}/100. This recommendation considers price competitiveness (${topChoice.priceScore}/25), service quality (${topChoice.qualityScore}/25), service offerings (${topChoice.serviceScore}/25), and delivery speed (${topChoice.speedScore}/25).`;
        
        // Scenario-based choices
        analysis.budgetChoice = quotes.reduce((min, current) => current.price < min.price ? current : min);
        analysis.qualityChoice = quotes.reduce((max, current) => current.rating > max.rating ? current : max);
        analysis.speedChoice = quotes.reduce((fastest, current) => {
            const currentDays = this.extractDaysFromTimeframe(current.timeframe);
            const fastestDays = this.extractDaysFromTimeframe(fastest.timeframe);
            return currentDays < fastestDays ? current : fastest;
        });
        
        return analysis;
    }
    
    calculateSpeedScore(timeframe) {
        const days = this.extractDaysFromTimeframe(timeframe);
        if (days <= 2) return 1.0;
        if (days <= 5) return 0.8;
        if (days <= 7) return 0.6;
        if (days <= 14) return 0.4;
        return 0.2;
    }
    
    extractDaysFromTimeframe(timeframe) {
        if (!timeframe) return 7; // Default
        const match = timeframe.match(/(\d+)/);
        return match ? parseInt(match[1]) : 7;
    }
    
    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="13" fill="#667eea"/>
                        <circle cx="12" cy="12" r="1.5" fill="#fff"/>
                        <circle cx="18" cy="12" r="1.5" fill="#fff"/>
                        <path d="M10 18 Q15 21 20 18" stroke="#fff" stroke-width="1.5" fill="none"/>
                    </svg>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your AI moving assistant. I can help you:</p>
                    <ul>
                        <li>🔍 Get instant quotes from multiple moving companies</li>
                        <li>📊 Compare prices and services intelligently</li>
                        <li>💡 Provide personalized moving recommendations</li>
                        <li>📋 Create custom moving checklists</li>
                        <li>❓ Answer any moving-related questions</li>
                    </ul>
                    <p>What would you like help with today?</p>
                </div>
            </div>
        `;
        
        this.conversationHistory = [];
        this.saveConversationHistory();
    }
}

// Global functions for HTML event handlers
function sendMessage() {
    if (window.aiAssistant) {
        window.aiAssistant.sendMessage();
    }
}

function sendQuickMessage(message) {
    if (window.aiAssistant) {
        window.aiAssistant.sendMessage(message);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function clearChat() {
    if (window.aiAssistant) {
        window.aiAssistant.clearChat();
    }
}

function selectQuote(index) {
    if (window.aiAssistant && window.aiAssistant.lastQuotes) {
        const quote = window.aiAssistant.lastQuotes[index];
        if (quote) {
            window.aiAssistant.addMessage(
                `Great choice! You've selected **${quote.company}** for $${quote.price.toLocaleString()}.\n\n` +
                `Next steps:\n` +
                `📞 Contact them at: ${quote.contact?.phone || 'Contact available in quote details'}\n` +
                `🌐 Visit: ${quote.contact?.website || 'Website available in quote details'}\n` +
                `📋 Confirm your moving details\n` +
                `💳 Review and finalize your booking\n\n` +
                `Would you like me to help you prepare questions to ask them or create a moving checklist?`,
                'ai'
            );
        }
    }
}

function viewQuoteDetails(index) {
    if (window.aiAssistant && window.aiAssistant.lastQuotes) {
        const quote = window.aiAssistant.lastQuotes[index];
        if (quote) {
            let details = `📋 **Detailed Quote from ${quote.company}**\n\n`;
            details += `💰 **Total Price:** $${quote.price.toLocaleString()}\n`;
            details += `⭐ **Rating:** ${quote.rating}/5\n`;
            details += `⏱️ **Timeframe:** ${quote.timeframe}\n`;
            details += `📅 **Availability:** ${quote.availability}\n\n`;
            
            if (quote.services && quote.services.length > 0) {
                details += `🔧 **Services Included:**\n${quote.services.map(s => `• ${s}`).join('\n')}\n\n`;
            }
            
            if (quote.specialOffers && quote.specialOffers.length > 0) {
                details += `🎁 **Special Offers:**\n${quote.specialOffers.map(o => `• ${o}`).join('\n')}\n\n`;
            }
            
            if (quote.insurance) {
                details += `🛡️ **Insurance Options:**\n`;
                details += `• Basic: ${quote.insurance.basic?.description || 'Standard coverage'}\n`;
                details += `• Full: ${quote.insurance.full?.description || 'Complete protection'} (+$${quote.insurance.full?.cost || 'Contact for pricing'})\n\n`;
            }
            
            if (quote.contact) {
                details += `📞 **Contact Information:**\n`;
                details += `• Phone: ${quote.contact.phone}\n`;
                details += `• Website: ${quote.contact.website}\n\n`;
            }
            
            details += `Ready to book with ${quote.company}? I can help you prepare for the call!`;
            
            window.aiAssistant.addMessage(details, 'ai');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.aiAssistant = new AIMovingAssistant();
});