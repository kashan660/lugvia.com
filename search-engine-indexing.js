const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');

class SearchEngineIndexing {
    constructor() {
        this.domain = process.env.DOMAIN || 'https://lugvia.com';
        this.googleCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) : null;
        this.bingApiKey = process.env.BING_WEBMASTER_API_KEY;
        this.yandexUserId = process.env.YANDEX_USER_ID;
        this.yandexApiKey = process.env.YANDEX_API_KEY;
        
        // Initialize Google Search Console API
        if (this.googleCredentials) {
            this.googleAuth = new google.auth.GoogleAuth({
                credentials: this.googleCredentials,
                scopes: ['https://www.googleapis.com/auth/webmasters']
            });
            this.searchConsole = google.searchconsole({ version: 'v1', auth: this.googleAuth });
            this.indexing = google.indexing({ version: 'v3', auth: this.googleAuth });
        }
    }

    // Generate comprehensive XML sitemap
    async generateSitemap() {
        try {
            const pages = await this.getAllPages();
            const currentDate = new Date().toISOString().split('T')[0];
            
            let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" `;
            sitemap += `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" `;
            sitemap += `xmlns:xhtml="http://www.w3.org/1999/xhtml" `;
            sitemap += `xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" `;
            sitemap += `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" `;
            sitemap += `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;
            
            for (const page of pages) {
                sitemap += `  <url>\n`;
                sitemap += `    <loc>${this.domain}${page.url}</loc>\n`;
                sitemap += `    <lastmod>${page.lastmod || currentDate}</lastmod>\n`;
                sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
                sitemap += `    <priority>${page.priority}</priority>\n`;
                
                // Add mobile annotation for mobile-friendly pages
                if (page.mobile) {
                    sitemap += `    <mobile:mobile/>\n`;
                }
                
                // Add images if any
                if (page.images && page.images.length > 0) {
                    for (const image of page.images) {
                        sitemap += `    <image:image>\n`;
                        sitemap += `      <image:loc>${this.domain}${image.url}</image:loc>\n`;
                        if (image.title) sitemap += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
                        if (image.caption) sitemap += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
                        sitemap += `    </image:image>\n`;
                    }
                }
                
                sitemap += `  </url>\n`;
            }
            
            sitemap += `</urlset>`;
            
            // Write sitemap to file
            const sitemapPath = path.join(__dirname, 'sitemap.xml');
            fs.writeFileSync(sitemapPath, sitemap);
            
            // Generate sitemap index if needed
            await this.generateSitemapIndex();
            
            return sitemap;
        } catch (error) {
            console.error('Error generating sitemap:', error);
            throw error;
        }
    }

    // Generate sitemap index for large sites
    async generateSitemapIndex() {
        const sitemaps = [
            { url: '/sitemap.xml', lastmod: new Date().toISOString().split('T')[0] }
        ];
        
        let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        sitemapIndex += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        for (const sitemap of sitemaps) {
            sitemapIndex += `  <sitemap>\n`;
            sitemapIndex += `    <loc>${this.domain}${sitemap.url}</loc>\n`;
            sitemapIndex += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
            sitemapIndex += `  </sitemap>\n`;
        }
        
        sitemapIndex += `</sitemapindex>`;
        
        const indexPath = path.join(__dirname, 'sitemap-index.xml');
        fs.writeFileSync(indexPath, sitemapIndex);
        
        return sitemapIndex;
    }

    // Get all pages for sitemap
    async getAllPages() {
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily', mobile: true, images: [{ url: '/hero-image.webp', title: 'Lugvia Moving Services' }] },
            { url: '/local-moving.html', priority: '0.9', changefreq: 'weekly', mobile: true, images: [{ url: '/local moving.webp', title: 'Local Moving Services' }] },
            { url: '/long-distance.html', priority: '0.9', changefreq: 'weekly', mobile: true, images: [{ url: '/long distance.webp', title: 'Long Distance Moving' }] },
            { url: '/packing-services.html', priority: '0.9', changefreq: 'weekly', mobile: true, images: [{ url: '/packing.webp', title: 'Packing Services' }] },
            { url: '/storage.html', priority: '0.9', changefreq: 'weekly', mobile: true, images: [{ url: '/storage.webp', title: 'Storage Solutions' }] },
            { url: '/contact.html', priority: '0.8', changefreq: 'monthly', mobile: true },
            { url: '/blog.html', priority: '0.8', changefreq: 'daily', mobile: true },
            { url: '/help-center.html', priority: '0.7', changefreq: 'weekly', mobile: true },
            { url: '/support.html', priority: '0.7', changefreq: 'weekly', mobile: true },
            { url: '/ai-chat.html', priority: '0.6', changefreq: 'monthly', mobile: true },
            { url: '/login.html', priority: '0.5', changefreq: 'monthly', mobile: true },
            { url: '/privacy.html', priority: '0.4', changefreq: 'yearly', mobile: true },
            { url: '/terms.html', priority: '0.4', changefreq: 'yearly', mobile: true }
        ];

        // Add dynamic pages (blogs, services, etc.) if database is available
        try {
            const Database = require('./database');
            const db = new Database();
            
            // Add blog posts
            const blogs = await db.getBlogs();
            if (blogs && blogs.length > 0) {
                for (const blog of blogs) {
                    staticPages.push({
                        url: `/blog/${blog.slug || blog.id}`,
                        priority: '0.7',
                        changefreq: 'weekly',
                        lastmod: blog.updated_at || blog.created_at,
                        mobile: true
                    });
                }
            }
            
            // Add service pages
            const services = await db.getServices();
            if (services && services.length > 0) {
                for (const service of services) {
                    staticPages.push({
                        url: `/services/${service.slug || service.id}`,
                        priority: '0.8',
                        changefreq: 'monthly',
                        lastmod: service.updated_at || service.created_at,
                        mobile: true
                    });
                }
            }
        } catch (error) {
            console.log('Database not available for dynamic pages:', error.message);
        }

        return staticPages;
    }

    // Submit sitemap to Google Search Console
    async submitToGoogle() {
        if (!this.searchConsole) {
            throw new Error('Google Search Console not configured');
        }

        try {
            const sitemapUrl = `${this.domain}/sitemap.xml`;
            
            await this.searchConsole.sitemaps.submit({
                siteUrl: this.domain,
                feedpath: sitemapUrl
            });

            console.log('Sitemap submitted to Google Search Console successfully');
            return { success: true, message: 'Sitemap submitted to Google' };
        } catch (error) {
            console.error('Error submitting sitemap to Google:', error);
            throw error;
        }
    }

    // Submit individual URL to Google for indexing
    async submitUrlToGoogle(url) {
        if (!this.indexing) {
            throw new Error('Google Indexing API not configured');
        }

        try {
            const fullUrl = url.startsWith('http') ? url : `${this.domain}${url}`;
            
            await this.indexing.urlNotifications.publish({
                requestBody: {
                    url: fullUrl,
                    type: 'URL_UPDATED'
                }
            });

            console.log(`URL ${fullUrl} submitted to Google for indexing`);
            return { success: true, url: fullUrl };
        } catch (error) {
            console.error('Error submitting URL to Google:', error);
            throw error;
        }
    }

    // Submit sitemap to Bing Webmaster Tools
    async submitToBing() {
        if (!this.bingApiKey) {
            throw new Error('Bing Webmaster API key not configured');
        }

        try {
            const sitemapUrl = `${this.domain}/sitemap.xml`;
            
            const response = await axios.post(
                `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${this.bingApiKey}`,
                {
                    siteUrl: this.domain,
                    urlList: [sitemapUrl]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Sitemap submitted to Bing successfully');
            return { success: true, message: 'Sitemap submitted to Bing' };
        } catch (error) {
            console.error('Error submitting sitemap to Bing:', error);
            throw error;
        }
    }

    // Submit URL to Bing for indexing
    async submitUrlToBing(url) {
        if (!this.bingApiKey) {
            throw new Error('Bing Webmaster API key not configured');
        }

        try {
            const fullUrl = url.startsWith('http') ? url : `${this.domain}${url}`;
            
            const response = await axios.post(
                `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${this.bingApiKey}`,
                {
                    siteUrl: this.domain,
                    url: fullUrl
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`URL ${fullUrl} submitted to Bing for indexing`);
            return { success: true, url: fullUrl };
        } catch (error) {
            console.error('Error submitting URL to Bing:', error);
            throw error;
        }
    }

    // Submit to Yandex Webmaster
    async submitToYandex() {
        if (!this.yandexApiKey || !this.yandexUserId) {
            throw new Error('Yandex Webmaster API credentials not configured');
        }

        try {
            const sitemapUrl = `${this.domain}/sitemap.xml`;
            
            const response = await axios.post(
                `https://api.webmaster.yandex.net/v4/user/${this.yandexUserId}/hosts/${this.domain}/sitemaps`,
                {
                    url: sitemapUrl
                },
                {
                    headers: {
                        'Authorization': `OAuth ${this.yandexApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Sitemap submitted to Yandex successfully');
            return { success: true, message: 'Sitemap submitted to Yandex' };
        } catch (error) {
            console.error('Error submitting sitemap to Yandex:', error);
            throw error;
        }
    }

    // Submit to all search engines
    async submitToAllSearchEngines() {
        const results = {
            google: null,
            bing: null,
            yandex: null
        };

        // Submit to Google
        try {
            results.google = await this.submitToGoogle();
        } catch (error) {
            results.google = { success: false, error: error.message };
        }

        // Submit to Bing
        try {
            results.bing = await this.submitToBing();
        } catch (error) {
            results.bing = { success: false, error: error.message };
        }

        // Submit to Yandex
        try {
            results.yandex = await this.submitToYandex();
        } catch (error) {
            results.yandex = { success: false, error: error.message };
        }

        return results;
    }

    // Submit URL to all search engines
    async submitUrlToAllSearchEngines(url) {
        const results = {
            google: null,
            bing: null
        };

        // Submit to Google
        try {
            results.google = await this.submitUrlToGoogle(url);
        } catch (error) {
            results.google = { success: false, error: error.message };
        }

        // Submit to Bing
        try {
            results.bing = await this.submitUrlToBing(url);
        } catch (error) {
            results.bing = { success: false, error: error.message };
        }

        return results;
    }

    // Generate robots.txt
    generateRobotsTxt() {
        const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.domain}/sitemap.xml
Sitemap: ${this.domain}/sitemap-index.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /admin-login.html
Disallow: /admin.html
Disallow: /admin-panel.html

# Disallow API endpoints
Disallow: /api/

# Disallow temporary files
Disallow: /*.tmp$
Disallow: /*.temp$

# Allow important files
Allow: /robots.txt
Allow: /sitemap.xml
Allow: /favicon.ico

# Crawl delay for different bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: Slurp
Crawl-delay: 3

User-agent: DuckDuckBot
Crawl-delay: 2

User-agent: Baiduspider
Crawl-delay: 5

User-agent: YandexBot
Crawl-delay: 3`;

        const robotsPath = path.join(__dirname, 'robots.txt');
        fs.writeFileSync(robotsPath, robotsTxt);
        
        return robotsTxt;
    }

    // Get indexing status from Google
    async getGoogleIndexingStatus() {
        if (!this.searchConsole) {
            throw new Error('Google Search Console not configured');
        }

        try {
            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: this.domain,
                requestBody: {
                    startDate: '2024-01-01',
                    endDate: new Date().toISOString().split('T')[0],
                    dimensions: ['page'],
                    rowLimit: 1000
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting Google indexing status:', error);
            throw error;
        }
    }

    // Utility function to escape XML characters
    escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    // Ping search engines about sitemap updates
    async pingSearchEngines() {
        const sitemapUrl = encodeURIComponent(`${this.domain}/sitemap.xml`);
        const pingUrls = [
            `http://www.google.com/webmasters/tools/ping?sitemap=${sitemapUrl}`,
            `http://www.bing.com/ping?sitemap=${sitemapUrl}`,
            `http://submissions.ask.com/ping?sitemap=${sitemapUrl}`,
            `http://blogs.yandex.ru/pings/?status=success&url=${sitemapUrl}`
        ];

        const results = [];
        
        for (const pingUrl of pingUrls) {
            try {
                const response = await axios.get(pingUrl, { timeout: 10000 });
                results.push({ url: pingUrl, success: true, status: response.status });
            } catch (error) {
                results.push({ url: pingUrl, success: false, error: error.message });
            }
        }

        return results;
    }
}

module.exports = SearchEngineIndexing;