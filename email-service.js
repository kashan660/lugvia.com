const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configure email transporter (using Gmail as example)
        // In production, use environment variables for credentials
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });
        
        this.fromEmail = process.env.FROM_EMAIL || 'support@lugvia.com';
        this.companyName = 'Lugvia';
    }

    async sendTicketCreatedEmail(ticket) {
        const subject = `Ticket Created: ${ticket.subject} [${ticket.id}]`;
        const html = this.generateTicketCreatedTemplate(ticket);
        
        try {
            await this.sendEmail(ticket.email, subject, html);
            console.log(`Ticket creation email sent to ${ticket.email}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send ticket creation email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendTicketStatusUpdateEmail(ticket, oldStatus) {
        const subject = `Ticket Status Updated: ${ticket.subject} [${ticket.id}]`;
        const html = this.generateStatusUpdateTemplate(ticket, oldStatus);
        
        try {
            await this.sendEmail(ticket.email, subject, html);
            console.log(`Status update email sent to ${ticket.email}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send status update email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendTicketResponseEmail(ticket, response) {
        const subject = `New Response: ${ticket.subject} [${ticket.id}]`;
        const html = this.generateResponseTemplate(ticket, response);
        
        try {
            await this.sendEmail(ticket.email, subject, html);
            console.log(`Response email sent to ${ticket.email}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to send response email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendEmail(to, subject, html) {
        const mailOptions = {
            from: `${this.companyName} Support <${this.fromEmail}>`,
            to: to,
            subject: subject,
            html: html
        };

        return await this.transporter.sendMail(mailOptions);
    }

    generateTicketCreatedTemplate(ticket) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .ticket-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .status-badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
                .status-open { background: #e74c3c; }
                .priority-${ticket.priority} { color: ${this.getPriorityColor(ticket.priority)}; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${this.companyName} Support</h1>
                    <h2>Ticket Created Successfully</h2>
                </div>
                <div class="content">
                    <p>Dear ${ticket.name},</p>
                    <p>Thank you for contacting us. Your support ticket has been created and our team will review it shortly.</p>
                    
                    <div class="ticket-info">
                        <h3>Ticket Details:</h3>
                        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                        <p><strong>Category:</strong> ${this.getCategoryLabel(ticket.category)}</p>
                        <p><strong>Priority:</strong> <span class="priority-${ticket.priority}">${ticket.priority.toUpperCase()}</span></p>
                        <p><strong>Status:</strong> <span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span></p>
                        <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div class="ticket-info">
                        <h3>Your Message:</h3>
                        <p>${ticket.description.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <p>We aim to respond to all tickets within 24 hours. You will receive email notifications when there are updates to your ticket.</p>
                    <p>If you need to add more information, please reply to this email with your ticket ID: <strong>${ticket.id}</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ${this.companyName} Support System.</p>
                    <p>Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateStatusUpdateTemplate(ticket, oldStatus) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .ticket-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .status-badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
                .status-open { background: #e74c3c; }
                .status-in-progress { background: #f39c12; }
                .status-resolved { background: #27ae60; }
                .status-closed { background: #95a5a6; }
                .status-change { background: #ecf0f1; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${this.companyName} Support</h1>
                    <h2>Ticket Status Updated</h2>
                </div>
                <div class="content">
                    <p>Dear ${ticket.name},</p>
                    <p>The status of your support ticket has been updated.</p>
                    
                    <div class="ticket-info">
                        <h3>Ticket Details:</h3>
                        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                    </div>
                    
                    <div class="status-change">
                        <h3>Status Change:</h3>
                        <p><strong>Previous Status:</strong> <span class="status-badge status-${oldStatus}">${oldStatus.toUpperCase()}</span></p>
                        <p><strong>Current Status:</strong> <span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span></p>
                        <p><strong>Updated:</strong> ${new Date(ticket.updatedAt).toLocaleString()}</p>
                    </div>
                    
                    ${ticket.status === 'resolved' ? '<p><strong>Your ticket has been resolved!</strong> If you are satisfied with the resolution, no further action is needed. If you need additional assistance, please reply to this email.</p>' : ''}
                    ${ticket.status === 'closed' ? '<p><strong>Your ticket has been closed.</strong> If you need further assistance, please create a new ticket.</p>' : ''}
                    
                    <p>Thank you for your patience.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ${this.companyName} Support System.</p>
                    <p>Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateResponseTemplate(ticket, response) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .ticket-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .response { background: #e8f5e8; padding: 15px; border-left: 4px solid #27ae60; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${this.companyName} Support</h1>
                    <h2>New Response to Your Ticket</h2>
                </div>
                <div class="content">
                    <p>Dear ${ticket.name},</p>
                    <p>Our support team has responded to your ticket.</p>
                    
                    <div class="ticket-info">
                        <h3>Ticket Details:</h3>
                        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                    </div>
                    
                    <div class="response">
                        <h3>Support Team Response:</h3>
                        <p>${response.message.replace(/\n/g, '<br>')}</p>
                        <p><small><strong>Response by:</strong> ${response.author} on ${new Date(response.timestamp).toLocaleString()}</small></p>
                    </div>
                    
                    <p>If you need further assistance, please reply to this email with your ticket ID: <strong>${ticket.id}</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message from ${this.companyName} Support System.</p>
                    <p>Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getPriorityColor(priority) {
        const colors = {
            low: '#27ae60',
            medium: '#f39c12',
            high: '#e74c3c',
            critical: '#8e44ad'
        };
        return colors[priority] || '#333';
    }

    getCategoryLabel(category) {
        const labels = {
            technical: 'Technical Support',
            billing: 'Billing & Payments',
            general: 'General Inquiry',
            feature: 'Feature Request',
            bug: 'Bug Report'
        };
        return labels[category] || category;
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('SMTP connection test successful');
            return true;
        } catch (error) {
            console.error('SMTP connection test failed:', error);
            return false;
        }
    }

    updateConfiguration(config) {
        if (config.host && config.port && config.user && config.pass) {
            this.transporter = nodemailer.createTransporter({
                host: config.host,
                port: config.port,
                secure: config.secure || false,
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });
            
            if (config.fromEmail) {
                this.fromEmail = config.fromEmail;
            }
            
            return true;
        }
        return false;
    }
}

module.exports = EmailService;