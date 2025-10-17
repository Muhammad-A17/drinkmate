#!/bin/bash

# DrinkMate Server Setup Script
# This script sets up a dedicated server for hosting drinkmate.sa

set -e

echo "🚀 Starting DrinkMate Server Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Install UFW firewall
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # Backend port
sudo ufw allow 3001  # Frontend port
sudo ufw --force enable

# Create application user
echo "👤 Creating application user..."
sudo useradd -m -s /bin/bash drinkmate
sudo usermod -aG sudo drinkmate

# Create application directory
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/drinkmate
sudo chown -R drinkmate:drinkmate /var/www/drinkmate

# Create logs directory
sudo mkdir -p /var/log/drinkmate
sudo chown -R drinkmate:drinkmate /var/log/drinkmate

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this server's IP"
echo "2. Run the deployment script to deploy your application"
echo "3. Configure SSL certificate"
echo ""
echo "Server IP: $(curl -s ifconfig.me)"
