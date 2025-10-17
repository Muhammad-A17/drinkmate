# DrinkMate Server Deployment Guide

This guide will help you deploy your DrinkMate application to a dedicated server with the domain `drinkmate.sa`.

## Prerequisites

- A dedicated server (VPS/Cloud server) with Ubuntu 20.04+ or Debian 11+
- Domain `drinkmate.sa` registered and accessible for DNS configuration
- SSH access to your server
- Basic knowledge of Linux command line

## Step-by-Step Deployment Process

### 1. Server Setup

First, connect to your server and run the server setup script:

```bash
# Download and run the server setup script
wget https://raw.githubusercontent.com/your-repo/drinkmates/main/deployment/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

This script will install:
- Node.js (LTS version)
- PM2 (Process Manager)
- Nginx (Web Server)
- MongoDB (Database)
- Certbot (SSL certificates)
- Git and other essential tools

### 2. Domain DNS Configuration

Configure your domain DNS settings to point to your server:

**Required DNS Records:**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

**Optional DNS Records:**
```
Type: CNAME
Name: api
Value: drinkmate.sa
TTL: 3600

Type: CNAME
Name: admin
Value: drinkmate.sa
TTL: 3600
```

### 3. Application Deployment

#### 3.1 Clone Repository
```bash
# Switch to the drinkmate user
sudo su - drinkmate

# Clone your repository
git clone https://github.com/your-username/drinkmates.git /var/www/drinkmate
cd /var/www/drinkmate
```

#### 3.2 Configure Environment Variables
```bash
# Copy the environment template
cp deployment/production.env.example server/.env

# Edit the environment file with your actual values
nano server/.env
```

**Important environment variables to configure:**
- `JWT_SECRET` - Generate a secure random string
- `SESSION_SECRET` - Generate a secure random string
- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_*` - Your Cloudinary credentials
- `EMAIL_*` - Email service configuration
- `ARAMEX_*` - Aramex shipping API credentials
- `URWAY_*` - Urway payment gateway credentials
- `TABBY_*` - Tabby payment gateway credentials

#### 3.3 Deploy Application
```bash
# Make deployment script executable
chmod +x deployment/deploy.sh

# Run deployment
./deployment/deploy.sh
```

### 4. SSL Certificate Setup

After your domain DNS has propagated (usually 5-30 minutes), set up SSL:

```bash
# Make SSL setup script executable
chmod +x deployment/ssl-setup.sh

# Run SSL setup
./deployment/ssl-setup.sh
```

### 5. Monitoring and Backup Setup

#### 5.1 Set up Monitoring
```bash
# Make monitoring setup script executable
chmod +x deployment/monitoring-setup.sh

# Run monitoring setup
./deployment/monitoring-setup.sh
```

#### 5.2 Set up Automated Backups
```bash
# Make backup script executable
chmod +x deployment/backup.sh

# Test backup
./deployment/backup.sh

# Set up automated daily backups
crontab -e
# Add this line:
0 2 * * * /var/www/drinkmate/deployment/backup.sh
```

## Post-Deployment Configuration

### 1. Update Application Configuration

Update your Next.js configuration to use the new domain:

```javascript
// In next.config.mjs, update the rewrites section:
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://drinkmate.sa/api/:path*',
    },
  ];
}
```

### 2. Database Migration

If you have existing data, migrate it to the new server:

```bash
# Export from your current database
mongodump --uri="your-current-mongodb-uri" --out ./backup

# Import to new database
mongorestore --db drinkmate_prod ./backup/your-database-name
```

### 3. Test All Functionality

Test the following features:
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order tracking
- [ ] Admin panel access
- [ ] Email notifications
- [ ] File uploads

## Management Commands

### Application Management
```bash
# Check application status
drinkmate-status

# View logs
drinkmate-logs backend
drinkmate-logs frontend
drinkmate-logs nginx

# Restart services
pm2 restart all

# Update application
cd /var/www/drinkmate
git pull origin main
./deployment/deploy.sh
```

### Database Management
```bash
# Access MongoDB
mongosh drinkmate_prod

# Backup database
mongodump --db drinkmate_prod --out /var/backups/mongodb-$(date +%Y%m%d)

# Restore database
mongorestore --db drinkmate_prod /path/to/backup/drinkmate_prod
```

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Check firewall status
sudo ufw status

# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/drinkmate
npm audit fix
```

### 3. Security Monitoring
```bash
# Check fail2ban status
sudo fail2ban-client status

# View security logs
sudo tail -f /var/log/fail2ban.log
```

## Troubleshooting

### Common Issues

#### 1. Application Not Starting
```bash
# Check PM2 logs
pm2 logs

# Check system resources
drinkmate-status

# Restart services
pm2 restart all
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
sudo nginx -t

# Renew certificate
sudo certbot renew --force-renewal
```

#### 3. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh drinkmate_prod
```

#### 4. Nginx Configuration Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

## Performance Optimization

### 1. Enable Gzip Compression
Already configured in the Nginx configuration.

### 2. Set up CDN
Consider using CloudFlare or similar CDN for static assets.

### 3. Database Optimization
```bash
# Create database indexes
mongosh drinkmate_prod
db.products.createIndex({ "name": "text", "description": "text" })
db.orders.createIndex({ "userId": 1, "createdAt": -1 })
```

### 4. Caching
Consider implementing Redis for session storage and caching.

## Backup and Recovery

### Automated Backups
Daily backups are automatically created and stored in `/var/backups/drinkmate/`.

### Manual Backup
```bash
./deployment/backup.sh
```

### Restore from Backup
```bash
# List available backups
ls -la /var/backups/drinkmate/

# Restore from specific backup
./restore-drinkmate-backup-YYYYMMDD-HHMMSS.sh
```

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Check system status and logs
- [ ] Monthly: Update system packages
- [ ] Quarterly: Review and rotate SSL certificates
- [ ] Annually: Review security configurations

### Monitoring Alerts
The system will automatically send email alerts for:
- High disk usage (>90%)
- High memory usage (>90%)
- Service failures
- SSL certificate expiration

### Contact Information
For technical support or issues, contact your system administrator.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `drinkmate-status` | Show system status |
| `drinkmate-logs [service]` | View application logs |
| `pm2 restart all` | Restart all services |
| `sudo nginx -t` | Test Nginx configuration |
| `sudo systemctl reload nginx` | Reload Nginx |
| `mongosh drinkmate_prod` | Access database |
| `./deployment/backup.sh` | Create backup |
| `./deployment/deploy.sh` | Deploy application |

Your DrinkMate application should now be successfully deployed and accessible at `https://drinkmate.sa`!
