# Vercel Deployment Guide for Lugvia Moving Services

This guide will help you deploy the Lugvia moving services platform to Vercel.

## Prerequisites

- Vercel account (free tier available)
- GitHub account
- Node.js 18+ installed locally

## Step 1: Prepare Your Project

### 1.1 Environment Variables Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Generate a secure admin password:
   ```bash
   node generate-admin-password.js
   ```

3. Fill in your `.env` file with actual values:
   ```bash
   # Database Configuration
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_secure_password
   DB_NAME=lugvia_production
   
   # Admin Authentication
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_generated_hash
   JWT_SECRET=your_jwt_secret_minimum_32_chars
   SESSION_SECRET=your_session_secret_minimum_32_chars
   
   # API Keys
   OPENAI_API_KEY=sk-your_openai_key
   CLOUDFLARE_API_TOKEN=your_cloudflare_token
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # Production Settings
   NODE_ENV=production
   PORT=3000
   ```

## Step 2: GitHub Repository

### 2.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `lugvia-moving-services`
3. Set it to Public or Private (your choice)
4. Don't initialize with README (we already have one)

### 2.2 Push Your Code

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/lugvia-moving-services.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Vercel Deployment

### 3.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your `lugvia-moving-services` repository

### 3.2 Configure Project Settings

1. **Framework Preset**: Other
2. **Build Command**: `npm run vercel-build`
3. **Output Directory**: Leave empty
4. **Install Command**: `npm install`

### 3.3 Environment Variables in Vercel

1. In your Vercel project dashboard, go to **Settings** > **Environment Variables**
2. Add each variable from your `.env` file:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DB_HOST` | your_database_host | Production |
   | `DB_USER` | your_database_user | Production |
   | `DB_PASSWORD` | your_secure_password | Production |
   | `DB_NAME` | lugvia_production | Production |
   | `ADMIN_USERNAME` | admin | Production |
   | `ADMIN_PASSWORD` | your_generated_hash | Production |
   | `JWT_SECRET` | your_jwt_secret | Production |
   | `SESSION_SECRET` | your_session_secret | Production |
   | `OPENAI_API_KEY` | sk-your_openai_key | Production |
   | `CLOUDFLARE_API_TOKEN` | your_cloudflare_token | Production |
   | `SMTP_HOST` | smtp.gmail.com | Production |
   | `SMTP_PORT` | 587 | Production |
   | `SMTP_USER` | your_email@gmail.com | Production |
   | `SMTP_PASS` | your_app_password | Production |
   | `NODE_ENV` | production | Production |
   | `RATE_LIMIT_WINDOW_MS` | 900000 | Production |
   | `RATE_LIMIT_MAX_REQUESTS` | 100 | Production |
   | `ADMIN_RATE_LIMIT_MAX` | 50 | Production |
   | `SESSION_TIMEOUT_MS` | 28800000 | Production |
   | `ADMIN_SESSION_TIMEOUT` | 8h | Production |
   | `BCRYPT_ROUNDS` | 12 | Production |
   | `SECURE_COOKIES` | true | Production |
   | `SAME_SITE_COOKIES` | strict | Production |

### 3.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Your site will be available at `https://your-project-name.vercel.app`

## Step 4: Database Setup

### 4.1 Production Database

You'll need a production MySQL database. Options include:

- **PlanetScale** (recommended for Vercel)
- **Railway**
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Databases**

### 4.2 Initialize Database

Once your database is ready:

1. Update your Vercel environment variables with the database credentials
2. The database tables will be created automatically when the app starts

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Vercel dashboard, go to **Settings** > **Domains**
2. Add your custom domain (e.g., `lugvia.com`)
3. Configure DNS records as instructed by Vercel

### 5.2 SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## Step 6: Monitoring & Maintenance

### 6.1 Check Deployment Status

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Check logs
vercel logs
```

### 6.2 Redeploy

To redeploy after making changes:

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Vercel will automatically redeploy when you push to the main branch.

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check that all environment variables are set
   - Verify Node.js version compatibility
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify database credentials
   - Check if database allows connections from Vercel IPs
   - Ensure database is running

3. **Admin Login Issues**:
   - Verify admin password was generated correctly
   - Check JWT_SECRET and SESSION_SECRET are set
   - Ensure cookies are working (check browser settings)

### Getting Help

- Check Vercel documentation: https://vercel.com/docs
- Review application logs in Vercel dashboard
- Check the SECURITY-AUDIT-REPORT.md for security considerations

## Security Considerations

- ✅ All sensitive data is in environment variables
- ✅ HTTPS is enforced by Vercel
- ✅ Security headers are configured
- ✅ Rate limiting is enabled
- ✅ Input validation is implemented
- ✅ Admin authentication is secure

## Performance Optimization

- Enable Vercel Analytics for performance monitoring
- Use Vercel Edge Functions for better global performance
- Configure caching headers for static assets
- Monitor database query performance

Your Lugvia moving services platform is now ready for production! 🚀