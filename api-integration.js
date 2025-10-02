// API Integration System for External Moving Service Providers

class MovingAPIIntegration {
    constructor() {
        this.apiEndpoints = {
            // Simulated external API endpoints
            uhaul: 'https://api.uhaul.com/quotes',
            budget: 'https://api.budgettruck.com/estimates',
            allied: 'https://api.alliedvan.com/pricing',
            mayflower: 'https://api.mayflower.com/quotes',
            northAmerican: 'https://api.northamerican.com/estimates'
        };
        
        this.apiKeys = {
            // In production, these would be stored securely
            uhaul: (typeof process !== 'undefined' && process.env ? process.env.UHAUL_API_KEY : null) || 'demo_key_uhaul',
            budget: (typeof process !== 'undefined' && process.env ? process.env.BUDGET_API_KEY : null) || 'demo_key_budget',
            allied: (typeof process !== 'undefined' && process.env ? process.env.ALLIED_API_KEY : null) || 'demo_key_allied',
            mayflower: (typeof process !== 'undefined' && process.env ? process.env.MAYFLOWER_API_KEY : null) || 'demo_key_mayflower',
            northAmerican: (typeof process !== 'undefined' && process.env ? process.env.NORTH_AMERICAN_API_KEY : null) || 'demo_key_na'
        };
        
        this.rateLimits = {
            uhaul: { requests: 0, lastReset: Date.now(), limit: 100 },
            budget: { requests: 0, lastReset: Date.now(), limit: 50 },
            allied: { requests: 0, lastReset: Date.now(), limit: 75 },
            mayflower: { requests: 0, lastReset: Date.now(), limit: 60 },
            northAmerican: { requests: 0, lastReset: Date.now(), limit: 80 }
        };
    }
    
    // Main method to get quotes from all providers
    async getQuotesFromAllProviders(moveDetails) {
        const {
            originZip,
            destinationZip,
            moveDate,
            homeSize,
            services = [],
            specialItems = []
        } = moveDetails;
        
        // Validate input
        if (!this.validateMoveDetails(moveDetails)) {
            throw new Error('Invalid move details provided');
        }
        
        const providers = Object.keys(this.apiEndpoints);
        const quotePromises = providers.map(provider => 
            this.getQuoteFromProvider(provider, moveDetails)
                .catch(error => {
                    console.error(`Error getting quote from ${provider}:`, error);
                    return null; // Return null for failed requests
                })
        );
        
        const results = await Promise.allSettled(quotePromises);
        
        // Filter out failed requests and format results
        const successfulQuotes = results
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);
        
        // Sort by price (lowest first)
        successfulQuotes.sort((a, b) => a.totalPrice - b.totalPrice);
        
        return {
            quotes: successfulQuotes,
            requestedAt: new Date().toISOString(),
            moveDetails: moveDetails,
            providersQueried: providers.length,
            successfulResponses: successfulQuotes.length
        };
    }
    
    // Get quote from specific provider
    async getQuoteFromProvider(provider, moveDetails) {
        // Check rate limits
        if (!this.checkRateLimit(provider)) {
            throw new Error(`Rate limit exceeded for ${provider}`);
        }
        
        // Increment request counter
        this.rateLimits[provider].requests++;
        
        try {
            // In a real implementation, this would make actual API calls
            // For demo purposes, we'll simulate the responses
            const quote = await this.simulateProviderAPI(provider, moveDetails);
            
            return {
                provider: provider,
                companyName: this.getCompanyName(provider),
                ...quote,
                retrievedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error(`API call failed for ${provider}:`, error);
            throw error;
        }
    }
    
    // Simulate API responses (replace with real API calls in production)
    async simulateProviderAPI(provider, moveDetails) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
        
        const distance = this.calculateDistance(moveDetails.originZip, moveDetails.destinationZip);
        const basePrice = this.calculateBasePrice(moveDetails, distance);
        
        // Provider-specific pricing adjustments
        const providerMultipliers = {
            uhaul: 0.85,      // Usually cheaper, DIY option
            budget: 0.90,     // Budget-friendly
            allied: 1.15,     // Premium service
            mayflower: 1.20,  // Premium service
            northAmerican: 1.10 // Mid-range premium
        };
        
        const adjustedPrice = Math.round(basePrice * providerMultipliers[provider]);
        
        return {
            totalPrice: adjustedPrice,
            basePrice: Math.round(adjustedPrice * 0.7),
            additionalFees: Math.round(adjustedPrice * 0.3),
            currency: 'USD',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            services: this.getProviderServices(provider, moveDetails.services),
            estimatedDuration: this.calculateMoveDuration(distance, moveDetails.homeSize),
            insurance: this.getInsuranceOptions(provider, adjustedPrice),
            availability: this.checkAvailability(provider, moveDetails.moveDate),
            rating: this.getProviderRating(provider),
            reviews: this.getProviderReviews(provider),
            specialOffers: this.getSpecialOffers(provider),
            contactInfo: this.getProviderContact(provider)
        };
    }
    
    // Calculate base price based on move details
    calculateBasePrice(moveDetails, distance) {
        const { homeSize, services = [], specialItems = [] } = moveDetails;
        
        // Base price calculation
        const homeSizeMultipliers = {
            'studio': 800,
            '1-bedroom': 1200,
            '2-bedroom': 1800,
            '3-bedroom': 2500,
            '4-bedroom': 3200,
            '5-bedroom': 4000
        };
        
        let basePrice = homeSizeMultipliers[homeSize] || 1500;
        
        // Distance factor
        if (distance > 100) {
            basePrice += distance * 1.2; // Long distance
        } else {
            basePrice += distance * 0.8; // Local move
        }
        
        // Service additions
        const serviceAdditions = {
            'packing': basePrice * 0.3,
            'unpacking': basePrice * 0.2,
            'storage': 200,
            'piano': 300,
            'appliances': 150,
            'fragile-items': 100
        };
        
        services.forEach(service => {
            if (serviceAdditions[service]) {
                basePrice += serviceAdditions[service];
            }
        });
        
        // Special items
        specialItems.forEach(item => {
            switch(item) {
                case 'piano':
                    basePrice += 400;
                    break;
                case 'pool-table':
                    basePrice += 300;
                    break;
                case 'hot-tub':
                    basePrice += 500;
                    break;
                case 'artwork':
                    basePrice += 200;
                    break;
                default:
                    basePrice += 100;
            }
        });
        
        return Math.round(basePrice);
    }
    
    // Calculate distance between zip codes (simplified)
    calculateDistance(originZip, destinationZip) {
        // In production, use a real geocoding service
        // This is a simplified simulation
        const zipDiff = Math.abs(parseInt(originZip) - parseInt(destinationZip));
        return Math.min(zipDiff * 0.1, 3000); // Cap at 3000 miles
    }
    
    // Calculate estimated move duration
    calculateMoveDuration(distance, homeSize) {
        const baseDays = {
            'studio': 1,
            '1-bedroom': 1,
            '2-bedroom': 2,
            '3-bedroom': 2,
            '4-bedroom': 3,
            '5-bedroom': 3
        };
        
        let days = baseDays[homeSize] || 2;
        
        if (distance > 500) {
            days += Math.ceil(distance / 500); // Add travel days
        }
        
        return `${days}-${days + 1} days`;
    }
    
    // Get provider-specific services
    getProviderServices(provider, requestedServices) {
        const allServices = {
            uhaul: ['Self-service moving', 'Truck rental', 'Moving supplies', 'Storage'],
            budget: ['Full-service moving', 'Packing services', 'Storage solutions'],
            allied: ['White-glove service', 'Custom crating', 'International moves', 'Storage'],
            mayflower: ['Premium moving', 'Corporate relocation', 'International', 'Storage'],
            northAmerican: ['Full-service moving', 'Packing', 'Storage', 'Specialty items']
        };
        
        return allServices[provider] || ['Standard moving services'];
    }
    
    // Get insurance options
    getInsuranceOptions(provider, totalPrice) {
        return {
            basic: {
                coverage: '60 cents per pound',
                cost: 0,
                description: 'Basic liability coverage'
            },
            full: {
                coverage: 'Full replacement value',
                cost: Math.round(totalPrice * 0.05),
                description: 'Complete protection for your belongings'
            }
        };
    }
    
    // Check availability
    checkAvailability(provider, moveDate) {
        const date = new Date(moveDate);
        const today = new Date();
        const daysOut = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        
        if (daysOut < 7) {
            return 'Limited availability';
        } else if (daysOut < 30) {
            return 'Good availability';
        } else {
            return 'Excellent availability';
        }
    }
    
    // Get provider ratings
    getProviderRating(provider) {
        const ratings = {
            uhaul: 4.2,
            budget: 4.0,
            allied: 4.7,
            mayflower: 4.8,
            northAmerican: 4.5
        };
        
        return ratings[provider] || 4.0;
    }
    
    // Get provider reviews count
    getProviderReviews(provider) {
        const reviews = {
            uhaul: 15420,
            budget: 8930,
            allied: 5670,
            mayflower: 7890,
            northAmerican: 6540
        };
        
        return reviews[provider] || 1000;
    }
    
    // Get special offers
    getSpecialOffers(provider) {
        const offers = {
            uhaul: ['10% off first-time customers', 'Free moving supplies kit'],
            budget: ['15% military discount', 'Free packing materials'],
            allied: ['Premium service guarantee', 'Free storage for 30 days'],
            mayflower: ['Corporate discount available', 'White-glove service'],
            northAmerican: ['Senior citizen discount', 'Flexible scheduling']
        };
        
        return offers[provider] || ['Contact for current promotions'];
    }
    
    // Get provider contact info
    getProviderContact(provider) {
        const contacts = {
            uhaul: { phone: '1-800-GO-UHAUL', website: 'uhaul.com' },
            budget: { phone: '1-800-BUDGET-TRUCK', website: 'budgettruck.com' },
            allied: { phone: '1-800-ALLIED-1', website: 'allied.com' },
            mayflower: { phone: '1-800-MAYFLOWER', website: 'mayflower.com' },
            northAmerican: { phone: '1-800-NORTH-AMERICAN', website: 'northamerican.com' }
        };
        
        return contacts[provider] || { phone: '1-800-MOVING', website: 'example.com' };
    }
    
    // Get company display name
    getCompanyName(provider) {
        const names = {
            uhaul: 'U-Haul',
            budget: 'Budget Truck Rental',
            allied: 'Allied Van Lines',
            mayflower: 'Mayflower Transit',
            northAmerican: 'North American Van Lines'
        };
        
        return names[provider] || provider;
    }
    
    // Validate move details
    validateMoveDetails(details) {
        const required = ['originZip', 'destinationZip', 'moveDate', 'homeSize'];
        
        for (const field of required) {
            if (!details[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate zip codes
        if (!/^\d{5}$/.test(details.originZip) || !/^\d{5}$/.test(details.destinationZip)) {
            console.error('Invalid zip code format');
            return false;
        }
        
        // Validate move date
        const moveDate = new Date(details.moveDate);
        const today = new Date();
        if (moveDate < today) {
            console.error('Move date cannot be in the past');
            return false;
        }
        
        return true;
    }
    
    // Check rate limits
    checkRateLimit(provider) {
        const limit = this.rateLimits[provider];
        const now = Date.now();
        
        // Reset counter if an hour has passed
        if (now - limit.lastReset > 3600000) { // 1 hour
            limit.requests = 0;
            limit.lastReset = now;
        }
        
        return limit.requests < limit.limit;
    }
    
    // Get API usage statistics
    getAPIUsageStats() {
        const stats = {};
        
        Object.keys(this.rateLimits).forEach(provider => {
            const limit = this.rateLimits[provider];
            stats[provider] = {
                requests: limit.requests,
                limit: limit.limit,
                remaining: limit.limit - limit.requests,
                resetTime: new Date(limit.lastReset + 3600000).toISOString()
            };
        });
        
        return stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovingAPIIntegration;
} else {
    window.MovingAPIIntegration = MovingAPIIntegration;
}