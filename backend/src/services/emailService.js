const nodemailer = require('nodemailer');

// Email service module containing email sending functions
const emailService = {

    // =====================================================
    // INITIALIZE EMAIL TRANSPORTER
    // =====================================================
    // Purpose: Create nodemailer transporter for sending emails
    // Returns: Configured transporter object
    // Security: Uses environment variables for sensitive credentials
    // Configuration: Supports Gmail, SendGrid, AWS SES, or custom SMTP
    initializeTransporter: () => {
        // Create mail transporter using environment variables for configuration
        // Environment variables should be set in backend/.env file
        // DO NOT hardcode credentials in source code
        // This example uses Gmail SMTP, can be changed to other providers

        // Supported transporter configurations (choose one):
        // 1. Gmail SMTP (requires app password, not regular Gmail password)
        // 2. SendGrid API
        // 3. AWS SES
        // 4. Custom SMTP server

        const transporter = nodemailer.createTransport({
            // SMTP host server address
            // Gmail: smtp.gmail.com
            // For other providers, check their documentation
            host: process.env.SMTP_HOST || 'smtp.gmail.com',

            // SMTP port number
            // 587: TLS (recommended for most services)
            // 465: SSL (older, still supported)
            // 25: Unencrypted (not recommended, may be blocked)
            port: parseInt(process.env.SMTP_PORT || '587'),

            // Whether to use secure connection (SSL/TLS)
            // true: Use SSL/TLS
            // false: Use unencrypted or STARTTLS
            // Port 465: secure should be true
            // Port 587: secure should be false (uses STARTTLS instead)
            secure: process.env.SMTP_SECURE === 'true' || false,

            // Authentication credentials for SMTP server
            // Should be stored in environment variables, never hardcoded
            auth: {
                // Email address or username for SMTP authentication
                // For Gmail: your Gmail address
                // For other services: check their requirements
                user: process.env.SMTP_USER,

                // Password or API key for SMTP authentication
                // For Gmail: Generate App Password (not regular password)
                // For SendGrid/AWS: Use API key
                // Should be kept secret in environment variables
                pass: process.env.SMTP_PASSWORD
            },

            // Additional TLS options for security
            tls: {
                // Allow self-signed certificates (only for testing, not production)
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });

        // Return configured transporter
        return transporter;
    },

    // =====================================================
    // SEND VERIFICATION CODE EMAIL
    // =====================================================
    // Purpose: Send password reset verification code to user email
    // Parameters:
    //   - userEmail: Email address to send code to
    //   - userName: User's name for personalization
    //   - verificationCode: Plain 6-digit code to include in email
    // Returns: Result of email send operation (promise)
    // Security: Code sent via email, user must provide it to verify ownership
    sendVerificationCodeEmail: async (userEmail, userName, verificationCode) => {
        try {
            // Initialize mail transporter
            // This creates the SMTP connection configuration
            const transporter = emailService.initializeTransporter();

            // Construct email subject
            // Clear, professional subject line
            // Should indicate this is for password reset
            const subject = 'AptExchange password reset verification code';

            // Construct email body using HTML template
            // Includes: greeting with user name, verification code, expiration info,
            // security warning, and footer with company contact info
            const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .header {
                background-color: #667eea;
                color: white;
                padding: 20px;
                border-radius: 5px 5px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 20px;
                background-color: #f9f9f9;
              }
              .code-box {
                background-color: #fff;
                border: 2px dashed #667eea;
                padding: 15px;
                text-align: center;
                margin: 20px 0;
                border-radius: 5px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
              }
              .footer {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 0 0 5px 5px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 10px;
                margin: 10px 0;
                border-radius: 3px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>AptExchange</h1>
              </div>
              
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>We received a request to reset the password for your AptExchange account (${userEmail}).</p>
                
                <p>Please use the verification code below to continue with your password reset:</p>
                
                <div class="code-box">
                  <p>Verification Code:</p>
                  <div class="code">${verificationCode}</div>
                </div>
                
                <p><strong>This code will be valid for 15 minutes.</strong></p>
                
                <div class="warning">
                  <p><strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact us immediately. Do not share this code with anyone.</p>
                </div>
                
                <p>Thank you,<br>
                AptExchange Security Team</p>
              </div>
              
              <div class="footer">
                <p>If you have any questions, please contact us at support@aptexchange.com or call 1-800-APT-XCHG</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

            // Construct plain text version of email for clients that don't support HTML
            // Should include all important information from HTML version
            const plainTextContent = `
AptExchange Password Reset Verification Code

Hi ${userName},

We received a request to reset the password for your AptExchange account (${userEmail}).

Please use the verification code below to continue:

Verification code: ${verificationCode}

This code will be valid for 15 minutes.

SECURITY NOTICE: If you did not request a password reset, please ignore this email or contact us immediately at support@aptexchange.com or 1-800-APT-XCHG. Do not share this code with anyone.

Thank you,
AptExchange Security Team

---
This is an automated message. Please do not reply to this email.
      `;

            // Construct mail options for nodemailer
            // Includes: from address, to address, subject, HTML and plain text content
            const mailOptions = {
                // From email address (should match SMTP_USER)
                // Can be formatted as: 'name <email@example.com>'
                from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,

                // Recipient email address
                // This is where the verification code will be sent
                to: userEmail,

                // Email subject line
                subject: subject,

                // Plain text version for compatibility
                // Used by email clients that don't support HTML
                text: plainTextContent,

                // HTML version of email for better formatting
                // This is what most modern email clients will display
                html: htmlContent,

                // Reply-to address for user responses
                // Should be monitored for user inquiries
                replyTo: process.env.SMTP_REPLY_TO || 'noreply@aptexchange.com'
            };

            // Send email using configured transporter
            // Returns promise that resolves with send result
            // Contains info like messageId, response status
            const info = await transporter.sendMail(mailOptions);

            // Log successful send for auditing
            // messageId: unique identifier for this email
            // Used for tracking and debugging
            console.log('Verification code email sent successfully. Message ID:', info.messageId);

            // Return success response
            return {
                success: true,
                messageId: info.messageId,
                message: 'Verification code email sent successfully'
            };

        } catch (error) {
            // Error handling for email sending failures
            // Common causes:
            //   - Invalid SMTP credentials
            //   - Invalid email address
            //   - Network connectivity issues
            //   - Rate limiting from email provider
            console.error('Error sending verification code email:', error);

            // Return error response
            return {
                success: false,
                error: error.message,
                message: 'Failed to send verification code email'
            };
        }
    },

    // =====================================================
    // TEST EMAIL TRANSPORTER
    // =====================================================
    // Purpose: Verify email configuration is working correctly
    // Called: During application startup or configuration testing
    // Returns: Success/failure of transporter verification
    testEmailConfiguration: async () => {
        try {
            // Initialize transporter
            const transporter = emailService.initializeTransporter();

            // Test SMTP connection by verifying configuration
            // This confirms SMTP server is reachable and credentials are valid
            await transporter.verify();

            // Connection successful
            console.log('Email transporter configured successfully');
            return {
                success: true,
                message: 'Email configuration verified successfully'
            };

        } catch (error) {
            // Connection failed - check SMTP settings
            console.error('Email transporter configuration error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Email configuration verification failed. Check SMTP settings in .env file.'
            };
        }
    }
};

// Export email service for use in other modules
// Imported by password reset controller
module.exports = emailService;