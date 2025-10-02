# Lugvia.com - Professional Moving Services Platform

A comprehensive, secure moving services website with advanced features including AI-powered chat, admin panel, and robust security implementations.

## 🚀 Features

### 🏠 Moving Services
- **Local Moving** - Professional local relocation services
- **Long Distance Moving** - Interstate and cross-country moves
- **Packing Services** - Expert packing and unpacking
- **Storage Solutions** - Secure storage facilities
- Interactive quote calculator with real-time estimates

### 🤖 AI-Powered Features
- **AI Chat Assistant** - 24/7 customer support with OpenAI integration
- **Smart Recommendations** - Personalized moving suggestions
- **Automated Responses** - Instant customer query handling

### 🔐 Security Features
- **Secure Admin Panel** - JWT-based authentication
- **Environment Variables** - Secure credential management
- **Rate Limiting** - DDoS protection and abuse prevention
- **Input Validation** - XSS and injection attack prevention
- **Security Headers** - HSTS, CSP, and other security measures

### 📊 Admin Dashboard
- **User Management** - Customer and booking management
- **Analytics Integration** - Google Analytics and custom metrics
- **Email Management** - SMTP configuration and testing
- **SEO Tools** - Sitemap generation and search console integration
- **Cloudflare Integration** - CDN and security management

## 🛠 Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MySQL** - Database management
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **dotenv** - Environment configuration

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with responsive design
- **Vanilla JavaScript** - Interactive functionality
- **Font Awesome** - Professional icons
- **Google Fonts** - Typography

### Security
- **Helmet.js** - Security headers
- **Express Rate Limit** - Request throttling
- **Input Sanitization** - XSS prevention
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
lugvia.com/
├── server.js                    # Main server file
├── package.json                 # Dependencies and scripts
├── vercel.json                  # Vercel deployment config
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
│
├── Frontend Files
├── index.html                   # Homepage
├── styles.css                   # Main stylesheet
├── script.js                    # Main JavaScript
├── local-moving.html            # Local moving page
├── long-distance.html           # Long distance page
├── packing-services.html        # Packing services page
├── storage.html                 # Storage solutions page
├── contact.html                 # Contact page
├── support.html                 # Support center
├── ai-chat.html                 # AI chat interface
│
├── Admin Panel
├── admin.html                   # Admin dashboard
├── admin-login.html             # Admin login
├── admin-panel.html             # Admin management
├── admin-routes.js              # Admin API routes
├── admin-styles.css             # Admin styling
│
├── Database & Config
├── database.js                  # Database connection
├── db-config.js                 # Database configuration
├── setup-database.js            # Database initialization
├── schema.sql                   # Database schema
│
├── Security & Utils
├── generate-admin-password.js   # Password generation utility
├── auth-service.js              # Authentication service
├── email-service.js             # Email functionality
├── cloudflare-config.js         # Cloudflare integration
│
└── Documentation
    ├── SECURITY-AUDIT-REPORT.md  # Security audit results
    ├── DEPLOYMENT-GUIDE.md       # Deployment instructions
    └── DATABASE-README.md        # Database setup guide
```

## 🚀 Deployment

### Prerequisites
- Node.js 18+ (for development and production)
- Git (for version control)
- Vercel account (for deployment)
- GitHub account (for code hosting)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lugvia-moving-services.git
   cd lugvia-moving-services
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Generate admin password:**
   ```bash
   node generate-admin-password.js
   ```

### Local Development

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

2. **Access the application:**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin-login.html

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

4. **Configure environment variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Navigate to Settings > Environment Variables
   - Add all variables from your .env file

### GitHub Setup

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lugvia moving services platform"
   ```

2. **Create GitHub repository:**
   - Go to GitHub and create a new repository
   - Name it `lugvia-moving-services`
   - Don't initialize with README (we already have one)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/lugvia-moving-services.git
   git branch -M main
   git push -u origin main
   ```

### Production Configuration

#### Required Environment Variables
```bash
# Database
DB_HOST=your_production_database_host
DB_USER=your_database_user
DB_PASSWORD=your_secure_database_password
DB_NAME=lugvia_production

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_hashed_password_from_generator
JWT_SECRET=your_super_secure_jwt_secret_key
SESSION_SECRET=your_super_secure_session_secret

# API Keys
OPENAI_API_KEY=sk-your_openai_api_key
CLOUDFLARE_API_TOKEN=your_cloudflare_token
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
NODE_ENV=production
SECURE_COOKIES=true
SAME_SITE_COOKIES=strict
```

### Database Setup

1. **Create production database:**
   ```sql
   CREATE DATABASE lugvia_production;
   ```

2. **Run database initialization:**
   ```bash
   node setup-database.js
   ```

### Security Checklist

- ✅ Environment variables configured
- ✅ Admin password hashed with bcrypt
- ✅ JWT secrets are strong and unique
- ✅ Database credentials are secure
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Security headers configured
- ✅ Rate limiting enabled
- ✅ Input validation implemented

### Monitoring & Maintenance

1. **Check application logs:**
   ```bash
   vercel logs
   ```

2. **Monitor performance:**
   - Use Vercel Analytics
   - Check Google Analytics
   - Monitor admin panel logs

3. **Update dependencies:**
   ```bash
   npm audit
   npm update
   ```

## Features in Detail

### Moving Calculator
The calculator provides instant quotes by:
- Calculating distance between cities using coordinates
- Applying home size multipliers
- Adding costs for additional services
- Generating realistic quotes from multiple companies
- Sorting results by price for easy comparison

### Responsive Breakpoints
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Customization

### Adding New Cities
To add new cities to the calculator, update the `cityCoordinates` object in `script.js`:

```javascript
const cityCoordinates = {
    'new-city': { lat: 40.7128, lng: -74.0060 },
    // Add more cities...
};
```

Then add the corresponding option in the HTML select elements.

### Adding New Moving Companies
Update the `movingCompanies` object in `script.js`:

```javascript
const movingCompanies = {
    'company-key': {
        name: 'Company Name',
        rating: 4.5,
        baseRate: 1.1,
        features: ['Feature 1', 'Feature 2'],
        specialty: 'Company Specialty'
    }
};
```

### Styling Customization
The CSS uses CSS custom properties for easy theming. Key variables are defined at the top of `styles.css`.

## Performance Optimizations

- Optimized images using SVG format
- Minified and compressed assets
- Efficient CSS Grid and Flexbox layouts
- Lazy loading for animations
- Minimal JavaScript dependencies

## SEO Features

- Semantic HTML structure
- Meta descriptions and titles
- Proper heading hierarchy
- Alt text for images
- Schema markup ready

## Deployment

The website is ready for deployment to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a GitHub repository
- **AWS S3**: Upload files to an S3 bucket

## Future Enhancements

- [ ] Integration with real moving company APIs
- [ ] User account system for quote history
- [ ] Advanced filtering and sorting options
- [ ] Real-time chat support
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Payment processing integration

## Support

For technical support or questions about the website:
- Email: support@lugvia.com
- Phone: 1-800-LUGVIA-1

## License

© 2024 Lugvia.com. All rights reserved.

---

**Built with ❤️ for seamless moving experiences across America**