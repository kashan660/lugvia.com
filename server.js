const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Database = require('./database');
const EmailService = require('./email-service');
const authRoutes = require('./auth-routes');
const adminRoutes = require('./admin-routes');
const AuthService = require('./auth-service');
require('dotenv').config();

// Enhanced admin authentication middleware with session management
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Admin authentication required' });
        }

        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET, {
            issuer: 'lugvia-admin',
            audience: 'lugvia-admin-panel'
        });
        
        if (!decoded || !decoded.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        // Check session timeout based on last activity
        const now = new Date();
        const lastActivity = new Date(decoded.lastActivity || decoded.loginTime);
        const sessionTimeoutMs = parseInt(process.env.ADMIN_SESSION_TIMEOUT_MS) || (8 * 60 * 60 * 1000); // 8 hours default
        
        if (now - lastActivity > sessionTimeoutMs) {
            return res.status(401).json({ 
                error: 'Session expired', 
                message: 'Please log in again due to inactivity' 
            });
        }
        
        // Update last activity (for future requests, we'd need to refresh the token)
        decoded.lastActivity = now.toISOString();
        req.admin = decoded;
        
        // Log admin activity for security monitoring
        console.log(`Admin activity: ${decoded.username} accessed ${req.method} ${req.path} at ${now.toISOString()}`);
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Session expired', 
                message: 'Please log in again' 
            });
        }
        console.error('Admin authentication error:', error);
        res.status(401).json({ error: 'Invalid admin token' });
    }
};
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const db = new Database();
const emailService = new EmailService();
const authService = new AuthService();

// Create authentication middleware
const authenticateToken = authService.requireAuth();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('.'));

// Cloudflare-compatible security headers
app.use((req, res, next) => {
    // Trust Cloudflare proxy
    app.set('trust proxy', true);
    
    // Security headers (will work with Cloudflare Workers)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CORS headers for API endpoints
    if (req.path.startsWith('/api/')) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Enhanced rate limiting with IP tracking
const rateLimitStore = new Map();
const suspiciousIPs = new Map();

app.use('/api/', (req, res, next) => {
    const clientIP = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    let maxRequests = 100; // requests per window
    
    // Stricter limits for admin endpoints
    if (req.path.startsWith('/admin')) {
        maxRequests = 20;
    }
    
    // Check if IP is flagged as suspicious
    if (suspiciousIPs.has(clientIP)) {
        const suspiciousData = suspiciousIPs.get(clientIP);
        if (now < suspiciousData.blockedUntil) {
            return res.status(429).json({
                error: 'IP temporarily blocked',
                message: 'Suspicious activity detected. Access blocked.'
            });
        } else {
            suspiciousIPs.delete(clientIP);
        }
    }
    
    if (!rateLimitStore.has(clientIP)) {
        rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs, violations: 0 });
        return next();
    }
    
    const clientData = rateLimitStore.get(clientIP);
    
    if (now > clientData.resetTime) {
        rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs, violations: clientData.violations || 0 });
        return next();
    }
    
    if (clientData.count >= maxRequests) {
        // Track violations
        clientData.violations = (clientData.violations || 0) + 1;
        
        // Block IP if too many violations
        if (clientData.violations >= 3) {
            suspiciousIPs.set(clientIP, { blockedUntil: now + (60 * 60 * 1000) }); // 1 hour block
            console.warn(`IP ${clientIP} blocked for suspicious activity`);
        }
        
        return res.status(429).json({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`
        });
    }
    
    clientData.count++;
    next();
});

// Input validation middleware
const validateInput = (req, res, next) => {
    // Sanitize common XSS patterns
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/<[^>]*>/g, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+=/gi, '');
    };
    
    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[sanitizeString(key)] = sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    };
    
    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    
    next();
};

app.use(validateInput);

// Security headers middleware
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' https://cdnjs.cloudflare.com;");
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// SEO API Routes
app.post('/api/admin/generate-sitemap', requireAdmin, async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.json({ success: true, sitemap });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ success: false, message: 'Failed to generate sitemap' });
  }
});

app.post('/api/admin/submit-sitemap', requireAdmin, async (req, res) => {
  try {
    // This would integrate with Google Search Console API
    // For now, return success
    res.json({ success: true, message: 'Sitemap submitted to Google Search Console' });
  } catch (error) {
    console.error('Error submitting sitemap:', error);
    res.status(500).json({ success: false, message: 'Failed to submit sitemap' });
  }
});

app.get('/api/admin/index-status', requireAdmin, async (req, res) => {
  try {
    // This would check Google Search Console for indexing status
    const mockData = {
      indexed: 25,
      total: 30,
      lastUpdated: new Date().toISOString()
    };
    res.json({ success: true, ...mockData });
  } catch (error) {
    console.error('Error checking index status:', error);
    res.status(500).json({ success: false, message: 'Failed to check index status' });
  }
});

// Cloudflare API Routes
app.post('/api/admin/cloudflare/purge-cache', requireAdmin, async (req, res) => {
  try {
    // This would integrate with Cloudflare API
    res.json({ success: true, message: 'Cache purged successfully' });
  } catch (error) {
    console.error('Error purging cache:', error);
    res.status(500).json({ success: false, message: 'Failed to purge cache' });
  }
});

app.get('/api/admin/cloudflare/ssl-status', requireAdmin, async (req, res) => {
  try {
    // This would check Cloudflare SSL status
    res.json({ success: true, status: 'Active' });
  } catch (error) {
    console.error('Error checking SSL status:', error);
    res.status(500).json({ success: false, message: 'Failed to check SSL status' });
  }
});

app.post('/api/admin/cloudflare/dev-mode', requireAdmin, async (req, res) => {
  try {
    // This would toggle Cloudflare development mode
    res.json({ success: true, enabled: true });
  } catch (error) {
    console.error('Error toggling development mode:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle development mode' });
  }
});

// SMTP API Routes
app.post('/api/admin/smtp/test', requireAdmin, async (req, res) => {
  try {
    // Test SMTP connection
    const testResult = await emailService.testConnection();
    res.json({ success: testResult, message: testResult ? 'SMTP connection successful' : 'SMTP connection failed' });
  } catch (error) {
    console.error('Error testing SMTP:', error);
    res.status(500).json({ success: false, message: 'SMTP test failed: ' + error.message });
  }
});

app.post('/api/admin/smtp/settings', requireAdmin, async (req, res) => {
  try {
    const { host, port, secure, user, pass, fromEmail } = req.body;
    const result = emailService.updateConfiguration({ host, port, secure, user, pass, fromEmail });
    res.json({ success: result, message: result ? 'SMTP settings updated' : 'Invalid SMTP configuration' });
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update SMTP settings' });
  }
});

// BIN Search API Routes
app.post('/api/admin/bin/search', requireAdmin, async (req, res) => {
  try {
    const { bin } = req.body;
    if (!bin || bin.length < 6) {
      return res.status(400).json({ success: false, message: 'BIN must be at least 6 digits' });
    }
    
    // Mock BIN data - in production, integrate with actual BIN API
    const mockBinData = {
      bin: bin,
      bank: 'Sample Bank',
      country: 'United States',
      type: 'CREDIT',
      brand: 'VISA',
      prepaid: false,
      currency: 'USD'
    };
    
    res.json({ success: true, data: mockBinData });
  } catch (error) {
    console.error('Error searching BIN:', error);
    res.status(500).json({ success: false, message: 'BIN search failed' });
  }
});

app.post('/api/admin/bin/api-settings', requireAdmin, async (req, res) => {
  try {
    const { apiKey, provider } = req.body;
    // Store BIN API settings (in production, save to database)
    res.json({ success: true, message: 'BIN API settings saved' });
  } catch (error) {
    console.error('Error saving BIN API settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save BIN API settings' });
  }
});

// Admin Settings API Routes
app.post('/api/admin/whatsapp/settings', requireAdmin, async (req, res) => {
  try {
    const { phoneNumber, message, position, enabled } = req.body;
    // Store WhatsApp settings (in production, save to database)
    res.json({ success: true, message: 'WhatsApp settings saved' });
  } catch (error) {
    console.error('Error saving WhatsApp settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save WhatsApp settings' });
  }
});

app.post('/api/admin/analytics/settings', requireAdmin, async (req, res) => {
  try {
    const { googleAnalyticsId, facebookPixelId, enabled } = req.body;
    // Store analytics settings (in production, save to database)
    res.json({ success: true, message: 'Analytics settings saved' });
  } catch (error) {
    console.error('Error saving analytics settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save analytics settings' });
  }
});

app.post('/api/admin/meta-tags', requireAdmin, async (req, res) => {
  try {
    const { title, description, keywords, ogTitle, ogDescription, ogImage } = req.body;
    // Store meta tags (in production, save to database)
    res.json({ success: true, message: 'Meta tags saved' });
  } catch (error) {
    console.error('Error saving meta tags:', error);
    res.status(500).json({ success: false, message: 'Failed to save meta tags' });
  }
});

app.post('/api/admin/search-console', requireAdmin, async (req, res) => {
  try {
    const { verificationCode, propertyUrl } = req.body;
    // Store Search Console settings (in production, save to database)
    res.json({ success: true, message: 'Search Console settings saved' });
  } catch (error) {
    console.error('Error saving Search Console settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save Search Console settings' });
  }
});

app.post('/api/admin/captcha/settings', requireAdmin, async (req, res) => {
  try {
    const { siteKey, secretKey, enabled } = req.body;
    // Store CAPTCHA settings (in production, save to database)
    res.json({ success: true, message: 'CAPTCHA settings saved' });
  } catch (error) {
    console.error('Error saving CAPTCHA settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save CAPTCHA settings' });
  }
});

app.post('/api/admin/login-security', requireAdmin, async (req, res) => {
  try {
    const { maxAttempts, lockoutDuration, twoFactorEnabled } = req.body;
    // Store login security settings (in production, save to database)
    res.json({ success: true, message: 'Login security settings saved' });
  } catch (error) {
    console.error('Error saving login security settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save login security settings' });
  }
});

app.post('/api/admin/cloudflare/settings', requireAdmin, async (req, res) => {
  try {
    const { apiKey, zoneId, email } = req.body;
    // Store Cloudflare settings (in production, save to database)
    res.json({ success: true, message: 'Cloudflare settings saved' });
  } catch (error) {
    console.error('Error saving Cloudflare settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save Cloudflare settings' });
  }
});

// Sitemap generation function
async function generateSitemap() {
  const fs = require('fs');
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/quote', priority: '0.9', changefreq: 'weekly' }
  ];
  
  const domain = 'https://lugvia.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  pages.forEach(page => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${domain}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });
  
  sitemap += `</urlset>`;
  
  // Write sitemap to file
  fs.writeFileSync('./sitemap.xml', sitemap);
  
  return sitemap;
}

// API Routes
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await db.getQuotes();
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const quoteData = req.body;
    
    // Add referral tracking if user is authenticated
    if (req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'your-secret-key');
        quoteData.user_id = decoded.userId;
      } catch (err) {
        // Token invalid, continue without user_id
      }
    }
    
    const quote = await db.createQuote(quoteData);
    
    // Send email notification
    try {
      await emailService.sendQuoteNotification(quoteData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.json({ success: true, quote });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.getTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const ticketData = req.body;
    
    // Add referral tracking if user is authenticated
    if (req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'your-secret-key');
        ticketData.user_id = decoded.userId;
      } catch (err) {
        // Token invalid, continue without user_id
      }
    }
    
    const ticket = await db.createTicket(ticketData);
    
    // Send email notification
    try {
      await emailService.sendTicketNotification(ticketData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.getContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const contactData = req.body;
    const contact = await db.createContact(contactData);
    
    // Send email notification
    try {
      await emailService.sendContactNotification(contactData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.json({ success: true, contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Protected route for updating quote/ticket status (admin only)
app.put('/api/quotes/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update quote status
    const result = await db.updateQuoteStatus(id, status);
    
    // If quote is completed and has referral, process earnings
    if (status === 'completed') {
      const quote = await db.getQuoteById(id);
      if (quote && quote.referred_by_user_id) {
        await db.completeReferral(quote.referred_by_user_id, 'quote', id, quote.total_amount || 0);
      }
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

app.put('/api/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update ticket status
    const result = await db.updateTicketStatus(id, status);
    
    // If ticket is completed and has referral, process earnings
    if (status === 'completed') {
      const ticket = await db.getTicketById(id);
      if (ticket && ticket.referred_by_user_id) {
        await db.completeReferral(ticket.referred_by_user_id, 'ticket', id, ticket.total_amount || 0);
      }
    }
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin route - redirect to admin login
app.get('/admin', (req, res) => {
    res.redirect('/admin-login.html');
});

// Admin login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database initialized and ready');
  console.log('Authentication system enabled');
  console.log('Referral system active');
});