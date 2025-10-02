-- Lugvia Moving Company Database Schema
-- Created for MySQL database integration

-- Create tickets table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);

-- Create quotes table
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
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_move_date (move_date),
    INDEX idx_customer_email (customer_email),
    INDEX idx_created_at (created_at)
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Create admin users table (for future use)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create users table for authentication and referral system
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by_code VARCHAR(20),
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_referrals INT DEFAULT 0,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_referral_code (referral_code),
    INDEX idx_referred_by (referred_by_code),
    INDEX idx_email (email)
);

-- Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_user_id INT,
    referral_code VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    status ENUM('pending', 'registered', 'completed') DEFAULT 'pending',
    quote_id INT,
    booking_id INT,
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    deal_value DECIMAL(10,2) DEFAULT 0.00,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
    INDEX idx_referrer (referrer_id),
    INDEX idx_referral_code (referral_code),
    INDEX idx_status (status)
);

-- Create earnings table to track user earnings
CREATE TABLE IF NOT EXISTS earnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    referral_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('referral_commission', 'bonus', 'adjustment') DEFAULT 'referral_commission',
    status ENUM('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
    description TEXT,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE,
    INDEX idx_user_earnings (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
);

-- Create user sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_sessions (user_id)
);

-- Create audit log table (for tracking changes)
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123 - change this!)
INSERT IGNORE INTO admin_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@lugvia.com', '$2b$10$rQZ8kHWKQVz8kHWKQVz8kO', 'admin');

-- Add referral tracking to existing quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS referred_by_user_id INT,
ADD INDEX IF NOT EXISTS idx_referral_code (referral_code),
ADD INDEX IF NOT EXISTS idx_referred_by_user (referred_by_user_id);

-- Add referral tracking to existing tickets table  
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS referred_by_user_id INT,
ADD INDEX IF NOT EXISTS idx_referral_code (referral_code),
ADD INDEX IF NOT EXISTS idx_referred_by_user (referred_by_user_id);

-- Create triggers to update user earnings when referrals are completed
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_user_earnings_after_referral
AFTER UPDATE ON referrals
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update user total earnings
        UPDATE users 
        SET total_earnings = total_earnings + NEW.commission_amount,
            total_referrals = total_referrals + 1
        WHERE id = NEW.referrer_id;
        
        -- Create earnings record
        INSERT INTO earnings (user_id, referral_id, amount, type, status, description)
        VALUES (NEW.referrer_id, NEW.id, NEW.commission_amount, 'referral_commission', 'approved', 
                CONCAT('Commission for referral #', NEW.id));
    END IF;
END//

DELIMITER ;

-- Create views for analytics and reporting
CREATE OR REPLACE VIEW ticket_summary AS
SELECT 
    status,
    priority,
    COUNT(*) as count,
    AVG(TIMESTAMPDIFF(HOUR, created_at, COALESCE(updated_at, NOW()))) as avg_resolution_hours
FROM tickets 
GROUP BY status, priority;

CREATE OR REPLACE VIEW quote_summary AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(estimated_cost) as avg_cost,
    SUM(estimated_cost) as total_value
FROM quotes 
GROUP BY status;

-- Referral analytics views
CREATE OR REPLACE VIEW referral_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.referral_code,
    u.total_referrals,
    u.total_earnings,
    COUNT(r.id) as active_referrals,
    SUM(CASE WHEN r.status = 'completed' THEN r.commission_amount ELSE 0 END) as completed_earnings,
    SUM(CASE WHEN r.status = 'pending' THEN r.commission_amount ELSE 0 END) as pending_earnings
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id
GROUP BY u.id;

CREATE OR REPLACE VIEW earnings_summary AS
SELECT 
    DATE(e.created_at) as date,
    e.type,
    e.status,
    COUNT(*) as transaction_count,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as avg_amount
FROM earnings e
GROUP BY DATE(e.created_at), e.type, e.status;

CREATE OR REPLACE VIEW daily_activity AS
SELECT 
    DATE(created_at) as date,
    'ticket' as type,
    COUNT(*) as count
FROM tickets 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
UNION ALL
SELECT 
    DATE(created_at) as date,
    'quote' as type,
    COUNT(*) as count
FROM quotes 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
UNION ALL
SELECT 
    DATE(created_at) as date,
    'contact' as type,
    COUNT(*) as count
FROM contacts 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
UNION ALL
SELECT 
    DATE(created_at) as date,
    'users' as type,
    COUNT(*) as count
FROM users 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
UNION ALL
SELECT 
    DATE(created_at) as date,
    'referrals' as type,
    COUNT(*) as count
FROM referrals 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Admin Settings Tables

-- WhatsApp Settings Table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    whatsapp_number VARCHAR(20) NOT NULL DEFAULT '',
    is_enabled BOOLEAN DEFAULT FALSE,
    default_message TEXT DEFAULT 'Hello! I\'m interested in your moving services.',
    business_hours VARCHAR(100) DEFAULT '9:00 AM - 6:00 PM',
    auto_reply TEXT DEFAULT 'Thanks for contacting us! We\'ll get back to you soon.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Analytics Settings Table
CREATE TABLE IF NOT EXISTS analytics_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ga_tracking_id VARCHAR(50) DEFAULT '',
    gtm_container_id VARCHAR(50) DEFAULT '',
    is_enabled BOOLEAN DEFAULT FALSE,
    track_events BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_title VARCHAR(255) DEFAULT 'Lugvia - Professional Moving Services',
    site_description TEXT DEFAULT 'Find the best moving companies in USA with Lugvia.',
    contact_email VARCHAR(255) DEFAULT '',
    contact_phone VARCHAR(50) DEFAULT '',
    business_address TEXT DEFAULT '',
    social_media JSON,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    seo_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT IGNORE INTO whatsapp_settings (id, whatsapp_number, is_enabled, default_message, business_hours, auto_reply) 
VALUES (1, '', FALSE, 'Hello! I\'m interested in your moving services.', '9:00 AM - 6:00 PM', 'Thanks for contacting us! We\'ll get back to you soon.');

INSERT IGNORE INTO analytics_settings (id, ga_tracking_id, gtm_container_id, is_enabled, track_events) 
VALUES (1, '', '', FALSE, TRUE);

INSERT IGNORE INTO website_settings (id, site_title, site_description, contact_email, contact_phone, business_address, social_media, maintenance_mode, seo_settings) 
VALUES (1, 'Lugvia - Professional Moving Services', 'Find the best moving companies in USA with Lugvia.', '', '', '', '{}', FALSE, '{}');