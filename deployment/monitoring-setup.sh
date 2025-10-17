#!/bin/bash

# DrinkMate Monitoring Setup Script
# This script sets up monitoring and logging for the production environment

set -e

echo "📊 Setting up monitoring and logging for DrinkMate..."

# Install monitoring tools
echo "📦 Installing monitoring tools..."
sudo apt update
sudo apt install -y htop iotop nethogs fail2ban logrotate

# Configure log rotation for application logs
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/drinkmate > /dev/null << 'EOF'
/var/log/drinkmate/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 drinkmate drinkmate
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Configure fail2ban for security
echo "🔒 Setting up fail2ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create monitoring script
echo "📊 Creating monitoring script..."
sudo tee /usr/local/bin/drinkmate-monitor > /dev/null << 'EOF'
#!/bin/bash

# DrinkMate System Monitoring Script

LOG_FILE="/var/log/drinkmate/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_message() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 80 ]; then
    log_message "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi

# Check if PM2 processes are running
if ! pm2 list | grep -q "online"; then
    log_message "ERROR: PM2 processes are not running"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    log_message "ERROR: Nginx is not running"
fi

# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
    log_message "ERROR: MongoDB is not running"
fi

# Check application health
if ! curl -f -s http://localhost:3000/health > /dev/null; then
    log_message "WARNING: Backend health check failed"
fi

if ! curl -f -s http://localhost:3001 > /dev/null; then
    log_message "WARNING: Frontend is not accessible"
fi

# Log system stats
log_message "System Status - Disk: ${DISK_USAGE}%, Memory: ${MEMORY_USAGE}%, Load: $(uptime | awk -F'load average:' '{print $2}')"
EOF

sudo chmod +x /usr/local/bin/drinkmate-monitor

# Set up cron job for monitoring
echo "⏰ Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/drinkmate-monitor") | crontab -

# Create system status script
echo "📋 Creating system status script..."
sudo tee /usr/local/bin/drinkmate-status > /dev/null << 'EOF'
#!/bin/bash

# DrinkMate System Status Script

echo "=== DrinkMate System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo ""

echo "=== System Resources ==="
echo "Disk Usage:"
df -h /
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Load Average:"
uptime
echo ""

echo "=== Services Status ==="
echo "Nginx: $(systemctl is-active nginx)"
echo "MongoDB: $(systemctl is-active mongod)"
echo "PM2: $(pm2 list | grep -c online) processes online"
echo ""

echo "=== Application Status ==="
echo "Backend Health:"
curl -s http://localhost:3000/health || echo "Backend not responding"
echo ""
echo "Frontend Status:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "Frontend not responding"
echo ""

echo "=== Recent Logs ==="
echo "Last 10 lines from system monitor:"
tail -10 /var/log/drinkmate/system-monitor.log 2>/dev/null || echo "No monitoring logs found"
echo ""

echo "=== PM2 Process List ==="
pm2 list
EOF

sudo chmod +x /usr/local/bin/drinkmate-status

# Create log viewer script
echo "📄 Creating log viewer script..."
sudo tee /usr/local/bin/drinkmate-logs > /dev/null << 'EOF'
#!/bin/bash

# DrinkMate Log Viewer Script

case "$1" in
    "backend")
        pm2 logs drinkmate-backend --lines 50
        ;;
    "frontend")
        pm2 logs drinkmate-frontend --lines 50
        ;;
    "nginx")
        sudo tail -50 /var/log/nginx/drinkmate.sa.error.log
        ;;
    "system")
        tail -50 /var/log/drinkmate/system-monitor.log
        ;;
    "all")
        echo "=== Backend Logs ==="
        pm2 logs drinkmate-backend --lines 20
        echo ""
        echo "=== Frontend Logs ==="
        pm2 logs drinkmate-frontend --lines 20
        echo ""
        echo "=== Nginx Error Logs ==="
        sudo tail -20 /var/log/nginx/drinkmate.sa.error.log
        ;;
    *)
        echo "Usage: drinkmate-logs {backend|frontend|nginx|system|all}"
        echo ""
        echo "Examples:"
        echo "  drinkmate-logs backend    - Show backend application logs"
        echo "  drinkmate-logs frontend   - Show frontend application logs"
        echo "  drinkmate-logs nginx      - Show Nginx error logs"
        echo "  drinkmate-logs system     - Show system monitoring logs"
        echo "  drinkmate-logs all        - Show all logs"
        ;;
esac
EOF

sudo chmod +x /usr/local/bin/drinkmate-logs

# Set up log cleanup
echo "🧹 Setting up log cleanup..."
(crontab -l 2>/dev/null; echo "0 2 * * * find /var/log/drinkmate -name '*.log' -mtime +30 -delete") | crontab -

# Create alerts script
echo "🚨 Creating alerts script..."
sudo tee /usr/local/bin/drinkmate-alerts > /dev/null << 'EOF'
#!/bin/bash

# DrinkMate Alerts Script

ALERT_EMAIL="admin@drinkmate.sa"  # Change this to your email

# Check for critical issues
CRITICAL_ISSUES=()

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    CRITICAL_ISSUES+=("Disk usage is ${DISK_USAGE}%")
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    CRITICAL_ISSUES+=("Memory usage is ${MEMORY_USAGE}%")
fi

# Check if services are running
if ! systemctl is-active --quiet nginx; then
    CRITICAL_ISSUES+=("Nginx is not running")
fi

if ! systemctl is-active --quiet mongod; then
    CRITICAL_ISSUES+=("MongoDB is not running")
fi

if ! pm2 list | grep -q "online"; then
    CRITICAL_ISSUES+=("PM2 processes are not running")
fi

# Send alert if there are critical issues
if [ ${#CRITICAL_ISSUES[@]} -gt 0 ]; then
    SUBJECT="DrinkMate Server Alert - $(date)"
    MESSAGE="Critical issues detected on DrinkMate server:\n\n"
    
    for issue in "${CRITICAL_ISSUES[@]}"; do
        MESSAGE+="- $issue\n"
    done
    
    MESSAGE+="\nServer: $(hostname)\n"
    MESSAGE+="Time: $(date)\n"
    
    # Send email (requires mailutils to be installed)
    echo -e "$MESSAGE" | mail -s "$SUBJECT" "$ALERT_EMAIL" 2>/dev/null || echo "Email sending failed"
    
    # Log the alert
    echo "[$(date)] ALERT: ${CRITICAL_ISSUES[*]}" >> /var/log/drinkmate/alerts.log
fi
EOF

sudo chmod +x /usr/local/bin/drinkmate-alerts

# Set up alert cron job
echo "🚨 Setting up alert cron job..."
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/drinkmate-alerts") | crontab -

# Install mailutils for email alerts (optional)
echo "📧 Installing mailutils for email alerts..."
sudo apt install -y mailutils

echo "✅ Monitoring setup completed!"
echo ""
echo "Available monitoring commands:"
echo "  drinkmate-status    - Show system status"
echo "  drinkmate-logs      - View application logs"
echo "  drinkmate-monitor   - Run system monitoring"
echo "  drinkmate-alerts    - Check for critical issues"
echo ""
echo "Monitoring features enabled:"
echo "  ✅ System resource monitoring (every 5 minutes)"
echo "  ✅ Service health checks"
echo "  ✅ Log rotation and cleanup"
echo "  ✅ Security monitoring with fail2ban"
echo "  ✅ Email alerts for critical issues"
echo "  ✅ Automated log management"
