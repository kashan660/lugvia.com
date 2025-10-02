const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Database = require('./database');

class AuthService {
    constructor() {
        this.db = new Database();
        this.jwtSecret = process.env.JWT_SECRET || 'lugvia-secret-key-2024';
        this.saltRounds = 12;
    }

    // Generate secure random token
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    // Verify password
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // Generate JWT token
    generateJWT(user) {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                referral_code: user.referral_code 
            },
            this.jwtSecret,
            { expiresIn: '7d' }
        );
    }

    // Verify JWT token
    verifyJWT(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }

    // Register new user
    async register(userData) {
        try {
            // Validate input
            if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
                throw new Error('Missing required fields');
            }

            // Check if user already exists
            const existingUser = await this.db.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Validate referral code if provided
            if (userData.referral_code) {
                const referrer = await this.db.query(
                    'SELECT id FROM users WHERE referral_code = ?',
                    [userData.referral_code]
                );
                if (referrer.length === 0) {
                    throw new Error('Invalid referral code');
                }
            }

            // Hash password
            const password_hash = await this.hashPassword(userData.password);

            // Create user
            const newUser = await this.db.createUser({
                email: userData.email,
                password_hash,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                referred_by_code: userData.referral_code
            });

            // Generate verification token
            const verificationToken = this.generateToken();
            await this.db.query(
                'UPDATE users SET verification_token = ? WHERE id = ?',
                [verificationToken, newUser.id]
            );

            return {
                success: true,
                user: {
                    id: newUser.id,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    referral_code: newUser.referral_code
                },
                verification_token: verificationToken
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(email, password, ipAddress, userAgent) {
        try {
            // Get user by email
            const user = await this.db.getUserByEmail(email);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isValidPassword = await this.verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            // Generate session token
            const sessionToken = this.generateToken();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            // Create session
            await this.db.createSession(user.id, sessionToken, expiresAt, ipAddress, userAgent);

            // Generate JWT
            const jwtToken = this.generateJWT(user);

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    referral_code: user.referral_code,
                    total_earnings: user.total_earnings,
                    total_referrals: user.total_referrals,
                    email_verified: user.email_verified
                },
                token: jwtToken,
                session_token: sessionToken
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    async logout(sessionToken) {
        try {
            await this.db.deleteSession(sessionToken);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Verify user session
    async verifySession(sessionToken) {
        try {
            const session = await this.db.getSession(sessionToken);
            if (!session) {
                return null;
            }

            return {
                id: session.user_id,
                email: session.email,
                first_name: session.first_name,
                last_name: session.last_name,
                referral_code: session.referral_code
            };
        } catch (error) {
            console.error('Session verification error:', error);
            return null;
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const user = await this.db.query(
                'SELECT id FROM users WHERE verification_token = ?',
                [token]
            );

            if (user.length === 0) {
                throw new Error('Invalid verification token');
            }

            await this.db.updateUserVerification(user[0].id, true);
            return { success: true };
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    // Generate password reset token
    async generatePasswordResetToken(email) {
        try {
            const user = await this.db.getUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            const resetToken = this.generateToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await this.db.query(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                [resetToken, expiresAt, user.id]
            );

            return { success: true, reset_token: resetToken };
        } catch (error) {
            console.error('Password reset token error:', error);
            throw error;
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            const user = await this.db.query(
                'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
                [token]
            );

            if (user.length === 0) {
                throw new Error('Invalid or expired reset token');
            }

            const password_hash = await this.hashPassword(newPassword);
            await this.db.query(
                'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                [password_hash, user[0].id]
            );

            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    // Middleware for protecting routes
    requireAuth() {
        return async (req, res, next) => {
            try {
                const token = req.cookies.session_token || req.headers.authorization?.replace('Bearer ', '');
                
                if (!token) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                const user = await this.verifySession(token);
                if (!user) {
                    return res.status(401).json({ error: 'Invalid session' });
                }

                req.user = user;
                next();
            } catch (error) {
                console.error('Auth middleware error:', error);
                res.status(401).json({ error: 'Authentication failed' });
            }
        };
    }
}

module.exports = AuthService;