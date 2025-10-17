const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Email templates
const emailTemplates = {
  passwordReset: (resetUrl, userName = 'User') => ({
    subject: 'Password Reset Request - Drinkmate',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Drinkmate</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #12d6fa 0%, #0fb8d9 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .title {
            font-size: 28px;
            font-weight: 600;
            opacity: 0.95;
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #555;
            margin-bottom: 25px;
          }
          
          .description {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
          }
          
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #12d6fa 0%, #0fb8d9 100%);
            color: #ffffff;
            padding: 20px 45px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(18, 214, 250, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
          }
          
          .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .reset-button:hover::before {
            left: 100%;
          }
          
          .reset-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(18, 214, 250, 0.4);
          }
          
          .warning-box {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 2px solid #f39c12;
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          
          .warning-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .warning-text {
            color: #856404;
            font-weight: 600;
            font-size: 15px;
          }
          
          .link-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
          }
          
          .link-label {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          .reset-link {
            color: #12d6fa;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            background: #ffffff;
            padding: 15px;
            border-radius: 10px;
            border: 2px dashed #e9ecef;
            display: block;
            margin: 10px 0;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          
          .signature {
            color: #555;
            margin-bottom: 25px;
            font-size: 16px;
          }
          
          .contact-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 25px 0;
            flex-wrap: wrap;
          }
          
          .contact-link {
            color: #12d6fa;
            text-decoration: none;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            background: #ffffff;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
          }
          
          .contact-link:hover {
            background: #12d6fa;
            color: #ffffff;
            border-color: #12d6fa;
          }
          
          .copyright {
            color: #999;
            font-size: 14px;
            margin-top: 20px;
          }
          
          .security-note {
            color: #999;
            font-size: 12px;
            margin-top: 15px;
            font-style: italic;
          }
          
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 10px;
              border-radius: 15px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .title {
              font-size: 24px;
            }
            
            .contact-links {
              flex-direction: column;
              gap: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Professional Header with Company Info -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
            <div style="color: #666; font-size: 12px; margin-bottom: 10px;">DRINKMATE OFFICIAL COMMUNICATION</div>
            <div style="color: #333; font-size: 14px; font-weight: 600;">Secure • Professional • Reliable</div>
          </div>
          
          <div class="header">
            <div class="logo">🥤 Drinkmate</div>
            <div class="title">Password Reset Request</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello <strong>${userName}</strong>,</div>
            
            <div class="description">
              We received a request to reset your password for your Drinkmate account. 
              If you didn't make this request, you can safely ignore this email.
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">
                🔐 Reset My Password
              </a>
            </div>
            
            <!-- Professional Urgency Indicator -->
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; border-radius: 15px; margin: 30px 0; text-align: center; box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);">
              <div style="font-size: 24px; margin-bottom: 10px;">⏰</div>
              <div style="font-size: 18px; font-weight: 700; margin-bottom: 5px;">URGENT: Link Expires Soon</div>
              <div style="font-size: 14px; opacity: 0.9;">This password reset link will expire in 1 hour for your protection</div>
            </div>
            
            <div class="warning-box">
              <div class="warning-icon">🔒</div>
              <div class="warning-text">
                <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your protection.
              </div>
            </div>
            
            <div class="link-section">
              <div class="link-label">
                If the button above doesn't work, copy and paste this link into your browser:
              </div>
              <div class="reset-link">${resetUrl}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 15px;">
                Need help? Our support team is here to assist you.
              </p>
            </div>
            
            <!-- Professional Contact Section -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; padding: 25px; margin: 30px 0; border-left: 4px solid #12d6fa;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 20px; color: #333; font-weight: 600; margin-bottom: 5px;">📞 Need Immediate Assistance?</div>
                <div style="color: #666; font-size: 14px;">Our dedicated support team is available 24/7</div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef;">
                  <div style="font-size: 16px; color: #12d6fa; font-weight: 600;">📧 Email Support</div>
                  <div style="color: #666; font-size: 12px; margin-top: 5px;">support@drinkmate.sa</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef;">
                  <div style="font-size: 16px; color: #12d6fa; font-weight: 600;">📞 Phone Support</div>
                  <div style="color: #666; font-size: 12px; margin-top: 5px;">+966 12 345 6789</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="signature">
              Best regards,<br>
              <strong>The Drinkmate Team</strong>
            </div>
            
            <div class="contact-links">
              <a href="https://drinkmate.sa" class="contact-link">🌐 Website</a>
              <a href="mailto:support@drinkmate.sa" class="contact-link">📧 Support</a>
              <a href="tel:+966123456789" class="contact-link">📞 +966 12 345 6789</a>
            </div>
            
            <!-- Social Media Links -->
            <div style="margin: 25px 0; text-align: center;">
              <div style="color: #666; font-size: 14px; margin-bottom: 15px;">Follow Us</div>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <a href="https://facebook.com/drinkmate" style="color: #1877f2; text-decoration: none; font-size: 20px;">📘</a>
                <a href="https://twitter.com/drinkmate" style="color: #1da1f2; text-decoration: none; font-size: 20px;">🐦</a>
                <a href="https://instagram.com/drinkmate" style="color: #e4405f; text-decoration: none; font-size: 20px;">📷</a>
                <a href="https://linkedin.com/company/drinkmate" style="color: #0077b5; text-decoration: none; font-size: 20px;">💼</a>
              </div>
            </div>
            
            <div class="copyright">
              © ${new Date().getFullYear()} Drinkmate. All rights reserved.
            </div>
            
            <div class="security-note">
              This email was sent to you because you requested a password reset for your Drinkmate account.
            </div>
            
            <!-- Professional Footer Bar -->
            <div style="background: #2c3e50; color: white; padding: 15px; margin: 30px -30px -30px -30px; text-align: center; font-size: 12px;">
              <div style="margin-bottom: 10px;">🔒 This is a secure, encrypted communication from Drinkmate</div>
              <div>If you have any concerns, please contact our security team immediately</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
╔══════════════════════════════════════════════════════════════╗
║                    🥤 DRINKMATE                              ║
║                Password Reset Request                        ║
╚══════════════════════════════════════════════════════════════╝

Hello ${userName},

We received a request to reset your password for your Drinkmate account. 
If you didn't make this request, you can safely ignore this email.

🔐 RESET YOUR PASSWORD:
${resetUrl}

⚠️  SECURITY NOTICE:
This password reset link will expire in 1 hour for your protection.

If you have any questions or need assistance, please contact our support team.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
The Drinkmate Team

📞 Contact Information:
• Website: https://drinkmate.sa
• Support: support@drinkmate.sa
• Phone: +966 12 345 6789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} Drinkmate. All rights reserved.

This email was sent to you because you requested a password reset 
for your Drinkmate account.
    `
  }),
  
  passwordResetSuccess: (userName = 'User') => ({
    subject: 'Password Successfully Reset - Drinkmate',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Success - Drinkmate</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .title {
            font-size: 28px;
            font-weight: 600;
            opacity: 0.95;
          }
          
          .success-icon {
            font-size: 64px;
            margin: 20px 0;
            animation: bounce 2s infinite;
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #555;
            margin-bottom: 25px;
          }
          
          .success-message {
            color: #28a745;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #d4edda;
            border-radius: 15px;
            border: 2px solid #c3e6cb;
          }
          
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          
          .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #12d6fa 0%, #0fb8d9 100%);
            color: #ffffff;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(18, 214, 250, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(18, 214, 250, 0.4);
          }
          
          .security-alert {
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border: 2px solid #dc3545;
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          
          .alert-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .alert-text {
            color: #721c24;
            font-weight: 600;
            font-size: 15px;
          }
          
          .security-tips {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .tips-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .tips-list {
            list-style: none;
            padding: 0;
          }
          
          .tips-list li {
            color: #666;
            margin-bottom: 12px;
            padding-left: 25px;
            position: relative;
          }
          
          .tips-list li:before {
            content: "🔒";
            position: absolute;
            left: 0;
            top: 0;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          
          .signature {
            color: #555;
            margin-bottom: 25px;
            font-size: 16px;
          }
          
          .contact-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 25px 0;
            flex-wrap: wrap;
          }
          
          .contact-link {
            color: #12d6fa;
            text-decoration: none;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            background: #ffffff;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
          }
          
          .contact-link:hover {
            background: #12d6fa;
            color: #ffffff;
            border-color: #12d6fa;
          }
          
          .copyright {
            color: #999;
            font-size: 14px;
            margin-top: 20px;
          }
          
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 10px;
              border-radius: 15px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .title {
              font-size: 24px;
            }
            
            .contact-links {
              flex-direction: column;
              gap: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Professional Header with Company Info -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
            <div style="color: #666; font-size: 12px; margin-bottom: 10px;">DRINKMATE OFFICIAL COMMUNICATION</div>
            <div style="color: #333; font-size: 14px; font-weight: 600;">Secure • Professional • Reliable</div>
          </div>
          
          <div class="header">
            <div class="logo">🥤 Drinkmate</div>
            <div class="title">Password Reset Successful</div>
            <div class="success-icon">🎉</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello <strong>${userName}</strong>,</div>
            
            <div class="success-message">
              🎉 Congratulations! Your password has been successfully reset!
            </div>
            
            <div class="button-container">
              <a href="${process.env.FRONTEND_URL || 'https://drinkmate.sa'}/login" class="login-button">
                🔐 Login to Your Account
              </a>
            </div>
            
            <div class="security-alert">
              <div class="alert-icon">⚠️</div>
              <div class="alert-text">
                <strong>Security Alert:</strong> If you didn't request this password reset, 
                please contact our support team immediately as your account security may have been compromised.
              </div>
            </div>
            
            <div class="security-tips">
              <div class="tips-title">🔒 Security Recommendations</div>
              <ul class="tips-list">
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication if available</li>
                <li>Regularly update your password</li>
                <li>Never share your password with anyone</li>
                <li>Use different passwords for different accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 15px;">
                Welcome back! We're glad to have you back in your Drinkmate account.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="signature">
              Best regards,<br>
              <strong>The Drinkmate Team</strong>
            </div>
            
            <div class="contact-links">
              <a href="https://drinkmate.sa" class="contact-link">🌐 Website</a>
              <a href="mailto:support@drinkmate.sa" class="contact-link">📧 Support</a>
              <a href="tel:+966123456789" class="contact-link">📞 +966 12 345 6789</a>
            </div>
            
            <!-- Social Media Links -->
            <div style="margin: 25px 0; text-align: center;">
              <div style="color: #666; font-size: 14px; margin-bottom: 15px;">Follow Us</div>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <a href="https://facebook.com/drinkmate" style="color: #1877f2; text-decoration: none; font-size: 20px;">📘</a>
                <a href="https://twitter.com/drinkmate" style="color: #1da1f2; text-decoration: none; font-size: 20px;">🐦</a>
                <a href="https://instagram.com/drinkmate" style="color: #e4405f; text-decoration: none; font-size: 20px;">📷</a>
                <a href="https://linkedin.com/company/drinkmate" style="color: #0077b5; text-decoration: none; font-size: 20px;">💼</a>
              </div>
            </div>
            
            <div class="copyright">
              © ${new Date().getFullYear()} Drinkmate. All rights reserved.
            </div>
            
            <!-- Professional Footer Bar -->
            <div style="background: #2c3e50; color: white; padding: 15px; margin: 30px -30px -30px -30px; text-align: center; font-size: 12px;">
              <div style="margin-bottom: 10px;">🔒 This is a secure, encrypted communication from Drinkmate</div>
              <div>If you have any concerns, please contact our security team immediately</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
╔══════════════════════════════════════════════════════════════╗
║                    🥤 DRINKMATE                              ║
║                Password Reset Successful                     ║
╚══════════════════════════════════════════════════════════════╝

Hello ${userName},

🎉 CONGRATULATIONS! Your password has been successfully reset!

🔐 LOGIN TO YOUR ACCOUNT:
${process.env.FRONTEND_URL || 'https://drinkmate.sa'}/login

⚠️  SECURITY ALERT:
If you didn't request this password reset, please contact our support team 
immediately as your account security may have been compromised.

🔒 SECURITY RECOMMENDATIONS:
• Use a strong, unique password
• Enable two-factor authentication if available
• Regularly update your password
• Never share your password with anyone
• Use different passwords for different accounts
• Consider using a password manager

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
The Drinkmate Team

📞 Contact Information:
• Website: https://drinkmate.sa
• Support: support@drinkmate.sa
• Phone: +966 12 345 6789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} Drinkmate. All rights reserved.

Welcome back! We're glad to have you back in your Drinkmate account.
    `
  }),

  // Welcome email for new users
  welcomeEmail: (userName = 'User') => ({
    subject: 'Welcome to Drinkmate! 🥤',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Drinkmate</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #12d6fa 0%, #0fb8d9 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .title {
            font-size: 28px;
            font-weight: 600;
            opacity: 0.95;
          }
          
          .welcome-icon {
            font-size: 64px;
            margin: 20px 0;
            animation: wave 2s infinite;
          }
          
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(20deg); }
            75% { transform: rotate(-20deg); }
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .greeting {
            font-size: 20px;
            color: #555;
            margin-bottom: 25px;
            text-align: center;
          }
          
          .welcome-message {
            color: #12d6fa;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #e3f2fd;
            border-radius: 15px;
            border: 2px solid #bbdefb;
          }
          
          .features {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .features-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .features-list {
            list-style: none;
            padding: 0;
          }
          
          .features-list li {
            color: #666;
            margin-bottom: 12px;
            padding-left: 25px;
            position: relative;
          }
          
          .features-list li:before {
            content: "✨";
            position: absolute;
            left: 0;
            top: 0;
          }
          
          .cta-section {
            text-align: center;
            margin: 35px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #12d6fa 0%, #0fb8d9 100%);
            color: #ffffff;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(18, 214, 250, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(18, 214, 250, 0.4);
          }
          
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          
          .signature {
            color: #555;
            margin-bottom: 25px;
            font-size: 16px;
          }
          
          .contact-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 25px 0;
            flex-wrap: wrap;
          }
          
          .contact-link {
            color: #12d6fa;
            text-decoration: none;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            background: #ffffff;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
          }
          
          .contact-link:hover {
            background: #12d6fa;
            color: #ffffff;
            border-color: #12d6fa;
          }
          
          .copyright {
            color: #999;
            font-size: 14px;
            margin-top: 20px;
          }
          
          @media (max-width: 600px) {
            .email-wrapper {
              margin: 10px;
              border-radius: 15px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .title {
              font-size: 24px;
            }
            
            .contact-links {
              flex-direction: column;
              gap: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Professional Header with Company Info -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
            <div style="color: #666; font-size: 12px; margin-bottom: 10px;">DRINKMATE OFFICIAL COMMUNICATION</div>
            <div style="color: #333; font-size: 14px; font-weight: 600;">Welcome • Professional • Reliable</div>
          </div>
          
          <div class="header">
            <div class="logo">🥤 Drinkmate</div>
            <div class="title">Welcome to Drinkmate!</div>
            <div class="welcome-icon">👋</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello <strong>${userName}</strong>!</div>
            
            <div class="welcome-message">
              🎉 Welcome to the Drinkmate family! We're excited to have you on board.
            </div>
            
            <div class="features">
              <div class="features-title">🚀 What You Can Do Now</div>
              <ul class="features-list">
                <li>Browse our premium soda makers and accessories</li>
                <li>Discover delicious flavor syrups</li>
                <li>Get exclusive deals and promotions</li>
                <li>Track your orders and manage your account</li>
                <li>Access 24/7 customer support</li>
                <li>Join our loyalty program</li>
              </ul>
            </div>
            
            <div class="cta-section">
              <a href="${process.env.FRONTEND_URL || 'https://drinkmate.sa'}/shop" class="cta-button">
                🛍️ Start Shopping Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 15px;">
                Ready to create amazing sparkling drinks at home? Let's get started!
              </p>
            </div>
            
            <!-- Professional Contact Section -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; padding: 25px; margin: 30px 0; border-left: 4px solid #12d6fa;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 20px; color: #333; font-weight: 600; margin-bottom: 5px;">🚀 Ready to Get Started?</div>
                <div style="color: #666; font-size: 14px;">Our team is here to help you every step of the way</div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef;">
                  <div style="font-size: 16px; color: #12d6fa; font-weight: 600;">📧 Email Support</div>
                  <div style="color: #666; font-size: 12px; margin-top: 5px;">support@drinkmate.sa</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e9ecef;">
                  <div style="font-size: 16px; color: #12d6fa; font-weight: 600;">📞 Phone Support</div>
                  <div style="color: #666; font-size: 12px; margin-top: 5px;">+966 12 345 6789</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="signature">
              Welcome aboard!<br>
              <strong>The Drinkmate Team</strong>
            </div>
            
            <div class="contact-links">
              <a href="https://drinkmate.sa" class="contact-link">🌐 Website</a>
              <a href="mailto:support@drinkmate.sa" class="contact-link">📧 Support</a>
              <a href="tel:+966123456789" class="contact-link">📞 +966 12 345 6789</a>
            </div>
            
            <!-- Social Media Links -->
            <div style="margin: 25px 0; text-align: center;">
              <div style="color: #666; font-size: 14px; margin-bottom: 15px;">Follow Us</div>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <a href="https://facebook.com/drinkmate" style="color: #1877f2; text-decoration: none; font-size: 20px;">📘</a>
                <a href="https://twitter.com/drinkmate" style="color: #1da1f2; text-decoration: none; font-size: 20px;">🐦</a>
                <a href="https://instagram.com/drinkmate" style="color: #e4405f; text-decoration: none; font-size: 20px;">📷</a>
                <a href="https://linkedin.com/company/drinkmate" style="color: #0077b5; text-decoration: none; font-size: 20px;">💼</a>
              </div>
            </div>
            
            <div class="copyright">
              © ${new Date().getFullYear()} Drinkmate. All rights reserved.
            </div>
            
            <!-- Professional Footer Bar -->
            <div style="background: #2c3e50; color: white; padding: 15px; margin: 30px -30px -30px -30px; text-align: center; font-size: 12px;">
              <div style="margin-bottom: 10px;">🔒 This is a secure, encrypted communication from Drinkmate</div>
              <div>If you have any concerns, please contact our security team immediately</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
╔══════════════════════════════════════════════════════════════╗
║                    🥤 DRINKMATE                              ║
║                    Welcome Aboard!                           ║
╚══════════════════════════════════════════════════════════════╝

Hello ${userName}!

🎉 WELCOME TO THE DRINKMATE FAMILY!

We're excited to have you on board and can't wait to help you create 
amazing sparkling drinks at home!

✨ WHAT YOU CAN DO NOW:
• Browse our premium soda makers and accessories
• Discover delicious flavor syrups
• Get exclusive deals and promotions
• Track your orders and manage your account
• Access 24/7 customer support
• Join our loyalty program

🛍️ START SHOPPING NOW:
${process.env.FRONTEND_URL || 'https://drinkmate.sa'}/shop

Ready to create amazing sparkling drinks at home? Let's get started!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome aboard!
The Drinkmate Team

📞 Contact Information:
• Website: https://drinkmate.sa
• Support: support@drinkmate.sa
• Phone: +966 12 345 6789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} Drinkmate. All rights reserved.
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    
    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // Generate template content
    const templateContent = typeof emailTemplate === 'function' 
      ? emailTemplate(data) 
      : emailTemplate;
    
    // Email options
    const mailOptions = {
      from: `"Drinkmate" <${process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@drinkmate.sa'}>`,
      to: to,
      subject: templateContent.subject,
      html: templateContent.html,
      text: templateContent.text
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Specific email functions
const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  return await sendEmail(email, 'passwordReset', { resetUrl, userName });
};

const sendPasswordResetSuccessEmail = async (email, userName) => {
  return await sendEmail(email, 'passwordResetSuccess', { userName });
};

const sendWelcomeEmail = async (email, userName) => {
  return await sendEmail(email, 'welcomeEmail', { userName });
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email connection successful' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
  testEmailConnection,
  emailTemplates
};
