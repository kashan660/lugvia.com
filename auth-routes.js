const express = require('express');
const AuthService = require('./auth-service');
const Database = require('./database');

const router = express.Router();
const authService = new AuthService();
const db = new Database();

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone, referral_code } = req.body;
        
        // Validate input
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: email, password, first_name, last_name' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const result = await authService.register({
            email: email.toLowerCase(),
            password,
            first_name,
            last_name,
            phone,
            referral_code
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: result.user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        const result = await authService.login(
            email.toLowerCase(), 
            password, 
            ipAddress, 
            userAgent
        );

        // Set session cookie
        res.cookie('session_token', result.session_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const sessionToken = req.cookies.session_token;
        
        if (sessionToken) {
            await authService.logout(sessionToken);
        }

        res.clearCookie('session_token');
        res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Get current user endpoint
router.get('/me', authService.requireAuth(), async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's referral and earnings summary
        const referrals = await db.getUserReferrals(user.id);
        const earningsSummary = await db.getUserEarningsSummary(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                referral_code: user.referral_code,
                total_earnings: user.total_earnings,
                total_referrals: user.total_referrals,
                email_verified: user.email_verified,
                created_at: user.created_at
            },
            referrals: referrals,
            earnings: earningsSummary
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Verify email endpoint
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        await authService.verifyEmail(token);
        
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        await authService.generatePasswordResetToken(email.toLowerCase());
        
        res.json({ 
            success: true, 
            message: 'Password reset instructions sent to your email' 
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        // Don't reveal if email exists or not
        res.json({ 
            success: true, 
            message: 'Password reset instructions sent to your email' 
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        await authService.resetPassword(token, password);
        
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get user referrals
router.get('/referrals', authService.requireAuth(), async (req, res) => {
    try {
        const referrals = await db.getUserReferrals(req.user.id);
        res.json({ success: true, referrals });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ error: 'Failed to get referrals' });
    }
});

// Get user earnings
router.get('/earnings', authService.requireAuth(), async (req, res) => {
    try {
        const earnings = await db.getUserEarnings(req.user.id);
        const summary = await db.getUserEarningsSummary(req.user.id);
        
        res.json({ 
            success: true, 
            earnings,
            summary
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ error: 'Failed to get earnings' });
    }
});

// Generate referral link
router.get('/referral-link', authService.requireAuth(), async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const referralLink = `${baseUrl}/?ref=${user.referral_code}`;
        
        res.json({ 
            success: true, 
            referral_code: user.referral_code,
            referral_link: referralLink
        });
    } catch (error) {
        console.error('Get referral link error:', error);
        res.status(500).json({ error: 'Failed to get referral link' });
    }
});

// Track referral click (for analytics)
router.post('/track-referral', async (req, res) => {
    try {
        const { referral_code, email } = req.body;
        
        if (!referral_code) {
            return res.status(400).json({ error: 'Referral code is required' });
        }

        // Create pending referral record
        await db.createReferralRecord(referral_code, email || null);
        
        res.json({ success: true, message: 'Referral tracked' });
    } catch (error) {
        console.error('Track referral error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;