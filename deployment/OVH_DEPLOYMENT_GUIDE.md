# DrinkMate OVH Server Deployment Guide

This is a simplified guide for deploying your DrinkMate application on an OVH server.

## Prerequisites

- OVH server with Ubuntu/Debian
- Domain `drinkmate.sa` 
- SSH access to your server
- Your DrinkMate project files

## Step 1: Connect to Your OVH Server

### Get Your Server Details
1. Log into your OVH control panel
2. Find your server's IP address
3. Note your server's root password or SSH key

### Connect via SSH
```bash
# Replace YOUR_SERVER_IP with your actual server IP
ssh root@YOUR_SERVER_IP
```

## Step 2: Basic Server Setup

Once connected to your server, run:

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/your-repo/drinkmates/main/deployment/ovh-setup.sh
chmod +x ovh-setup.sh
./ovh-setup.sh
```

This will install:
- Node.js
- PM2 (Process Manager)
- Nginx (Web Server)
- MongoDB (Database)
- Git
- Certbot (for SSL)

## Step 3: Upload Your Project Files

### Option A: Using Git (Recommended)
```bash
# Clone your repository
cd /var/www
git clone https://github.com/your-username/drinkmates.git drinkmate
cd drinkmate
```

### Option B: Using SCP (if you have files locally)
```bash
# From your local computer, upload files
scp -r /path/to/your/drinkmates root@YOUR_SERVER_IP:/var/www/
```

## Step 4: Configure Environment Variables

```bash
# Copy the environment template
cp deployment/production.env.example server/.env

# Edit the environment file
nano server/.env
```

**Important variables to set:**
- `JWT_SECRET` - Generate a random string
- `SESSION_SECRET` - Generate a random string
- `MONGODB_URI` - Use: `mongodb://localhost:27017/drinkmate_prod`
- Your API keys (Cloudinary, Aramex, Urway, etc.)

## Step 5: Install Dependencies and Build

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies and build
cd ../drinkmate-main
npm install
npm run build
```

## Step 6: Configure Nginx

```bash
# Copy Nginx configuration
cp deployment/nginx.conf /etc/nginx/sites-available/drinkmate.sa
ln -s /etc/nginx/sites-available/drinkmate.sa /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 7: Start Your Application

```bash
# Start with PM2
cd /var/www/drinkmate
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 8: Configure Your Domain

In your domain registrar's DNS settings, add:
```
A record: drinkmate.sa → YOUR_SERVER_IP
A record: www.drinkmate.sa → YOUR_SERVER_IP
```

## Step 9: Set Up SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d drinkmate.sa -d www.drinkmate.sa
```

## Step 10: Test Your Application

Visit `https://drinkmate.sa` to test your application.

## Management Commands

### Check Status
```bash
# Check if services are running
pm2 status
systemctl status nginx
systemctl status mongod
```

### View Logs
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart application
pm2 restart all

# Restart Nginx
systemctl restart nginx
```

### Update Application
```bash
cd /var/www/drinkmate
git pull origin main
cd server && npm install
cd ../drinkmate-main && npm install && npm run build
pm2 restart all
```

## Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
netstat -tlnp | grep :3000
netstat -tlnp | grep :3001
```

### Nginx Issues
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

### Database Issues
```bash
# Check MongoDB status
systemctl status mongod

# Connect to database
mongosh drinkmate_prod
```

## Security Notes

1. **Firewall**: Configure UFW to allow only necessary ports
2. **Updates**: Regularly update your system packages
3. **Backups**: Set up regular database backups
4. **Monitoring**: Monitor your server resources

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Check application status |
| `pm2 logs` | View application logs |
| `pm2 restart all` | Restart all applications |
| `systemctl status nginx` | Check Nginx status |
| `systemctl restart nginx` | Restart Nginx |
| `mongosh drinkmate_prod` | Connect to database |
| `nginx -t` | Test Nginx configuration |

Your DrinkMate application should now be running on your OVH server!
