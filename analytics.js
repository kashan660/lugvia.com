// Google Analytics Integration
class AnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.settings = null;
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            if (this.settings && this.settings.is_enabled) {
                await this.initializeAnalytics();
            }
        } catch (error) {
            console.error('Analytics initialization error:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/admin/analytics-settings');
            if (response.ok) {
                this.settings = await response.json();
            }
        } catch (error) {
            console.error('Failed to load analytics settings:', error);
        }
    }

    async initializeAnalytics() {
        if (this.isInitialized) return;

        try {
            // Initialize Google Analytics 4 (GA4)
            if (this.settings.ga_tracking_id) {
                await this.initGA4();
            }

            // Initialize Google Tag Manager
            if (this.settings.gtm_container_id) {
                await this.initGTM();
            }

            this.isInitialized = true;
            console.log('Analytics initialized successfully');
        } catch (error) {
            console.error('Analytics initialization failed:', error);
        }
    }

    async initGA4() {
        return new Promise((resolve, reject) => {
            try {
                // Load Google Analytics script
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${this.settings.ga_tracking_id}`;
                script.onload = () => {
                    // Initialize gtag
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    
                    gtag('js', new Date());
                    gtag('config', this.settings.ga_tracking_id, {
                        page_title: document.title,
                        page_location: window.location.href
                    });
                    
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } catch (error) {
                reject(error);
            }
        });
    }

    async initGTM() {
        return new Promise((resolve, reject) => {
            try {
                // Initialize dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });

                // Load GTM script
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtm.js?id=${this.settings.gtm_container_id}`;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);

                // Add GTM noscript fallback
                const noscript = document.createElement('noscript');
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.settings.gtm_container_id}`;
                iframe.height = '0';
                iframe.width = '0';
                iframe.style.display = 'none';
                iframe.style.visibility = 'hidden';
                noscript.appendChild(iframe);
                document.body.insertBefore(noscript, document.body.firstChild);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Track custom events
    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized || !this.settings?.track_events) return;

        try {
            if (window.gtag) {
                window.gtag('event', eventName, parameters);
            }

            if (window.dataLayer) {
                window.dataLayer.push({
                    event: eventName,
                    ...parameters
                });
            }
        } catch (error) {
            console.error('Event tracking error:', error);
        }
    }

    // Track page views
    trackPageView(page_title, page_location) {
        if (!this.isInitialized) return;

        try {
            if (window.gtag) {
                window.gtag('config', this.settings.ga_tracking_id, {
                    page_title: page_title || document.title,
                    page_location: page_location || window.location.href
                });
            }
        } catch (error) {
            console.error('Page view tracking error:', error);
        }
    }

    // Track form submissions
    trackFormSubmission(formName, formData = {}) {
        this.trackEvent('form_submit', {
            form_name: formName,
            ...formData
        });
    }

    // Track quote requests
    trackQuoteRequest(quoteData = {}) {
        this.trackEvent('quote_request', {
            event_category: 'engagement',
            event_label: 'quote_form',
            value: 1,
            ...quoteData
        });
    }

    // Track user registration
    trackUserRegistration(userData = {}) {
        this.trackEvent('sign_up', {
            method: 'email',
            event_category: 'engagement',
            ...userData
        });
    }

    // Track user login
    trackUserLogin(userData = {}) {
        this.trackEvent('login', {
            method: 'email',
            event_category: 'engagement',
            ...userData
        });
    }

    // Track referral clicks
    trackReferralClick(referralData = {}) {
        this.trackEvent('referral_click', {
            event_category: 'referral',
            event_label: 'referral_link',
            ...referralData
        });
    }

    // Track WhatsApp clicks
    trackWhatsAppClick(phoneNumber = '') {
        this.trackEvent('whatsapp_click', {
            event_category: 'contact',
            event_label: 'whatsapp_button',
            phone_number: phoneNumber
        });
    }

    // Track phone calls
    trackPhoneCall(phoneNumber = '') {
        this.trackEvent('phone_call', {
            event_category: 'contact',
            event_label: 'phone_click',
            phone_number: phoneNumber
        });
    }

    // Track email clicks
    trackEmailClick(emailAddress = '') {
        this.trackEvent('email_click', {
            event_category: 'contact',
            event_label: 'email_click',
            email_address: emailAddress
        });
    }

    // Track file downloads
    trackDownload(fileName, fileType = '') {
        this.trackEvent('file_download', {
            event_category: 'engagement',
            event_label: fileName,
            file_type: fileType
        });
    }

    // Track external link clicks
    trackExternalLink(url, linkText = '') {
        this.trackEvent('click', {
            event_category: 'outbound',
            event_label: url,
            link_text: linkText
        });
    }

    // Track scroll depth
    trackScrollDepth(percentage) {
        this.trackEvent('scroll', {
            event_category: 'engagement',
            event_label: `${percentage}%`,
            value: percentage
        });
    }

    // Track time on page
    trackTimeOnPage(seconds) {
        this.trackEvent('timing_complete', {
            name: 'page_view_time',
            value: seconds
        });
    }
}

// Initialize analytics when DOM is ready
let analyticsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        analyticsManager = new AnalyticsManager();
    });
} else {
    analyticsManager = new AnalyticsManager();
}

// Make analytics manager globally available
window.analyticsManager = analyticsManager;

// Auto-track common events
document.addEventListener('DOMContentLoaded', () => {
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const formName = form.id || form.className || 'unknown_form';
            analyticsManager?.trackFormSubmission(formName);
        });
    });

    // Track external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.addEventListener('click', () => {
                analyticsManager?.trackExternalLink(link.href, link.textContent);
            });
        }
    });

    // Track phone number clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            analyticsManager?.trackPhoneCall(link.href.replace('tel:', ''));
        });
    });

    // Track email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', () => {
            analyticsManager?.trackEmailClick(link.href.replace('mailto:', ''));
        });
    });

    // Track scroll depth
    let maxScroll = 0;
    const trackScrollDepth = () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            analyticsManager?.trackScrollDepth(scrollPercent);
        }
    };
    
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        if (timeOnPage > 10) { // Only track if user spent more than 10 seconds
            analyticsManager?.trackTimeOnPage(timeOnPage);
        }
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}