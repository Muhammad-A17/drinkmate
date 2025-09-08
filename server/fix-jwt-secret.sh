#!/bin/bash

# ===========================================
# FIX JWT SECRET SCRIPT
# ===========================================
# This script generates a strong JWT secret and updates your .env file

echo "🔐 Fixing JWT Secret for DrinkMate..."

# Navigate to server directory
cd "$(dirname "$0")"

# Generate a strong JWT secret
echo "🔑 Generating strong JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    touch .env
fi

# Update or add JWT_SECRET to .env file
echo "📝 Updating .env file with new JWT_SECRET..."

# Remove existing JWT_SECRET line if it exists
sed -i '/^JWT_SECRET=/d' .env

# Add new JWT_SECRET
echo "JWT_SECRET=$JWT_SECRET" >> .env

echo "✅ JWT_SECRET updated successfully!"
echo ""
echo "🚀 You can now restart your server:"
echo "  npm start"
echo ""
echo "⚠️  IMPORTANT: Keep your JWT_SECRET secure and never commit it to version control!"
echo ""
