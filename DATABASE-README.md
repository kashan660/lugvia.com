# Database Setup Instructions

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
   - Run `npm install` to install dependencies
   - The application will automatically create necessary tables

3. **Test Database Connection:**
   - Run `node test-db.js` to verify connection
   - Check admin panel functionality
   - Test contact forms and quote requests

### Features

- **Automatic Fallback:** If MySQL is not available, the app falls back to file-based storage
- **Data Migration:** Existing JSON data can be migrated using `node migrate-data.js`
- **Analytics:** Built-in views for reporting and analytics
- **Scalability:** Ready for high-volume traffic and concurrent users

### File Structure

- `db-config.js` - Database connection configuration
- `database.js` - Database operations class
- `schema.sql` - Database schema and tables
- `migrate-data.js` - Data migration script
- `test-db.js` - Database testing script

### Troubleshooting

If you encounter connection issues:
1. Verify database credentials in hPanel
2. Check that MySQL service is running
3. Ensure firewall allows database connections
4. Review error logs for specific issues

The application will continue to work with file-based storage if MySQL is unavailable.
