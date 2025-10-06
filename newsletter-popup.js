/**
 * Dynamic Newsletter Popup System
 * Features: Alternating positioning, exit-intent detection, conversion optimization
 */

class NewsletterPopupManager {
    constructor() {
        this.popups = [];
        this.currentPopupIndex = 0;
        this.isExitIntentShown = false;
        this.userInteracted = false;
        this.sessionStartTime = Date.now();
        this.popupShownCount = 0;
        this.maxPopupsPerSession = 3;
        this.scrollDepth = 0;
        this.timeOnPage = 0;
        this.pageViews = this.getPageViews();
        this.userEngagement = this.calculateEngagement();
        this.deviceType = this.getDeviceType();
        this.timeOfDay = new Date().getHours();
        this.dayOfWeek = new Date().getDay();
        
        // Advanced Configuration with Smart Timing
        this.config = {
            // Base timing (adjusted based on user behavior)
            showDelay: this.getSmartDelay(), // Dynamic delay based on engagement
            popupInterval: this.getSmartInterval(), // Dynamic interval
            exitIntentDelay: 1000, // 1 second delay for exit intent
            maxPopupsPerDay: this.getMaxPopupsForUser(), // Dynamic based on engagement
            cookieExpiry: 24 * 60 * 60 * 1000, // 24 hours
            
            // UX Optimization settings
            respectUserPreferences: true,
            adaptToUserBehavior: true,
            minimumEngagementTime: 10000, // 10 seconds minimum engagement
            scrollThreshold: 25, // Show after 25% scroll
            returnVisitorDelay: 8000, // Faster for return visitors
            mobileOptimization: true,
            peakHoursBoost: this.isPeakHours(), // Show more during peak hours
            
            // A/B Testing variants
            testVariant: this.getTestVariant(),
            
            // Frequency capping
            respectDismissals: true,
            dismissalCooldown: 2 * 60 * 60 * 1000, // 2 hours after dismissal
            conversionCooldown: 7 * 24 * 60 * 60 * 1000 // 7 days after conversion
        };
        
        this.offers = [
            {
                type: 'discount',
                title: '🚚 FLASH SALE: 40% OFF Moving!',
                subtitle: 'Today Only - Don\'t Miss Out!',
                badge: 'SAVE $800+',
                description: 'Massive savings on professional moving services! Licensed movers, full insurance, zero stress.',
                benefits: [
                    '✅ Save up to $800 on your move',
                    '✅ Professional packing included FREE',
                    '✅ Full insurance & damage protection',
                    '✅ Same-day booking available',
                    '✅ 5-star rated moving teams'
                ],
                cta: 'Claim 40% Discount Now',
                urgency: '⏰ Only 8 spots left at this price!'
            },
            {
                type: 'free_quote',
                title: '💰 Get 3 FREE Moving Quotes',
                subtitle: 'Compare & Save Big!',
                badge: 'INSTANT QUOTES',
                description: 'Compare quotes from top-rated movers in 60 seconds. Save up to 40% by choosing the best deal!',
                benefits: [
                    '⚡ Instant quotes in 60 seconds',
                    '💵 Save up to 40% by comparing',
                    '🛡️ All movers pre-screened & insured',
                    '📞 24/7 moving concierge support',
                    '🎯 Price match guarantee'
                ],
                cta: 'Get My Free Quotes',
                urgency: '🔥 Over 500 quotes requested today!'
            },
            {
                type: 'newsletter',
                title: '🎁 Exclusive Moving Insider Club',
                subtitle: 'Join 25,000+ Smart Movers',
                badge: 'VIP ACCESS',
                description: 'Get insider moving secrets, exclusive deals, and stress-free moving tips from industry experts.',
                benefits: [
                    '📧 Weekly insider moving tips',
                    '💸 Exclusive subscriber-only discounts',
                    '📋 Free moving checklists & guides',
                    '🚨 Early access to flash sales',
                    '🎯 Personalized moving advice'
                ],
                cta: 'Join VIP Club FREE',
                urgency: '🎉 New members get instant 20% off coupon!'
            },
            {
                type: 'emergency',
                title: '🆘 Need to Move ASAP?',
                subtitle: 'Emergency Moving Service',
                badge: 'SAME DAY',
                description: 'Last-minute move? We\'ve got you covered! Professional movers available within 24 hours.',
                benefits: [
                    '⚡ Same-day & next-day availability',
                    '🚚 Emergency moving specialists',
                    '📱 Instant booking confirmation',
                    '💪 Experienced last-minute teams',
                    '🛡️ Full insurance even for rush jobs'
                ],
                cta: 'Book Emergency Move',
                urgency: '🚨 Emergency slots filling fast!'
            },
            {
                type: 'seasonal',
                title: '🌟 Peak Season Special',
                subtitle: 'Beat the Rush & Save',
                badge: 'EARLY BIRD',
                description: 'Moving during peak season? Book early and save big! Secure your preferred dates now.',
                benefits: [
                    '📅 Guaranteed preferred moving dates',
                    '💰 Early bird pricing (save 25%)',
                    '🎯 Priority scheduling',
                    '📦 Free packing materials included',
                    '🏆 Premium moving crew assigned'
                ],
                cta: 'Secure My Dates',
                urgency: '📈 Peak season books up 3x faster!'
            }
        ];
        
        this.init();
    }
    
    init() {
        // Initialize user behavior tracking
        this.initializeTracking();
        
        // Check if user has seen popups today
        if (this.hasReachedDailyLimit()) {
            return;
        }
        
        // Initialize tracking
        this.setupEventListeners();
        
        // Start popup sequence with smart timing
        setTimeout(() => {
            if (this.shouldShowPopup()) {
                this.showNextPopup();
            }
        }, this.config.showDelay);
        
        // Setup exit intent detection
        this.setupExitIntent();
        
        // Setup periodic popups with smart timing
        this.setupPeriodicPopups();
        
        // Setup scroll tracking
        this.setupScrollTracking();
        
        // Track page view
        this.trackPageView();
    }

    initializeTracking() {
        // Initialize milestones
        this.milestones = {};
        
        // Track session start
        this.trackEvent('session_start', {
            page: window.location.pathname,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
        
        // Update interaction count
        const currentCount = parseInt(localStorage.getItem('interaction_count') || '0');
        localStorage.setItem('interaction_count', (currentCount + 1).toString());
    }

    trackPageView() {
        const views = JSON.parse(localStorage.getItem('page_views') || '[]');
        views.push({
            url: window.location.href,
            timestamp: Date.now(),
            title: document.title
        });
        
        // Keep only last 50 page views
        if (views.length > 50) {
            views.splice(0, views.length - 50);
        }
        
        localStorage.setItem('page_views', JSON.stringify(views));
    }

    setupScrollTracking() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScrollDepth();
            }, 100);
        });
    }
    
    setupEventListeners() {
        // Track user interaction
        ['click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                this.userInteracted = true;
            }, { once: true });
        });
        
        // Track time on page
        window.addEventListener('beforeunload', () => {
            this.trackSession();
        });
    }
    
    setupExitIntent() {
        let exitIntentTriggered = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !exitIntentTriggered && this.userInteracted) {
                exitIntentTriggered = true;
                setTimeout(() => {
                    this.showExitIntentPopup();
                }, this.config.exitIntentDelay);
            }
        });
        
        // Mobile exit intent (back button simulation)
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchDiff = touchY - touchStartY;
            
            if (touchDiff > 100 && window.scrollY === 0 && !exitIntentTriggered) {
                exitIntentTriggered = true;
                this.showExitIntentPopup();
            }
        });
    }
    
    setupPeriodicPopups() {
        setInterval(() => {
            if (this.popupShownCount < this.maxPopupsPerSession && 
                this.userInteracted && 
                this.shouldShowPopup()) {
                this.showNextPopup();
            }
        }, this.config.popupInterval);
    }

    showNextPopup() {
        if (this.popupShownCount >= this.maxPopupsPerSession || !this.shouldShowPopup()) {
            return;
        }
        
        // Select offer based on test variant and user behavior
        const offer = this.selectOptimalOffer();
        const position = this.getOptimalPosition();
        
        this.createPopup(offer, position);
        this.currentPopupIndex++;
        this.popupShownCount++;
        
        // Track popup shown with enhanced data
        this.trackPopupShown(offer.type, {
            position,
            user_engagement: this.userEngagement,
            scroll_depth: this.scrollDepth,
            time_on_page: Date.now() - this.sessionStartTime,
            test_variant: this.config.testVariant
        });
    }

    selectOptimalOffer() {
        // Select offer based on user behavior and test variant
        let offerIndex = this.currentPopupIndex % this.offers.length;
        
        // Adjust based on test variant
        if (this.config.testVariant === 'aggressive') {
            // Prioritize discount offers
            const discountOffers = this.offers.filter(offer => offer.type === 'discount');
            if (discountOffers.length > 0) {
                return discountOffers[0];
            }
        } else if (this.config.testVariant === 'gentle') {
            // Prioritize newsletter signup
            const newsletterOffers = this.offers.filter(offer => offer.type === 'newsletter');
            if (newsletterOffers.length > 0) {
                return newsletterOffers[0];
            }
        }
        
        // Adjust based on user engagement
        if (this.userEngagement === 'high') {
            // Show premium offers to engaged users
            const premiumOffers = this.offers.filter(offer => 
                offer.type === 'discount' || offer.type === 'seasonal'
            );
            if (premiumOffers.length > 0) {
                offerIndex = offerIndex % premiumOffers.length;
                return premiumOffers[offerIndex];
            }
        }
        
        return this.offers[offerIndex];
    }

    getOptimalPosition() {
        // Determine optimal position based on device and user behavior
        if (this.deviceType === 'mobile') {
            return 'center'; // Center position works best on mobile
        }
        
        // Alternate positions for desktop/tablet
        return this.currentPopupIndex % 2 === 0 ? 'right' : 'left';
    }
    
    createPopup(offer, position) {
        const popup = document.createElement('div');
        popup.className = `newsletter-popup ${position}`;
        popup.innerHTML = this.getPopupHTML(offer);
        
        document.body.appendChild(popup);
        
        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        // Setup event listeners
        this.setupPopupEvents(popup, offer);
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
            this.hidePopup(popup);
        }, 15000);
        
        return popup;
    }
    
    getPopupHTML(offer) {
        return `
            <div class="popup-header">
                <button class="popup-close" onclick="this.closest('.newsletter-popup').remove()">×</button>
                <div class="popup-icon">${this.getOfferIcon(offer.type)}</div>
                <h3 class="popup-title">${offer.title}</h3>
                <p class="popup-subtitle">${offer.subtitle}</p>
            </div>
            <div class="popup-content">
                <div class="offer-badge">${offer.badge}</div>
                <p class="popup-description">${offer.description}</p>
                <ul class="popup-benefits">
                    ${offer.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
                <form class="popup-form" data-offer-type="${offer.type}">
                    <input type="email" class="popup-input" placeholder="Enter your email address" required>
                    <input type="text" class="popup-input" placeholder="Your name (optional)">
                    <button type="submit" class="popup-submit">${offer.cta}</button>
                </form>
                <div class="popup-footer">
                    <small>${offer.urgency}</small>
                </div>
            </div>
        `;
    }
    
    getOfferIcon(type) {
        const icons = {
            discount: '🎉',
            free_quote: '📦',
            newsletter: '💡'
        };
        return icons[type] || '🎯';
    }
    
    setupPopupEvents(popup, offer) {
        const form = popup.querySelector('.popup-form');
        const closeBtn = popup.querySelector('.popup-close');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(form, popup, offer);
            
            // Track conversion
            localStorage.setItem('popup_last_conversion', Date.now().toString());
            this.trackEvent('conversion', {
                offer_type: offer.type,
                time_to_convert: Date.now() - this.sessionStartTime
            });
        });
        
        // Handle close button with dismissal tracking
        closeBtn.addEventListener('click', () => {
            this.trackDismissal(popup, offer, 'close_button');
            this.hidePopup(popup);
        });
        
        // Handle outside click with dismissal tracking
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.trackDismissal(popup, offer, 'outside_click');
                this.hidePopup(popup);
            }
        });
        
        // Track popup interaction
        popup.addEventListener('mouseenter', () => {
            this.trackEvent('popup_hover', {
                offer_type: offer.type,
                time_since_shown: Date.now() - popup.dataset.shownAt
            });
        });
        
        // Track time spent viewing popup
        popup.dataset.shownAt = Date.now();
    }

    trackDismissal(popup, offer, method) {
        const timeViewed = Date.now() - parseInt(popup.dataset.shownAt);
        
        // Track dismissal
        localStorage.setItem('popup_last_dismissal', Date.now().toString());
        
        this.trackEvent('popup_dismissed', {
            offer_type: offer.type,
            dismissal_method: method,
            time_viewed: timeViewed,
            scroll_depth_at_dismissal: this.scrollDepth
        });
    }
    
    async handleFormSubmission(form, popup, offer) {
        const email = form.querySelector('input[type="email"]').value;
        const name = form.querySelector('input[type="text"]').value;
        const submitBtn = form.querySelector('.popup-submit');
        
        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="popup-loading"></span> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Submit to newsletter API
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    name: name,
                    source: `popup_${offer.type}`,
                    offer_type: offer.type
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success state
                popup.classList.add('popup-success');
                popup.innerHTML = this.getSuccessHTML(offer);
                
                // Track conversion
                this.trackConversion(offer.type, email);
                
                // Hide after 3 seconds
                setTimeout(() => {
                    this.hidePopup(popup);
                }, 3000);
                
                // Redirect based on offer type
                if (offer.type === 'free_quote') {
                    setTimeout(() => {
                        window.location.href = '/contact.html?source=popup';
                    }, 2000);
                }
                
            } else {
                throw new Error(result.error || 'Subscription failed');
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            submitBtn.textContent = 'Try Again';
            submitBtn.style.background = '#ff4757';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 2000);
        }
    }
    
    getSuccessHTML(offer) {
        const messages = {
            discount: {
                icon: '🎊',
                title: 'HUGE Savings Secured!',
                message: '🎯 Your 40% discount code is in your inbox! Our moving specialist will call you within 30 minutes to help plan your stress-free move!'
            },
            free_quote: {
                icon: '🚀',
                title: 'Quotes Coming Your Way!',
                message: '⚡ Redirecting you to get 3 instant quotes! You\'re about to save hundreds on your move!'
            },
            newsletter: {
                icon: '🎁',
                title: 'VIP Access Granted!',
                message: '🌟 Welcome to the insider club! Check your email for your instant 20% off coupon + exclusive moving secrets!'
            },
            emergency: {
                icon: '🆘',
                title: 'Emergency Move Booked!',
                message: '⚡ Our emergency team is standing by! You\'ll receive a call within 15 minutes to coordinate your urgent move!'
            },
            seasonal: {
                icon: '📅',
                title: 'Dates Secured!',
                message: '🎯 Your preferred moving dates are locked in! Check your email for confirmation and next steps!'
            }
        };
        
        const msg = messages[offer.type] || messages.newsletter;
        
        return `
            <div class="popup-header">
                <div class="popup-icon">${msg.icon}</div>
                <h3 class="popup-title">${msg.title}</h3>
            </div>
            <div class="popup-content">
                <p class="popup-description">${msg.message}</p>
            </div>
        `;
    }
    
    showExitIntentPopup() {
        if (this.isExitIntentShown || this.hasReachedDailyLimit()) {
            return;
        }
        
        this.isExitIntentShown = true;
        
        const exitPopup = document.createElement('div');
        exitPopup.className = 'exit-intent-popup';
        exitPopup.innerHTML = this.getExitIntentHTML();
        
        document.body.appendChild(exitPopup);
        
        setTimeout(() => {
            exitPopup.classList.add('show');
        }, 100);
        
        this.setupExitIntentEvents(exitPopup);
        this.trackPopupShown('exit_intent');
    }
    
    getExitIntentHTML() {
        return `
            <div class="exit-popup-content">
                <div class="exit-popup-emoji">🚨</div>
                <h2 class="exit-popup-title">STOP! You're Missing Out!</h2>
                <p class="exit-popup-subtitle">Before you go... grab this EXCLUSIVE deal!</p>
                <div class="exit-popup-offer">
                    <div class="offer-badge-large">🎯 LAST CHANCE</div>
                    <div class="offer-main">50% OFF + FREE PACKING + FREE INSURANCE</div>
                    <div class="offer-value">Save up to $1,200 on your move!</div>
                </div>
                <div class="urgency-timer">
                    <span class="timer-icon">⏰</span>
                    <span class="timer-text">This offer expires when you close this page!</span>
                </div>
                <div class="social-proof">
                    <span class="proof-icon">👥</span>
                    <span class="proof-text">847 people claimed this offer today</span>
                </div>
                <div class="exit-popup-buttons">
                    <button class="exit-popup-btn primary pulse" onclick="this.closest('.exit-intent-popup').querySelector('.exit-email-form').style.display='block'; this.style.display='none';">
                        🎁 YES! Claim My 50% Discount
                    </button>
                    <button class="exit-popup-btn secondary" onclick="this.closest('.exit-intent-popup').remove();">
                        No thanks, I prefer paying full price
                    </button>
                </div>
                <form class="exit-email-form popup-form" style="display:none; margin-top:20px;">
                    <div class="form-header">
                        <h3>🎉 Congratulations! You're getting 50% OFF!</h3>
                        <p>Enter your email to secure this exclusive discount:</p>
                    </div>
                    <input type="email" class="popup-input" placeholder="Enter your email address" required>
                    <button type="submit" class="popup-submit glow">🔒 Secure My 50% Discount Now!</button>
                    <div class="trust-badges">
                        <span>🛡️ 100% Secure</span>
                        <span>📧 No Spam</span>
                        <span>⚡ Instant Delivery</span>
                    </div>
                </form>
            </div>
        `;
    }
    
    setupExitIntentEvents(popup) {
        const form = popup.querySelector('.exit-email-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            try {
                await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        source: 'exit_intent',
                        offer_type: 'exit_discount'
                    })
                });
                
                popup.innerHTML = `
                    <div class="exit-popup-content">
                        <div class="exit-popup-emoji">🎉</div>
                        <h2 class="exit-popup-title">Discount Secured!</h2>
                        <p>Check your email for the 30% discount code!</p>
                        <p>Our team will contact you within 1 hour to help with your move.</p>
                        <button class="exit-popup-btn primary" onclick="this.closest('.exit-intent-popup').remove();">
                            Continue Browsing
                        </button>
                    </div>
                `;
                
                this.trackConversion('exit_intent', email);
                
            } catch (error) {
                console.error('Exit intent subscription error:', error);
            }
        });
    }
    
    hidePopup(popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 600);
    }
    
    trackPopupShown(type, additionalData = {}) {
        // Enhanced popup analytics tracking
        const trackingData = {
            event_category: 'Newsletter_Popup',
            event_label: type,
            value: 1,
            ...additionalData
        };
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'popup_shown', trackingData);
        }
        
        // Store in localStorage for daily limit tracking
        const today = new Date().toDateString();
        const key = `popup_shown_${today}`;
        const shown = JSON.parse(localStorage.getItem(key) || '[]');
        shown.push({ 
            type, 
            timestamp: Date.now(),
            ...additionalData
        });
        localStorage.setItem(key, JSON.stringify(shown));
        
        // Track with enhanced event system
        this.trackEvent('popup_shown', {
            offer_type: type,
            ...additionalData
        });
    }
    
    trackConversion(type, email) {
        // Track conversion analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_conversion', {
                event_category: 'Newsletter',
                event_label: type,
                value: 1
            });
        }
        
        // Store conversion data
        const conversions = JSON.parse(localStorage.getItem('newsletter_conversions') || '[]');
        conversions.push({
            type,
            email,
            timestamp: Date.now(),
            source: 'popup'
        });
        localStorage.setItem('newsletter_conversions', JSON.stringify(conversions));
    }
    
    trackSession() {
        const sessionTime = Date.now() - this.sessionStartTime;
        const sessionData = {
            duration: sessionTime,
            popupsShown: this.popupShownCount,
            userInteracted: this.userInteracted,
            exitIntentShown: this.isExitIntentShown,
            maxScrollDepth: this.scrollDepth,
            userEngagement: this.userEngagement,
            deviceType: this.deviceType,
            testVariant: this.config.testVariant
        };
        
        // Store session time for engagement calculation
        const sessions = JSON.parse(localStorage.getItem('session_times') || '[]');
        sessions.push(sessionTime);
        
        // Keep only last 20 sessions
        if (sessions.length > 20) {
            sessions.splice(0, sessions.length - 20);
        }
        
        localStorage.setItem('session_times', JSON.stringify(sessions));
        
        // Send session data to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'session_end', {
                event_category: 'Newsletter_Popup',
                custom_map: sessionData
            });
        }
        
        this.trackEvent('session_end', sessionData);
    }
    
    hasReachedDailyLimit() {
        const today = new Date().toDateString();
        const key = `popup_shown_${today}`;
        const shown = JSON.parse(localStorage.getItem(key) || '[]');
        return shown.length >= this.config.maxPopupsPerDay;
    }

    // Smart Timing Methods
    getSmartDelay() {
        let baseDelay = 15000; // 15 seconds default
    
        // Safe fallback for return visitor delay if config not yet initialized
        const returnVisitorFallback = 8000;
        const returnVisitorDelay = (this && this.config && typeof this.config.returnVisitorDelay === 'number')
            ? this.config.returnVisitorDelay
            : returnVisitorFallback;
    
        // Faster for return visitors
        if (this.pageViews > 1) {
            baseDelay = returnVisitorDelay;
        }
    
        // Adjust based on device type
        if (this.deviceType === 'mobile') {
            baseDelay *= 1.2; // 20% longer on mobile
        }
    
        // Adjust based on time of day
        if (this.isPeakHours()) {
            baseDelay *= 0.8; // 20% faster during peak hours
        }
    
        // Adjust based on user engagement
        if (this.userEngagement === 'high') {
            baseDelay *= 0.7; // 30% faster for engaged users
        } else if (this.userEngagement === 'low') {
            baseDelay *= 1.5; // 50% slower for less engaged users
        }
    
        return Math.max(baseDelay, 5000); // Minimum 5 seconds
    }

    getSmartInterval() {
        let baseInterval = 45000; // 45 seconds default
        
        // Adjust based on user engagement
        if (this.userEngagement === 'high') {
            baseInterval *= 0.8; // More frequent for engaged users
        } else if (this.userEngagement === 'low') {
            baseInterval *= 1.5; // Less frequent for less engaged users
        }
        
        // Adjust based on device type
        if (this.deviceType === 'mobile') {
            baseInterval *= 1.3; // Less frequent on mobile
        }
        
        return Math.max(baseInterval, 30000); // Minimum 30 seconds
    }

    getMaxPopupsForUser() {
        let maxPopups = 3; // Default
        
        // More for highly engaged users
        if (this.userEngagement === 'high') {
            maxPopups = 5;
        } else if (this.userEngagement === 'low') {
            maxPopups = 2;
        }
        
        // Fewer on mobile
        if (this.deviceType === 'mobile') {
            maxPopups = Math.max(maxPopups - 1, 1);
        }
        
        return maxPopups;
    }

    calculateEngagement() {
        const pageViews = this.getPageViews();
        const timeSpent = this.getAverageTimeSpent();
        const interactions = this.getInteractionCount();
        
        let score = 0;
        
        // Page views scoring
        if (pageViews >= 5) score += 3;
        else if (pageViews >= 3) score += 2;
        else if (pageViews >= 2) score += 1;
        
        // Time spent scoring
        if (timeSpent >= 120) score += 3; // 2+ minutes
        else if (timeSpent >= 60) score += 2; // 1+ minute
        else if (timeSpent >= 30) score += 1; // 30+ seconds
        
        // Interaction scoring
        if (interactions >= 10) score += 2;
        else if (interactions >= 5) score += 1;
        
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    isPeakHours() {
        // Peak hours: 9-11 AM and 2-5 PM
        return (this.timeOfDay >= 9 && this.timeOfDay <= 11) || 
               (this.timeOfDay >= 14 && this.timeOfDay <= 17);
    }

    getTestVariant() {
        // Simple A/B testing
        const variants = ['control', 'aggressive', 'gentle'];
        const hash = this.hashCode(navigator.userAgent + new Date().toDateString());
        return variants[Math.abs(hash) % variants.length];
    }

    getPageViews() {
        const views = JSON.parse(localStorage.getItem('page_views') || '[]');
        return views.length;
    }

    getAverageTimeSpent() {
        const sessions = JSON.parse(localStorage.getItem('session_times') || '[]');
        if (sessions.length === 0) return 0;
        const total = sessions.reduce((sum, time) => sum + time, 0);
        return total / sessions.length / 1000; // Convert to seconds
    }

    getInteractionCount() {
        return parseInt(localStorage.getItem('interaction_count') || '0');
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    // Enhanced User Behavior Tracking
    trackScrollDepth() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        this.scrollDepth = Math.max(this.scrollDepth, scrollPercent);
        
        // Track milestone scrolls
        if (scrollPercent >= 25 && !this.milestones?.scroll25) {
            this.milestones = this.milestones || {};
            this.milestones.scroll25 = true;
            this.trackEvent('scroll_milestone', { depth: 25 });
        }
        
        if (scrollPercent >= 50 && !this.milestones?.scroll50) {
            this.milestones = this.milestones || {};
            this.milestones.scroll50 = true;
            this.trackEvent('scroll_milestone', { depth: 50 });
        }
        
        if (scrollPercent >= 75 && !this.milestones?.scroll75) {
            this.milestones = this.milestones || {};
            this.milestones.scroll75 = true;
            this.trackEvent('scroll_milestone', { depth: 75 });
        }
    }

    trackEvent(eventName, data = {}) {
        // Enhanced analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Newsletter_Popup',
                ...data,
                user_engagement: this.userEngagement,
                device_type: this.deviceType,
                test_variant: this.config.testVariant
            });
        }
        
        // Store for local analysis
        const events = JSON.parse(localStorage.getItem('popup_events') || '[]');
        events.push({
            event: eventName,
            data,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('popup_events', JSON.stringify(events));
    }

    // Respect User Preferences
    shouldShowPopup() {
        // Check if user has dismissed recently
        if (this.config.respectDismissals) {
            const lastDismissal = localStorage.getItem('popup_last_dismissal');
            if (lastDismissal && Date.now() - parseInt(lastDismissal) < this.config.dismissalCooldown) {
                return false;
            }
        }
        
        // Check if user converted recently
        const lastConversion = localStorage.getItem('popup_last_conversion');
        if (lastConversion && Date.now() - parseInt(lastConversion) < this.config.conversionCooldown) {
            return false;
        }
        
        // Check minimum engagement time
        if (Date.now() - this.sessionStartTime < this.config.minimumEngagementTime) {
            return false;
        }
        
        // Check scroll threshold
        if (this.scrollDepth < this.config.scrollThreshold) {
            return false;
        }
        
        // Check daily limit
        if (this.hasReachedDailyLimit()) {
            return false;
        }
        
        return true;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main pages, not admin pages
    if (!window.location.pathname.includes('admin') && !window.location.pathname.includes('login')) {
        window.newsletterPopupManager = new NewsletterPopupManager();
    }
});

// Export for manual control
window.NewsletterPopupManager = NewsletterPopupManager;