# 🚀 Lugvia.com Deployment Instructions

## Quick Deployment Guide

### 1. GitHub Setup
```bash
# Initialize Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Lugvia moving services website"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/lugvia.com.git

# Push to GitHub
git push -u origin main
```

### 2. Vercel Deployment (Recommended)

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: lugvia-com
# - Directory: ./
# - Override settings? No
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy!

### 3. Environment Variables Setup

Add these environment variables in your deployment platform:

```env
# Database (use a cloud database like PlanetScale, Railway, or Supabase)
DB_HOST=your_production_database_host
DB_USER=your_production_database_user
DB_PASSWORD=your_production_database_password
DB_NAME=lugvia_production

# Admin Authentication
ADMIN_USERNAME=admin@lugvia.com
ADMIN_PASSWORD=your_secure_hashed_password
JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
ADMIN_JWT_SECRET=your_admin_jwt_secret_32_chars_min
SESSION_SECRET=your_session_secret_32_chars_min

# API Keys
OPENAI_API_KEY=your_openai_api_key
CLOUDFLARE_API_TOKEN=your_cloudflare_token
GOOGLE_ANALYTICS_ID=your_ga_id
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Email (use a service like SendGrid, Mailgun, or Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Production Settings
NODE_ENV=production
PORT=3000
```

### 4. Database Setup

#### Option A: PlanetScale (Recommended)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get connection details
4. Run the schema from `schema.sql`

#### Option B: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create MySQL database
3. Get connection details
4. Import schema

### 5. Domain Setup

#### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 6. Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Contact forms working
- [ ] AI chat functioning
- [ ] Database connected
- [ ] Email notifications working
- [ ] SSL certificate active
- [ ] Analytics tracking
- [ ] Performance optimized

### 7. Monitoring & Maintenance

#### Set up monitoring:
- Vercel Analytics (built-in)
- Google Analytics
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)

#### Regular maintenance:
- Update dependencies monthly
- Monitor security alerts
- Backup database regularly
- Review performance metrics

## 🔧 Troubleshooting

### Common Issues:

**Build Fails:**
- Check Node.js version (>=18.0.0)
- Verify all dependencies in package.json
- Check for syntax errors

**Database Connection:**
- Verify environment variables
- Check database credentials
- Ensure database is accessible from deployment platform

**Admin Panel Issues:**
- Verify JWT secrets are set
- Check admin credentials
- Ensure cookies are enabled

**Email Not Working:**
- Verify SMTP credentials
- Check spam folders
- Test with different email providers

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Review environment variables
3. Test locally first
4. Check database connectivity

## 🎉 Success!

Your Lugvia.com website should now be live and accessible to the world!

**Next Steps:**
- Set up Google Search Console
- Submit sitemap to search engines
- Configure social media links
- Set up backup procedures
- Monitor performance and user feedback