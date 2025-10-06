class MetaTagsService {
    constructor() {
        this.domain = process.env.DOMAIN || 'https://lugvia.com';
        this.defaultImage = `${this.domain}/hero-image.png`;
        this.siteName = 'Lugvia';
        this.defaultDescription = 'Professional moving and relocation services. Get a free quote today for local and long-distance moves.';
        this.twitterHandle = '@lugvia';
    }

    // Generate basic SEO meta tags
    generateBasicMetaTags(page) {
        const tags = [];
        
        // Title tag
        tags.push(`<title>${page.title}</title>`);
        
        // Meta description
        tags.push(`<meta name="description" content="${page.description}">`);
        
        // Meta keywords
        if (page.keywords) {
            tags.push(`<meta name="keywords" content="${page.keywords}">`);
        }
        
        // Canonical URL
        tags.push(`<link rel="canonical" href="${this.domain}${page.url}">`);
        
        // Robots meta
        tags.push(`<meta name="robots" content="${page.robots || 'index, follow'}">`);
        
        // Author
        if (page.author) {
            tags.push(`<meta name="author" content="${page.author}">`);
        }
        
        // Language
        tags.push(`<meta name="language" content="${page.language || 'en'}">`);
        
        // Viewport (responsive)
        tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
        
        // Character encoding
        tags.push(`<meta charset="UTF-8">`);
        
        return tags;
    }

    // Generate Open Graph meta tags
    generateOpenGraphTags(page) {
        const tags = [];
        
        tags.push(`<meta property="og:title" content="${page.title}">`);
        tags.push(`<meta property="og:description" content="${page.description}">`);
        tags.push(`<meta property="og:type" content="${page.type || 'website'}">`);
        tags.push(`<meta property="og:url" content="${this.domain}${page.url}">`);
        tags.push(`<meta property="og:site_name" content="${this.siteName}">`);
        tags.push(`<meta property="og:image" content="${page.image || this.defaultImage}">`);
        tags.push(`<meta property="og:image:width" content="1200">`);
        tags.push(`<meta property="og:image:height" content="630">`);
        tags.push(`<meta property="og:image:alt" content="${page.imageAlt || page.title}">`);
        tags.push(`<meta property="og:locale" content="${page.locale || 'en_US'}">`);
        
        if (page.publishedTime) {
            tags.push(`<meta property="article:published_time" content="${page.publishedTime}">`);
        }
        
        if (page.modifiedTime) {
            tags.push(`<meta property="article:modified_time" content="${page.modifiedTime}">`);
        }
        
        if (page.author) {
            tags.push(`<meta property="article:author" content="${page.author}">`);
        }
        
        if (page.section) {
            tags.push(`<meta property="article:section" content="${page.section}">`);
        }
        
        if (page.tags && Array.isArray(page.tags)) {
            page.tags.forEach(tag => {
                tags.push(`<meta property="article:tag" content="${tag}">`);
            });
        }
        
        return tags;
    }

    // Generate Twitter Card meta tags
    generateTwitterCardTags(page) {
        const tags = [];
        
        tags.push(`<meta name="twitter:card" content="${page.twitterCard || 'summary_large_image'}">`);
        tags.push(`<meta name="twitter:site" content="${this.twitterHandle}">`);
        tags.push(`<meta name="twitter:title" content="${page.title}">`);
        tags.push(`<meta name="twitter:description" content="${page.description}">`);
        tags.push(`<meta name="twitter:image" content="${page.image || this.defaultImage}">`);
        tags.push(`<meta name="twitter:image:alt" content="${page.imageAlt || page.title}">`);
        
        if (page.twitterCreator) {
            tags.push(`<meta name="twitter:creator" content="${page.twitterCreator}">`);
        }
        
        return tags;
    }

    // Generate additional SEO meta tags
    generateAdditionalSEOTags(page) {
        const tags = [];
        
        // Theme color for mobile browsers
        tags.push(`<meta name="theme-color" content="#2563eb">`);
        
        // Application name
        tags.push(`<meta name="application-name" content="${this.siteName}">`);
        
        // Generator
        tags.push(`<meta name="generator" content="Lugvia CMS">`);
        
        // Rating
        tags.push(`<meta name="rating" content="general">`);
        
        // Distribution
        tags.push(`<meta name="distribution" content="global">`);
        
        // Revisit after
        tags.push(`<meta name="revisit-after" content="7 days">`);
        
        // Geographic tags if location is relevant
        if (page.geo) {
            tags.push(`<meta name="geo.region" content="${page.geo.region || 'US'}">`);
            tags.push(`<meta name="geo.placename" content="${page.geo.placename || 'United States'}">`);
            if (page.geo.position) {
                tags.push(`<meta name="geo.position" content="${page.geo.position}">`);
                tags.push(`<meta name="ICBM" content="${page.geo.position}">`);
            }
        }
        
        // Business-specific tags
        if (page.business) {
            tags.push(`<meta name="business:contact_data:street_address" content="${page.business.address}">`);
            tags.push(`<meta name="business:contact_data:locality" content="${page.business.city}">`);
            tags.push(`<meta name="business:contact_data:region" content="${page.business.state}">`);
            tags.push(`<meta name="business:contact_data:postal_code" content="${page.business.zip}">`);
            tags.push(`<meta name="business:contact_data:country_name" content="${page.business.country}">`);
            tags.push(`<meta name="business:contact_data:phone_number" content="${page.business.phone}">`);
        }
        
        return tags;
    }

    // Generate favicon and icon tags
    generateIconTags() {
        const tags = [];
        
        tags.push(`<link rel="icon" type="image/x-icon" href="/favicon.ico">`);
        tags.push(`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`);
        tags.push(`<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`);
        tags.push(`<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`);
        tags.push(`<link rel="manifest" href="/site.webmanifest">`);
        tags.push(`<meta name="msapplication-TileColor" content="#2563eb">`);
        tags.push(`<meta name="msapplication-config" content="/browserconfig.xml">`);
        
        return tags;
    }

    // Generate preload and prefetch tags for performance
    generatePerformanceTags(page) {
        const tags = [];
        
        // Preload critical resources
        tags.push(`<link rel="preload" href="/styles.css" as="style">`);
        tags.push(`<link rel="preload" href="/script.js" as="script">`);
        
        // Preconnect to external domains
        tags.push(`<link rel="preconnect" href="https://fonts.googleapis.com">`);
        tags.push(`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
        tags.push(`<link rel="preconnect" href="https://www.google-analytics.com">`);
        
        // DNS prefetch for external resources
        tags.push(`<link rel="dns-prefetch" href="//www.googletagmanager.com">`);
        tags.push(`<link rel="dns-prefetch" href="//fonts.googleapis.com">`);
        
        // Prefetch next likely pages
        if (page.prefetchPages && Array.isArray(page.prefetchPages)) {
            page.prefetchPages.forEach(url => {
                tags.push(`<link rel="prefetch" href="${url}">`);
            });
        }
        
        return tags;
    }

    // Generate all meta tags for a page
    generateAllMetaTags(page) {
        const allTags = [
            ...this.generateBasicMetaTags(page),
            ...this.generateOpenGraphTags(page),
            ...this.generateTwitterCardTags(page),
            ...this.generateAdditionalSEOTags(page),
            ...this.generateIconTags(),
            ...this.generatePerformanceTags(page)
        ];
        
        return allTags.join('\n    ');
    }

    // Predefined page configurations
    getPageConfig(pageType, customData = {}) {
        const configs = {
            homepage: {
                title: 'Lugvia - Professional Moving Services | Get Free Quote',
                description: 'Professional moving and relocation services. Local and long-distance moves with experienced movers. Get your free quote today!',
                keywords: 'moving services, professional movers, relocation, local moving, long distance moving, packing services',
                url: '/',
                type: 'website',
                prefetchPages: ['/services', '/quote', '/about'],
                geo: {
                    region: 'US',
                    placename: 'United States'
                },
                business: {
                    address: '123 Moving Street',
                    city: 'Your City',
                    state: 'Your State',
                    zip: '12345',
                    country: 'US',
                    phone: '+1-555-LUGVIA'
                }
            },
            services: {
                title: 'Moving Services - Local & Long Distance | Lugvia',
                description: 'Comprehensive moving services including local moves, long-distance relocations, packing, and storage solutions. Professional and reliable.',
                keywords: 'moving services, local moving, long distance moving, packing services, storage solutions, professional movers',
                url: '/services',
                type: 'website',
                prefetchPages: ['/quote', '/contact']
            },
            about: {
                title: 'About Lugvia - Leading Packers and Movers Service Provider Platform',
                description: 'Learn about Lugvia\'s mission to connect families with licensed, DOT-registered packers and movers companies nationwide. Trusted platform for professional moving services.',
                keywords: 'about lugvia, packers and movers platform, DOT registered movers, licensed moving companies, professional packers movers, moving service provider, trusted movers network, packers movers companies',
                url: '/about',
                type: 'website',
                prefetchPages: ['/services', '/contact']
            },
            contact: {
                title: 'Contact Lugvia - Get Your Free Moving Quote',
                description: 'Contact Lugvia for your moving needs. Get a free quote, schedule your move, or ask questions about our services.',
                keywords: 'contact lugvia, free quote, moving quote, schedule move, moving consultation',
                url: '/contact',
                type: 'website'
            },
            quote: {
                title: 'Free Moving Quote - Lugvia Moving Services',
                description: 'Get your free moving quote from Lugvia. Quick and easy online form for accurate pricing on your upcoming move.',
                keywords: 'free moving quote, moving estimate, moving cost, online quote, moving pricing',
                url: '/quote',
                type: 'website'
            }
        };
        
        return { ...configs[pageType], ...customData };
    }

    // Generate meta tags for specific page types
    generateMetaTagsForPage(pageType, customData = {}) {
        const pageConfig = this.getPageConfig(pageType, customData);
        return this.generateAllMetaTags(pageConfig);
    }
}

module.exports = MetaTagsService;