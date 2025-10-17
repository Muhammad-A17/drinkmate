#!/bin/bash

# SSL Certificate Setup Script for drinkmate.sa
# This script sets up Let's Encrypt SSL certificate

set -e

echo "🔒 Setting up SSL certificate for drinkmate.sa..."

# Check if domain is pointing to this server
echo "🌐 Checking DNS configuration..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short drinkmate.sa | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "⚠️  WARNING: Domain drinkmate.sa ($DOMAIN_IP) is not pointing to this server ($SERVER_IP)"
    echo "Please update your DNS settings first, then run this script again."
    echo ""
    echo "DNS Configuration needed:"
    echo "A record: drinkmate.sa -> $SERVER_IP"
    echo "A record: www.drinkmate.sa -> $SERVER_IP"
    exit 1
fi

echo "✅ DNS configuration is correct"

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily
echo "⏸️  Stopping Nginx..."
sudo systemctl stop nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --email admin@drinkmate.sa \
    --agree-tos \
    --no-eff-email \
    -d drinkmate.sa \
    -d www.drinkmate.sa

# Copy Nginx configuration
echo "📝 Setting up Nginx configuration..."
sudo cp /var/www/drinkmate/deployment/nginx.conf /etc/nginx/sites-available/drinkmate.sa
sudo ln -sf /etc/nginx/sites-available/drinkmate.sa /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start Nginx
echo "▶️  Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Set up automatic renewal
echo "🔄 Setting up automatic certificate renewal..."
sudo crontab -l 2>/dev/null | grep -v certbot | sudo crontab -
echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo crontab -

# Test SSL certificate
echo "🧪 Testing SSL certificate..."
sleep 5
if curl -f -s https://drinkmate.sa > /dev/null; then
    echo "✅ SSL certificate is working correctly!"
    echo "🌐 Your site is now accessible at: https://drinkmate.sa"
else
    echo "❌ SSL certificate test failed"
    echo "Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
fi

# Show certificate information
echo ""
echo "📋 Certificate Information:"
sudo certbot certificates

echo ""
echo "✅ SSL setup completed!"
echo "🔒 Your site is now secured with HTTPS"
echo "🔄 Certificate will auto-renew every 90 days"
