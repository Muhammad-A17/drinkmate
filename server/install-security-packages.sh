#!/bin/bash

# Security packages installation script for DrinkMate
echo "🔒 Installing security packages for DrinkMate..."

# Install required security packages
npm install --save \
  helmet \
  express-rate-limit \
  express-slow-down \
  express-mongo-sanitize \
  xss-clean \
  hpp \
  sharp \
  bcryptjs \
  jsonwebtoken \
  crypto \
  compression \
  morgan

# Install development security packages
npm install --save-dev \
  eslint-plugin-security \
  @types/bcryptjs \
  @types/jsonwebtoken

echo "✅ Security packages installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with secure values (see security-config.example)"
echo "2. Generate a strong JWT secret: openssl rand -base64 32"
echo "3. Update your database connection string"
echo "4. Configure your CORS origins properly"
echo "5. Test the application thoroughly"
echo ""
echo "🚨 IMPORTANT: Remove demo accounts and weak passwords before production!"
