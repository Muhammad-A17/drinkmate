#!/bin/bash

# DrinkMate Deployment Script
# This script deploys the application to the production server

set -e

echo "🚀 Starting DrinkMate Deployment..."

# Configuration
APP_DIR="/var/www/drinkmate"
BACKUP_DIR="/var/backups/drinkmate"
LOG_DIR="/var/log/drinkmate"
REPO_URL="https://github.com/your-username/drinkmates.git"  # Replace with your actual repo
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as correct user
if [ "$USER" != "drinkmate" ]; then
    print_error "This script must be run as the 'drinkmate' user"
    exit 1
fi

# Create backup
print_status "Creating backup..."
sudo mkdir -p $BACKUP_DIR
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

if [ -d "$APP_DIR" ]; then
    print_status "Backing up current application..."
    sudo cp -r $APP_DIR "$BACKUP_DIR/$BACKUP_NAME/"
    
    # Backup MongoDB
    print_status "Backing up MongoDB..."
    mongodump --db drinkmate_prod --out "$BACKUP_DIR/$BACKUP_NAME/mongodb"
fi

# Clone or update repository
print_status "Updating application code..."
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    sudo mkdir -p $APP_DIR
    sudo chown drinkmate:drinkmate $APP_DIR
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $APP_DIR/server
npm ci --production

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd $APP_DIR/drinkmate-main
npm ci --production
npm run build

# Set proper permissions
print_status "Setting permissions..."
sudo chown -R drinkmate:drinkmate $APP_DIR
sudo chmod -R 755 $APP_DIR

# Copy environment files if they don't exist
if [ ! -f "$APP_DIR/server/.env" ]; then
    print_warning "Environment file not found. Please create $APP_DIR/server/.env"
    print_warning "You can copy from $APP_DIR/server/env-template.txt"
fi

# Restart services with PM2
print_status "Restarting services..."
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Test the deployment
print_status "Testing deployment..."
sleep 10

# Check if services are running
if pm2 list | grep -q "drinkmate-backend.*online"; then
    print_status "Backend service is running"
else
    print_error "Backend service failed to start"
    pm2 logs drinkmate-backend --lines 20
    exit 1
fi

if pm2 list | grep -q "drinkmate-frontend.*online"; then
    print_status "Frontend service is running"
else
    print_error "Frontend service failed to start"
    pm2 logs drinkmate-frontend --lines 20
    exit 1
fi

# Test endpoints
print_status "Testing endpoints..."
if curl -f -s http://localhost:3000/health > /dev/null; then
    print_status "Backend health check passed"
else
    print_warning "Backend health check failed"
fi

if curl -f -s http://localhost:3001 > /dev/null; then
    print_status "Frontend is accessible"
else
    print_warning "Frontend accessibility check failed"
fi

# Reload Nginx
print_status "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

print_status "✅ Deployment completed successfully!"
print_status "Application is now running at: https://drinkmate.sa"
print_status "Backup created at: $BACKUP_DIR/$BACKUP_NAME"

# Show PM2 status
print_status "Current PM2 status:"
pm2 list

# Show recent logs
print_status "Recent logs:"
pm2 logs --lines 10
