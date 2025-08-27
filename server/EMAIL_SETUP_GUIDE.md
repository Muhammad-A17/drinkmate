# Email Setup Guide for Drinkmate Password Reset

This guide will help you set up email functionality for password reset in your Drinkmate application.

## 🚀 What's Already Implemented

✅ **Frontend Components:**
- Forgot password page (`/forgot-password`)
- Reset password page (`/reset-password/[token]`)
- Password strength validation
- User-friendly error handling

✅ **Backend API:**
- `/api/auth/forgot-password` endpoint
- `/api/auth/reset-password` endpoint
- Token generation and validation
- User model with reset token fields

✅ **Email Service:**
- Professional email templates
- SMTP configuration support
- Error handling and logging
- Test email endpoint

## ❌ What You Need to Configure

### 1. Email Provider Setup

Choose one of the following email providers:

#### Option A: Gmail (Recommended for Testing)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "Mail"
   - Use this password (not your regular Gmail password)

#### Option B: Outlook/Hotmail
1. **Enable 2-Factor Authentication** on your Outlook account
2. **Generate an App Password:**
   - Go to [Microsoft Account Security](https://account.microsoft.com/security)
   - Advanced security options → App passwords
   - Generate a new app password

#### Option C: Custom SMTP Server
Contact your hosting provider for SMTP details.

### 2. Environment Configuration

Update your `server/.env` file with your email credentials:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com          # or your SMTP server
SMTP_PORT=587                     # 587 for TLS, 465 for SSL
SMTP_USER=your-email@gmail.com    # Your email address
SMTP_PASS=your-app-password       # Your app password (not regular password)

# Alternative variables (for backward compatibility)
EMAIL_USER=${SMTP_USER}
EMAIL_PASS=${SMTP_PASS}

# Environment
NODE_ENV=development              # Set to 'production' in production
```

### 3. Test the Setup

1. **Start your server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test email connection:**
   ```bash
   # Using curl or Postman
   POST http://localhost:3000/api/auth/test-email
   {
     "email": "your-test-email@example.com",
     "template": "passwordReset"
   }
   ```

3. **Test forgot password:**
   - Go to `/forgot-password` page
   - Enter a valid email address
   - Check if you receive the password reset email

## 🔧 Troubleshooting

### Common Issues:

1. **"Authentication failed" error:**
   - Make sure you're using an app password, not your regular password
   - Verify 2FA is enabled on your email account
   - Check if "Less secure app access" is OFF (for Gmail)

2. **"Connection timeout" error:**
   - Check your firewall settings
   - Verify SMTP port (587 for TLS, 465 for SSL)
   - Try different SMTP servers

3. **"Email not received":**
   - Check spam/junk folder
   - Verify email address is correct
   - Check server logs for errors

### Debug Steps:

1. **Check server logs** for email-related errors
2. **Verify environment variables** are loaded correctly
3. **Test SMTP connection** using the test endpoint
4. **Check email provider settings** and app passwords

## 📧 Email Templates

The application includes two professional email templates:

1. **Password Reset Request** - Sent when user requests password reset
2. **Password Reset Success** - Sent when password is successfully reset

Both templates include:
- Professional branding with Drinkmate logo
- Clear call-to-action buttons
- Security warnings and recommendations
- Contact information and support details

## 🚀 Production Deployment

For production:

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   SMTP_HOST=your-production-smtp-server
   SMTP_USER=your-production-email
   SMTP_PASS=your-production-password
   ```

2. **Use production SMTP server** (not Gmail/Outlook)
3. **Monitor email delivery** and bounce rates
4. **Set up email analytics** if needed

## 📱 Frontend Integration

The frontend is already integrated and will:
- Show loading states during email sending
- Display success/error messages
- Handle email validation
- Provide user feedback

## 🔒 Security Features

- **Token expiration:** Reset tokens expire in 1 hour
- **Secure token generation:** Uses crypto.randomBytes()
- **Rate limiting:** Prevents abuse (implement in production)
- **Audit logging:** Tracks password reset attempts

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review server logs for errors
3. Test email connection using the test endpoint
4. Verify your email provider settings

## 🎯 Next Steps

After setting up email:
1. Test the complete password reset flow
2. Customize email templates if needed
3. Set up email monitoring
4. Implement additional security measures (rate limiting, etc.)

---

**Note:** This setup is for development/testing. For production, use a professional email service provider with proper deliverability and monitoring.
