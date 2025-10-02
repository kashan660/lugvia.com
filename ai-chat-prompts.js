/**
 * AI Chat Prompts for Lugvia Moving Assistant
 * Intelligent prompts that understand the business model and provide contextual responses
 */

class LugviaAIPrompts {
    constructor() {
        this.businessContext = {
            platform: "Lugvia - AI-Powered Moving Platform",
            purpose: "Connect users with moving service providers through intelligent cost estimation and comparison",
            services: ["Cost estimation", "Quote comparison", "Moving advice", "Provider matching", "Timeline planning"],
            target_audience: "Individuals and families planning residential moves",
            value_proposition: "Save time and money by finding the best moving deals with AI assistance"
        };
    }

    getSystemPrompt(context = {}) {
        const { userProfile, conversationHistory, lastQuotes, currentRecommendations } = context;
        
        return `You are Lugvia AI, the intelligent moving assistant for Lugvia.com - the leading AI-powered moving platform.

🏢 BUSINESS CONTEXT:
Lugvia connects people with trusted moving service providers through intelligent cost estimation, quote comparison, and personalized recommendations. Our platform helps users save time and money by finding the best moving deals tailored to their specific needs.

🎯 YOUR ROLE:
As Lugvia AI, you are the expert moving consultant who:
- Provides accurate cost estimates and moving advice
- Compares quotes from multiple providers
- Offers personalized recommendations based on user needs
- Guides users through every step of their moving journey
- Helps users make informed decisions about their move

💡 CORE CAPABILITIES:
1. **Smart Cost Estimation**: Analyze moving requirements and provide realistic cost ranges
2. **Quote Comparison**: Help users understand and compare different moving quotes
3. **Personalized Recommendations**: Suggest the best options based on budget, timeline, and preferences
4. **Moving Guidance**: Provide expert advice on packing, timeline, insurance, and logistics
5. **Provider Matching**: Connect users with the most suitable moving companies

📊 CURRENT CONTEXT:
${userProfile ? `User Profile: ${JSON.stringify(userProfile, null, 2)}` : 'No user profile available'}
${lastQuotes ? `Recent Quotes: ${JSON.stringify(lastQuotes, null, 2)}` : 'No recent quotes'}
${currentRecommendations ? `Current Recommendations: ${JSON.stringify(currentRecommendations, null, 2)}` : 'No current recommendations'}
${conversationHistory ? `Recent Conversation: ${JSON.stringify(conversationHistory.slice(-3), null, 2)}` : 'No conversation history'}

🗣️ COMMUNICATION STYLE:
- Friendly, professional, and knowledgeable
- Use clear, jargon-free language
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Always focus on helping users save money and time
- Reference Lugvia's platform capabilities when relevant

🚀 KEY OBJECTIVES:
1. Help users get accurate moving cost estimates
2. Guide them to the best moving deals
3. Provide expert moving advice and tips
4. Build trust in Lugvia's platform and services
5. Ensure users have a smooth, stress-free moving experience

Always remember: You represent Lugvia's commitment to making moving easier, more affordable, and less stressful through AI-powered solutions.`;
    }

    getWelcomePrompt() {
        return `Welcome to Lugvia! 👋 I'm your AI moving assistant, here to help you plan the perfect move.

I can help you with:
🏠 **Get Moving Quotes** - Instant estimates from top providers
📊 **Compare Prices** - Find the best deals for your budget
📋 **Moving Advice** - Expert tips for packing, timeline, and logistics
🎯 **Personalized Recommendations** - Tailored suggestions for your specific needs

What can I help you with today? Just tell me about your move!`;
    }

    getQuoteRequestPrompt(userInput) {
        return `I'll help you get accurate moving quotes! To provide the best estimates, I need to understand your moving requirements.

Based on what you've told me, let me gather some details:

📍 **Locations**: Where are you moving from and to?
📦 **Home Size**: What size home are you moving? (studio, 1BR, 2BR, etc.)
📅 **Timeline**: When are you planning to move?
🚚 **Services**: Do you need full-service movers, or just transportation?

The more details you provide, the more accurate your quotes will be!`;
    }

    getComparisonPrompt(quotes) {
        return `Great! I've found several moving options for you. Let me break down the key differences to help you choose:

💰 **Price Comparison**:
- Budget Option: Best value for money
- Premium Option: Full-service with extra care
- Balanced Option: Good mix of price and service

⭐ **What to Consider**:
- Total cost (including hidden fees)
- Insurance coverage
- Company reputation and reviews
- Services included
- Timeline flexibility

Which aspect is most important to you - saving money, premium service, or finding the right balance?`;
    }

    getRecommendationPrompt(userProfile) {
        const budget = userProfile?.budget || 'moderate';
        const timeline = userProfile?.timeline || 'flexible';
        
        return `Based on your profile and preferences, here are my personalized recommendations:

🎯 **Best Match for You**:
Considering your ${budget} budget and ${timeline} timeline, I recommend focusing on providers that offer:

✅ **Value Optimization**: Maximum service for your budget
✅ **Timeline Alignment**: Movers available when you need them
✅ **Service Match**: Services that fit your specific requirements

Would you like me to explain why these recommendations work best for your situation?`;
    }

    getPackingAdvicePrompt() {
        return `Let me share some expert packing tips to save you time and money! 📦

💡 **Smart Packing Strategies**:
- Start early: Begin 6-8 weeks before moving
- Declutter first: Donate/sell items you don't need
- Use what you have: Towels, clothes as padding
- Label everything: Room + contents for easy unpacking

💰 **Cost-Saving Tips**:
- Pack non-essentials yourself
- Use free boxes from liquor stores, grocery stores
- Pack heavy items in small boxes
- Take photos of electronics before disconnecting

What specific packing challenges are you facing? I can provide targeted advice!`;
    }

    getCostSavingPrompt() {
        return `Here are proven strategies to reduce your moving costs! 💰

🎯 **Immediate Savings**:
- Move during off-peak times (fall/winter, mid-month)
- Get multiple quotes (save 10-20% on average)
- Pack yourself (save $500-1500)
- Declutter before moving (reduce weight/volume)

📅 **Timing Strategies**:
- Avoid summer months and weekends
- Book 4-6 weeks in advance
- Be flexible with dates

🔍 **Hidden Cost Avoidance**:
- Read contracts carefully
- Understand insurance options
- Ask about additional fees upfront

Want me to help you calculate potential savings for your specific move?`;
    }

    getTimelinePrompt() {
        return `Let me help you create the perfect moving timeline! ⏰

📅 **8 Weeks Before**:
- Research and book moving company
- Start decluttering and organizing
- Begin collecting moving supplies

📅 **4 Weeks Before**:
- Confirm moving details
- Start packing non-essentials
- Arrange time off work

📅 **2 Weeks Before**:
- Confirm utilities transfer
- Pack everything except essentials
- Prepare moving day kit

📅 **Moving Day**:
- Be present for pickup/delivery
- Do final walkthrough
- Keep important documents with you

What's your target moving date? I can create a customized timeline for you!`;
    }

    getInsurancePrompt() {
        return `Protecting your belongings is crucial! Let me explain your insurance options: 🛡️

📋 **Coverage Types**:
- **Basic Coverage**: Included, but limited ($0.60/lb)
- **Declared Value**: You set the amount, higher protection
- **Full Replacement**: Complete coverage for actual value

💡 **Lugvia Recommendation**:
For most moves, declared value coverage offers the best balance of protection and cost. Consider full replacement for high-value items.

🔍 **What to Consider**:
- Total value of your belongings
- Risk tolerance
- Cost vs. benefit analysis

Would you like help calculating the right coverage level for your move?`;
    }

    getErrorFallbackPrompt() {
        return `I apologize, but I'm having a temporary issue accessing my AI services. Don't worry - I can still help you with your move! 🤖

I can assist you with:
- Moving cost estimates
- Quote comparisons
- Packing advice
- Timeline planning
- Moving tips and strategies

What specific moving question can I help you with right now?`;
    }

    getContextualPrompt(intent, context = {}) {
        const prompts = {
            quote: () => this.getQuoteRequestPrompt(context.userInput),
            comparison: () => this.getComparisonPrompt(context.quotes),
            recommendation: () => this.getRecommendationPrompt(context.userProfile),
            packing: () => this.getPackingAdvicePrompt(),
            cost: () => this.getCostSavingPrompt(),
            timeline: () => this.getTimelinePrompt(),
            insurance: () => this.getInsurancePrompt(),
            welcome: () => this.getWelcomePrompt(),
            error: () => this.getErrorFallbackPrompt()
        };

        return prompts[intent] ? prompts[intent]() : this.getWelcomePrompt();
    }

    // Dynamic prompt generation based on user context
    generateContextualSystemPrompt(userMessage, context = {}) {
        const basePrompt = this.getSystemPrompt(context);
        
        // Add specific instructions based on user intent
        let additionalInstructions = "";
        
        if (userMessage.toLowerCase().includes('quote') || userMessage.toLowerCase().includes('cost')) {
            additionalInstructions += "\n\n🎯 FOCUS: The user is interested in getting quotes or cost information. Prioritize providing accurate estimates and connecting them with our quote comparison tools.";
        }
        
        if (userMessage.toLowerCase().includes('compare') || userMessage.toLowerCase().includes('best')) {
            additionalInstructions += "\n\n🎯 FOCUS: The user wants to compare options. Highlight the key differences between providers and help them understand value propositions.";
        }
        
        if (userMessage.toLowerCase().includes('pack') || userMessage.toLowerCase().includes('tip')) {
            additionalInstructions += "\n\n🎯 FOCUS: The user needs practical moving advice. Provide specific, actionable tips that will save them time and money.";
        }
        
        return basePrompt + additionalInstructions;
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LugviaAIPrompts;
} else if (typeof window !== 'undefined') {
    window.LugviaAIPrompts = LugviaAIPrompts;
}