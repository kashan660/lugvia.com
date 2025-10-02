# 🚀 Deployment Guide for Lugvia Moving Company

## MySQL Database Setup on hPanel

Your website is currently running in **fallback mode** using local file storage. To activate MySQL database functionality, follow these steps:

### Step 1: Create MySQL Database on hPanel

1. **Login to hPanel Control Panel**
   - Go to your hosting provider's control panel
   - Navigate to **MySQL Databases** section

2. **Create Database**
   - Database Name: `u513195619_lugvia`
   - Click "Create Database"

3. **Create Database User**
   - Username: `u513195619_lugvia`
   - Password: `A5hx&ku$!m*`
   - Click "Create User"

4. **Assign User to Database**
   - Select database: `u513195619_lugvia`
   - Select user: `u513195619_lugvia`
   - Grant **ALL PRIVILEGES**
   - Click "Add User to Database"

### Step 2: Deploy Website Files

1. **Upload Files**
   - Upload all files from `d:\lugvia.com\` to your hosting directory
   - Ensure all files including `node_modules` are uploaded

2. **Install Dependencies** (if needed)
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   node server.js
   ```

### Step 3: Verify Database Connection

Once deployed, the application will:
- ✅ Automatically connect to MySQL database
- ✅ Create all necessary tables
- ✅ Display "Database connected successfully!" in logs

### Step 4: Migrate Existing Data (Optional)

If you have existing data in JSON files:
```bash
node migrate-data.js
```

### Step 5: Test Functionality

1. **Test Contact Form**
   - Visit your website
   - Fill out contact form
   - Check admin panel for new entries

2. **Test Quote Requests**
   - Request a moving quote
   - Verify data appears in admin dashboard

3. **Test Support Tickets**
   - Create a support ticket
   - Check ticket management in admin

## 🔧 Troubleshooting

### Database Connection Issues

If you see "Database connection failed":

1. **Verify Credentials**
   - Check database name, username, and password
   - Ensure they match exactly in hPanel

2. **Check Database Status**
   - Ensure MySQL service is running
   - Verify database was created successfully

3. **Test Connection**
   ```bash
   node test-db.js
   ```

### Common Solutions

- **Wrong Host**: Use `localhost` for hPanel
- **Privileges**: Ensure user has ALL privileges
- **Firewall**: Check if database port is accessible
- **Charset**: Database should use `utf8mb4`

## 📊 Database Features

### Tables Created Automatically
- **tickets** - Support ticket management
- **quotes** - Moving quote requests  
- **contacts** - Customer inquiries
- **admin_users** - Admin authentication (future)
- **audit_log** - Change tracking

### Analytics Views
- **ticket_summary** - Ticket statistics by status/priority
- **quote_summary** - Quote statistics and revenue
- **daily_activity** - Daily activity across all modules

## 🎯 Benefits After MySQL Setup

- **Performance**: Handle 1000+ concurrent users
- **Reliability**: ACID compliance and data integrity
- **Scalability**: Professional database infrastructure
- **Analytics**: Built-in reporting and insights
- **Backup**: Automated database backups
- **Security**: SQL injection protection

## 📞 Support

If you need help with deployment:
1. Check server logs for specific error messages
2. Verify all credentials are correct
3. Test database connection independently
4. Contact your hosting provider for MySQL support

---

**Current Status**: ✅ Ready for deployment
**Database**: 🔄 Waiting for MySQL setup on hPanel
**Fallback**: ✅ Working with local file storage