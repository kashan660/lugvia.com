const { pool, testConnection, initializeTables } = require('./db-config');

class Database {
    constructor() {
        this.pool = pool;
        this.init();
    }

    async init() {
        try {
            await testConnection();
            await initializeTables();
            console.log('✅ Database initialized successfully!');
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    // Ticket methods
    async createTicket(ticketData) {
        const sql = `
            INSERT INTO tickets (title, description, status, priority, category, customer_name, customer_email, customer_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            ticketData.title,
            ticketData.description,
            ticketData.status || 'open',
            ticketData.priority || 'medium',
            ticketData.category,
            ticketData.customerName,
            ticketData.customerEmail,
            ticketData.customerPhone
        ];
        
        const result = await this.query(sql, params);
        return { id: result.insertId, ...ticketData };
    }

    async getTickets() {
        const sql = 'SELECT * FROM tickets ORDER BY created_at DESC';
        return await this.query(sql);
    }

    async getTicketById(id) {
        const sql = 'SELECT * FROM tickets WHERE id = ?';
        const tickets = await this.query(sql, [id]);
        return tickets[0] || null;
    }

    async updateTicket(id, updateData) {
        const fields = [];
        const params = [];
        
        Object.keys(updateData).forEach(key => {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                params.push(updateData[key]);
            }
        });
        
        if (fields.length === 0) return null;
        
        params.push(id);
        const sql = `UPDATE tickets SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        await this.query(sql, params);
        return await this.getTicketById(id);
    }

    async deleteTicket(id) {
        const sql = 'DELETE FROM tickets WHERE id = ?';
        const result = await this.query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Get tickets by status
    getTicketsByStatus(status) {
        return this.tickets.filter(ticket => ticket.status === status);
    }

    // Get tickets by priority
    getTicketsByPriority(priority) {
        return this.tickets.filter(ticket => ticket.priority === priority);
    }

    // Get tickets by category
    getTicketsByCategory(category) {
        return this.tickets.filter(ticket => ticket.category === category);
    }

    // Get ticket statistics
    getTicketStats() {
        const stats = {
            total: this.tickets.length,
            open: 0,
            'in-progress': 0,
            resolved: 0,
            closed: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        this.tickets.forEach(ticket => {
            // Count by status
            if (stats.hasOwnProperty(ticket.status)) {
                stats[ticket.status]++;
            }
            
            // Count by priority
            if (stats.hasOwnProperty(ticket.priority)) {
                stats[ticket.priority]++;
            }
        });

        return stats;
    }

    // Search tickets
    searchTickets(query) {
        const searchTerm = query.toLowerCase();
        return this.tickets.filter(ticket => 
            ticket.subject.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm) ||
            ticket.name.toLowerCase().includes(searchTerm) ||
            ticket.email.toLowerCase().includes(searchTerm) ||
            ticket.id.toLowerCase().includes(searchTerm)
        );
    }
    // Quote methods
    async createQuote(quoteData) {
        const sql = `
            INSERT INTO quotes (customer_name, customer_email, customer_phone, move_from, move_to, move_date, move_size, services, estimated_cost, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            quoteData.customerName,
            quoteData.customerEmail,
            quoteData.customerPhone,
            quoteData.moveFrom,
            quoteData.moveTo,
            quoteData.moveDate,
            quoteData.moveSize,
            JSON.stringify(quoteData.services),
            quoteData.estimatedCost,
            quoteData.status || 'pending'
        ];
        
        const result = await this.query(sql, params);
        return { id: result.insertId, ...quoteData };
    }

    async getQuotes() {
        const sql = 'SELECT * FROM quotes ORDER BY created_at DESC';
        return await this.query(sql);
    }

    async getQuoteById(id) {
        const sql = 'SELECT * FROM quotes WHERE id = ?';
        const quotes = await this.query(sql, [id]);
        return quotes[0] || null;
    }

    async updateQuote(id, updateData) {
        const fields = [];
        const params = [];
        
        Object.keys(updateData).forEach(key => {
            if (key !== 'id') {
                if (key === 'services' && typeof updateData[key] === 'object') {
                    fields.push(`${key} = ?`);
                    params.push(JSON.stringify(updateData[key]));
                } else {
                    fields.push(`${key} = ?`);
                    params.push(updateData[key]);
                }
            }
        });
        
        if (fields.length === 0) return null;
        
        params.push(id);
        const sql = `UPDATE quotes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        await this.query(sql, params);
        return await this.getQuoteById(id);
    }

    async deleteQuote(id) {
        const sql = 'DELETE FROM quotes WHERE id = ?';
        const result = await this.query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Contact methods
    async createContact(contactData) {
        const sql = `
            INSERT INTO contacts (name, email, phone, subject, message, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            contactData.name,
            contactData.email,
            contactData.phone,
            contactData.subject,
            contactData.message,
            contactData.status || 'new'
        ];
        
        const result = await this.query(sql, params);
        return { id: result.insertId, ...contactData };
    }

    async getContacts() {
        const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
        return await this.query(sql);
    }

    async getContactById(id) {
        const sql = 'SELECT * FROM contacts WHERE id = ?';
        const contacts = await this.query(sql, [id]);
        return contacts[0] || null;
    }

    async updateContact(id, updateData) {
        const fields = [];
        const params = [];
        
        Object.keys(updateData).forEach(key => {
            if (key !== 'id') {
                fields.push(`${key} = ?`);
                params.push(updateData[key]);
            }
        });
        
        if (fields.length === 0) return null;
        
        params.push(id);
        const sql = `UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`;
        
        await this.query(sql, params);
        return await this.getContactById(id);
    }

    async deleteContact(id) {
        const sql = 'DELETE FROM contacts WHERE id = ?';
        const result = await this.query(sql, [id]);
        return result.affectedRows > 0;
    }

    // User Authentication Methods
    async createUser(userData) {
        try {
            const referralCode = this.generateReferralCode();
            const sql = `
                INSERT INTO users (email, password_hash, first_name, last_name, phone, referral_code, referred_by_code, email_verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                userData.email, userData.password_hash, userData.first_name, userData.last_name, 
                userData.phone || null, referralCode, userData.referred_by_code || null, false
            ];
            
            const result = await this.query(sql, params);
            
            // If user was referred, create referral record
            if (userData.referred_by_code) {
                await this.createReferralRecord(userData.referred_by_code, userData.email, result.insertId);
            }
            
            return { id: result.insertId, referral_code: referralCode };
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const sql = 'SELECT * FROM users WHERE email = ? AND status = "active"';
            const users = await this.query(sql, [email]);
            return users[0] || null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    async getUserById(id) {
        try {
            const sql = 'SELECT * FROM users WHERE id = ? AND status = "active"';
            const users = await this.query(sql, [id]);
            return users[0] || null;
        } catch (error) {
            console.error('Get user by ID error:', error);
            return null;
        }
    }

    async updateUserVerification(userId, verified = true) {
        try {
            const sql = 'UPDATE users SET email_verified = ?, verification_token = NULL WHERE id = ?';
            await this.query(sql, [verified, userId]);
            return true;
        } catch (error) {
            console.error('Update verification error:', error);
            return false;
        }
    }

    async getUserByReferralCode(referralCode) {
        try {
            const sql = 'SELECT * FROM users WHERE referral_code = ? AND status = "active"';
            const users = await this.query(sql, [referralCode]);
            return users[0] || null;
        } catch (error) {
            console.error('Get user by referral code error:', error);
            return null;
        }
    }

    // Session Management
    async createSession(userId, sessionToken, expiresAt, ipAddress, userAgent) {
        try {
            const sql = 'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)';
            await this.query(sql, [userId, sessionToken, expiresAt, ipAddress, userAgent]);
            return true;
        } catch (error) {
            console.error('Create session error:', error);
            return false;
        }
    }

    async getSession(sessionToken) {
        try {
            const sql = `
                SELECT s.*, u.email, u.first_name, u.last_name, u.referral_code 
                FROM user_sessions s 
                JOIN users u ON s.user_id = u.id 
                WHERE s.session_token = ? AND s.expires_at > NOW()
            `;
            const sessions = await this.query(sql, [sessionToken]);
            return sessions[0] || null;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    async deleteSession(sessionToken) {
        try {
            const sql = 'DELETE FROM user_sessions WHERE session_token = ?';
            await this.query(sql, [sessionToken]);
            return true;
        } catch (error) {
            console.error('Delete session error:', error);
            return false;
        }
    }

    // Referral System Methods
    generateReferralCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async createReferralRecord(referralCode, email, referredUserId = null) {
        try {
            // Find the referrer
            const referrerSql = 'SELECT id FROM users WHERE referral_code = ?';
            const referrer = await this.query(referrerSql, [referralCode]);
            
            if (referrer.length === 0) {
                throw new Error('Invalid referral code');
            }
            
            const sql = `
                INSERT INTO referrals (referrer_id, referred_user_id, referral_code, email, status) 
                VALUES (?, ?, ?, ?, ?)
            `;
            const params = [
                referrer[0].id, referredUserId, referralCode, email, 
                referredUserId ? 'registered' : 'pending'
            ];
            
            const result = await this.query(sql, params);
            return result.insertId;
        } catch (error) {
            console.error('Create referral error:', error);
            throw error;
        }
    }

    async getUserReferrals(userId) {
        try {
            const sql = `
                SELECT r.*, u.email as referred_email, u.first_name, u.last_name 
                FROM referrals r 
                LEFT JOIN users u ON r.referred_user_id = u.id 
                WHERE r.referrer_id = ? 
                ORDER BY r.created_at DESC
            `;
            return await this.query(sql, [userId]);
        } catch (error) {
            console.error('Get user referrals error:', error);
            return [];
        }
    }

    async completeReferral(referralId, quoteId, dealValue, commissionRate = 5.0) {
        try {
            const commissionAmount = (dealValue * commissionRate) / 100;
            
            const sql = `
                UPDATE referrals SET status = 'completed', quote_id = ?, deal_value = ?, 
                commission_rate = ?, commission_amount = ?, completed_at = NOW() 
                WHERE id = ?
            `;
            await this.query(sql, [quoteId, dealValue, commissionRate, commissionAmount, referralId]);
            
            return true;
        } catch (error) {
            console.error('Complete referral error:', error);
            return false;
        }
    }

    // Earnings Methods
    async getUserEarnings(userId) {
        try {
            const sql = `
                SELECT e.*, r.referral_code, r.deal_value 
                FROM earnings e 
                JOIN referrals r ON e.referral_id = r.id 
                WHERE e.user_id = ? 
                ORDER BY e.created_at DESC
            `;
            return await this.query(sql, [userId]);
        } catch (error) {
            console.error('Get user earnings error:', error);
            return [];
        }
    }

    async getUserEarningsSummary(userId) {
        try {
            const sql = `
                SELECT 
                    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_approved,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
                    COUNT(*) as total_transactions
                FROM earnings WHERE user_id = ?
            `;
            const result = await this.query(sql, [userId]);
            return result[0] || { total_approved: 0, total_pending: 0, total_paid: 0, total_transactions: 0 };
        } catch (error) {
            console.error('Get earnings summary error:', error);
            return { total_approved: 0, total_pending: 0, total_paid: 0, total_transactions: 0 };
        }
    }

    // Analytics methods
    async getTicketSummary() {
        const sql = 'SELECT * FROM ticket_summary';
        return await this.query(sql);
    }

    async getQuoteSummary() {
        const sql = 'SELECT * FROM quote_summary';
        return await this.query(sql);
    }

    async getDailyActivity() {
        const sql = 'SELECT * FROM daily_activity LIMIT 30';
        return await this.query(sql);
    }

    async getAnalytics() {
        try {
            const ticketStats = await this.query(
                'SELECT COUNT(*) as total, status FROM tickets GROUP BY status'
            );
            const quoteStats = await this.query(
                'SELECT COUNT(*) as total, status FROM quotes GROUP BY status'
            );
            const contactStats = await this.query(
                'SELECT COUNT(*) as total FROM contacts'
            );
            const userStats = await this.query(
                'SELECT COUNT(*) as total, status FROM users GROUP BY status'
            );
            const referralStats = await this.query(
                'SELECT COUNT(*) as total, status FROM referrals GROUP BY status'
            );

            return {
                tickets: ticketStats,
                quotes: quoteStats,
                contacts: contactStats[0]?.total || 0,
                users: userStats,
                referrals: referralStats
            };
        } catch (error) {
            console.error('Analytics error:', error);
            return {
                tickets: [],
                quotes: [],
                contacts: 0,
                users: [],
                referrals: []
            };
        }
    }

    // WhatsApp Settings Methods
    async getWhatsAppSettings() {
        try {
            const sql = 'SELECT * FROM whatsapp_settings LIMIT 1';
            const result = await this.query(sql);
            
            if (result.length === 0) {
                // Return default settings if none exist
                return {
                    whatsapp_number: '',
                    is_enabled: false,
                    default_message: 'Hello! I\'m interested in your moving services.',
                    business_hours: '9:00 AM - 6:00 PM',
                    auto_reply: 'Thanks for contacting us! We\'ll get back to you soon.'
                };
            }
            
            return result[0];
        } catch (error) {
            console.error('Get WhatsApp settings error:', error);
            return {
                whatsapp_number: '',
                is_enabled: false,
                default_message: 'Hello! I\'m interested in your moving services.',
                business_hours: '9:00 AM - 6:00 PM',
                auto_reply: 'Thanks for contacting us! We\'ll get back to you soon.'
            };
        }
    }

    async updateWhatsAppSettings(settings) {
        try {
            const sql = `
                INSERT INTO whatsapp_settings 
                (whatsapp_number, is_enabled, default_message, business_hours, auto_reply, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE 
                whatsapp_number = VALUES(whatsapp_number),
                is_enabled = VALUES(is_enabled),
                default_message = VALUES(default_message),
                business_hours = VALUES(business_hours),
                auto_reply = VALUES(auto_reply),
                updated_at = NOW()
            `;
            
            await this.query(sql, [
                settings.whatsapp_number,
                settings.is_enabled,
                settings.default_message,
                settings.business_hours,
                settings.auto_reply
            ]);
            
            return true;
        } catch (error) {
            console.error('Update WhatsApp settings error:', error);
            throw error;
        }
    }

    // Analytics Settings Methods
    async getAnalyticsSettings() {
        try {
            const sql = 'SELECT * FROM analytics_settings LIMIT 1';
            const result = await this.query(sql);
            
            if (result.length === 0) {
                return {
                    ga_tracking_id: '',
                    gtm_container_id: '',
                    is_enabled: false,
                    track_events: true
                };
            }
            
            return result[0];
        } catch (error) {
            console.error('Get analytics settings error:', error);
            return {
                ga_tracking_id: '',
                gtm_container_id: '',
                is_enabled: false,
                track_events: true
            };
        }
    }

    async updateAnalyticsSettings(settings) {
        try {
            const sql = `
                INSERT INTO analytics_settings 
                (ga_tracking_id, gtm_container_id, is_enabled, track_events, updated_at) 
                VALUES (?, ?, ?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE 
                ga_tracking_id = VALUES(ga_tracking_id),
                gtm_container_id = VALUES(gtm_container_id),
                is_enabled = VALUES(is_enabled),
                track_events = VALUES(track_events),
                updated_at = NOW()
            `;
            
            await this.query(sql, [
                settings.ga_tracking_id,
                settings.gtm_container_id,
                settings.is_enabled,
                settings.track_events
            ]);
            
            return true;
        } catch (error) {
            console.error('Update analytics settings error:', error);
            throw error;
        }
    }

    // Website Settings Methods
    async getWebsiteSettings() {
        try {
            const sql = 'SELECT * FROM website_settings LIMIT 1';
            const result = await this.query(sql);
            
            if (result.length === 0) {
                return {
                    site_title: 'Lugvia - Professional Moving Services',
                    site_description: 'Find the best moving companies in USA with Lugvia.',
                    contact_email: '',
                    contact_phone: '',
                    business_address: '',
                    social_media: '{}',
                    maintenance_mode: false,
                    seo_settings: '{}'
                };
            }
            
            const settings = result[0];
            // Parse JSON fields
            if (settings.social_media) {
                try {
                    settings.social_media = JSON.parse(settings.social_media);
                } catch (e) {
                    settings.social_media = {};
                }
            }
            if (settings.seo_settings) {
                try {
                    settings.seo_settings = JSON.parse(settings.seo_settings);
                } catch (e) {
                    settings.seo_settings = {};
                }
            }
            
            return settings;
        } catch (error) {
            console.error('Get website settings error:', error);
            return {
                site_title: 'Lugvia - Professional Moving Services',
                site_description: 'Find the best moving companies in USA with Lugvia.',
                contact_email: '',
                contact_phone: '',
                business_address: '',
                social_media: {},
                maintenance_mode: false,
                seo_settings: {}
            };
        }
    }

    async updateWebsiteSettings(settings) {
        try {
            const sql = `
                INSERT INTO website_settings 
                (site_title, site_description, contact_email, contact_phone, business_address, 
                 social_media, maintenance_mode, seo_settings, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE 
                site_title = VALUES(site_title),
                site_description = VALUES(site_description),
                contact_email = VALUES(contact_email),
                contact_phone = VALUES(contact_phone),
                business_address = VALUES(business_address),
                social_media = VALUES(social_media),
                maintenance_mode = VALUES(maintenance_mode),
                seo_settings = VALUES(seo_settings),
                updated_at = NOW()
            `;
            
            await this.query(sql, [
                settings.site_title,
                settings.site_description,
                settings.contact_email,
                settings.contact_phone,
                settings.business_address,
                JSON.stringify(settings.social_media),
                settings.maintenance_mode,
                JSON.stringify(settings.seo_settings)
            ]);
            
            return true;
        } catch (error) {
            console.error('Update website settings error:', error);
            throw error;
        }
    }

    // Admin Dashboard Analytics
    async getDashboardAnalytics() {
        try {
            const [userStats, referralStats, earningsStats, recentActivity] = await Promise.all([
                this.getUserStatistics(),
                this.getReferralStatistics(),
                this.getEarningsStatistics(),
                this.getRecentActivities()
            ]);
            
            return {
                users: userStats,
                referrals: referralStats,
                earnings: earningsStats,
                recent_activity: recentActivity
            };
        } catch (error) {
            console.error('Get dashboard analytics error:', error);
            return {
                users: { total: 0, new_today: 0, verified: 0 },
                referrals: { total: 0, completed: 0, pending: 0 },
                earnings: { total: 0, this_month: 0, pending: 0 },
                recent_activity: []
            };
        }
    }

    async getUserStatistics() {
        try {
            const totalSql = 'SELECT COUNT(*) as total FROM users';
            const todaySql = 'SELECT COUNT(*) as new_today FROM users WHERE DATE(created_at) = CURDATE()';
            const verifiedSql = 'SELECT COUNT(*) as verified FROM users WHERE email_verified = 1';
            
            const [total, today, verified] = await Promise.all([
                this.query(totalSql),
                this.query(todaySql),
                this.query(verifiedSql)
            ]);
            
            return {
                total: total[0].total,
                new_today: today[0].new_today,
                verified: verified[0].verified
            };
        } catch (error) {
            console.error('Get user statistics error:', error);
            return { total: 0, new_today: 0, verified: 0 };
        }
    }

    async getReferralStatistics() {
        try {
            const totalSql = 'SELECT COUNT(*) as total FROM referrals';
            const completedSql = 'SELECT COUNT(*) as completed FROM referrals WHERE status = "completed"';
            const pendingSql = 'SELECT COUNT(*) as pending FROM referrals WHERE status = "pending"';
            
            const [total, completed, pending] = await Promise.all([
                this.query(totalSql),
                this.query(completedSql),
                this.query(pendingSql)
            ]);
            
            return {
                total: total[0].total,
                completed: completed[0].completed,
                pending: pending[0].pending
            };
        } catch (error) {
            console.error('Get referral statistics error:', error);
            return { total: 0, completed: 0, pending: 0 };
        }
    }

    async getEarningsStatistics() {
        try {
            const totalSql = 'SELECT SUM(amount) as total FROM earnings WHERE status = "paid"';
            const monthSql = 'SELECT SUM(amount) as this_month FROM earnings WHERE status = "paid" AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
            const pendingSql = 'SELECT SUM(amount) as pending FROM earnings WHERE status = "pending"';
            
            const [total, month, pending] = await Promise.all([
                this.query(totalSql),
                this.query(monthSql),
                this.query(pendingSql)
            ]);
            
            return {
                total: total[0].total || 0,
                this_month: month[0].this_month || 0,
                pending: pending[0].pending || 0
            };
        } catch (error) {
            console.error('Get earnings statistics error:', error);
            return { total: 0, this_month: 0, pending: 0 };
        }
    }

    async getRecentActivities() {
        try {
            const sql = `
                SELECT 'user_registration' as type, CONCAT(first_name, ' ', last_name) as description, 
                       created_at as timestamp FROM users 
                UNION ALL
                SELECT 'referral' as type, CONCAT('New referral: ', referral_code) as description, 
                       created_at as timestamp FROM referrals 
                UNION ALL
                SELECT 'quote' as type, CONCAT('Quote request from ', name) as description, 
                       created_at as timestamp FROM quotes 
                ORDER BY timestamp DESC LIMIT 10
            `;
            
            return await this.query(sql);
        } catch (error) {
            console.error('Get recent activities error:', error);
            return [];
        }
    }

    // Export Methods
    async exportUsers(dateFrom, dateTo) {
        try {
            let sql = 'SELECT id, email, first_name, last_name, referral_code, total_earnings, total_referrals, email_verified, created_at FROM users';
            const params = [];
            
            if (dateFrom && dateTo) {
                sql += ' WHERE created_at BETWEEN ? AND ?';
                params.push(dateFrom, dateTo);
            }
            
            sql += ' ORDER BY created_at DESC';
            return await this.query(sql, params);
        } catch (error) {
            console.error('Export users error:', error);
            return [];
        }
    }

    async exportReferrals(dateFrom, dateTo) {
        try {
            let sql = `
                SELECT r.*, u1.email as referrer_email, u2.email as referred_email 
                FROM referrals r 
                LEFT JOIN users u1 ON r.referrer_id = u1.id 
                LEFT JOIN users u2 ON r.referred_user_id = u2.id
            `;
            const params = [];
            
            if (dateFrom && dateTo) {
                sql += ' WHERE r.created_at BETWEEN ? AND ?';
                params.push(dateFrom, dateTo);
            }
            
            sql += ' ORDER BY r.created_at DESC';
            return await this.query(sql, params);
        } catch (error) {
            console.error('Export referrals error:', error);
            return [];
        }
    }

    async exportEarnings(dateFrom, dateTo) {
        try {
            let sql = `
                SELECT e.*, u.email as user_email, r.referral_code 
                FROM earnings e 
                LEFT JOIN users u ON e.user_id = u.id 
                LEFT JOIN referrals r ON e.referral_id = r.id
            `;
            const params = [];
            
            if (dateFrom && dateTo) {
                sql += ' WHERE e.created_at BETWEEN ? AND ?';
                params.push(dateFrom, dateTo);
            }
            
            sql += ' ORDER BY e.created_at DESC';
            return await this.query(sql, params);
        } catch (error) {
            console.error('Export earnings error:', error);
            return [];
        }
    }

    async exportQuotes(dateFrom, dateTo) {
        try {
            let sql = 'SELECT * FROM quotes';
            const params = [];
            
            if (dateFrom && dateTo) {
                sql += ' WHERE created_at BETWEEN ? AND ?';
                params.push(dateFrom, dateTo);
            }
            
            sql += ' ORDER BY created_at DESC';
            return await this.query(sql, params);
        } catch (error) {
            console.error('Export quotes error:', error);
            return [];
        }
    }

    async exportTickets(dateFrom, dateTo) {
        try {
            let sql = 'SELECT * FROM tickets';
            const params = [];
            
            if (dateFrom && dateTo) {
                sql += ' WHERE created_at BETWEEN ? AND ?';
                params.push(dateFrom, dateTo);
            }
            
            sql += ' ORDER BY created_at DESC';
            return await this.query(sql, params);
        } catch (error) {
            console.error('Export tickets error:', error);
            return [];
        }
    }
}

module.exports = Database;