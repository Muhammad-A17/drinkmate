#!/bin/bash

# DrinkMate Backup Script
# This script creates automated backups of the application and database

set -e

# Configuration
BACKUP_DIR="/var/backups/drinkmate"
APP_DIR="/var/www/drinkmate"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="drinkmate-backup-$DATE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
sudo mkdir -p $BACKUP_DIR
sudo chown drinkmate:drinkmate $BACKUP_DIR

print_status "Starting backup process..."

# Create backup directory for this backup
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p $BACKUP_PATH

# Backup application files
print_status "Backing up application files..."
cp -r $APP_DIR $BACKUP_PATH/

# Backup MongoDB database
print_status "Backing up MongoDB database..."
mongodump --db drinkmate_prod --out $BACKUP_PATH/mongodb

# Backup Nginx configuration
print_status "Backing up Nginx configuration..."
sudo cp -r /etc/nginx $BACKUP_PATH/nginx-config

# Backup SSL certificates
print_status "Backing up SSL certificates..."
sudo cp -r /etc/letsencrypt $BACKUP_PATH/ssl-certificates

# Backup PM2 configuration
print_status "Backing up PM2 configuration..."
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_PATH/

# Create backup info file
print_status "Creating backup information file..."
cat > $BACKUP_PATH/backup-info.txt << EOF
Backup Date: $(date)
Server: $(hostname)
Application Version: $(cd $APP_DIR && git rev-parse HEAD 2>/dev/null || echo "Unknown")
Database: drinkmate_prod
Backup Type: Full
Files: Application, Database, Configuration, SSL Certificates
EOF

# Compress backup
print_status "Compressing backup..."
cd $BACKUP_DIR
tar -czf "$BACKUP_NAME.tar.gz" $BACKUP_NAME
rm -rf $BACKUP_NAME

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_NAME.tar.gz" | cut -f1)
print_status "Backup created: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)"

# Clean up old backups
print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "drinkmate-backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Show backup statistics
print_status "Backup statistics:"
echo "  - Total backups: $(ls -1 $BACKUP_DIR/drinkmate-backup-*.tar.gz 2>/dev/null | wc -l)"
echo "  - Total size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "  - Latest backup: $BACKUP_NAME.tar.gz"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# print_status "Uploading backup to cloud storage..."
# aws s3 cp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" s3://your-backup-bucket/drinkmate/

print_status "✅ Backup completed successfully!"

# Create restore script for this backup
cat > "$BACKUP_DIR/restore-$BACKUP_NAME.sh" << 'EOF'
#!/bin/bash
# Restore script for backup: BACKUP_NAME

set -e

BACKUP_FILE="BACKUP_NAME.tar.gz"
BACKUP_DIR="/var/backups/drinkmate"

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE not found"
    exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"
echo "This will overwrite current application data. Continue? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 1
fi

# Stop services
pm2 stop all

# Extract backup
cd $BACKUP_DIR
tar -xzf $BACKUP_FILE

# Restore application files
sudo rm -rf /var/www/drinkmate
sudo cp -r drinkmate-backup-*/drinkmate /var/www/
sudo chown -R drinkmate:drinkmate /var/www/drinkmate

# Restore database
mongorestore --db drinkmate_prod --drop drinkmate-backup-*/mongodb/drinkmate_prod

# Restore Nginx configuration
sudo cp -r drinkmate-backup-*/nginx-config /etc/nginx

# Restore SSL certificates
sudo cp -r drinkmate-backup-*/ssl-certificates /etc/letsencrypt

# Restore PM2 configuration
cp drinkmate-backup-*/dump.pm2 ~/.pm2/

# Start services
pm2 start ecosystem.config.js --env production

echo "Restore completed successfully!"
EOF

# Replace placeholder in restore script
sed -i "s/BACKUP_NAME/$BACKUP_NAME/g" "$BACKUP_DIR/restore-$BACKUP_NAME.sh"
chmod +x "$BACKUP_DIR/restore-$BACKUP_NAME.sh"

print_status "Restore script created: restore-$BACKUP_NAME.sh"
