// Comprehensive audit logging service for sensitive operations
const fs = require('fs');
const path = require('path');

class AuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs/audit');
    this.ensureLogDirectory();
  }

  /**
   * Ensure audit log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get log file path for today
   */
  getLogFilePath() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `audit-${today}.log`);
  }

  /**
   * Log audit event
   */
  logEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId(),
      ...event
    };

    // Write to file
    this.writeToFile(logEntry);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AUDIT LOG:', JSON.stringify(logEntry, null, 2));
    }

    return logEntry.eventId;
  }

  /**
   * Write log entry to file
   */
  writeToFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.getLogFilePath(), logLine);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log authentication events
   */
  logAuthEvent(type, userId, email, ip, userAgent, success, details = {}) {
    return this.logEvent({
      category: 'AUTHENTICATION',
      type,
      userId,
      email,
      ip,
      userAgent,
      success,
      details,
      severity: success ? 'INFO' : 'WARNING'
    });
  }

  /**
   * Log authorization events
   */
  logAuthzEvent(type, userId, email, resource, action, success, details = {}) {
    return this.logEvent({
      category: 'AUTHORIZATION',
      type,
      userId,
      email,
      resource,
      action,
      success,
      details,
      severity: success ? 'INFO' : 'WARNING'
    });
  }

  /**
   * Log data access events
   */
  logDataAccessEvent(type, userId, email, resource, action, recordId, details = {}) {
    return this.logEvent({
      category: 'DATA_ACCESS',
      type,
      userId,
      email,
      resource,
      action,
      recordId,
      details,
      severity: 'INFO'
    });
  }

  /**
   * Log data modification events
   */
  logDataModificationEvent(type, userId, email, resource, action, recordId, changes = {}, details = {}) {
    return this.logEvent({
      category: 'DATA_MODIFICATION',
      type,
      userId,
      email,
      resource,
      action,
      recordId,
      changes,
      details,
      severity: 'INFO'
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(type, userId, email, ip, userAgent, details = {}) {
    return this.logEvent({
      category: 'SECURITY',
      type,
      userId,
      email,
      ip,
      userAgent,
      details,
      severity: 'WARNING'
    });
  }

  /**
   * Log system events
   */
  logSystemEvent(type, details = {}) {
    return this.logEvent({
      category: 'SYSTEM',
      type,
      details,
      severity: 'INFO'
    });
  }

  /**
   * Log admin actions
   */
  logAdminAction(type, adminId, adminEmail, targetResource, action, details = {}) {
    return this.logEvent({
      category: 'ADMIN_ACTION',
      type,
      adminId,
      adminEmail,
      targetResource,
      action,
      details,
      severity: 'INFO'
    });
  }

  /**
   * Log payment events
   */
  logPaymentEvent(type, userId, email, amount, currency, paymentMethod, success, details = {}) {
    return this.logEvent({
      category: 'PAYMENT',
      type,
      userId,
      email,
      amount,
      currency,
      paymentMethod,
      success,
      details,
      severity: success ? 'INFO' : 'WARNING'
    });
  }

  /**
   * Log API access events
   */
  logApiAccessEvent(method, endpoint, userId, email, ip, userAgent, responseTime, statusCode, details = {}) {
    return this.logEvent({
      category: 'API_ACCESS',
      type: 'API_REQUEST',
      method,
      endpoint,
      userId,
      email,
      ip,
      userAgent,
      responseTime,
      statusCode,
      details,
      severity: statusCode >= 400 ? 'WARNING' : 'INFO'
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId, limit = 100, offset = 0) {
    try {
      const logFiles = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
        .sort()
        .reverse();

      const logs = [];
      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');

        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            if (logEntry.userId === userId) {
              logs.push(logEntry);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }

        if (logs.length >= limit + offset) break;
      }

      return logs.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error reading audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs by category
   */
  async getAuditLogsByCategory(category, limit = 100, offset = 0) {
    try {
      const logFiles = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
        .sort()
        .reverse();

      const logs = [];
      for (const file of logFiles) {
        const filePath = path.join(this.logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');

        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            if (logEntry.category === category) {
              logs.push(logEntry);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }

        if (logs.length >= limit + offset) break;
      }

      return logs.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error reading audit logs:', error);
      return [];
    }
  }

  /**
   * Clean up old audit logs (keep last 90 days)
   */
  async cleanupOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      for (const file of files) {
        if (file.startsWith('audit-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old audit log: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
    }
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Clean up old logs on startup
auditLogger.cleanupOldLogs();

module.exports = auditLogger;
