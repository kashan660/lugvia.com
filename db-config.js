const mysql = require('mysql2/promise');
require('dotenv').config();

// Secure database configuration using environment variables
// NEVER hardcode credentials in source code
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
    console.warn('⚠️  Please check your .env file configuration');
}

// Create connection pool
let pool;

try {
    pool = mysql.createPool(dbConfig);
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
        
        console.log('✅ Database tables initialized successfully!');
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