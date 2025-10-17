#!/bin/bash

# Simple OVH Server Setup for DrinkMate
# Run this script on your OVH server

echo "🚀 Setting up DrinkMate on OVH Server..."

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/drinkmate
chown -R www-data:www-data /var/www/drinkmate

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

echo "✅ Basic setup completed!"
echo ""
echo "Next steps:"
echo "1. Upload your DrinkMate files to /var/www/drinkmate"
echo "2. Configure your environment variables"
echo "3. Set up your domain DNS"
echo "4. Run the deployment script"
