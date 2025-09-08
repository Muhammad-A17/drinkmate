const fs = require('fs');
const path = require('path');

class SecurityMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/security.log');
    this.ensureLogDirectory();
    this.suspiciousActivities = new Map();
    this.blockedIPs = new Set();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  logSecurityEvent(event) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: event.type,
      severity: event.severity || 'medium',
      ip: event.ip,
      userAgent: event.userAgent,
      path: event.path,
      method: event.method,
      details: event.details,
      userId: event.userId
    };

    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');

    // Console logging for immediate alerts
    if (event.severity === 'high' || event.severity === 'critical') {
      console.error(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.type}`, {
        ip: event.ip,
        path: event.path,
        details: event.details
      });
    }

    // Track suspicious activities
    this.trackSuspiciousActivity(event);
  }

  trackSuspiciousActivity(event) {
    const key = `${event.ip}_${event.type}`;
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }
    
    const activities = this.suspiciousActivities.get(key);
    activities.push(now);
    
    // Keep only recent activities (last hour)
    const recentActivities = activities.filter(time => now - time < 3600000);
    this.suspiciousActivities.set(key, recentActivities);
    
    // Block IP if too many suspicious activities
    if (recentActivities.length >= 10) {
      this.blockIP(event.ip, 'Too many suspicious activities');
    }
  }

  blockIP(ip, reason) {
    this.blockedIPs.add(ip);
    this.logSecurityEvent({
      type: 'IP_BLOCKED',
      severity: 'high',
      ip,
      details: reason
    });
    
    console.warn(`🚫 IP ${ip} blocked: ${reason}`);
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Security event types
  static events = {
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    SUSPICIOUS_REQUEST: 'SUSPICIOUS_REQUEST',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
    FILE_UPLOAD_ABUSE: 'FILE_UPLOAD_ABUSE',
    SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
    XSS_ATTEMPT: 'XSS_ATTEMPT',
    IP_BLOCKED: 'IP_BLOCKED',
    ADMIN_ACCESS: 'ADMIN_ACCESS'
  };

  // Middleware for request monitoring
  static middleware() {
    return (req, res, next) => {
      const monitor = new SecurityMonitor();
      
      // Check if IP is blocked
      if (monitor.isIPBlocked(req.ip)) {
        return res.status(403).json({
          error: 'Access denied',
          code: 'IP_BLOCKED'
        });
      }
      
      // Monitor for suspicious patterns
      const suspiciousPatterns = [
        /script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<script/i,
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /\.\.\//,
        /\.\.\\/,
        /etc\/passwd/i,
        /proc\/self\/environ/i
      ];
      
      const checkSuspicious = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            for (const pattern of suspiciousPatterns) {
              if (pattern.test(value)) {
                monitor.logSecurityEvent({
                  type: SecurityMonitor.events.SUSPICIOUS_REQUEST,
                  severity: 'high',
                  ip: req.ip,
                  userAgent: req.get('User-Agent'),
                  path: req.path,
                  method: req.method,
                  details: `Suspicious pattern detected in ${currentPath}: ${value}`,
                  userId: req.user?._id
                });
                break;
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            checkSuspicious(value, currentPath);
          }
        }
      };
      
      // Check request data
      if (req.body) checkSuspicious(req.body, 'body');
      if (req.query) checkSuspicious(req.query, 'query');
      if (req.params) checkSuspicious(req.params, 'params');
      
      next();
    };
  }
}

module.exports = SecurityMonitor;
