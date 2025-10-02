const Database = require('./database');

async function testDatabase() {
    console.log('🔄 Testing database connection and functionality...');
    
    try {
        // Initialize database
        const db = new Database();
        
        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n📝 Testing ticket operations...');
        
        // Test creating a ticket
        const testTicket = await db.createTicket({
            title: 'Test Support Ticket',
            description: 'This is a test ticket to verify database functionality',
            status: 'open',
            priority: 'medium',
            category: 'technical',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '555-0123'
        });
        console.log('✅ Ticket created:', testTicket.id);
        
        // Test retrieving tickets
        const tickets = await db.getTickets();
        console.log('✅ Retrieved tickets:', tickets.length);
        
        // Test updating a ticket
        const updatedTicket = await db.updateTicket(testTicket.id, {
            status: 'in_progress',
            priority: 'high'
        });
        console.log('✅ Ticket updated:', updatedTicket ? 'Success' : 'Failed');
        
        console.log('\n💰 Testing quote operations...');
        
        // Test creating a quote
        const testQuote = await db.createQuote({
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            customerPhone: '555-0456',
            moveFrom: 'New York, NY',
            moveTo: 'Boston, MA',
            moveDate: '2024-02-15',
            moveSize: '2-bedroom',
            services: ['packing', 'loading', 'transport'],
            estimatedCost: 2500.00,
            status: 'pending'
        });
        console.log('✅ Quote created:', testQuote.id);
        
        // Test retrieving quotes
        const quotes = await db.getQuotes();
        console.log('✅ Retrieved quotes:', quotes.length);
        
        console.log('\n📞 Testing contact operations...');
        
        // Test creating a contact
        const testContact = await db.createContact({
            name: 'Mike Johnson',
            email: 'mike@example.com',
            phone: '555-0789',
            subject: 'Moving Inquiry',
            message: 'I need help with a local move next month.',
            status: 'new'
        });
        console.log('✅ Contact created:', testContact.id);
        
        // Test retrieving contacts
        const contacts = await db.getContacts();
        console.log('✅ Retrieved contacts:', contacts.length);
        
        console.log('\n📊 Testing analytics...');
        
        // Test analytics
        const ticketSummary = await db.getTicketSummary();
        console.log('✅ Ticket summary:', ticketSummary.length, 'records');
        
        const quoteSummary = await db.getQuoteSummary();
        console.log('✅ Quote summary:', quoteSummary.length, 'records');
        
        const dailyActivity = await db.getDailyActivity();
        console.log('✅ Daily activity:', dailyActivity.length, 'records');
        
        console.log('\n🎉 All database tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log(`   • Tickets: ${tickets.length} total`);
        console.log(`   • Quotes: ${quotes.length} total`);
        console.log(`   • Contacts: ${contacts.length} total`);
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await db.deleteTicket(testTicket.id);
        await db.deleteQuote(testQuote.id);
        await db.deleteContact(testContact.id);
        console.log('✅ Test data cleaned up');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
testDatabase();