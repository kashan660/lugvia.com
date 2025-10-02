// AI Recommendation Engine for Moving Services

class AIRecommendationEngine {
    constructor() {
        this.userProfiles = new Map();
        this.movingPatterns = {
            budget: {
                priorities: ['price', 'basic_services'],
                weights: { price: 0.6, rating: 0.2, services: 0.1, speed: 0.1 }
            },
            premium: {
                priorities: ['rating', 'services', 'speed'],
                weights: { price: 0.1, rating: 0.4, services: 0.3, speed: 0.2 }
            },
            balanced: {
                priorities: ['rating', 'price', 'services'],
                weights: { price: 0.3, rating: 0.3, services: 0.2, speed: 0.2 }
            },
            urgent: {
                priorities: ['speed', 'availability'],
                weights: { price: 0.1, rating: 0.2, services: 0.2, speed: 0.5 }
            }
        };
        
        this.serviceCategories = {
            local: {
                maxDistance: 100,
                recommendedServices: ['basic_moving', 'packing_help'],
                avgDuration: '1-2 days'
            },
            longDistance: {
                minDistance: 100,
                recommendedServices: ['full_service', 'insurance', 'tracking'],
                avgDuration: '3-7 days'
            },
            international: {
                minDistance: 1000,
                recommendedServices: ['customs', 'international_insurance', 'storage'],
                avgDuration: '2-6 weeks'
            }
        };
    }
    
    // Main recommendation method
    async generateRecommendations(userInput, availableQuotes) {
        try {
            // Analyze user profile and preferences
            const userProfile = this.analyzeUserProfile(userInput);
            
            // Categorize the move type
            const moveCategory = this.categorizeMoveType(userInput);
            
            // Score and rank quotes
            const scoredQuotes = this.scoreQuotes(availableQuotes, userProfile, moveCategory);
            
            // Generate personalized recommendations
            const recommendations = this.generatePersonalizedRecommendations(
                scoredQuotes, 
                userProfile, 
                moveCategory
            );
            
            // Add AI insights and tips
            const insights = this.generateAIInsights(userProfile, moveCategory, scoredQuotes);
            
            return {
                userProfile,
                moveCategory,
                recommendations,
                insights,
                confidence: this.calculateConfidence(userInput, scoredQuotes),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return this.getFallbackRecommendations(availableQuotes);
        }
    }
    
    // Analyze user profile from input
    analyzeUserProfile(userInput) {
        const profile = {
            moveType: 'balanced',
            budget: 'medium',
            timeline: 'flexible',
            priorities: [],
            specialNeeds: [],
            experience: 'first_time',
            familySize: 'small'
        };
        
        const input = userInput.toLowerCase();
        
        // Analyze budget preferences
        if (input.includes('cheap') || input.includes('budget') || input.includes('affordable')) {
            profile.moveType = 'budget';
            profile.budget = 'low';
        } else if (input.includes('premium') || input.includes('luxury') || input.includes('best')) {
            profile.moveType = 'premium';
            profile.budget = 'high';
        } else if (input.includes('urgent') || input.includes('asap') || input.includes('quickly')) {
            profile.moveType = 'urgent';
            profile.timeline = 'urgent';
        }
        
        // Analyze timeline
        if (input.includes('next week') || input.includes('urgent') || input.includes('emergency')) {
            profile.timeline = 'urgent';
        } else if (input.includes('flexible') || input.includes('whenever')) {
            profile.timeline = 'flexible';
        }
        
        // Analyze family size
        if (input.includes('family') || input.includes('kids') || input.includes('children')) {
            profile.familySize = 'large';
        } else if (input.includes('couple') || input.includes('two people')) {
            profile.familySize = 'medium';
        }
        
        // Analyze special needs
        if (input.includes('piano') || input.includes('antique') || input.includes('fragile')) {
            profile.specialNeeds.push('fragile_items');
        }
        if (input.includes('storage') || input.includes('temporary')) {
            profile.specialNeeds.push('storage');
        }
        if (input.includes('pack') || input.includes('packing')) {
            profile.specialNeeds.push('packing_service');
        }
        
        // Analyze experience
        if (input.includes('first time') || input.includes('never moved')) {
            profile.experience = 'first_time';
        } else if (input.includes('moved before') || input.includes('experienced')) {
            profile.experience = 'experienced';
        }
        
        return profile;
    }
    
    // Categorize move type based on distance and other factors
    categorizeMoveType(userInput) {
        const { originZip, destinationZip } = userInput;
        
        if (!originZip || !destinationZip) {
            return 'local'; // Default assumption
        }
        
        const distance = this.calculateDistance(originZip, destinationZip);
        
        if (distance <= 100) {
            return 'local';
        } else if (distance <= 1000) {
            return 'longDistance';
        } else {
            return 'international';
        }
    }
    
    // Score quotes based on user profile and preferences
    scoreQuotes(quotes, userProfile, moveCategory) {
        const weights = this.movingPatterns[userProfile.moveType].weights;
        
        return quotes.map(quote => {
            const scores = {
                price: this.scorePriceValue(quote.price, quotes),
                rating: this.scoreRating(quote.rating),
                services: this.scoreServices(quote.services, userProfile.specialNeeds),
                speed: this.scoreSpeed(quote.timeframe, userProfile.timeline),
                availability: this.scoreAvailability(quote.availability, userProfile.timeline)
            };
            
            // Calculate weighted total score
            const totalScore = 
                (scores.price * weights.price) +
                (scores.rating * weights.rating) +
                (scores.services * weights.services) +
                (scores.speed * weights.speed);
            
            return {
                ...quote,
                scores,
                totalScore: Math.round(totalScore * 100) / 100,
                recommendation: this.generateQuoteRecommendation(quote, scores, userProfile)
            };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }
    
    // Score price value (lower price = higher score, but consider value)
    scorePriceValue(price, allQuotes) {
        const prices = allQuotes.map(q => q.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) return 1;
        
        // Invert the score so lower prices get higher scores
        return 1 - ((price - minPrice) / (maxPrice - minPrice));
    }
    
    // Score rating (higher rating = higher score)
    scoreRating(rating) {
        return rating / 5; // Normalize to 0-1
    }
    
    // Score services based on user needs
    scoreServices(services, specialNeeds) {
        if (!services || services.length === 0) return 0.5;
        
        let score = 0.5; // Base score
        
        // Bonus for matching special needs
        specialNeeds.forEach(need => {
            const matchingService = services.find(service => 
                service.toLowerCase().includes(need.replace('_', ' '))
            );
            if (matchingService) score += 0.2;
        });
        
        // Bonus for comprehensive services
        if (services.length >= 3) score += 0.1;
        
        return Math.min(score, 1); // Cap at 1
    }
    
    // Score speed based on timeline needs
    scoreSpeed(timeframe, timeline) {
        if (!timeframe) return 0.5;
        
        const days = this.extractDaysFromTimeframe(timeframe);
        
        if (timeline === 'urgent') {
            return days <= 2 ? 1 : days <= 5 ? 0.7 : 0.3;
        } else if (timeline === 'flexible') {
            return 0.8; // Flexible users don't prioritize speed as much
        } else {
            return days <= 3 ? 0.9 : days <= 7 ? 0.7 : 0.5;
        }
    }
    
    // Score availability
    scoreAvailability(availability, timeline) {
        if (!availability) return 0.5;
        
        const avail = availability.toLowerCase();
        
        if (timeline === 'urgent') {
            if (avail.includes('excellent') || avail.includes('immediate')) return 1;
            if (avail.includes('good')) return 0.7;
            return 0.3;
        }
        
        if (avail.includes('excellent')) return 1;
        if (avail.includes('good')) return 0.8;
        if (avail.includes('limited')) return 0.6;
        return 0.5;
    }
    
    // Generate personalized recommendations
    generatePersonalizedRecommendations(scoredQuotes, userProfile, moveCategory) {
        const recommendations = {
            topChoice: null,
            budgetOption: null,
            premiumOption: null,
            alternatives: [],
            reasoning: []
        };
        
        if (scoredQuotes.length === 0) {
            return recommendations;
        }
        
        // Top choice (highest score)
        recommendations.topChoice = scoredQuotes[0];
        recommendations.reasoning.push(
            `**${scoredQuotes[0].company}** is your top match with a score of ${scoredQuotes[0].totalScore}/1.0 based on your ${userProfile.moveType} preferences.`
        );
        
        // Budget option (lowest price with decent rating)
        const budgetOptions = scoredQuotes
            .filter(q => q.rating >= 4.0)
            .sort((a, b) => a.price - b.price);
        
        if (budgetOptions.length > 0) {
            recommendations.budgetOption = budgetOptions[0];
            if (budgetOptions[0] !== scoredQuotes[0]) {
                recommendations.reasoning.push(
                    `**${budgetOptions[0].company}** offers the best value at $${budgetOptions[0].price.toLocaleString()} with a ${budgetOptions[0].rating}/5 rating.`
                );
            }
        }
        
        // Premium option (highest rating)
        const premiumOptions = scoredQuotes
            .sort((a, b) => b.rating - a.rating);
        
        if (premiumOptions.length > 0 && premiumOptions[0].rating >= 4.5) {
            recommendations.premiumOption = premiumOptions[0];
            if (premiumOptions[0] !== scoredQuotes[0] && premiumOptions[0] !== budgetOptions[0]) {
                recommendations.reasoning.push(
                    `**${premiumOptions[0].company}** provides premium service with a ${premiumOptions[0].rating}/5 rating and comprehensive services.`
                );
            }
        }
        
        // Alternative options
        recommendations.alternatives = scoredQuotes.slice(1, 4).filter(q => 
            q !== recommendations.budgetOption && q !== recommendations.premiumOption
        );
        
        return recommendations;
    }
    
    // Generate AI insights
    generateAIInsights(userProfile, moveCategory, scoredQuotes) {
        const insights = {
            marketAnalysis: [],
            personalizedTips: [],
            costSavingOpportunities: [],
            riskFactors: [],
            timeline: []
        };
        
        // Market analysis
        if (scoredQuotes.length >= 3) {
            const avgPrice = scoredQuotes.reduce((sum, q) => sum + q.price, 0) / scoredQuotes.length;
            const priceRange = Math.max(...scoredQuotes.map(q => q.price)) - Math.min(...scoredQuotes.map(q => q.price));
            
            insights.marketAnalysis.push(
                `Average market price for your move: $${Math.round(avgPrice).toLocaleString()}`
            );
            
            if (priceRange > avgPrice * 0.5) {
                insights.marketAnalysis.push(
                    `High price variation detected ($${Math.round(priceRange).toLocaleString()} range) - careful comparison recommended`
                );
            }
        }
        
        // Personalized tips based on profile
        if (userProfile.experience === 'first_time') {
            insights.personalizedTips.push(
                "As a first-time mover, consider full-service options to reduce stress",
                "Ask about insurance options - basic coverage may not be sufficient",
                "Get written estimates and read contracts carefully"
            );
        }
        
        if (userProfile.familySize === 'large') {
            insights.personalizedTips.push(
                "With a large family, plan for 2-3 extra days for settling in",
                "Consider packing services to save time and reduce family stress"
            );
        }
        
        // Cost-saving opportunities
        if (userProfile.timeline === 'flexible') {
            insights.costSavingOpportunities.push(
                "Your flexible timeline allows for off-peak discounts",
                "Consider mid-week moves for potential 10-15% savings"
            );
        }
        
        if (userProfile.specialNeeds.includes('packing_service')) {
            insights.costSavingOpportunities.push(
                "Partial self-packing can save 20-30% on packing costs",
                "Pack non-fragile items yourself, let professionals handle delicates"
            );
        }
        
        // Risk factors
        const lowRatedQuotes = scoredQuotes.filter(q => q.rating < 4.0);
        if (lowRatedQuotes.length > 0) {
            insights.riskFactors.push(
                `${lowRatedQuotes.length} quote(s) from companies with ratings below 4.0 - proceed with caution`
            );
        }
        
        if (moveCategory === 'longDistance') {
            insights.riskFactors.push(
                "Long-distance moves have higher risk - verify insurance coverage",
                "Confirm delivery windows and penalty clauses for delays"
            );
        }
        
        // Timeline insights
        if (userProfile.timeline === 'urgent') {
            insights.timeline.push(
                "Urgent moves may incur 20-50% premium charges",
                "Limited availability may reduce negotiation power"
            );
        } else {
            insights.timeline.push(
                "Booking 6-8 weeks in advance typically offers best rates",
                "Peak season (May-September) has 15-25% higher costs"
            );
        }
        
        return insights;
    }
    
    // Generate recommendation for individual quote
    generateQuoteRecommendation(quote, scores, userProfile) {
        const strengths = [];
        const considerations = [];
        
        if (scores.price >= 0.8) strengths.push('Excellent value');
        if (scores.rating >= 0.9) strengths.push('Outstanding reputation');
        if (scores.services >= 0.8) strengths.push('Comprehensive services');
        if (scores.speed >= 0.8) strengths.push('Fast service');
        
        if (scores.price < 0.4) considerations.push('Higher cost');
        if (scores.rating < 0.6) considerations.push('Lower customer ratings');
        if (scores.services < 0.5) considerations.push('Limited services');
        
        return {
            strengths,
            considerations,
            matchScore: Math.round(quote.totalScore * 100),
            bestFor: this.determineBestFor(scores, userProfile)
        };
    }
    
    // Determine what this quote is best for
    determineBestFor(scores, userProfile) {
        if (scores.price >= 0.8 && scores.rating >= 0.7) return 'Budget-conscious movers seeking quality';
        if (scores.rating >= 0.9) return 'Those prioritizing premium service';
        if (scores.speed >= 0.8) return 'Urgent or time-sensitive moves';
        if (scores.services >= 0.8) return 'Complex moves requiring full service';
        return 'Standard residential moves';
    }
    
    // Helper methods
    calculateDistance(zip1, zip2) {
        // Simplified distance calculation
        const diff = Math.abs(parseInt(zip1) - parseInt(zip2));
        return Math.min(diff * 0.1, 3000);
    }
    
    extractDaysFromTimeframe(timeframe) {
        const match = timeframe.match(/(\d+)/);
        return match ? parseInt(match[1]) : 5; // Default to 5 days
    }
    
    calculateConfidence(userInput, scoredQuotes) {
        let confidence = 0.7; // Base confidence
        
        // More quotes = higher confidence
        if (scoredQuotes.length >= 5) confidence += 0.2;
        else if (scoredQuotes.length >= 3) confidence += 0.1;
        
        // Clear user preferences = higher confidence
        const input = userInput.toString().toLowerCase();
        if (input.includes('budget') || input.includes('cheap') || 
            input.includes('premium') || input.includes('urgent')) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }
    
    getFallbackRecommendations(quotes) {
        return {
            userProfile: { moveType: 'balanced' },
            moveCategory: 'local',
            recommendations: {
                topChoice: quotes[0] || null,
                reasoning: ['Basic recommendation based on available quotes']
            },
            insights: {
                personalizedTips: ['Compare quotes carefully', 'Verify company credentials']
            },
            confidence: 0.5
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIRecommendationEngine;
} else {
    window.AIRecommendationEngine = AIRecommendationEngine;
}