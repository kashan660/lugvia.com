const fs = require('fs');
const path = require('path');
const Database = require('./database');

async function migrateData() {
    console.log('🔄 Starting data migration from JSON files to MySQL...');
    
    try {
        // Initialize database
        const db = new Database();
        
        // Wait for database initialization
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if old data files exist
        const dataDir = path.join(__dirname, 'data');
        const ticketsFile = path.join(dataDir, 'tickets.json');
        const countersFile = path.join(dataDir, 'counters.json');
        
        let migratedCount = 0;
        
        // Migrate tickets if file exists
        if (fs.existsSync(ticketsFile)) {
            console.log('📄 Found tickets.json, migrating tickets...');
            
            const ticketsData = JSON.parse(fs.readFileSync(ticketsFile, 'utf8'));
            
            for (const ticket of ticketsData) {
                try {
                    await db.createTicket({
                        title: ticket.subject || ticket.title || 'Migrated Ticket',
                        description: ticket.description || ticket.message || '',
                        status: ticket.status || 'open',
                        priority: ticket.priority || 'medium',
                        category: ticket.category || 'general',
                        customerName: ticket.name || ticket.customerName || '',
                        customerEmail: ticket.email || ticket.customerEmail || '',
                        customerPhone: ticket.phone || ticket.customerPhone || ''
                    });
                    migratedCount++;
                } catch (error) {
                    console.warn(`⚠️  Failed to migrate ticket ${ticket.id}:`, error.message);
                }
            }
            
            console.log(`✅ Migrated ${migratedCount} tickets`);
        } else {
            console.log('ℹ️  No tickets.json file found, skipping ticket migration');
        }
        
        // Create backup of old files
        if (fs.existsSync(dataDir)) {
            const backupDir = path.join(__dirname, 'data-backup-' + Date.now());
            
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            // Copy files to backup
            if (fs.existsSync(ticketsFile)) {
                fs.copyFileSync(ticketsFile, path.join(backupDir, 'tickets.json'));
                console.log('💾 Backed up tickets.json');
            }
            
            if (fs.existsSync(countersFile)) {
                fs.copyFileSync(countersFile, path.join(backupDir, 'counters.json'));
                console.log('💾 Backed up counters.json');
            }
            
            console.log(`📁 Backup created at: ${backupDir}`);
        }
        
        // Test the migrated data
        console.log('\n🔍 Verifying migrated data...');
        
        const tickets = await db.getTickets();
        const quotes = await db.getQuotes();
        const contacts = await db.getContacts();
        
        console.log('\n📊 Migration Summary:');
        console.log(`   • Tickets in database: ${tickets.length}`);
        console.log(`   • Quotes in database: ${quotes.length}`);
        console.log(`   • Contacts in database: ${contacts.length}`);
        
        // Create sample data for testing
        console.log('\n🎯 Creating sample data for testing...');
        
        // Sample ticket
        await db.createTicket({
            title: 'Welcome to MySQL Database',
            description: 'This is a sample ticket created after migration to demonstrate the new MySQL database functionality.',
            status: 'open',
            priority: 'low',
            category: 'system',
            customerName: 'System Admin',
            customerEmail: 'admin@lugvia.com',
            customerPhone: '555-0000'
        });
        
        // Sample quote
        await db.createQuote({
            customerName: 'Sample Customer',
            customerEmail: 'customer@example.com',
            customerPhone: '555-1234',
            moveFrom: 'Sample City A',
            moveTo: 'Sample City B',
            moveDate: '2024-03-01',
            moveSize: '3-bedroom',
            services: ['packing', 'loading', 'transport', 'unloading'],
            estimatedCost: 3500.00,
            status: 'pending'
        });
        
        // Sample contact
        await db.createContact({
            name: 'Sample Contact',
            email: 'contact@example.com',
            phone: '555-5678',
            subject: 'General Inquiry',
            message: 'This is a sample contact message to test the new database system.',
            status: 'new'
        });
        
        console.log('✅ Sample data created successfully');
        
        console.log('\n🎉 Data migration completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Test the website functionality');
        console.log('   2. Verify admin panel works with new database');
        console.log('   3. Check contact forms and quote requests');
        console.log('   4. Monitor database performance');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the migration
migrateData();