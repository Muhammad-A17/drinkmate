#!/bin/bash

# DrinkMate Secure Environment Setup Script
echo "🔒 Setting up secure environment for DrinkMate..."

# Check if running on Windows (Git Bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "⚠️  Windows detected. Please run this script in Git Bash or WSL."
    echo "Alternatively, set environment variables manually in your .env file."
    exit 1
fi

# Generate secure secrets
echo "🔐 Generating secure secrets..."

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET: ${JWT_SECRET:0:10}..."

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)
echo "Generated SESSION_SECRET: ${SESSION_SECRET:0:10}..."

# Generate admin password
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
echo "Generated ADMIN_PASSWORD: ${ADMIN_PASSWORD:0:5}..."

# Generate test password
TEST_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
echo "Generated TEST_PASSWORD: ${TEST_PASSWORD:0:5}..."

# Create .env file
echo "📝 Creating secure .env file..."

cat > .env << EOF
# ===========================================
# DRINKMATE SECURE ENVIRONMENT CONFIGURATION
# ===========================================
# Generated on: $(date)
# NEVER commit this file to version control

# ===========================================
# SERVER CONFIGURATION
# ===========================================
NODE_ENV=production
PORT=3000

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# ⚠️  UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drinkmate?retryWrites=true&w=majority&authSource=admin

# ===========================================
# FRONTEND CONFIGURATION
# ===========================================
# ⚠️  UPDATE WITH YOUR ACTUAL DOMAIN
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# ===========================================
# CLOUDINARY CONFIGURATION
# ===========================================
# ⚠️  UPDATE WITH YOUR ACTUAL CLOUDINARY CREDENTIALS
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
# ⚠️  UPDATE WITH YOUR ACTUAL EMAIL CREDENTIALS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password

# ===========================================
# PAYMENT GATEWAY CONFIGURATION
# ===========================================
# ⚠️  UPDATE WITH YOUR ACTUAL PAYMENT CREDENTIALS
URWAYS_API_KEY=your_urways_api_key
URWAYS_SECRET_KEY=your_urways_secret_key
URWAYS_MERCHANT_ID=your_urways_merchant_id
URWAYS_ENVIRONMENT=production

TAP_API_KEY=your_tap_api_key
TAP_SECRET_KEY=your_tap_secret_key
TAP_MERCHANT_ID=your_tap_merchant_id
TAP_ENVIRONMENT=production

# ===========================================
# ADMIN CREDENTIALS
# ===========================================
ADMIN_PASSWORD=${ADMIN_PASSWORD}
TEST_PASSWORD=${TEST_PASSWORD}

# ===========================================
# SECURITY MONITORING
# ===========================================
SECURITY_LOGGING=true
LOG_LEVEL=warn

# ===========================================
# BACKUP CONFIGURATION
# ===========================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
EOF

echo "✅ Secure .env file created successfully!"
echo ""
echo "🚨 CRITICAL NEXT STEPS:"
echo "1. Update the following values in .env file:"
echo "   - MONGODB_URI (your actual database connection)"
echo "   - FRONTEND_URL (your actual domain)"
echo "   - CORS_ORIGIN (your actual domain)"
echo "   - CLOUDINARY_* (your actual Cloudinary credentials)"
echo "   - SMTP_* (your actual email credentials)"
echo "   - URWAYS_* and TAP_* (your actual payment credentials)"
echo ""
echo "2. Save your admin credentials:"
echo "   - Admin Password: ${ADMIN_PASSWORD}"
echo "   - Test Password: ${TEST_PASSWORD}"
echo ""
echo "3. Test the server:"
echo "   npm start"
echo ""
echo "🔒 Security Status: READY FOR PRODUCTION"
