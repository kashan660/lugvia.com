#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Guide
 * This script provides instructions for configuring environment variables in Vercel
 */

console.log('\n🚀 VERCEL ENVIRONMENT VARIABLES SETUP GUIDE');
console.log('='.repeat(50));

console.log('\n📋 REQUIRED ENVIRONMENT VARIABLES:');
console.log('='.repeat(35));

const requiredVars = [
    {
        name: 'DB_HOST',
        description: 'Your hPanel MySQL database host',
        example: 'localhost (or your hosting provider\'s MySQL host)',
        critical: true
    },
    {
        name: 'DB_USER',
        description: 'Your hPanel MySQL database username',
        example: 'u513195619_lugvia',
        critical: true
    },
    {
        name: 'DB_PASSWORD',
        description: 'Your hPanel MySQL database password',
        example: 'your_secure_password',
        critical: true
    },
    {
        name: 'DB_NAME',
        description: 'Your hPanel MySQL database name',
        example: 'u513195619_lugvia',
        critical: true
    },
    {
        name: 'ADMIN_USERNAME',
        description: 'Admin panel username',
        example: 'admin',
        critical: true
    },
    {
        name: 'ADMIN_PASSWORD',
        description: 'Admin panel password (hashed)',
        example: 'your_bcrypt_hashed_password',
        critical: true
    },
    {
        name: 'JWT_SECRET',
        description: 'JWT token secret for authentication',
        example: 'your_jwt_secret_key_here',
        critical: true
    },
    {
        name: 'SESSION_SECRET',
        description: 'Session secret for secure sessions',
        example: 'your_session_secret_here',
        critical: true
    },
    {
        name: 'NODE_ENV',
        description: 'Environment mode',
        example: 'production',
        critical: true
    }
];

const optionalVars = [
    {
        name: 'OPENAI_API_KEY',
        description: 'OpenAI API key for AI features',
        example: 'sk-...'
    },
    {
        name: 'OPENAI_MODEL',
        description: 'OpenAI model to use',
        example: 'gpt-3.5-turbo'
    },
    {
        name: 'UHAUL_API_KEY',
        description: 'U-Haul API integration',
        example: 'your_uhaul_api_key'
    },
    {
        name: 'BUDGET_API_KEY',
        description: 'Budget Truck API integration',
        example: 'your_budget_api_key'
    },
    {
        name: 'ALLIED_API_KEY',
        description: 'Allied Van Lines API integration',
        example: 'your_allied_api_key'
    },
    {
        name: 'MAYFLOWER_API_KEY',
        description: 'Mayflower API integration',
        example: 'your_mayflower_api_key'
    },
    {
        name: 'NORTH_AMERICAN_API_KEY',
        description: 'North American Van Lines API integration',
        example: 'your_north_american_api_key'
    }
];

// Display required variables
requiredVars.forEach((variable, index) => {
    console.log(`\n${index + 1}. ${variable.name} ${variable.critical ? '🔴 CRITICAL' : ''}`);
    console.log(`   Description: ${variable.description}`);
    console.log(`   Example: ${variable.example}`);
});

console.log('\n📋 OPTIONAL ENVIRONMENT VARIABLES:');
console.log('='.repeat(35));

optionalVars.forEach((variable, index) => {
    console.log(`\n${index + 1}. ${variable.name}`);
    console.log(`   Description: ${variable.description}`);
    console.log(`   Example: ${variable.example}`);
});

console.log('\n🔧 SETUP INSTRUCTIONS:');
console.log('='.repeat(25));

console.log(`
1. 📱 Go to your Vercel Dashboard:
   https://vercel.com/dashboard

2. 🎯 Select your project (lugvia.com)

3. ⚙️  Go to Settings → Environment Variables

4. ➕ Add each variable:
   - Click "Add New"
   - Enter Variable Name
   - Enter Variable Value
   - Select Environment: Production (and Preview if needed)
   - Click "Save"

5. 🔄 Redeploy your application:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

6. ✅ Test the deployment:
   - Visit your live site
   - Check admin panel functionality
   - Test quote form submission
   - Verify database connectivity
`);

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('='.repeat(30));

console.log(`
• Never commit actual environment variables to Git
• Use strong, unique passwords for database and admin access
• Regularly rotate API keys and secrets
• Monitor your Vercel deployment logs for any errors
• Test all functionality after deployment
`);

console.log('\n🎯 NEXT STEPS AFTER SETUP:');
console.log('='.repeat(28));

console.log(`
1. Deploy to Vercel with environment variables configured
2. Test database connectivity in production
3. Verify all features work correctly
4. Monitor application performance and logs
5. Set up monitoring and alerts for production issues
`);

console.log('\n✅ Setup guide completed!');
console.log('📞 Need help? Check the deployment logs in Vercel dashboard.\n');