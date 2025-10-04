const mysql = require('mysql2/promise');
require('dotenv').config();

// Secure database configuration using environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

// Validate required environment variables
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.warn('⚠️  Database credentials not found in environment variables');
    console.warn('⚠️  Running in fallback mode without database connection');
    console.log('📝 To enable database features, configure DB_USER, DB_PASSWORD, and DB_NAME');
}

// Create connection pool
let pool;

try {
    // Only create pool if we have the required credentials
    if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
        pool = mysql.createPool(dbConfig);
    } else {
        console.log('⚠️  Database credentials missing - running in fallback mode');
        pool = null;
    }
} catch (error) {
    console.warn('⚠️  MySQL connection not available, using fallback mode');
    pool = null;
}

// Test connection function
async function testConnection() {
    if (!pool) {
        console.log('⚠️  Database pool not initialized - running in fallback mode');
        return false;
    }
    
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.warn('⚠️  Database connection failed:', error.message);
        console.log('📝 Running in fallback mode - data will be stored locally');
        return false;
    }
}

// Initialize database tables
async function initializeTables() {
    if (!pool) {
        console.log('⚠️  No database connection - skipping table initialization');
        return false;
    }
    
    try {
        const connection = await pool.getConnection();
        
        // Create tickets table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                category VARCHAR(100),
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create quotes table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                move_from VARCHAR(255),
                move_to VARCHAR(255),
                move_date DATE,
                move_size VARCHAR(100),
                services TEXT,
                estimated_cost DECIMAL(10,2),
                status ENUM('pending', 'sent', 'accepted', 'declined') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Create contacts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                subject VARCHAR(255),
                message TEXT,
                status ENUM('new', 'read', 'replied') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create newsletter_subscribers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                status ENUM('active', 'unsubscribed') DEFAULT 'active',
                subscription_source VARCHAR(100) DEFAULT 'website',
                ip_address VARCHAR(45),
                user_agent TEXT,
                unsubscribe_token VARCHAR(255) UNIQUE,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP NULL
            )
        `);

        // Create admin_users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email)
            )
        `);

        // Create users table for customer accounts
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(50),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                zip_code VARCHAR(20),
                referral_code VARCHAR(50) UNIQUE,
                referred_by INT,
                email_verified BOOLEAN DEFAULT FALSE,
                email_verification_token VARCHAR(255),
                password_reset_token VARCHAR(255),
                password_reset_expires TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_email (email),
                INDEX idx_referral_code (referral_code),
                INDEX idx_referred_by (referred_by)
            )
        `);

        // Create referrals table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS referrals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                referrer_id INT NOT NULL,
                referred_id INT NOT NULL,
                referral_code VARCHAR(50) NOT NULL,
                status ENUM('pending', 'completed', 'paid') DEFAULT 'pending',
                commission_amount DECIMAL(10,2) DEFAULT 0.00,
                commission_rate DECIMAL(5,2) DEFAULT 5.00,
                quote_id INT,
                completed_at TIMESTAMP NULL,
                paid_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
                INDEX idx_referrer (referrer_id),
                INDEX idx_referred (referred_id),
                INDEX idx_status (status)
            )
        `);

        // Create earnings table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS earnings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                referral_id INT,
                amount DECIMAL(10,2) NOT NULL,
                type ENUM('referral_commission', 'bonus', 'adjustment') DEFAULT 'referral_commission',
                status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
                description TEXT,
                payment_method VARCHAR(100),
                payment_reference VARCHAR(255),
                paid_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_type (type)
            )
        `);

        // Create user_sessions table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                user_agent TEXT,
                ip_address VARCHAR(45),
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_session_token (session_token),
                INDEX idx_user_id (user_id),
                INDEX idx_expires_at (expires_at)
            )
        `);

        // Create audit_log table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                admin_id INT,
                action VARCHAR(100) NOT NULL,
                table_name VARCHAR(100),
                record_id INT,
                old_values JSON,
                new_values JSON,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_admin_id (admin_id),
                INDEX idx_action (action),
                INDEX idx_table_name (table_name),
                INDEX idx_created_at (created_at)
            )
        `);

        // Add referral tracking columns to quotes table if they don't exist
        try {
            await connection.execute(`
                ALTER TABLE quotes 
                ADD COLUMN IF NOT EXISTS referred_by INT,
                ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50),
                ADD FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
            `);
        } catch (error) {
            // Columns might already exist, ignore error
            console.log('Note: Referral columns may already exist in quotes table');
        }

        // Insert default admin user if not exists
        try {
            const [adminExists] = await connection.execute(
                'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
                ['admin']
            );
            
            if (adminExists.length === 0) {
                // Default password: admin123 (should be changed immediately)
                const bcrypt = require('bcrypt');
                const defaultPassword = await bcrypt.hash('admin123', 12);
                
                await connection.execute(`
                    INSERT INTO admin_users (username, email, password_hash, role) 
                    VALUES (?, ?, ?, ?)
                `, ['admin', 'admin@lugvia.com', defaultPassword, 'super_admin']);
                
                console.log('✅ Default admin user created (username: admin, password: admin123)');
                console.log('⚠️  IMPORTANT: Change the default admin password immediately!');
            }
        } catch (error) {
            console.log('Note: Default admin user creation skipped:', error.message);
        }
        
        console.log('✅ All database tables initialized successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize tables:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    initializeTables
};