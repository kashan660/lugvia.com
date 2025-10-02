// Cloudflare Configuration for Lugvia.com
// This file contains recommended Cloudflare settings for optimal security and performance

const cloudflareConfig = {
    // Security Settings
    security: {
        // Security Level (essentially_off, low, medium, high, under_attack)
        securityLevel: 'medium',
        
        // Challenge Passage (1-99999999)
        challengeTtl: 1800,
        
        // Browser Integrity Check
        browserCheck: true,
        
        // Hotlink Protection
        hotlinkProtection: false,
        
        // IP Geolocation
        ipGeolocation: true,
        
        // Email Obfuscation
        emailObfuscation: true,
        
        // Server Side Excludes
        serverSideExclude: true,
        
        // TLS Settings
        tls: {
            // TLS Version (1.0, 1.1, 1.2, 1.3)
            minTlsVersion: '1.2',
            
            // Opportunistic Encryption
            opportunisticEncryption: true,
            
            // TLS 1.3
            tls13: true,
            
            // Automatic HTTPS Rewrites
            automaticHttpsRewrites: true,
            
            // Always Use HTTPS
            alwaysUseHttps: true
        }
    },
    
    // Performance Settings
    performance: {
        // Caching Level (aggressive, basic, simplified)
        cachingLevel: 'aggressive',
        
        // Browser Cache TTL
        browserCacheTtl: 14400, // 4 hours
        
        // Development Mode (bypasses cache)
        developmentMode: false,
        
        // Auto Minify
        minify: {
            css: true,
            html: true,
            js: true
        },
        
        // Brotli Compression
        brotli: true,
        
        // Early Hints
        earlyHints: true,
        
        // HTTP/2 Edge Prioritization
        http2EdgePrioritization: true,
        
        // Image Resizing
        imageResizing: true,
        
        // Mirage (Image optimization)
        mirage: true,
        
        // Polish (Image compression)
        polish: 'lossy',
        
        // Rocket Loader
        rocketLoader: false // Disabled for better compatibility
    },
    
    // Page Rules for specific paths
    pageRules: [
        {
            url: 'lugvia.com/admin*',
            settings: {
                securityLevel: 'high',
                cachingLevel: 'bypass',
                disableApps: true,
                disablePerformance: true
            }
        },
        {
            url: 'lugvia.com/api*',
            settings: {
                securityLevel: 'medium',
                cachingLevel: 'bypass',
                disableApps: true
            }
        },
        {
            url: 'lugvia.com/*.css',
            settings: {
                cachingLevel: 'aggressive',
                browserCacheTtl: 31536000 // 1 year
            }
        },
        {
            url: 'lugvia.com/*.js',
            settings: {
                cachingLevel: 'aggressive',
                browserCacheTtl: 31536000 // 1 year
            }
        },
        {
            url: 'lugvia.com/*.png',
            settings: {
                cachingLevel: 'aggressive',
                browserCacheTtl: 31536000 // 1 year
            }
        }
    ],
    
    // Firewall Rules
    firewallRules: [
        {
            description: 'Block known bad bots',
            expression: '(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine" "Social Media" "Monitoring"})',
            action: 'block'
        },
        {
            description: 'Challenge suspicious countries for admin access',
            expression: '(http.request.uri.path contains "/admin") and (ip.geoip.country in {"CN" "RU" "KP"})',
            action: 'challenge'
        },
        {
            description: 'Rate limit API endpoints',
            expression: '(http.request.uri.path contains "/api/")',
            action: 'challenge',
            rateLimit: {
                threshold: 100,
                period: 60
            }
        }
    ],
    
    // DNS Settings
    dns: {
        // Proxy status for records
        records: [
            { name: 'lugvia.com', type: 'A', proxied: true },
            { name: 'www.lugvia.com', type: 'CNAME', proxied: true },
            { name: 'api.lugvia.com', type: 'CNAME', proxied: true }
        ]
    },
    
    // Workers (if needed)
    workers: {
        // Security headers worker
        securityHeaders: `
            addEventListener('fetch', event => {
                event.respondWith(handleRequest(event.request))
            })
            
            async function handleRequest(request) {
                const response = await fetch(request)
                const newResponse = new Response(response.body, response)
                
                // Add security headers
                newResponse.headers.set('X-Frame-Options', 'DENY')
                newResponse.headers.set('X-Content-Type-Options', 'nosniff')
                newResponse.headers.set('X-XSS-Protection', '1; mode=block')
                newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
                newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
                newResponse.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'")
                
                return newResponse
            }
        `
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cloudflareConfig;
}

// Instructions for Cloudflare Setup:
/*
1. Sign up for Cloudflare account at https://cloudflare.com
2. Add your domain (lugvia.com) to Cloudflare
3. Update your domain's nameservers to Cloudflare's nameservers
4. Configure the settings above in your Cloudflare dashboard:
   - Go to Security > Settings and configure security level
   - Go to Speed > Optimization and enable minification
   - Go to SSL/TLS and set to "Full (strict)"
   - Go to Page Rules and add the rules defined above
   - Go to Firewall > Firewall Rules and add the rules above
5. Enable "Under Attack Mode" if experiencing DDoS
6. Monitor analytics in Cloudflare dashboard

Recommended Cloudflare Plan: Pro ($20/month) for:
- Advanced DDoS protection
- Web Application Firewall (WAF)
- Image optimization
- Mobile optimization
- Advanced analytics
*/