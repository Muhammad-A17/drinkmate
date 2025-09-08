#!/bin/bash

# ===========================================
# DRINKMATE ADVANCED SECURITY PACKAGES
# ===========================================
# This script installs all packages needed for advanced security features

echo "🔒 Installing advanced security packages for DrinkMate..."

# Navigate to server directory
cd "$(dirname "$0")"

# Install 2FA packages
echo "📱 Installing 2FA packages..."
npm install speakeasy qrcode

# Install API security packages
echo "🔐 Installing API security packages..."
npm install express-validator joi

# Install monitoring packages
echo "📊 Installing monitoring packages..."
npm install winston winston-daily-rotate-file

# Install additional security packages
echo "🛡️ Installing additional security packages..."
npm install express-brute express-brute-redis
npm install express-limiter
npm install express-session connect-redis
npm install cookie-parser
npm install csrf
npm install express-validator

# Install development security packages
echo "🔧 Installing development security packages..."
npm install --save-dev eslint-plugin-security
npm install --save-dev @types/speakeasy
npm install --save-dev @types/qrcode

# Install optional packages for enhanced security
echo "⚡ Installing optional enhanced security packages..."
npm install express-slow-down
npm install express-mongo-sanitize
npm install xss-clean
npm install hpp

echo ""
echo "✅ All advanced security packages installed successfully!"
echo ""
echo "📋 Installed packages:"
echo "  - speakeasy (2FA)"
echo "  - qrcode (QR code generation)"
echo "  - express-validator (Input validation)"
echo "  - joi (Schema validation)"
echo "  - winston (Logging)"
echo "  - winston-daily-rotate-file (Log rotation)"
echo "  - express-brute (Brute force protection)"
echo "  - express-session (Session management)"
echo "  - connect-redis (Redis session store)"
echo "  - cookie-parser (Cookie parsing)"
echo "  - csrf (CSRF protection)"
echo "  - express-slow-down (Rate limiting)"
echo "  - express-mongo-sanitize (NoSQL injection protection)"
echo "  - xss-clean (XSS protection)"
echo "  - hpp (HTTP parameter pollution protection)"
echo ""
echo "🚀 Next steps:"
echo "  1. Generate a strong JWT secret: openssl rand -base64 32"
echo "  2. Update your .env file with the new JWT_SECRET"
echo "  3. Restart your server"
echo ""
