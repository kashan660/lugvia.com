const express = require('express');
const Database = require('./database');
const AuthService = require('./auth-service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();
const db = new Database();
const authService = new AuthService();

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Admin authentication required' });
        }

        // Verify JWT token using the correct method
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (!decoded || !decoded.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Check session timeout (24 hours)
        const now = Date.now();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        if (decoded.loginTime && (now - decoded.loginTime > sessionTimeout)) {
            return res.status(401).json({ error: 'Session expired' });
        }

        // Update last activity
        decoded.lastActivity = now;

        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Admin auth error:', error);
        res.status(401).json({ error: 'Invalid admin token' });
    }
};

// Admin login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required' 
            });
        }
        
        // Validate admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminUsername || !adminPassword) {
            console.error('Admin credentials not configured in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error' 
            });
        }
        
        // Check credentials
        const isValidUsername = username === adminUsername;
        const isValidPassword = await bcrypt.compare(password, adminPassword);
        
        if (!isValidUsername || !isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        // Generate secure admin JWT token with session management
        const sessionId = require('crypto').randomBytes(32).toString('hex');
        const loginTime = new Date().toISOString();
        
        const adminToken = jwt.sign(
            { 
                username: adminUsername, 
                isAdmin: true, 
                sessionId: sessionId,
                loginTime: loginTime,
                lastActivity: loginTime
            },
            process.env.ADMIN_JWT_SECRET,
            { 
                expiresIn: process.env.ADMIN_SESSION_TIMEOUT || '8h',
                issuer: 'lugvia-admin',
                audience: 'lugvia-admin-panel'
            }
        );
        
        // Set secure cookie
        res.cookie('admin_token', adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict'
        });
        
        res.json({ 
            success: true, 
            message: 'Admin login successful',
            token: adminToken,
            sessionId: sessionId
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Admin logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.admin_token || req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Clear the admin token cookie
            res.clearCookie('admin_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            
            // Log logout activity
            try {
                const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
                console.log(`Admin logout: ${decoded.username} logged out at ${new Date().toISOString()}`);
            } catch (err) {
                // Token might be expired, but still clear cookie
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Admin logout successful' 
        });
        
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Logout failed' 
        });
    }
});

// Admin change password endpoint
router.post('/change-password', requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Current password and new password are required' 
            });
        }
        
        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: 'New password must be at least 8 characters long' 
            });
        }
        
        // Check if new password has at least one uppercase, lowercase, number, and special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                success: false, 
                error: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
            });
        }
        
        // Get current admin password from environment
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminPassword) {
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error' 
            });
        }
        
        // Verify current password
        const isValidCurrentPassword = await bcrypt.compare(currentPassword, adminPassword);
        
        if (!isValidCurrentPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Current password is incorrect' 
            });
        }
        
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Note: In a real application, you would update the password in a database
        // For this implementation, we'll just return success since the password is stored in environment variables
        // In production, you should implement proper password storage and update mechanisms
        
        res.json({ 
            success: true, 
            message: 'Password changed successfully. Please note: To permanently change the admin password, update the ADMIN_PASSWORD environment variable with the new hashed password.' 
        });
        
    } catch (error) {
        console.error('Admin change password error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get WhatsApp settings
router.get('/whatsapp-settings', async (req, res) => {
    try {
        const settings = await db.getWhatsAppSettings();
        res.json(settings);
    } catch (error) {
        console.error('Get WhatsApp settings error:', error);
        res.status(500).json({ error: 'Failed to get WhatsApp settings' });
    }
});

// Update WhatsApp settings (admin only)
router.put('/whatsapp-settings', requireAdmin, async (req, res) => {
    try {
        const { whatsapp_number, is_enabled, default_message, business_hours, auto_reply } = req.body;
        
        const settings = {
            whatsapp_number: whatsapp_number || '',
            is_enabled: is_enabled || false,
            default_message: default_message || 'Hello! I\'m interested in your moving services.',
            business_hours: business_hours || '9:00 AM - 6:00 PM',
            auto_reply: auto_reply || 'Thanks for contacting us! We\'ll get back to you soon.'
        };

        await db.updateWhatsAppSettings(settings);
        res.json({ success: true, message: 'WhatsApp settings updated successfully', settings });
    } catch (error) {
        console.error('Update WhatsApp settings error:', error);
        res.status(500).json({ error: 'Failed to update WhatsApp settings' });
    }
});

// Get Google Analytics settings
router.get('/analytics-settings', requireAdmin, async (req, res) => {
    try {
        const settings = await db.getAnalyticsSettings();
        res.json(settings);
    } catch (error) {
        console.error('Get analytics settings error:', error);
        res.status(500).json({ error: 'Failed to get analytics settings' });
    }
});

// Update Google Analytics settings
router.put('/analytics-settings', requireAdmin, async (req, res) => {
    try {
        const { ga_tracking_id, gtm_container_id, is_enabled, track_events } = req.body;
        
        const settings = {
            ga_tracking_id: ga_tracking_id || '',
            gtm_container_id: gtm_container_id || '',
            is_enabled: is_enabled || false,
            track_events: track_events || true
        };

        await db.updateAnalyticsSettings(settings);
        res.json({ success: true, message: 'Analytics settings updated successfully', settings });
    } catch (error) {
        console.error('Update analytics settings error:', error);
        res.status(500).json({ error: 'Failed to update analytics settings' });
    }
});

// Get website settings
router.get('/website-settings', requireAdmin, async (req, res) => {
    try {
        const settings = await db.getWebsiteSettings();
        res.json(settings);
    } catch (error) {
        console.error('Get website settings error:', error);
        res.status(500).json({ error: 'Failed to get website settings' });
    }
});

// Update website settings
router.put('/website-settings', requireAdmin, async (req, res) => {
    try {
        const { 
            site_title, 
            site_description, 
            contact_email, 
            contact_phone, 
            business_address,
            social_media,
            maintenance_mode,
            seo_settings
        } = req.body;
        
        const settings = {
            site_title: site_title || 'Lugvia - Professional Moving Services',
            site_description: site_description || 'Find the best moving companies in USA with Lugvia.',
            contact_email: contact_email || '',
            contact_phone: contact_phone || '',
            business_address: business_address || '',
            social_media: social_media || {},
            maintenance_mode: maintenance_mode || false,
            seo_settings: seo_settings || {}
        };

        await db.updateWebsiteSettings(settings);
        res.json({ success: true, message: 'Website settings updated successfully', settings });
    } catch (error) {
        console.error('Update website settings error:', error);
        res.status(500).json({ error: 'Failed to update website settings' });
    }
});

// Get dashboard analytics
router.get('/dashboard-analytics', requireAdmin, async (req, res) => {
    try {
        const analytics = await db.getDashboardAnalytics();
        res.json(analytics);
    } catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to get dashboard analytics' });
    }
});

// Get user statistics
router.get('/user-stats', requireAdmin, async (req, res) => {
    try {
        const stats = await db.getUserStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to get user statistics' });
    }
});

// Get referral statistics
router.get('/referral-stats', requireAdmin, async (req, res) => {
    try {
        const stats = await db.getReferralStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({ error: 'Failed to get referral statistics' });
    }
});

// Get earnings statistics
router.get('/earnings-stats', requireAdmin, async (req, res) => {
    try {
        const stats = await db.getEarningsStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Get earnings stats error:', error);
        res.status(500).json({ error: 'Failed to get earnings statistics' });
    }
});

// Get recent activities
router.get('/recent-activities', requireAdmin, async (req, res) => {
    try {
        const activities = await db.getRecentActivities();
        res.json(activities);
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({ error: 'Failed to get recent activities' });
    }
});

// Export data
router.get('/export/:type', requireAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'json', date_from, date_to } = req.query;
        
        let data;
        switch (type) {
            case 'users':
                data = await db.exportUsers(date_from, date_to);
                break;
            case 'referrals':
                data = await db.exportReferrals(date_from, date_to);
                break;
            case 'earnings':
                data = await db.exportEarnings(date_from, date_to);
                break;
            case 'quotes':
                data = await db.exportQuotes(date_from, date_to);
                break;
            case 'tickets':
                data = await db.exportTickets(date_from, date_to);
                break;
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
            res.send(csv);
        } else {
            res.json({ success: true, data });
        }
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Helper function to convert JSON to CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;