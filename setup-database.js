const fs = require('fs');
const path = require('path');

// Database setup script for local development
// This script prepares the application for MySQL integration

function setupDatabase() {
    console.log('🔧 Setting up database configuration...');
    
    try {
        // Create a local database configuration for development
        const localDbConfig = `const mysql = require('mysql2/promise');
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
    console.error('❌ Database credentials not found in environment variables');
    console.error('❌ Please configure your .env file with DB_USER, DB_PASSWORD, and DB_NAME');
    process.exit(1);
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
        await connection.execute(\`
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
        \`);
        
        // Create quotes table
        await connection.execute(\`
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
        \`);
        
        // Create contacts table
        await connection.execute(\`
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
        \`);
        
        // Create newsletter_subscribers table
        await connection.execute(\`
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
        \`);
        
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
};`;
        
        // Write the updated configuration
        fs.writeFileSync(path.join(__dirname, 'db-config.js'), localDbConfig);
        console.log('✅ Database configuration updated');
        
        // Create a README for database setup
        const readmeContent = `# Database Setup Instructions

## MySQL Integration for Lugvia Moving Company

This application has been configured to work with MySQL database on hPanel.

### Database Credentials
- **Database Name:** u513195619_lugvia
- **Username:** u513195619_lugvia
- **Password:** A5hx&ku$!m*
- **Host:** localhost (on hPanel)

### Setup Steps

1. **Create MySQL Database on hPanel:**
   - Log into your hPanel control panel
   - Navigate to MySQL Databases
   - Create database: u513195619_lugvia
   - Create user: u513195619_lugvia
   - Assign user to database with all privileges

2. **Deploy Application:**
   - Upload all files to your hosting directory
   - Run \`npm install\` to install dependencies
   - The application will automatically create necessary tables

3. **Test Database Connection:**
   - Run \`node test-db.js\` to verify connection
   - Check admin panel functionality
   - Test contact forms and quote requests

### Features

- **Automatic Fallback:** If MySQL is not available, the app falls back to file-based storage
- **Data Migration:** Existing JSON data can be migrated using \`node migrate-data.js\`
- **Analytics:** Built-in views for reporting and analytics
- **Scalability:** Ready for high-volume traffic and concurrent users

### File Structure

- \`db-config.js\` - Database connection configuration
- \`database.js\` - Database operations class
- \`schema.sql\` - Database schema and tables
- \`migrate-data.js\` - Data migration script
- \`test-db.js\` - Database testing script

### Troubleshooting

If you encounter connection issues:
1. Verify database credentials in hPanel
2. Check that MySQL service is running
3. Ensure firewall allows database connections
4. Review error logs for specific issues

The application will continue to work with file-based storage if MySQL is unavailable.
`;
        
        fs.writeFileSync(path.join(__dirname, 'DATABASE-README.md'), readmeContent);
        console.log('✅ Database setup documentation created');
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   • MySQL integration configured');
        console.log('   • Fallback mode available for development');
        console.log('   • Migration scripts ready');
        console.log('   • Documentation created');
        
        console.log('\n📝 Next Steps:');
        console.log('   1. Deploy to hPanel hosting');
        console.log('   2. Create MySQL database in hPanel');
        console.log('   3. Test database connection');
        console.log('   4. Run migration if needed');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
setupDatabase();