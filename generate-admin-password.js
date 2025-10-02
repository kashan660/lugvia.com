const bcrypt = require('bcrypt');
require('dotenv').config();

// Script to generate hashed admin password
async function generateAdminPassword() {
    const plainPassword = process.argv[2];
    
    if (!plainPassword) {
        console.log('Usage: node generate-admin-password.js <password>');
        console.log('Example: node generate-admin-password.js mySecurePassword123');
        process.exit(1);
    }
    
    try {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        
        console.log('\n=== ADMIN PASSWORD HASH GENERATED ===');
        console.log('Add this to your .env file:');
        console.log(`ADMIN_PASSWORD=${hashedPassword}`);
        console.log('\n⚠️  SECURITY REMINDER:');
        console.log('- Keep this hash secure and never share it');
        console.log('- Use a strong password with at least 12 characters');
        console.log('- Include uppercase, lowercase, numbers, and symbols');
        console.log('- Change the password regularly');
        
    } catch (error) {
        console.error('Error generating password hash:', error);
        process.exit(1);
    }
}

generateAdminPassword();